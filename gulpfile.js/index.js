/* Project Packages
================================================================================================= */
// Main Gulp Tasks
var gulp = require('gulp-help')(require('gulp'), {'description': '', 'hideEmpty': true, 'hideDepsMessage': true});
var tasks = require('require-dir')('./tasks', { recurse: true });
var config = require('./config');
var utils = require('./utils');

/* Load all plugins
------------------------------------------------------------------------------------------------- */
var plugins = require('gulp-load-plugins')({
    pattern: ['*', '!require-dir', '!minimist', '!run-sequence'],
    replaceString: /\b(gulp|postcss)[\-.]/,
    rename: {
        'fs-jetpack': 'fs',
        'gulp-util': 'gutil',
        'merge-stream': 'merge',
        'postcss-position-alt': 'position',
        'postcss-advanced-variables': 'variables'
    }
});
// add additional plugin(s) that require parameters
plugins.flags = require('minimist')(process.argv.slice(2));
plugins.sequence = require('run-sequence').use(gulp);
// add a built-in node module
plugins.path = require('path');

/* Instantiate & pass parameters to all found tasks
------------------------------------------------------------------------------------------------- */
function iterate(tasks) {
    for (var task in tasks) {
        if (tasks[task] instanceof Function) {
            tasks[task](gulp, plugins, config, utils);
        }
        else {
            if (typeof tasks[task] === 'object') {
                iterate(tasks[task]);
            }
        }
    }
}
iterate(tasks);
