/* Project Packages
==================================================================================================== */
// Main Gulp Tasks
var gulp = require('gulp-help')(require('gulp'), {'description': '', 'hideEmpty': true, 'hideDepsMessage': true});
var pkg = require('./package.json');
var browserSync = require('browser-sync');
var sequence = require('run-sequence').use(gulp);
// POSTCSS Packages
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var variables = require('postcss-advanced-variables');
var cachebuster = require('postcss-cachebuster');
var calc = require('postcss-calc');
var position = require('postcss-position-alt');
var sorting = require('postcss-sorting');
// Misc NPM Packages
var path = require('path');
var fs = require('fs-jetpack');
var git = require('gulp-git');
var zip = require('gulp-zip');
var size = require('gulp-size');
var gutil = require('gulp-util');
var sizeOf = require('image-size');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var merge = require('merge-stream');
var cheerio = require('cheerio');
var flags = require('minimist')(process.argv.slice(2));

var devFolder = '';
var zipFolder = '';
var sizeRegExp = new RegExp('(\\d{2,}x\\d{2,})', 'g');
var browserSyncRewriteRules = [{
    match: /<!-- {inject:banner-controls} -->/ig,
    fn: function(match) {
        return '<script src="assets/_dev-build/_banners.js"></script>';
    }
}];

var project = {
    year: pkg.name.split('-')[0],
    clientCode: pkg.name.split('-')[1].toUpperCase(),
    jobCode: pkg.name.split('-')[2],
    get name() {
        return this.year + this.clientCode + this.jobCode;
    },
    get title() {
        return this.clientCode + ' ' + this.jobCode + ' ' + pkg.title;
    }
};

/* Setup: Initial values from banner boilerplate
--------------------------------------------------------------------------- */
var defaults = {
    name: 'client-name', // YY-aaa-9999 (e.g. 15-car-7155); view README.md for formatting
    title: '{{Project Title}}', // Will be used on the review page template
    desc: '{{Project Description}}', // Will be used on the review page template
    folder: '_banner-template' // starter boilerplate to build banners
};

/* Setup: File paths
--------------------------------------------------------------------------- */
var paths = {
    html: '/index.html',
    img: '/assets/img/**/*',
    css: {
        source: '/assets/css/source.css',
        destination: '/assets/css/'
    },
    js: '/assets/js/*.js'
};

/* Utilities
--------------------------------------------------------------------------- */
var utils = {
    divider: function() {
        var cols = process.stdout.columns;
        return Array.apply(null, { length: cols }).join('-').slice(0, cols) + '\n';
    },
    message: function(msg) {
        return utils.divider() + msg + utils.divider();
    },
    getFolders: function(dir) {
        var folders = [];
        fs.inspectTree(dir).children.forEach(function(folder) {
            if (folder.type === 'dir') { folders.push(folder.name); }
        });
        return folders;
    },
    getBanners: function() {
        var bannerList = [];
        // return only folders with dimensions in label
        var banners = utils.getFolders('banners');
        banners.forEach(function(item) {
            if (item.match(sizeRegExp)) {
                bannerList.push(item);
            }
        });

        return bannerList;
    },
    getDimensions: function(item) {
        var dimensions = item.match(sizeRegExp)[0].split('x');
        return {
            width: parseInt(dimensions[0], 10),
            height: parseInt(dimensions[1], 10),
            get formatted() {
                return this.width + 'x' + this.height;
            }
        };
    }
};

/* TASKS
==================================================================================================== */
gulp.task('default', function(done) {
    sequence('help', done);
});

/* Task: Review -- prep banners and build review page
--------------------------------------------------------------------------- */
// pull remote template file, merge and put into `review` folder
gulp.task('review', 'build review page from banner directories', ['preflight-package-json', 'directory-check', 'git:review-template'], function(done) {
    var bannerHtml = [];

    // Copy banners into review (only folders with dimensions in label)
    var bannerList = utils.getBanners();
    bannerList.forEach(function(item) {
        var banner = './review/banners/' + item;
        fs.copy('./banners/' + item, banner);
    });

    // rename fallback image
    fs.find('review/banners', { matching: ['fallback.{jpg,gif,png}'] }).forEach(function(image) {
        var ext = image.split('.').pop();
        fs.rename(image, project.name + '_' + utils.getDimensions(image).formatted + '.' + ext);
    });

    // remove unnecessary files/folders
    fs.find('review/banners', { matching: ['_dev-build'], files: false, directories: true }).forEach(fs.remove);

    /* Review Template -- update content
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    var reviewDirectory = fs.cwd('./review');
    var indexBody = reviewDirectory.read('index.html').toString();
    var $ = cheerio.load(indexBody);

    var title = $('title').text().replace('{{title}}', project.title);
    $('title').text(title);
    $('h3.headline').text(project.title);
    // Update Tabs
    var tpl_tab = $('#tab-item').html().replace(/^\s+/, '').replace(/\s+$/, '');
    var tpl_tab_single = $('#tab-single-item').html().replace(/^\s+/, '').replace(/\s+$/, '');
    $(bannerList).each(function(i, banner) {
        bannerHtml.push(tpl_tab.replace('{{size}}', banner));
    });
    bannerHtml.push(tpl_tab_single.replace('{{size}}', bannerList[0]));
    $('.tabs').html(bannerHtml.join(''));
    $('#tab-item, #tab-single-item').remove(); // remove the templates from the index page
    // write all the changes to the page
    fs.write(reviewDirectory.cwd() + '/index.html', $.html());

    sequence('zip');
});

/* Clone Review Template git repository and update with project-specific info
--------------------------------------------------------------------------- */
gulp.task('git:review-template', false, function(done) {
    // clean up; remove any pre-existing `review` folder; fs.remove() doesn't work on non-empty folders
    if (fs.exists('./review')) {
        fs.find('./review', { matching: '*' }).forEach(fs.remove); // first remove all files
        fs.find('./review', { matching: '*', directories: true }).forEach(fs.remove); // remove all directories
    }

    // Clone Review Page repository and set up directory
    git.clone('https://github.com/misega/HTML5-Banners-Review-Site', {args: './review'}, function(err) {
        if (err) { console.log(err); }
        // remove extra files
        fs.remove('./review/README.md');
        fs.remove('./review/source');
        // move files to ./review root
        var review = fs.cwd('./review/public');
        review.move('./index.html', '../index.html');
        review.move('./assets', '../assets');
        fs.remove('./review/public');

        done();
    });
});

/* Task: Deploy -- prep banners and zip each directory for distribution
--------------------------------------------------------------------------- */
// loop through directories, clean up folders/files, zip up for distribution
gulp.task('deploy', 'zip up banner directories for distribution', ['preflight-package-json', 'directory-check', 'review'], function(done) {
    console.log('deploy');
});

/* Watch a specific banner directory; use --flag to declare folder name
--------------------------------------------------------------------------- */
gulp.task('watch', 'monitor files for changes', ['preflight-directory', 'styles', 'browserSync'], function(done) {
    gulp.watch([devFolder + paths.html]).on('change', function() {
        sequence('html', browserSync.reload);
    });
    gulp.watch([devFolder + paths.img]).on('change', function() {
        sequence(browserSync.reload);
    });
    gulp.watch(devFolder + paths.css.source).on('change', function() {
        sequence('styles', browserSync.reload);
    });
    gulp.watch(devFolder + paths.js).on('change', function() {
        sequence(browserSync.reload);
    });
}, {
    options: {
        'folder': 'active directory to monitor (e.g. --folder 300x250)',
        'controls': 'show banner controls; enables scrubbing through timeline'
    }
});

/* Watch a specific banner directory; use --flag to declare folder name
--------------------------------------------------------------------------- */
gulp.task('browserSync', false, function() {
    browserSync({
        server: { baseDir: devFolder },
        open: true,
        notify: false,
        rewriteRules: (flags.controls)? browserSyncRewriteRules : []
    });
});

/* Two actions: Zip up each directory, zip up all directories as one
--------------------------------------------------------------------------- */
gulp.task('zip', false, function() {
    var zipFolder = 'review/banners';
    var folders = utils.getFolders(zipFolder);

    var singleZip = folders.map(function(folder) {
        return gulp
            .src(path.join(zipFolder, folder, '/**/*'))
            .pipe(plumber({ errorHandler: reportError }))
            .pipe(zip(project.name + '_' + folder + '.zip'))
            .pipe(gulp.dest(path.join(zipFolder, folder)));
    });

    var groupZip = gulp
        .src(path.join(zipFolder, '/**/*'))
        .pipe(plumber({ errorHandler: reportError }))
        .pipe(zip(project.name + '-all(' + folders.length + ').zip'))
        .pipe(gulp.dest('review/banners'));

    return merge(singleZip, groupZip);
});

/* Check to make sure there are directories with dimensions in label
 * Also check to make sure there are fallback images
--------------------------------------------------------------------------- */
gulp.task('directory-check', false, function() {
    var errorTitle = '';
    var errorNote = '';
    var errors = [];
    var missingImages = [];

    var bannerList = utils.getBanners();
    if (!bannerList.length) {
        errorTitle = gutil.colors.bgRed.white.bold('  Empty Banner Directory  ') + '\n\n';
        errors.push(gutil.colors.red('\u2718') + gutil.colors.bold(' Banners') + ': missing\n\n');

        var boilerplateExists = fs.exists('banners/' + defaults.folder);
        if (boilerplateExists) {
            errors.push('Copy ' + gutil.colors.cyan(defaults.folder) + ' and/or rename with banner size (e.g. 300x250)\n');
            errors.push('Then run `gulp watch --folder 300x250` to build banners\n');
        }
    }
    else {
        errorTitle = gutil.colors.bgRed.white.bold('  Fallback Images  ') + '\n\n';
        errorNote = gutil.colors.gray('\nFix any issues with the fallback image(s) before proceeding\n');
        bannerList.forEach(function(banner) {
            var fallback = fs.find('./banners/' + banner, { matching: ['fallback.*'] });
            if (!fallback.length) { // no image found
                errors.push(gutil.colors.red('\u2718 ') + gutil.colors.bold(banner) + ': missing fallback image\n');
            }
            else {
                // Check for correct mime type of fallback image
                if (!fallback[0].match(/jpg|gif|png/)) {
                    errors.push(gutil.colors.red('\u2718 ') + gutil.colors.bold(banner) + ': wrong mimetype \u2192 ' + gutil.colors.red(fallback[0].split('.').pop().toUpperCase()) + '\n');
                    errors.push('  - Allowed mime-types: ' + gutil.colors.cyan('JPG, GIF, PNG') + '\n');
                }
                else {
                    var folderSize = utils.getDimensions(banner);
                    var dimensions = sizeOf(fallback[0]);
                    if (folderSize.width !== dimensions.width && folderSize.height !== dimensions.height) {
                        errors.push(gutil.colors.red('\u2718 ') + gutil.colors.bold(banner) + ': fallback image size doesn\'t match\n');
                        errors.push('  - folder size: ' + gutil.colors.cyan(folderSize.formatted) + '\n');
                        errors.push('  - image size: ' + gutil.colors.cyan(dimensions.width + 'x' + dimensions.height) + '\n');
                    }
                }
            }
        });
    }

    if (errors.length) {
        var msg = errorTitle + errors.join('') + errorNote + '\n';
        console.log(utils.message(msg));
        process.exit(1);
    }
});

/* SUB-TASKS: Modify assets (html, images, styles, scripts) on change
==================================================================================================== */
gulp.task('html', false, function(done) {
    return gulp
        .src(devFolder + paths.html)
        .pipe(plumber({ errorHandler: reportError }));
});

// gulp.task('assets', false, function() {
//     return gulp
//         .src(devFolder + paths.img);
// });

gulp.task('styles', false, function() {
    var processors = [
        autoprefixer({ browsers: ['> 1%', 'last 3 versions', 'ie >= 9', 'ios >= 7', 'android >= 4.4']}),
        variables(),
        position(),
        calc()
        //sorting({ 'sort-order': 'zen' })
    ];

    return gulp
        .src(devFolder + paths.css.source)
        .pipe(plumber({ errorHandler: reportError }))
        .pipe(postcss(processors))
        .pipe(rename('style.css'))
        .pipe(gulp.dest(devFolder + paths.css.destination));
});

// gulp.task('scripts', false, function() {
//     return gulp
//         .src(devFolder + paths.script);
// });

/* SUB-TASKS: Preflight Checklist
==================================================================================================== */

/* Setup: Make sure Package.json project info has been updated
--------------------------------------------------------------------------- */
gulp.task('preflight-package-json', false, function() {
    var errors = [];
    var errorTitle = gutil.colors.bgRed.white.bold('  package.json  ') + '\n\nRequired Project Information:\n';
    var errorNote = '\nProject information will be displayed\non the generated review page.\nView ' + gutil.colors.cyan.italic('README.md') + ' for more details\n\n';

    if (pkg.name === defaults.name || !pkg.name.length || !pkg.name.match(/\b(\d{2}[-]?[a-z]{3}[-]?\d{4})\b/)) {
        errors.push(gutil.colors.red('\u2718') + gutil.colors.bold(' name') + ': required format ' + gutil.colors.gray('YY-aaa-9999') + '\n');
        errors.push('  - YY: 2-digit Year\n');
        errors.push('  - aaa: 3-digit Client Code\n');
        errors.push('  - 9999: 4-digit Job Code\n');
    }

    if (pkg.title === defaults.title || !pkg.title.length) {
        errors.push(gutil.colors.red('\u2718') + gutil.colors.bold(' title') + ': missing\n');
    }

    if (pkg.description === defaults.desc || !pkg.description.length) {
        errors.push(gutil.colors.red('\u2718') + gutil.colors.bold(' description') + ': missing\n');
    }

    if (errors.length) {
        var msg = errorTitle + errors.join('') + errorNote;
        console.log(utils.message(msg));
        process.exit(1);
    }
});

/* Setup: Make sure folder is setup with banner dimensions
--------------------------------------------------------------------------- */
gulp.task('preflight-directory', false, ['preflight-package-json'], function() {
    var errors = [];
    var errorTitle = gutil.colors.bgRed.white.bold('  directory  ') + '\n\n';
    var isDirectory = fs.exists('banners/' + flags.folder);

    // Flag isn't set. If the folder isn't declared, we can't monitor changes.
    if (!flags.folder) {
        errors.push(gutil.colors.red('\u2718') + gutil.colors.bold(' folder flag') + ': missing\n');
        errors.push(gutil.colors.gray('e.g. `gulp watch --folder 300x250`\n\n'));
    }
    // Flag is set but the directory is missing. Pick a directory to copy.
    else if (!isDirectory) {
        errors.push(gutil.colors.red('\u2718') + gutil.colors.bold(' directory') + ': missing\n');
        // Missing directory: copy the starter boilerplate folder
        var boilerplateExists = fs.exists('banners/' + defaults.folder);
        if (boilerplateExists) {
            errors.push('Copy ' + gutil.colors.cyan(defaults.folder) + ' and/or rename with banner size (e.g. ' + flags.folder + ')\n\n');
        }
        // Missing directory: no boilerplate folder to copy, try another folder?
        else {
            errors.push('Copy another directory and rename with banner size (e.g. ' + flags.folder + ')\n\n');
        }
    }

    if (errors.length) {
        var msg = errorTitle + errors.join('');
        console.log(utils.message(msg));
        process.exit(1);
    }

    /* Directory Exists. Let's update the index page and style page to show the correct dimensions
    --------------------------------------------------------------------------- */
    var currentDirectory = fs.cwd('banners/' + flags.folder);
    devFolder = currentDirectory.cwd();
    // The directory is available, let's update files to match the directory name
    var size = utils.getDimensions(flags.folder);

    // index.html -- set <meta name="ad.size"> and <title> to dimensions of folder
    var adSizeRegExp = new RegExp('content="width=({{width}}|\d{2,}), height=({{height}}|\d{2,})"', 'g');
    var titleRexExp = new RegExp('<title>(.*)<\/title>', 'g');
    var indexContent = currentDirectory.read('index.html').toString();
    indexContent = indexContent.replace(adSizeRegExp, 'content="width=' + size.width + ', height=' + size.height + '"');
    indexContent = indexContent.replace(titleRexExp, '<title>Ad Banner: ' + size.width + 'x' + size.height + '</title>');
    fs.write(currentDirectory.cwd() + '/index.html', indexContent);

    // source.css -- set css variable width/height
    var styleContent = currentDirectory.read('assets/css/source.css').toString();
    styleContent = styleContent.replace(/{{width}}/g, size.width + 'px');
    styleContent = styleContent.replace(/{{height}}/g, size.height + 'px');
    fs.write(currentDirectory.cwd() + '/assets/css/source.css', styleContent);
});

/* SUB-TASKS: Error Reporting
==================================================================================================== */
var reportError = function(error) {
    var lineNumber = (error.line) ? 'LINE ' + error.line + ' -- ' : '';

    notify({
        title: 'Task Failed [' + error.plugin + ']',
        message: lineNumber + 'See console.',
        // See: System Preferences… » Sound » Sound Effects
        sound: 'Basso'
    }).write(error);

    // Pretty error reporting
    var report = '';
    var chalk = gutil.colors.white.bgRed;

    report += chalk('TASK:') + ' [' + error.plugin + ']\n';
    if (error.line) { report += chalk('LINE:') + ' ' + error.line + '\n'; }
    report += chalk('PROB:') + ' ' + error.messageFormatted + '\n';
    console.error(report);

    // Prevent the `watch` task from stopping
    this.emit('end');
};
