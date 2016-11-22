/* TASK: Review -- clean up folders/files, build review page
------------------------------------------------------------------------------------------------- */
module.exports = function(gulp, plugin, config, utils) {
    gulp.task('review', 'build review page from banner directories', ['preflight:checklist', 'clean'], function(done) {
        config.watchFolder = config.folder.review;

        var queue = ['copy'];
        if (config.injectAdPlatform) {
            queue.push('inject:ad-platform');
            queue.push('zip:banners');
        }

        queue.push('review-template');

        if (plugin.flags.preview) {
            queue.push('browserSync');
        }
        queue.push(done);

        plugin.sequence.apply(this, queue);
    }, {
        options: {
            'preview': 'open review page in browser'
        }
    });
};
