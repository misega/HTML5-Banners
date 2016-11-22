/* TASK: Check to make sure there are directories with dimensions in label
------------------------------------------------------------------------------------------------- */
module.exports = function(gulp, plugin, config, utils) {
    gulp.task('preflight:directory-check', false, function() {
        var colors = plugin.gutil.colors;

        var errorTitle = '';
        var errorNote = '';
        var errors = [];

        var bannerList = utils.getBanners();
        if (!bannerList.length) {
            errorTitle = colors.bgRed.white.bold('  Empty Banner Directory  ') + '\n\n';
            errors.push(colors.red('\u2718') + colors.bold(' Banners') + ': missing\n\n');

            var boilerplateExists = plugin.fs.exists('banners/' + config.defaults.folder);
            if (boilerplateExists) {
                errors.push('Copy ' + colors.cyan(config.defaults.folder) + ' and/or rename with banner size (e.g. 300x250)\n');
                errors.push('Then run `gulp watch --folder 300x250` to build banners\n');
            }
        }

        if (errors.length) {
            var msg = errorTitle + errors.join('') + errorNote + '\n';
            console.log(utils.message(msg));
            process.exit(1);
        }
    });
};
