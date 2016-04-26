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
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var merge = require('merge-stream');
var flags = require('minimist')(process.argv.slice(2));

var devFolder = '';
var zipFolder = '';
var browserSyncRewriteRules = [{
    match: /<!-- {inject:banner-controls} -->/ig,
    fn: function(match) {
        return '<script src="assets/_dev-build/_banners.js"></script>';
    }
}];

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
gulp.task('review', 'build review page from banner directories', ['preflight-directory', 'styles'], function(done) {
    // fs.remove('review');
    // fs.dir('review/banners');

    // var banners = [];
    // var temp = fs.cwd('temporary');
    // var folders = fs.inspectTree('temporary');
    // folders.children.forEach(function(item) {
    //     if (item.type !== 'dir') { return; }

    //     var banner = 'review/banners/' + item.name;
    //     banners.push(banner);
    //     fs.copy(temp.cwd() + '/' + item.name, banner);
    // });

    // fs.find('review', { matching: ['_dev-build'], files: false, directories: true }).forEach(function(devFolder) {
    //     fs.remove(devFolder);
    // });

    // zipFolder = 'review/banners';
    // sequence('zip');
});

// gulp.task('review:ftp', 'upload review site to ftp', function(done) {
//     console.log('review:ftp');
// });

/* Task: Deploy -- prep banners and zip each directory for distribution
--------------------------------------------------------------------------- */
// loop through directories, clean up folders/files, zip up for distribution
gulp.task('deploy', 'zip up banner directories for distribution', ['preflight-directory', 'styles', 'review'], function(done) {
    console.log('deploy');
});

/* Watch a specific banner directory; use --flag to declare folder name
--------------------------------------------------------------------------- */
gulp.task('watch', 'monitor files for changes', ['preflight-directory', 'styles', 'browserSync'], function(done) {
    gulp.watch([devFolder + paths.html]).on('change', function() {
        sequence('html', browserSync.reload);
    });
    // gulp.watch([devFolder + paths.img]).on('change', function() {
    //     sequence('assets', browserSync.reload);
    // });
    gulp.watch(devFolder + paths.css.source).on('change', function() {
        sequence('styles', browserSync.reload);
    });
    // gulp.watch(devFolder + paths.js).on('change', function() {
    //     sequence('scripts', browserSync.reload);
    // });
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
            .pipe(zip(pkg.name + '_' + folder + '.zip'))
            .pipe(gulp.dest(path.join(zipFolder, folder)));
    });

    var groupZip = gulp
        .src(path.join(zipFolder, '/**/*'))
        .pipe(zip(pkg.name + '-all(' + folders.length + ').zip'))
        .pipe(gulp.dest('review/banners'));

    return merge(singleZip, groupZip);
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

    if (pkg.name === defaults.name || !pkg.name.length) {
        errors.push(gutil.colors.red('\u2718') + gutil.colors.bold(' name') + ': missing\n');
    }
    else if (!pkg.name.match(/\b(\d{2}[-]?[a-z]{3}[-]?\d{4})\b/)) {
        errors.push(gutil.colors.red('\u2718') + gutil.colors.bold(' name') + ': incorrect formatting\n');
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
    var dimensions = flags.folder.match(/(\d{2,}x\d{2,})/g)[0].split('x');
    var size = {
        width: dimensions[0],
        height: dimensions[1]
    };

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

    // Prevent the 'watch' task from stopping
    this.emit('end');
};
