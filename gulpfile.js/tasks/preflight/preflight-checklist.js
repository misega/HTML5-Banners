/* TASK: Make sure Package.json project meets minimum requirements before proceeding
------------------------------------------------------------------------------------------------- */
module.exports = function(gulp, plugin, config, utils) {
    gulp.task('preflight:checklist', false, function(done) {
        plugin.sequence('preflight:package.json', 'preflight:directory-check', 'preflight:banner-fallback-image', 'preflight:ad-platform', done);
    });
};
