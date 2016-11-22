/* TASK: Make sure Package.json project meets minimum requirements before proceeding
------------------------------------------------------------------------------------------------- */
module.exports = function(gulp, plugin, config, utils) {
    gulp.task('preflight:package.json', false, function() {
        var colors = plugin.gutil.colors;

        var errors = [];
        var errorTitle = colors.bgRed.white.bold('  package.json  ') + '\n\nRequired Project Information:\n';
        var errorNote = '\nProject information will be displayed\non the generated review page.\nView ' + colors.cyan.italic('README.md') + ' for more details\n\n';

        if (config.pkg.name === config.defaults.name || !config.pkg.name.length || !config.pkg.name.match(/\b(\d{2}[-]?[A-Za-z]{3,}[-]?\d{4,})\b/)) {
            errors.push(colors.red('\u2718') + colors.bold(' name') + ': required format ' + colors.cyan('YY-aaa-9999') + '\n');
            errors.push('  - YY: 2-digit Year\n');
            errors.push('  - aaa: 3-digit Client Code\n');
            errors.push('  - 9999: 4-digit Job Code\n');
        }

        if (config.pkg.title === config.defaults.title || !config.pkg.title.length) {
            errors.push(colors.red('\u2718') + colors.bold(' title') + ': missing\n');
        }

        if (errors.length) {
            var msg = errorTitle + errors.join('') + errorNote;
            console.log(utils.message(msg));
            process.exit(1);
        }
    });
};
