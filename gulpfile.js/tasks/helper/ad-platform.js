/* TASK:
------------------------------------------------------------------------------------------------- */
module.exports = function(gulp, plugin, config, utils) {
    gulp.task('inject:ad-platform', false, function(done) {
        var platform = (typeof plugin.flags.platform === 'string')? plugin.flags.platform.toLowerCase() : null;
        var supportFiles = plugin.fs.cwd('./banners/_banner-support-files/ad-platform/');

        var getAdScript = function(type) {
            var markdown = supportFiles.read(plugin.flags.platform + '.md').toString();
            var adScriptRegEx = new RegExp('`{3}script-' + type + '([\\s\\S]+?)`{3}\\n', 'g');
            var adScriptStr = markdown.slice().match(adScriptRegEx)[0].replace(adScriptRegEx, '$1');
            return utils.trim(adScriptStr);
        };

        var injectPlatformScript = function() {
            return plugin.tap(function(file) {
                var filename = plugin.path.basename(file.relative);

                if (filename === 'index.html') {
                    var adScriptLib = file.contents.toString().replace('<!-- {inject:ad-platform-lib-url} -->', getAdScript('lib'));
                    file.contents = new Buffer(adScriptLib);
                }

                if (filename === 'script.js') {
                    var adScriptInit = file.contents.toString().replace('timeline.init();', getAdScript('init'));
                    file.contents = new Buffer(adScriptInit);

                    if (platform === 'sizmek') { // move init file into folder
                        plugin.fs.copy(supportFiles.cwd() + '/EBLoader.js', plugin.path.parse(file.path).dir + '/EBLoader.js', { overwrite: true });
                    }
                }
            });
        };

        if (config.injectAdPlatform) {
            return gulp
                .src([config.watchFolder + '/' + config.defaults.zipFolder + '/**/index.html', config.watchFolder + '/' + config.defaults.zipFolder + '/**/script.js'])
                .pipe(injectPlatformScript())
                .pipe(gulp.dest(config.watchFolder + '/' + config.defaults.zipFolder));
        }
        else {
            done();
        }

    });
};
