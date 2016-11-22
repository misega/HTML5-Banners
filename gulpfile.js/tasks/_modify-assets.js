/* TASK: Modify assets (html, images, styles, scripts) on change
------------------------------------------------------------------------------------------------- */
module.exports = function(gulp, plugin, config, utils) {
    gulp.task('html', false, function(done) {
        return gulp
            .src(config.watchFolder + config.paths.html)
            .pipe(plugin.plumber({ errorHandler: utils.reportError }));
    });

    gulp.task('assets', false, function() {
        return gulp
            .src(config.watchFolder + config.paths.img)
            .pipe(plugin.plumber({ errorHandler: utils.reportError }));
    });

    gulp.task('styles', false, function() {
        var processors = [
            plugin.autoprefixer({ browsers: ['> 1%', 'last 3 versions', 'ie >= 9', 'ios >= 7', 'android >= 4.4']}),
            plugin.variables(),
            plugin.position(),
            plugin.calc(),
            plugin.sorting({ 'sort-order': 'zen' })
        ];

        return gulp
            .src(config.watchFolder + config.paths.css.source)
            .pipe(plugin.plumber({ errorHandler: utils.reportError }))
            .pipe(plugin.postcss(processors))
            .pipe(plugin.rename('style.css'))
            .pipe(plugin.header(config.defaults.css_header))
            .pipe(gulp.dest(config.watchFolder + config.paths.css.destination));
    });

    gulp.task('scripts', false, function() {
        return gulp
            .src(config.watchFolder + config.paths.script)
            .pipe(plugin.plumber({ errorHandler: utils.reportError }));
    });
};
