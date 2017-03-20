# HTML5 Banner Boilerplate

-----

Project boilerplate for creating HTML5 animated banners with [GSAP](http://greensock.com/gsap).

[Download Banner Boilerplate](https://github.com/misega/HTML5-Banners/archive/master.zip)

* Watch a specific banner folder for changes and update browser during development
* Compile CSS variables and automatically adds vendor prefixes via `POSTCSS`
* Verify each banner has a fallback image and is the appropriate size
* Generate review site
* Update all banners to platform-specific distribution (e.g. DoubleClick, Sizmek)
* Minify files and assets then create directory of zip files for distribution
* Verify zip file size does not exceed IAB maximum allowable file size

### In This Documentation
1. [Getting Started](#gettingstarted)
2. [File Structure](#filestructure)
3. [Resources](#resources)
4. [References](#references)

## Getting Started

### Dependencies
Make sure these are installed first.

* [Node.js](http://nodejs.org)
* [Gulp](http://gulpjs.com) `sudo npm install -g gulp`

### Quick Start
1. Open `banners` folder.
2. Inside, rename `_banner-template` with the banner size (e.g. `300x250`)
3. In bash/terminal/command line, `cd` into your project directory.
4. Run `npm install` to install required files.
5. When it's done installing, run one of the tasks to get going:

| Tasks | |
|:----|----|
| `gulp` | Will show all available tasks
| `gulp watch`<br>`--folder`<br>`--controls` | Watch files for changes and update browser<br>_flag:_ folder to watch for file changes<br>_flag:_ controls to play/pause & scrub timeline
| `gulp review`<br>`--preview`<br>`--platform` | Build review page; ready to push to review ftp<br>_flag:_ open review page in browser<br>_flag:_ add zip files to review site; ready for distribution
| `gulp deploy`<br>`--platform` | Compress files and zip folders for distribution<br>_flag:_ ad platform distribution (`doubleclick`,`sizmek`)

#### Update _package.json_
* **name**: Project Code (format: YY-aaa-9999). Information used throughout the build/review/deploy process
    * **YY**: 2-digit Year
    * **aaa**: 3-digit Client Code
    * **9999**: 4-digit Job Code
* **title**: Project Title. Added to the review site

## File Structure

```bash
.
├── README.md
├── package.json                # list of npm packages and some configurations
├── gulp.js/                    # build configuration
├── node_modules/               # will be created with `npm install`
└─┬ banners/                    # directory to contain all banner sizes
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
      │ └── keyframes/          # keyframe graphics from PSD for layout/placement; removed via `review` or `deploy` task
      └─┬ js/
        └── script.js           # customized banner animation script
```

## Resources
**Greensock/GSAP**<br>
[Greensock 101 - Greensock Tutorials for Beginners](https://ihatetomatoes.net/product/greensock-101/)<br>
[Greensock Cheat Sheet](https://ihatetomatoes.net/wp-content/uploads/2015/08/GreenSock-Cheatsheet-2.pdf) <small>PDF</small><br>

## References
**IAB.com**<br>
[iab.com/guidelines](http://www.iab.com/guidelines/)<br>
[iab.com - HTML5 for Digital Advertising 2.0](http://www.iab.com/wp-content/uploads/2016/04/HTML5forDigitalAdvertising2.0.pdf) <small>PDF</small><br>
[iab.com - Display Format Guidelines](http://www.iab.com/wp-content/uploads/2015/11/IAB_Display_Mobile_Creative_Guidelines_HTML5_2015.pdf) <small>PDF</small><br>
<br>
**DoubleClick**<br>
[DoubleClick Starter Files](http://www.richmediagallery.com/tools/starterfiles)<br>
[DoubleClick Campaign Manager (DCM) HTML5 Validator](https://h5validator.appspot.com/dcm)<br>
[DoubleClick CDN/Shared Libraries](https://support.google.com/richmedia/answer/6307288)<br>
[Rich Media Gallery](http://www.richmediagallery.com/gallery)<br>
<br>
**Sizmek**<br>
[Sizmek Banner Formats](http://showcase.sizmek.com/formats)<br>
[Building Ads / Creating HTML5 Banners](https://support.sizmek.com/hc/en-us/categories/200103329--creative-Building-Ads-Creating-HTML5-Ads)<br>
[Sizmek CDN/Shared Libraries](https://support.sizmek.com/hc/en-us/articles/206136366--reference-glossary-HTML5-Shared-Libraries)<br>

## Roadmap
 - update to `gulp 4`

 ## TODO

  - `zipfiles.js`
    - minify image assets
  - `review` -- declare specific folders to use when building a review site
    - allow wildcard filter to select folder names
  - lint on `watch`: html, css, js
  - cleanup: find unused assets (css, js, images)
  - update controls to add features. See: [mojs-player](https://github.com/legomushroom/mojs-player)
