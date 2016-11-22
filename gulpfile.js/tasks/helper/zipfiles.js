/* TASK:
------------------------------------------------------------------------------------------------- */
module.exports = function(gulp, plugin, config, utils) {
    gulp.task('zip:banners', false, ['zip:prepare', 'zip:compress'], function(done) {
        var srcFolder = plugin.path.join(config.watchFolder, config.defaults.zipFolder);
        var folders = utils.getFolders(srcFolder);

        // Remove directories. Only leave the compressed zip files
        folders.map(function(folder) {
            plugin.fs.remove(plugin.path.join(srcFolder, folder));
        });

        plugin.sequence('preflight:zipfile-size-limit', done);
    });

    gulp.task('zip:compress', false, function(done) {
        var srcFolder = plugin.path.join(config.watchFolder, config.defaults.zipFolder);
        var folders = utils.getFolders(srcFolder);

        // each folder will be zipped up
        var singleZip = folders.map(function(folder) {
            return gulp
                .src(plugin.path.join(srcFolder, folder, '/**/*'))
                .pipe(plugin.plumber({ errorHandler: config.reportError }))
                .pipe(plugin.zip(config.project.name + '_' + folder + '.zip'))
                .pipe(gulp.dest(srcFolder));
        });

        // if there is only one, there's no need to create a "group" zip too
        if (folders.length === 1) { return plugin.merge(singleZip); }

        // all folders will be grouped and zipped up into one file
        var groupZip = gulp
            .src(plugin.path.join(srcFolder, '/**/*'))
            .pipe(plugin.plumber({ errorHandler: config.reportError }))
            .pipe(plugin.zip(config.project.name + '-all(' + folders.length + ').zip'))
            .pipe(gulp.dest(srcFolder));

        return plugin.merge(singleZip, groupZip);
    });

    gulp.task('zip:prepare', false, function(done) {
        var srcFolder = plugin.path.join(config.watchFolder, config.defaults.zipFolder);
        var folders = utils.getFolders(srcFolder);

        // TODO: Add addition compression tasks
        // https://github.com/ben-eb/gulp-uncss
        // https://github.com/sindresorhus/gulp-imagemin
        // https://www.npmjs.com/package/gulp-unused-images -or-
        // https://www.npmjs.com/package/gulp-delete-unused-images

        var prepareFiles = folders.map(function(folder) {
            var dir = plugin.path.join(srcFolder, folder);
            // 1) Rename `index.html`
            plugin.fs.rename(dir + '/index.html', config.project.name + '_' + folder + '.html');
            var index = plugin.fs.find(dir, { matching: ['*.html'] })[0];

            // 2) Move `fallback` image to root level of each banner folder
            var image = plugin.fs.find(dir, { matching: ['fallback.{jpg,gif,png}'] });
            var fallback = plugin.path.parse(image[0]);
            plugin.fs.move(fallback.dir + '/' + fallback.base, dir + '/' + fallback.base);

            // 3) Rename `fallback` image to project.name
            plugin.fs.find(dir, { matching: ['fallback.{jpg,gif,png}'] }).forEach(function(image) {
                var ext = image.split('.').pop();
                plugin.fs.rename(image, config.project.name + '_' + folder + '.' + ext);
            });

            var jsFilter = plugin.filter([dir + '/assets/js/script.js'], { restore: true });
            var cssFilter = plugin.filter([dir + '/assets/css/style.css'], { restore: true });
            var htmlFilter = plugin.filter([index], { restore: true });

            return gulp
                .src(plugin.path.join(srcFolder, folder, '/**/*'))
                .pipe(plugin.plumber({ errorHandler: config.reportError }))
                // 4) Minify HTML
                .pipe(htmlFilter)
                .pipe(plugin.htmlmin({collapseWhitespace: true, removeComments: true}))
                .pipe(htmlFilter.restore)
                // 5) Minify CSS
                .pipe(cssFilter)
                .pipe(plugin.cssnano())
                .pipe(cssFilter.restore)
                // 6) Minify JS
                .pipe(jsFilter)
                .pipe(plugin.uglify())
                .pipe(jsFilter.restore)
                .pipe(gulp.dest(dir));
        });

        return plugin.merge(prepareFiles);
    });
};
