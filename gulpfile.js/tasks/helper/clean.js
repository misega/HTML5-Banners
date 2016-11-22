/* TASK:
------------------------------------------------------------------------------------------------- */
module.exports = function(gulp, plugin, config, utils) {
    gulp.task('clean', false, function(done) {
        // [delete any hidden files, delete main folder]
        var reviewFolder = [config.folder.review + '/**/*.*', config.folder.review];
        var deployFolder = [config.folder.deploy + '/**/*.*', config.folder.deploy];
        plugin.del.sync([].concat(reviewFolder, deployFolder), {force: true});
        done();
    });

    gulp.task('clean:review-folder', false, function(done) {
        done();
    });

    gulp.task('clean:deploy-folder', false, ['move:deploy-files'], function(done) {
        plugin.del.sync([
            plugin.path.join(config.folder.deploy, 'banners'),
            plugin.path.join(config.folder.deploy, config.defaults.zipFolder)
        ], {force: true});
        done();
    });

    gulp.task('move:deploy-files', false, function(done) {
        var zipFiles = plugin.path.join(config.watchFolder, config.defaults.zipFolder, '*.zip');
        return gulp.src(zipFiles).pipe(gulp.dest(config.folder.deploy));
    });
};
