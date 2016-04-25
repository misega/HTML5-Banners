## HTML5 Banners

```bash
.
├── README.md
├── gulp.js                     # build configuration
├── package.json                # list of npm packages and some configurations
├── node_modules/               # will be created with `npm install`
└─┬ _banner-template/           # initial banner setup; duplicate to customize
  ├── index.html                # The ad file, with the ad configuration and init code
  ├── fallback.jpg              # required; task `gulp deploy` will fail, if image missing
  └─┬ assets/
    ├─┬ _dev-build/             # available during production; will be removed when deployed
    │ ├── _banners.js           # installs required development assets
    │ ├── banner-controls.js    # installs/instantiates control bar
    │ └── banner-controls.css   # styles for control bar
    ├─┬ css/
    │ ├── style.css             # compiled styles
    │ ├── source.css            # main styles; compiled by postcss into `style.css`
    │ └── fonts/                # local font files (optional)
    ├─┬ img/                    # graphic files: jpg, gif, png, or svg
    │ └── keyframes/            # keyframe graphics from PSD for layout/placement
    └─┬ js/
      ├── EBLoader.js           # required Sizmek script; must load first before ad is displayed
      └── script.js             # customized script
```

|Functions ||
|:----|----|
| `$ gulp` | Compile source files into working banners
| `$ gulp watch --300x250` | Watch files for changes and update browser
| `$ gulp review` | Build review page; ready to push to review ftp
| `$ gulp deploy` | Compress files and zip folders for distribution


**Roadmap**

- Pull template remotely (from Github/Gitlab)
- move files to FTP
- zip folder contents up, move up to FTP

**browser-sync rewriteRules**

- <http://quick.as/ly3ulob0>
- <https://www.browsersync.io/docs/options/#option-rewriteRules>
- <https://github.com/BrowserSync/browser-sync-client/blob/master/gulpfile.js>

NPM Packages:<br>
<https://github.com/szwacz/fs-jetpack><br>
<https://github.com/archiverjs/node-archiver><br>
<https://github.com/amokjs/amok><br>
<https://github.com/Freyskeyd/gulp-prompt><br>
POSTCSS:<br>
_develop:_<br>
<https://github.com/seaneking/postcss-position><br>
<https://github.com/jonathantneal/postcss-advanced-variables><br>
_review:_<br>
<https://github.com/glebmachine/postcss-cachebuster><br>
<https://github.com/hudochenkov/postcss-sorting><br>
<https://github.com/stylelint/stylelint><br>
_deploy:_<br>
<https://github.com/ben-eb/cssnano><br>
<https://github.com/ben-eb/postcss-svgo>
