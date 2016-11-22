/* TASK: Default -- Will only show `help` message; list all available tasks
------------------------------------------------------------------------------------------------- */
module.exports = function(gulp, plugin, config, utils) {
    gulp.task('default', function(done) {
        plugin.sequence('help', done);
    });
};
