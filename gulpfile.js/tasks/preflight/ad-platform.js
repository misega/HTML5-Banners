/* TASK: Make sure each banner size has a fallback image
------------------------------------------------------------------------------------------------- */
module.exports = function(gulp, plugin, config, utils) {
    gulp.task('preflight:ad-platform', false, function() {
        var colors = plugin.gutil.colors;
        var platform = (typeof plugin.flags.platform === 'string')? plugin.flags.platform.toLowerCase() : null;
        var availablePlatforms = utils.getAvailablePlatforms();

        var errors = [];
        var errorTitle = colors.bgRed.white.bold('  Ad Platform  ') + '\n\n';
        var errorNote = '  - Available platforms: ' + colors.cyan(utils.formatAvailablePlatforms()) + '\n';

        // --platform flag missing
        if (typeof plugin.flags.platform === 'undefined') {
            errors.push(colors.red('\u2718 ') + colors.bold('--platform') + ' flag requires a value\n');
        }
        // --platform flag exists; must require a value
        else if (typeof plugin.flags.platform === 'boolean') {
            errors.push(colors.red('\u2718 ') + colors.bold('--platform') + ' flag requires a value\n');
        }
        // ad platform markdown file not found. Show available options
        else if (config.watchFolder === config.folder.deploy && platform === null) {
            errors.push(colors.red('\u2718 ') + 'Ad Platform required\n');
        }
        else if (!utils.formatAvailablePlatforms().includes(platform)) {
            errors.push(colors.red('\u2718 ') + 'Ad Platform not found: ' + colors.bold(platform) + '\n');
        }
        // everything is good, proceed.
        else {
            config.injectAdPlatform = true;
        }

        // ad platform optional w/ `review` task
        if (utils.getActiveTask(this) === 'review' && (!plugin.flags.platform && !platform)) {
            errors = []; // clear any errors
            config.injectAdPlatform = false;
        }

        if (errors.length) {
            var msg = errorTitle + errors.join('') + errorNote + '\n';
            console.log(utils.message(msg));
            process.exit(1);
        }
    });
};
