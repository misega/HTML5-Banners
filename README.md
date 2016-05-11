# HTML5 Banner Boilerplate

-----

Project boilerplate for creating HTML5 animated banners with [GSAP](http://greensock.com/gsap).

[Download Banner Boilerplate](https://github.com/misega/HTML5-Banners/archive/master.zip)

* Watch a specific banner folder for changes and update browser during development
* Compiles CSS variables and automatically adds vendor prefixes via `POSTCSS`
* Lints HTML, CSS, and JS files to maintain coding standards
* Verify each banner has a fallback image and is the appropriate size
* Automatically generate review site
* Update all banners to platform-specific distribution (e.g. DoubleClick, Sizmek)
* Automatically minifies files and assets then creates directory of zip files for distribution

**In This Documentation**

1. [Getting Started](#gettingstarted)
2. [File Structure](#filestructure)
3. [Resources & References](#resourcesreferences)

## Getting Started

### Dependencies
Make sure these are installed first.

* [Node.js](http://nodejs.org)
* [Gulp](http://gulpjs.com) `sudo npm install -g gulp`

### Quick Start
1. In bash/terminal/command line, `cd` into your project directory.
2. Run `npm install` to install required files.
3. When it's done installing, run one of the task runners to get going:

|Tasks ||
|:----|----|
| `$ gulp` | Will show all available tasks
| `$ gulp watch`<br>`--folder`<br>`--controls` | Watch files for changes and update browser<br>_flag:_ folder to watch for file changes<br>_flag:_ controls to play/pause & scrub timeline
| `$ gulp review` | Build review page; ready to push to review ftp
| `$ gulp deploy`<br>`--platform` | Compress files and zip folders for distribution<br>_flag:_ ad platform distribution (`doubleclick`,`sizmek`)

#### Update _package.json_
* **name**: Project Code (format: YY-aaa-9999). Information used throughout the build/review/deploy process
    * **YY**: 2-digit Year
    * **aaa**: 3-digit Client Code
    * **9999**: 4-digit Job Code
* **title**: Project Title. Added to the review site
* **description**: Brief description of project. Added to the review site

## File Structure

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

## Resources & References
<https://support.sizmek.com/hc/en-us/articles/206136366--reference-glossary-HTML5-Shared-Libraries><br>
<http://www.richmediagallery.com/gallery><br>
<http://www.richmediagallery.com/tools/starterfiles><br>
<https://ihatetomatoes.net/product/greensock-101/><br>

## Roadmap

 - lint: html, css, js during build
 - optimize on build: css, js, image assets (jpg, gif, svg)
 - move tasks into a gulp subfolder and separate files
 - update to `gulp 4`

------

NPM Packages:<br>
POSTCSS:<br>
_review:_<br>
<https://github.com/stylelint/stylelint><br>
_deploy:_<br>
<https://github.com/ben-eb/cssnano><br>
<https://github.com/ben-eb/postcss-svgo>
