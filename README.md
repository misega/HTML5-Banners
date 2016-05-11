## HTML5 Banners

```bash
.
├── README.md
├── package.json                # list of npm packages and some configurations
├── gulp.js                     # build configuration
├── node_modules/               # will be created with `npm install`
└─┬ _banners/                   # directory to contain all banner sizes
  ├─┬ _banner-support-files/
  │ ├─┬ ad-platform/            # collection of platform-specific documentation
  │ │ ├── doubleclick.md        # documentation; script blocks will be injected via `deploy` task
  │ │ ├── sizmek.md             # documentation; script blocks will be injected via `deploy` task
  │ │ └── EBLoader.js           # required Sizmek script; must load first before ad is displayed
  │ └─┬ controls/
  │   ├── _banners.js           # installs required development assets
  │   ├── banner-controls.js    # installs/instantiates control bar
  │   └── banner-controls.css   # styles for control bar
  └─┬ _banner-template/         # initial banner setup; duplicate to customize
    ├── index.html              # The ad file, with the ad configuration and init code
    ├── fallback.jpg            # required; Formats accepted: JPG, GIF, PNG
    └─┬ assets/
      ├─┬ css/
      │ ├── style.css           # compiled styles; will be created with `watch`, `review`, or `deploy` tasks
      │ ├── source.css          # main styles; compiled by postcss into `style.css`
      │ └── fonts/              # local font files (optional)
      ├─┬ img/                  # graphic files: jpg, gif, png, or svg
      │ └── keyframes/          # keyframe graphics from PSD for layout/placement; removed via `review` task
      └─┬ js/
        └── script.js           # customized banner animation script
```
|Functions ||
|:----|----|
| `$ gulp` | Will show all available tasks
| `$ gulp watch`<br>`--folder`<br>`--controls` | Watch files for changes and update browser<br>_flag:_ folder to watch for file changes<br>_flag:_ controls to play/pause & scrub timeline
| `$ gulp review` | Build review page; ready to push to review ftp
| `$ gulp deploy`<br>`--platform` | Compress files and zip folders for distribution<br>_flag:_ ad platform distribution (`doubleclick`,`sizmek`)


###ROADMAP

------

 - add flag to build either Sizmek or Doubleclick banners
 - lint: html, css, js during build
 - optimize on build: css, js, image assets (jpg, gif, svg)
 - update to `gulp 4`

------

NPM Packages:<br>
<https://github.com/Freyskeyd/gulp-prompt><br>
POSTCSS:<br>
_review:_<br>
<https://github.com/stylelint/stylelint><br>
_deploy:_<br>
<https://github.com/ben-eb/cssnano><br>
<https://github.com/ben-eb/postcss-svgo>


<https://docs.npmjs.com/files/package.json#name>

------

<https://support.sizmek.com/hc/en-us/articles/206136366--reference-glossary-HTML5-Shared-Libraries><br>
<http://www.richmediagallery.com/gallery><br>
<http://www.richmediagallery.com/tools/starterfiles><br>
<https://ihatetomatoes.net/product/greensock-101/><br>
