/* TASK: Make sure each banner size has a fallback image
------------------------------------------------------------------------------------------------- */
module.exports = function(gulp, plugin, config, utils) {
    gulp.task('preflight:banner-fallback-image', false, function() {
        var colors = plugin.gutil.colors;
        var errors = [];

        var errorTitle = colors.bgRed.white.bold('  Fallback Images  ') + '\n\n';
        var errorNote = colors.gray('\nFix any issues with the fallback image(s) before proceeding\n');
        errorNote += colors.gray('Ensure each image is named') + ' ' + colors.cyan('fallback') + '\n';

        var bannerList = utils.getBanners();
        bannerList.forEach(function(banner) {
            var folder = 'banners/' + banner;
            var folderSize = utils.getDimensions(banner);
            var image = plugin.fs.find(folder, { matching: ['fallback.*'] });

            // 1) Find `fallback` image
            if (!image.length) { // no `fallback` image found
                errors.push(colors.red('\u2718 ') + colors.bold(banner) + ': missing fallback image\n');
            }
            else if (image.length > 1) { // multiple `fallback` images found
                errors.push(colors.red('\u2718 ') + colors.bold(image.length) + ' fallback images found in ' + colors.bold(banner) + ':\n');
                image.forEach(function(duplicate) {
                    errors.push(colors.red('\u21B3   ') + colors.bold(duplicate) + '\n');
                });
                errors.push(colors.white('Choose one image and delete any others') + '\n\n');
            }
            else {
                var fallback = plugin.path.parse(image[0]);
                var dimensions = plugin.imageSize(image[0]);

                // 2) Check for correct mime type of `fallback` image
                if (!fallback.ext.match(/jpg|gif|png/)) {
                    errors.push(colors.red('\u2718 ') + colors.bold(banner) + ': wrong mimetype \u2192 ' + colors.red(fallback.ext.toUpperCase()) + '\n');
                    errors.push('  - Allowed mime-types: ' + colors.cyan('JPG, GIF, PNG') + '\n');
                }

                // 3) Check for correct dimensions
                if (folderSize.width !== dimensions.width || folderSize.height !== dimensions.height) {
                    errors.push(colors.red('\u2718 ') + colors.bold(banner) + ': fallback image size doesn\'t match\n');
                    errors.push('  - folder size: ' + colors.cyan(folderSize.formatted) + '\n');
                    errors.push('  - image size: ' + colors.cyan(dimensions.width + 'x' + dimensions.height) + '\n');
                }
            }
        });

        if (errors.length) {
            var msg = errorTitle + errors.join('') + errorNote + '\n';
            console.log(utils.message(msg));
            process.exit(1);
        }
    });
};
