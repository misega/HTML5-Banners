## HTML5 Banners

```bash
.
├── README.md
├── gulp.js                     # build configuration
├── package.json                # list of npm packages and some configurations
├── node_modules/               # will be created with `npm install`
└─┬ _banners/                   # directory to contain all banner sizes
  └─┬ _banner-template/         # initial banner setup; duplicate to customize
    ├── index.html              # The ad file, with the ad configuration and init code
    ├── fallback.jpg            # required; Formats accepted: JPG, GIF, PNG
    └─┬ assets/
      ├─┬ _dev-build/           # available during development; will be removed when deployed
      │ ├── _banners.js         # installs required development assets
      │ ├── banner-controls.js  # installs/instantiates control bar
      │ └── banner-controls.css # styles for control bar
      ├─┬ css/
      │ ├── style.css           # compiled styles
      │ ├── source.css          # main styles; compiled by postcss into `style.css`
      │ └── fonts/              # local font files (optional)
      ├─┬ img/                  # graphic files: jpg, gif, png, or svg
      │ └── keyframes/          # keyframe graphics from PSD for layout/placement
      └─┬ js/
        ├── EBLoader.js         # required Sizmek script; must load first before ad is displayed
        └── script.js           # customized script
```
|Functions ||
|:----|----|
| `$ gulp` | Will show all available tasks
| `$ gulp watch`<br>`--folder`<br>`--controls` | Watch files for changes and update browser<br>_flag:_ folder to watch for file changes<br>_flag:_ controls to play/pause & scrub timeline
| `$ gulp review` | Build review page; ready to push to review ftp
| `$ gulp deploy` | Compress files and zip folders for distribution


NPM Packages:<br>
<https://github.com/Freyskeyd/gulp-prompt><br>
POSTCSS:<br>
_review:_<br>
<https://github.com/stylelint/stylelint><br>
_deploy:_<br>
<https://github.com/ben-eb/cssnano><br>
<https://github.com/ben-eb/postcss-svgo>


<https://docs.npmjs.com/files/package.json#name>

<https://support.sizmek.com/hc/en-us/articles/206136366--reference-glossary-HTML5-Shared-Libraries>
