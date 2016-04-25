/* Project Packages
==================================================================================================== */
// Include Gulp
var gulp = require('gulp-help')(require('gulp'), {'description': '', 'hideEmpty': true, 'hideDepsMessage': true});
var pkg = require('./package.json');

// NPM Packages
var fs = require('fs-jetpack');
var gutil = require('gulp-util');
var Supplant = require('supplant');
var subs = new Supplant();
var flags = require('minimist')(process.argv.slice(2));

/* Setup: Initial values from banner boilerplate
--------------------------------------------------------------------------- */
var defaults = {
    name: 'client-name', // 2016-bro-8813 //https://docs.npmjs.com/files/package.json#name
    title: '{{Project Title}}', // Will be used on the review page template
    desc: '{{Project Description}}', // Will be used on the review page template
    folder: '_banner-template'
};

/* Utilities
--------------------------------------------------------------------------- */
var utils = {
    divider: function() {
        var cols = process.stdout.columns;
        return Array.apply(null, { length: cols }).join('-').slice(0, cols);
    }
};

/* TASKS
==================================================================================================== */

/* Task: Review -- prep banners and build review page
--------------------------------------------------------------------------- */
// pull remote template file, merge and put into `review` folder

/* Task: Deploy -- prep banners and zip each directory for distribution
--------------------------------------------------------------------------- */
// loop through directories, clean up folders/files, zip up for distribution

/* Watch a specific banner directory; use --flag to declare folder name
--------------------------------------------------------------------------- */
// --300x250
// --controls


/* SUB-TASKS
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
        console.log(utils.divider(), msg, utils.divider());
        process.exit(1);
        // this.emit('end');
    }
});

/* Setup: Make sure folder is setup with banner dimensions
--------------------------------------------------------------------------- */
gulp.task('preflight-directory', false, function() {
    // if DIR is _banner-template, then alert('copy directory or rename with banner size (e.g. 300x250'));
    // set flag to folder "--300x250" to watch folder for changes
    // if DIR is 300x250, check that index.html has size set. Confirm the size is 300x250

    if (process.stdout.isTTY) { // is terminal window
        console.log(utils.divider());
        console.log('The console size is:', process.stdout.getWindowSize());
        console.log(utils.divider());
    }
    var bannerDir = fs.cwd('banners/_banner-template');
    var data = bannerDir.read('index.html');
    if (/{{width}}/.test(data.toString())) {
        console.log('prompt user for banner size');
    }
    // var txt = subs.text(data, {
    //     width: 300,
    //     height: 250
    // });
    // txt.split('\n').forEach(function(line, i) {
    //     if (line.indexOf('ad.size') > -1) {
    //         console.log(line);
    //     }
    //     if (line.indexOf('<title>') > -1) {
    //         console.log(line);
    //     }
    // });
    // fs.write(bannerDir.cwd() + '/index.html', txt);
});
