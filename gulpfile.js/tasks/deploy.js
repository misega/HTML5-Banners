/* TASK: Review -- clean up folders/files, build review page
------------------------------------------------------------------------------------------------- */
module.exports = function(gulp, plugin, config, utils) {
    gulp.task('deploy', 'zip up banner directories for distribution', ['preflight:checklist', 'clean'], function(done) {
        config.watchFolder = config.folder.deploy;
        plugin.sequence('copy', 'inject:ad-platform', 'zip:banners', 'clean:deploy-folder', done);
    }, {
        options: {
            'platform': 'ad platform distribution (' + utils.formatAvailablePlatforms() + ')'
        }
    });
};
