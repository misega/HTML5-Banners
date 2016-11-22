/* TASK: Update browser(s) when files change
------------------------------------------------------------------------------------------------- */
module.exports = function(gulp, plugin, config, utils) {
    var browserSyncRewriteRules = [{
        match: /<!-- {inject:banner-controls} -->/ig,
        fn: function(match) {
            return '<script src="assets/_banner-support-files/controls/_banners.js"></script>';
        }
    }];

    gulp.task('browserSync', false, ['directory-update'], function() {
        plugin.browserSync({
            server: { baseDir: config.watchFolder },
            open: true,
            notify: false,
            rewriteRules: (plugin.flags.controls)? browserSyncRewriteRules : []
        });
    });
};
