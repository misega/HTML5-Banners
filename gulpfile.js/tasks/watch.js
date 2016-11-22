/* TASK: Review -- clean up folders/files, build review page
------------------------------------------------------------------------------------------------- */
module.exports = function(gulp, plugin, config, utils) {
    gulp.task('watch', 'monitor files for changes', ['preflight:directory-watch', 'directory-update', 'styles', 'browserSync'], function(done) {
        gulp.watch([config.watchFolder + config.paths.html]).on('change', function() {
            plugin.sequence('html', plugin.browserSync.reload);
        });
        gulp.watch([config.watchFolder + config.paths.img]).on('change', function() {
            plugin.sequence('assets', plugin.browserSync.reload);
        });
        gulp.watch(config.watchFolder + config.paths.css.source).on('change', function() {
            plugin.sequence('styles', plugin.browserSync.reload);
        });
        gulp.watch(config.watchFolder + config.paths.js).on('change', function() {
            plugin.sequence('scripts', plugin.browserSync.reload);
        });
    }, {
        options: {
            'folder': 'active directory to monitor (e.g. --folder 300x250)',
            'controls': 'show banner controls; enables scrubbing through timeline'
        }
    });
};
