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
var del = require('del');
var path = require('path');
var fs = require('fs-jetpack');
var tap = require('gulp-tap');
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

var watchFolder = '';
var zipFolder = 'deploy';
var sizeRegExp = new RegExp('(\\d{2,}x\\d{2,})', 'g');
var browserSyncRewriteRules = [{
    match: /<!-- {inject:banner-controls} -->/ig,
    fn: function(match) {
        return '<script src="assets/_banner-support-files/controls/_banners.js"></script>';
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
    },
    review_template: 'https://github.com/misega/HTML5-Banners-Review-Site'
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
    trim: function(str) {
        return str.replace(/^\s+/, '').replace(/\s+$/, '');
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
    walkDirectory: function(dir, filelist) {
        var fso = fso || require('fs');
        var files = fso.readdirSync(dir);
        filelist = filelist || [];

        files.forEach(function(file) {
            if (fso.statSync(dir + '/' + file).isDirectory()) {
                filelist = utils.walkDirectory(dir + '/' + file, filelist);
            }
            else {
                if (!/(\.DS_Store|\.keep)/.test(file)) {
                    filelist.push(fs.inspect(dir + '/' + file, {times: true}));
                }
            }
        });

        return filelist;
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

/* TASK: Default -- Will only show `help` message; list all available tasks
==================================================================================================== */
gulp.task('default', function(done) {
    sequence('help', done);
});

/* TASK: Watch -- Watch a specific banner directory for changes; set flag `--folder {name}`
==================================================================================================== */
gulp.task('watch', 'monitor files for changes', ['preflight:watch-directory', 'update:watch-directory', 'styles', 'browserSync:watch'], function(done) {
    gulp.watch([watchFolder + paths.html]).on('change', function() {
        sequence('html', browserSync.reload);
    });
    gulp.watch([watchFolder + paths.img]).on('change', function() {
        sequence(browserSync.reload);
    });
    gulp.watch(watchFolder + paths.css.source).on('change', function() {
        sequence('styles', browserSync.reload);
    });
    gulp.watch(watchFolder + paths.js).on('change', function() {
        sequence(browserSync.reload);
    });
}, {
    options: {
        'folder': 'active directory to monitor (e.g. --folder 300x250)',
        'controls': 'show banner controls; enables scrubbing through timeline'
    }
});

gulp.task('update:watch-directory', false, function(done) {
    /* Directory Exists. Let's update the index page and style page to show the correct dimensions
    --------------------------------------------------------------------------- */
    var currentDirectory = fs.cwd('banners/' + flags.folder);
    watchFolder = currentDirectory.cwd();
    // The directory is available, let's update files to match the directory name
    var size = utils.getDimensions(flags.folder);

    // index.html -- set <meta name="ad.size"> and <title> to dimensions of folder
    var adSizeRegExp = new RegExp('content="width=({{width}}|\\d{2,}), height=({{height}}|\\d{2,})"', 'g');
    var titleRexExp = new RegExp('<title>(.*)<\/title>', 'g');
    var indexContent = currentDirectory.read('index.html').toString();
    indexContent = indexContent.replace(adSizeRegExp, 'content="width=' + size.width + ', height=' + size.height + '"');
    indexContent = indexContent.replace(titleRexExp, '<title>Ad Banner: ' + size.width + 'x' + size.height + '</title>');
    fs.write(currentDirectory.cwd() + '/index.html', indexContent);

    // source.css -- set css variable width/height, if it exists
    var source_css = 'assets/css/source.css';
    if (!fs.exists(watchFolder + '/' + source_css)) { return; }
    var styleContent = currentDirectory.read(source_css).toString();
    styleContent = styleContent.replace(/\$width:\s?({{width}}|\d{2,}px);/g, '$width: ' + size.width + 'px;');
    styleContent = styleContent.replace(/\$height:\s?({{height}}|\d{2,}px);/g, '$height: ' + size.height + 'px;');
    fs.write(watchFolder + '/' + source_css, styleContent);

    /* Controls: Add folder, if flag is active; remove, if not
    --------------------------------------------------------------------------- */
    var controls = '_banner-support-files/controls';
    var controlsFolder = watchFolder + '/assets/' + controls;
    var hasControlsFolder = fs.exists(controlsFolder);
    if (!flags.controls && hasControlsFolder) {
        fs.remove(watchFolder + '/assets/_banner-support-files');
    }

    if (flags.controls && !hasControlsFolder) {
        fs.copy('./banners/' + controls, controlsFolder);
    }

    done();
});

/* Update browser(s) when files change
--------------------------------------------------------------------------- */
gulp.task('browserSync:watch', false, ['update:watch-directory'], function() {
    browserSync({
        server: { baseDir: watchFolder },
        open: true,
        notify: false,
        rewriteRules: (flags.controls)? browserSyncRewriteRules : []
    });
});

gulp.task('browserSync:review', false, function() {
    browserSync({
        server: { baseDir: './review' },
        open: true,
        notify: false
    });
});

/* TASK: Review -- prep banners and build review page
==================================================================================================== */
gulp.task('clean:review', function(done) {
    return del(['review/**/.*', 'review'], {force: true});
});

// pull remote template file, merge and put into `review` folder
gulp.task('review', 'build review page from banner directories', ['preflight:package.json', 'preflight:directory-check', 'preflight:banners-fallback-image', 'review-template:build'], function(done) {

    // Copy banners into review (only folders with dimensions in label)
    var bannerList = utils.getBanners();
    bannerList.forEach(function(item) {
        var banner = './review/banners/' + item;
        fs.copy('./banners/' + item, banner);
        // remove controls and source.css, used during development
        del([banner + '/assets/_banner-support-files', banner + '/assets/css/source.css']);
    });

    // rename fallback image
    fs.find('review/banners', { matching: ['fallback.{jpg,gif,png}'] }).forEach(function(image) {
        var ext = image.split('.').pop();
        fs.rename(image, project.name + '_' + utils.getDimensions(image).formatted + '.' + ext);
    });

    sequence('browsersync:review', done);
});

gulp.task('review-template:build', false, function(done) {
    sequence('clean:review', 'review-template:clone', 'review-template:update-directory', 'review-template:update-index', done);
});

/* Clone Review Template git repository and update with project-specific info
--------------------------------------------------------------------------- */
gulp.task('review-template:clone', false, ['clean:review'], function(done) {
    // Clone Review Page repository and set up directory
    git.clone(project.review_template, {args: './review'}, function(err) {
        if (err) { console.log(err); }
        else { done(); }
    });
});

/* Move files around and delete unnecessary files/folders
--------------------------------------------------------------------------- */
gulp.task('review-template:update-directory', false, function(done) {
    // move files to ./review root
    var review = fs.cwd('./review/public');
    review.move('./index.html', '../index.html');
    review.move('./assets', '../assets');
    // remove extra files
    del(['review/README.md', 'review/source', 'review/public', 'review/.*']);
    // add banner controls for review
    var controls = '_banner-support-files/controls/';
    fs.copy('./banners/' + controls, './review/assets/' + controls);

    done();
});

/* Update main review `index.html` page to show all banners and meta info
--------------------------------------------------------------------------- */
gulp.task('review-template:update-index', false, function(done) {
    var bannerHtml = [];
    var bannerList = utils.getBanners();

    var updateIndex = function() {
        return tap(function(file) {
            var contents = file.contents.toString('utf-8');
            var $ = cheerio.load(contents);

            var title = $('title').text().replace('{{title}}', project.title);
            $('title').text(title);
            $('h3.headline').text(project.title);

            // Update Tabs
            var tpl_tab = utils.trim($('#tab-item').html());
            var tpl_tab_single = utils.trim($('#tab-single-item').html());

            $(bannerList).each(function(i, banner) {
                var modifiedTime = utils.walkDirectory('./banners/' + banner).sort(function(a, b) { return b.modifyTime - a.modifyTime; });
                var modifiedDate = new Date(modifiedTime[0].modifyTime).toISOString();

                bannerHtml.push(
                    tpl_tab
                        .replace('{{type}}', 'iframe')
                        .replace('{{filesize}}', fs.inspectTree('./banners/' + banner).size)
                        .replace('{{modified}}', modifiedDate)
                        .replace('{{size}}', banner)
                );
            });
            bannerHtml.push(tpl_tab_single.replace('{{size}}', bannerList[0]));
            $('.tabs').html(bannerHtml.join(''));
            $('.tabs').find('input[type="radio"]').first().attr('checked', true);

            $('#tab-item, #tab-single-item').remove(); // remove the templates from the index page
            // write all the changes to the page
            file.contents = new Buffer($.html());
        });
    };

    return gulp
        .src('./review/index.html')
        .pipe(updateIndex())
        .pipe(gulp.dest('./review'));
});

/* Task: Deploy -- prep banners and zip each directory for distribution
--------------------------------------------------------------------------- */
gulp.task('clean:deploy', false, function(done) {
    return del(['deploy/**/.*', 'deploy/**/*'], {force: true});
});
gulp.task('clean:deploy-folders', false, ['clean:review'], function(done) {
    return del.sync(['deploy/**/*', '!deploy/*.zip'], {force: true});
});

gulp.task('inject:ad-platform', false, function(done) {
    var errors = [];
    var errorTitle = gutil.colors.bgRed.white.bold('  advertising platform  ') + '\n\n';
    var platform = flags.platform.toLowerCase();

    if (!flags.platform) {
        errors.push(gutil.colors.red('\u2718') + gutil.colors.bold(' ad platform flag') + ': missing\n');
        errors.push('platform options: ' + gutil.colors.cyan('doubleclick') + ' or ' +  gutil.colors.cyan('sizmek') + '\n\n');
        errors.push(gutil.colors.gray('e.g. gulp deploy --platform doubleclick\n'));
        errors.push(gutil.colors.gray('e.g. gulp deploy --platform sizmek\n\n'));

        console.log(utils.message(errorTitle + errors.join('')));
        process.exit(1);
    }

    var supportFiles = fs.cwd('./banners/_banner-support-files/ad-platform/');
    var markdown = supportFiles.read(flags.platform + '.md').toString();

    var getAdScript = function(type) {
        var adScriptRegEx = new RegExp('`{3}script-' + type + '([\\s\\S]+?)`{3}\\n', 'g');
        var adScriptStr = markdown.slice().match(adScriptRegEx)[0].replace(adScriptRegEx, '$1');
        return utils.trim(adScriptStr);
    };

    var injectAdPlatform = function() {
        return tap(function(file) {
            var filename = path.basename(file.relative);

            if (filename === 'index.html') {
                var adScriptLib = file.contents.toString().replace('<!-- {inject:ad-platform-lib-url} -->', getAdScript('lib'));
                file.contents = new Buffer(adScriptLib);
            }

            if (filename === 'script.js') {
                var adScriptInit = file.contents.toString().replace('timeline.init();', getAdScript('init'));
                file.contents = new Buffer(adScriptInit);

                if (platform === 'sizmek') { // move init file into folder
                    fs.copy(supportFiles.cwd() + '/EBLoader.js', path.parse(file.path).dir + '/EBLoader.js', { overwrite: true });
                }
            }
        });
    };

    return gulp
        .src(['./deploy/**/index.html', './deploy/**/script.js'])
        .pipe(injectAdPlatform())
        .pipe(gulp.dest('./deploy'));
});

// loop through directories, clean up folders/files, zip up for distribution
gulp.task('deploy', 'zip up banner directories for distribution', ['clean:deploy', 'review'], function(done) {
    fs.move('review/banners', 'deploy');
    sequence('inject:ad-platform', 'zip', 'clean:deploy-folders', done);
}, {
    options: {
        'platform': 'ad platform distribution (`doubleclick` or `sizmek`)'
    }
});

/* SUB-TASK: Two actions: Zip up each directory, zip up all directories as one
==================================================================================================== */
gulp.task('zip', false, function(done) {
    var folders = utils.getFolders(zipFolder);

    var singleZip = folders.map(function(folder) {
        return gulp
            .src(path.join(zipFolder, folder, '/**/*'))
            .pipe(plumber({ errorHandler: reportError }))
            .pipe(zip(project.name + '_' + folder + '.zip'))
            .pipe(gulp.dest(zipFolder));
    });

    var groupZip = gulp
        .src(path.join(zipFolder, '/**/*'))
        .pipe(plumber({ errorHandler: reportError }))
        .pipe(zip(project.name + '-all(' + folders.length + ').zip'))
        .pipe(gulp.dest(zipFolder));

    return merge(singleZip, groupZip);
});

/* SUB-TASKS: Modify assets (html, images, styles, scripts) on change
==================================================================================================== */
gulp.task('html', false, function(done) {
    return gulp
        .src(watchFolder + paths.html)
        .pipe(plumber({ errorHandler: reportError }));
});

// gulp.task('assets', false, function() {
//     return gulp
//         .src(watchFolder + paths.img);
// });

gulp.task('styles', false, function() {
    var processors = [
        autoprefixer({ browsers: ['> 1%', 'last 3 versions', 'ie >= 9', 'ios >= 7', 'android >= 4.4']}),
        variables(),
        position(),
        calc(),
        sorting({ 'sort-order': 'zen' })
    ];

    return gulp
        .src(watchFolder + paths.css.source)
        .pipe(plumber({ errorHandler: reportError }))
        .pipe(postcss(processors))
        .pipe(rename('style.css'))
        .pipe(gulp.dest(watchFolder + paths.css.destination));
});

// gulp.task('scripts', false, function() {
//     return gulp
//         .src(watchFolder + paths.script);
// });

/* SUB-TASKS: Preflight Checklist
==================================================================================================== */
/* Make sure Package.json project meets minimum requirements before proceeding
--------------------------------------------------------------------------- */
gulp.task('preflight:package.json', false, function() {
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
gulp.task('preflight:watch-directory', false, function() {
    var errors = [];
    var errorTitle = gutil.colors.bgRed.white.bold('  watch directory  ') + '\n\n';
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
});

/* Check to make sure there are directories with dimensions in label
--------------------------------------------------------------------------- */
gulp.task('preflight:directory-check', false, function() {
    var errorTitle = '';
    var errorNote = '';
    var errors = [];

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

    if (errors.length) {
        var msg = errorTitle + errors.join('') + errorNote + '\n';
        console.log(utils.message(msg));
        process.exit(1);
    }
});

/* Make sure each banner size has a fallback image
--------------------------------------------------------------------------- */
gulp.task('preflight:banners-fallback-image', false, function() {
    var errorTitle = '';
    var errorNote = '';
    var errors = [];

    var bannerList = utils.getBanners();
    errorTitle = gutil.colors.bgRed.white.bold('  Fallback Images  ') + '\n\n';
    errorNote = gutil.colors.gray('\nFix any issues with the fallback image(s) before proceeding\n');
    errorNote += gutil.colors.gray('Ensure each image is named') + ' ' + gutil.colors.cyan('fallback') + '\n'
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
                // check for correct dimensions (possibly incorrect when copying folders but not updating fallback image)
                var folderSize = utils.getDimensions(banner);
                var dimensions = sizeOf(fallback[0]);
                if (folderSize.width !== dimensions.width || folderSize.height !== dimensions.height) {
                    errors.push(gutil.colors.red('\u2718 ') + gutil.colors.bold(banner) + ': fallback image size doesn\'t match\n');
                    errors.push('  - folder size: ' + gutil.colors.cyan(folderSize.formatted) + '\n');
                    errors.push('  - image size: ' + gutil.colors.cyan(dimensions.width + 'x' + dimensions.height) + '\n');
                }
            }
        }
    });

    if (errors.length) {
        var msg = errorTitle + errors.join('') + errorNote + '\n';
        console.log(utils.message(msg));
        process.exit(1);
    }
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
