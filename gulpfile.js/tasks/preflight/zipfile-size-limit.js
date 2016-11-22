/* TASK: Make sure each banner size has a fallback image
------------------------------------------------------------------------------------------------- */
module.exports = function(gulp, plugin, config, utils) {
    gulp.task('preflight:zipfile-size-limit', false, function() {
        var colors = plugin.gutil.colors;
        var errors = [];

        var errorTitle = colors.bgRed.white.bold('  IAB Zipfile Size Limit  ') + '\n\n';
        var errorNote = colors.gray('\nIAB Maximum Filesize limit: ') + colors.white(utils.getReadableFileSize(config.defaults.zipFolderSizeLimit) + '\n');

        var zipFolderPath = plugin.path.join(config.watchFolder, config.defaults.zipFolder);
        plugin.fs.inspectTree(zipFolderPath).children.forEach(function(zipFile) {
            if (zipFile.type !== 'file') { return; }
            if (/(\w+)-all\(\d+\)/.test(zipFile.name)) { return; } // ignore larger collection zip file

            if (zipFile.size > config.defaults.zipFolderSizeLimit) {
                errors.push(colors.red('\u2718 ') + colors.bold(zipFile.name) + ': ' + colors.cyan(utils.getReadableFileSize(zipFile.size)) + '\n');
            }
        });

        if (errors.length) {
            var msg = errorTitle + errors.join('') + errorNote + '\n';
            console.log(utils.message(msg));
            if (config.defaults.zipFolderExceedFlag === 'error') { process.exit(1); }
        }
    });
};
