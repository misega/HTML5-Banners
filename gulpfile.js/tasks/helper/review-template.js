/* TASK:
------------------------------------------------------------------------------------------------- */
module.exports = function(gulp, plugin, config, utils) {
    var reviewTmpFolder = '';

    gulp.task('review-template', false, function(done) {
        reviewTmpFolder = config.watchFolder + '/.tmp';
        plugin.sequence('review-template:clone', 'review-template:update-directory', 'review-template:update-index', done);
    });

    /* Clone Review Page repository and set up in `review` directory
    --------------------------------------------------------------------------- */
    gulp.task('review-template:clone', false, function(done) {
        plugin.git.clone(config.project.review_template, {args: reviewTmpFolder}, function(err) {
            if (err) { console.log(err); }
            else { done(); }
        });
    });

    /* Move files around and delete unnecessary files/folders
    --------------------------------------------------------------------------- */
    gulp.task('review-template:update-directory', false, function(done) {
        // move files to `review` root
        var review = plugin.fs.cwd(reviewTmpFolder);
        review.move('./public/index.html', '../index.html');
        review.move('./public/assets', '../assets');
        // remove extra files
        review = review.cwd('../');
        plugin.del([review.cwd() + '/.tmp'], { force: true });
        // add banner controls for review
        var controls = '_banner-support-files/controls/';
        plugin.fs.copy('./banners/' + controls, config.watchFolder + '/assets/' + controls);

        done();
    });

    /* Update main review `index.html` page to show all banners and meta info
    --------------------------------------------------------------------------- */
    gulp.task('review-template:update-index', false, function(done) {
        var bannerHtml = [];
        var bannerList = utils.getBanners();

        var updateIndex = function() {
            return plugin.tap(function(file) {
                var contents = file.contents.toString('utf-8');
                var $ = plugin.cheerio.load(contents);

                var title = $('title').text().replace('{{title}}', config.project.title);
                $('title').text(title);
                $('h3.headline').text(config.project.title);

                // Update Tabs
                var tpl_tab = utils.trim($('#tab-item').html());
                var tpl_tab_single = utils.trim($('#tab-single-item').html());

                $(bannerList).each(function(i, banner) {
                    var modifiedTime = utils.walkDirectory('./banners/' + banner).sort(function(a, b) { return b.modifyTime - a.modifyTime; });
                    var modifiedDate = new Date(modifiedTime[0].modifyTime).toISOString();
                    var zipFile = config.defaults.zipFolder + '/' + config.project.name + '_' + banner + '.zip';

                    var tab = tpl_tab.replace('{{type}}', 'iframe').replace('{{modified}}', modifiedDate).replace('{{size}}', banner);
                    if (config.injectAdPlatform) {
                        tab = tab.replace('{{zipfile}}', zipFile).replace('{{filesize}}', utils.getFileSize(config.watchFolder + '/' + zipFile));
                    }
                    else {
                        tab = tab.replace('{{filesize}}', utils.getFileSize(config.watchFolder + '/banners/' + banner));
                    }

                    bannerHtml.push(tab);
                });
                bannerHtml.push(tpl_tab_single.replace('{{size}}', bannerList[0]));
                $('.tabs').html(bannerHtml.join(''));
                $('.tabs').find('input[type="radio"]').first().attr('checked', true);

                // remove the static templates from the index page
                $('#tab-item, #tab-single-item').remove();
                // write all the changes to the page
                file.contents = new Buffer($.html());
            });
        };

        return gulp
            .src(config.watchFolder + '/index.html')
            .pipe(updateIndex())
            .pipe(gulp.dest(config.watchFolder));
    });
};
