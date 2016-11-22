/* Setup
--------------------------------------------------------------------------- */
var fs = require('fs-jetpack');
var path = require('path');
var gutil = require('gulp-util');
var config = require('./config.js');

/* Global Utilities
--------------------------------------------------------------------------- */
var utils = {
    divider: function() {
        var cols = process.stdout.columns;
        return Array.apply(null, { length: cols }).join('-').slice(0, cols) + '\n';
    },
    message: function(msg) {
        return utils.divider() + msg + utils.divider();
    },
    trim: function(str) {
        return str.replace(/^\s+/, '').replace(/\s+$/, '');
    },
    getActiveTask: function(task) {
        return task.seq.slice(-1)[0];
    },
    getFolders: function(dir) {
        var folders = [];
        fs.inspectTree(dir).children.forEach(function(folder) {
            if (folder.type === 'dir') { folders.push(folder.name); }
        });
        return folders;
    },
    getReadableFileSize: function(size) {
        if (!size) { return 0; }
        var k = 1000; // 1000 used for physical disk sizes; see: http://stackoverflow.com/a/8632634
        var i = Math.floor(Math.log(size) / Math.log(k));
        return (size / Math.pow(k, i)).toFixed(2) * 1 + ' ' + ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][i];
    },
    getFileSize: function(filePath) {
        var size = (fs.exists(filePath) && fs.inspectTree(filePath).size) || 0;
        return utils.getReadableFileSize(size);
    },
    getBanners: function() {
        var bannerList = [];
        // return only folders with dimensions in label
        var banners = utils.getFolders('banners');
        banners.forEach(function(item) {
            if (item.match(config.sizeRegExp)) {
                bannerList.push(item);
            }
        });

        return bannerList;
    },
    walkDirectory: function(dir, filelist) {
        var fso = fso || require('fs');
        var files = fso.readdirSync(dir);
        filelist = filelist || [];

        files.forEach(function(file) {
            if (fso.statSync(dir + '/' + file).isDirectory()) {
                filelist = utils.walkDirectory(dir + '/' + file, filelist);
            }
            else {
                if (!/(\.DS_Store|\.keep)/.test(file)) {
                    filelist.push(fs.inspect(dir + '/' + file, {times: true}));
                }
            }
        });

        return filelist;
    },
    getDimensions: function(item) {
        var dimensions = item.match(config.sizeRegExp)[0].split('x');
        return {
            width: parseInt(dimensions[0], 10),
            height: parseInt(dimensions[1], 10),
            get formatted() {
                return this.width + 'x' + this.height;
            }
        };
    },
    getAvailablePlatforms: function() {
        var files = [];
        var supportFiles = fs.cwd(config.folder.ad_platform);
        fs.find(supportFiles.cwd(), { matching: ['*.md']}).forEach(function(file) {
            files.push(path.parse(file).name);
        });
        return files;
    },
    formatAvailablePlatforms: function() {
        var files = utils.getAvailablePlatforms();
        return files.join(', ').replace(/,\s(\w+)$/, ' or $1');
    },
    reportError: function(error) {
        gutil.log(gutil.colors.red(error.message));
        this.emit('end');
    }
};

/*
--------------------------------------------------------------------------- */
module.exports = utils;
