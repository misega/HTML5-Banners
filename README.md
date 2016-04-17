## HTML5 Banners

```bash
.
├── README.md
├── gulp.js             # build configuration
├── package.json        # list of npm packages and some configurations
├── node_modules/       # will be created with `npm install`
└─┬ _banner-template/   # initial banner setup; duplicate to customize
  ├── index.html        # The ad file, with the ad configuration and init code
  ├── fallback.jpg      # image displayed, if ad is not displayed
  ├─┬ images/           # graphic files: jpg, gif, png, or svg
  │ └── TEMP/           # keyframe graphics from PSD for layout/placement
  ├─┬ scripts/
  │ ├── EBLoader.js     # required Sizmek script; must load first before ad is displayed
  │ └── script.js       # customized script
  └─┬ styles/
    ├── style.css       # compiled styles
    ├── style.scss      # main styles
    └── fonts/          # local font files (optional)
```

|Functions ||
|:----|----|
| `$ gulp --watch` | Watch files for changes and update browser
| `$ gulp review` | Build review page and push files to folder on FTP
| `$ gulp deploy` | Compress files and zip folders for distribution


**Roadmap**

- Pull template remotely (from Github/Gitlab)
- move files to FTP
- zip folder contents up, move up to FTP

NPM Packages:<br>
<https://github.com/szwacz/fs-jetpack><br>
<https://github.com/archiverjs/node-archiver><br>
<https://www.npmjs.com/package/vinyl-ftp><br>