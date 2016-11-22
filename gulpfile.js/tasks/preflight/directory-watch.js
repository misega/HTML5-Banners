/* TASK: Make sure folder name has banner dimensions and the flag is set
------------------------------------------------------------------------------------------------- */
module.exports = function(gulp, plugin, config, utils) {
    gulp.task('preflight:directory-watch', false, function() {
        var colors = plugin.gutil.colors;
        var isDirectory = plugin.fs.exists('banners/' + plugin.flags.folder);

        var errors = [];
        var errorTitle = colors.bgRed.white.bold('  watch directory  ') + '\n\n';

        // Flag isn't set. If the folder isn't declared, we can't monitor changes.
        if (!plugin.flags.folder) {
            errors.push(colors.red('\u2718') + colors.bold(' folder flag') + ': missing\n');
            errors.push(colors.gray('e.g. `gulp watch --folder 300x250`\n\n'));
        }
        // Flag is set but the directory is missing. Pick a directory to copy.
        else if (!isDirectory) {
            errors.push(colors.red('\u2718') + colors.bold(' directory') + ': missing\n');
            // Missing directory: copy the starter boilerplate folder
            var boilerplateExists = plugin.fs.exists('banners/' + config.defaults.folder);
            if (boilerplateExists) {
                errors.push('Copy ' + colors.cyan(config.defaults.folder) + ' and/or rename with banner size (e.g. ' + plugin.flags.folder + ')\n\n');
            }
            // Missing directory: no boilerplate folder to copy, try another folder?
            else {
                errors.push('Copy another directory and rename with banner size (e.g. ' + plugin.flags.folder + ')\n\n');
            }
        }

        if (errors.length) {
            var msg = errorTitle + errors.join('');
            console.log(utils.message(msg));
            process.exit(1);
        }
    });
};
