/* TASK: Update the index page and style page to show the correct dimensions
--------------------------------------------------------------------------- */
module.exports = function(gulp, plugin, config, utils) {
    gulp.task('directory-update', false, function(done) {
        if (!plugin.flags.folder) { done(); return; }

        var currentDirectory = plugin.fs.cwd('banners/' + plugin.flags.folder);
        config.watchFolder = currentDirectory.cwd();

        // The directory is available, let's update files to match the directory name
        var size = utils.getDimensions(plugin.flags.folder);

        // index.html -- set <meta name="ad.size"> and <title> to dimensions of folder
        var adSizeRegExp = new RegExp('content="width=({{width}}|\\d{2,}), height=({{height}}|\\d{2,})"', 'g');
        var titleRexExp = new RegExp('<title>(.*)<\/title>', 'g');
        var indexContent = currentDirectory.read('index.html').toString();
        indexContent = indexContent.replace(adSizeRegExp, 'content="width=' + size.width + ', height=' + size.height + '"');
        indexContent = indexContent.replace(titleRexExp, '<title>Ad Banner: ' + size.width + 'x' + size.height + '</title>');
        plugin.fs.write(currentDirectory.cwd() + '/index.html', indexContent);

        // source.css -- set css variable width/height, if it exists
        var source_css = config.paths.css.source.slice(1);
        if (!plugin.fs.exists(config.watchFolder + '/' + source_css)) { return; }
        var styleContent = currentDirectory.read(source_css).toString();
        styleContent = styleContent.replace(/\$width:\s?({{width}}|\d{2,}px);/g, '$width: ' + size.width + 'px;');
        styleContent = styleContent.replace(/\$height:\s?({{height}}|\d{2,}px);/g, '$height: ' + size.height + 'px;');
        plugin.fs.write(config.watchFolder + '/' + source_css, styleContent);

        /* Controls: Add folder, if flag is active; remove, if not
        --------------------------------------------------------------------------- */
        var controls = '_banner-support-files/controls';
        var controlsFolder = config.watchFolder + '/assets/' + controls;
        var hasControlsFolder = plugin.fs.exists(controlsFolder);
        if (!plugin.flags.controls && hasControlsFolder) {
            plugin.fs.remove(config.watchFolder + '/assets/_banner-support-files');
        }

        if (plugin.flags.controls && !hasControlsFolder) {
            plugin.fs.copy('./banners/' + controls, controlsFolder);
        }

        done();
    });
};
