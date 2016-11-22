/* TASK: Copy Banners into Watch Folder
------------------------------------------------------------------------------------------------- */
module.exports = function(gulp, plugin, config, utils) {
    gulp.task('copy', false, function(done) {
        // Copy banners into watch folder (only folders with dimensions in label)
        var bannerList = utils.getBanners();
        var bannerFolder = './' + config.watchFolder + '/banners/';
        var zipFolder = './' + config.watchFolder + '/' + config.defaults.zipFolder;

        bannerList.forEach(function(item) {
            var banner = bannerFolder + item;
            plugin.fs.copy('./banners/' + item, banner);
            // remove unnecessary files/folders within the `assets` folder
            plugin.fs.remove(banner + '/assets/_banner-support-files');
            plugin.fs.remove(banner + '/assets/css/source.css');
            plugin.fs.remove(banner + '/assets/img/keyframes');
            // remove the fonts folder, if empty
            var dirFonts = plugin.fs.inspectTree(banner + '/assets/css/fonts/');
            if (!dirFonts.size) { plugin.fs.remove(banner + '/assets/css/fonts/'); }
        });

        // if `--platform` flag declares a valid ad platform, duplicate `banners` folder and rename as `zip-folder`
        if (config.injectAdPlatform) { plugin.fs.copy(bannerFolder, zipFolder); }

        done();
    });
};
