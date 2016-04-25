/* Project Packages
==================================================================================================== */
// Main Gulp Tasks
var gulp = require('gulp-help')(require('gulp'), {'description': '', 'hideEmpty': true, 'hideDepsMessage': true});
var pkg = require('./package.json');
var browserSync = require('browser-sync');
var sequence = require('run-sequence').use(gulp);

// Misc NPM Packages
var del = require('del');
var fs = require('fs-jetpack');
var size = require('gulp-size');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var flags = require('minimist')(process.argv.slice(2));
var Supplant = require('supplant');
var subs = new Supplant();

var devFolder = '';

/* Setup: Initial values from banner boilerplate
--------------------------------------------------------------------------- */
var defaults = {
    name: 'client-name', // YY-aaa-9999 (e.g. 15-car-7155); view README.md for formatting
    title: '{{Project Title}}', // Will be used on the review page template
    desc: '{{Project Description}}', // Will be used on the review page template
    folder: '_banner-template' // starter boilerplate to build banners
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
gulp.task('review', 'build review page from banner directories', function(done) {
    console.log('review:build');
});

// gulp.task('review:ftp', 'upload review site to ftp', function(done) {
//     console.log('review:ftp');
// });

/* Task: Deploy -- prep banners and zip each directory for distribution
--------------------------------------------------------------------------- */
// loop through directories, clean up folders/files, zip up for distribution
gulp.task('deploy', 'zip up banner directories for distribution', function(done) {
    console.log('deploy');
});

/* Watch a specific banner directory; use --flag to declare folder name
--------------------------------------------------------------------------- */
gulp.task('watch', 'monitor files for changes', ['preflight-directory'], function(done) {
    // gulp.watch([config.scss.watchFiles]).on('change', function() {
    //     sequence('styles', browserSync.reload);
    // });
    // gulp.watch([config.scss.copyFiles]).on('change', function() {
    //     sequence('copy:styles', browserSync.reload);
    // });
    // gulp.watch(config.js.watchFiles).on('change', function() {
    //     sequence('scripts', browserSync.reload);
    // });
    // gulp.watch(config.js.copyFiles).on('change', function() {
    //     sequence('copy:scripts', browserSync.reload);
    // });
}, {
    options: {
        'folder': 'directory labeled by dimensions (e.g. --folder 300x250)',
        'controls': 'show banner controls; enables scrubbing through timeline'
    }
});
// --300x250
// --controls


/* SUB-TASKS
==================================================================================================== */

/* Watch a specific banner directory; use --flag to declare folder name
--------------------------------------------------------------------------- */
gulp.task('browserSync', false, function(done) {
    browserSync({
        //proxy: 'public.drupal7.broco',
        server: { baseDir: devFolder },
        open: true,
        notify: false,
        // See: System Preferences… » Sound » Sound Effects
        sound: 'Basso'
    });
});

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
gulp.task('preflight-directory', false, function() {
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

    // Directory Exists. Let's update the index page and style page to show the correct dimensions
    var currentDirectory = fs.cwd('banners/' + flags.folder);

    // The directory is available, let's update files to match the directory name
    var dimensions = flags.folder.match(/(\d{2,}x\d{2,})/g)[0].split('x');
    var size = {
        width: dimensions[0],
        height: dimensions[1]
    };

    // set <meta name="ad.size"> and <title> to dimensions of folder
    var adSizeRegExp = new RegExp('content="width=({{width}}|\d{2,}), height=({{height}}|\d{2,})"', 'g');
    var titleRexExp = new RegExp('<title>(.*)<\/title>', 'g');
    var indexContent = currentDirectory.read('index.html');
    indexContent = indexContent.toString().replace(adSizeRegExp, 'content="width=' + size.width + ', height=' + size.height + '"');
    indexContent = indexContent.toString().replace(titleRexExp, '<title>Ad Banner: ' + size.width + 'x' + size.height + '</title>');
    fs.write(currentDirectory.cwd() + '/index.html', indexContent);

    // set base folder for BrowserSync
    devFolder = currentDirectory.cwd();
});
