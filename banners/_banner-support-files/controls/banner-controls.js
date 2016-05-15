/* global Promise, timeline, Dragdealer */

// Bling.js
// https://gist.github.com/paulirish/12fb951a8b893a454b32
// ====================================================================================================
window.$ = document.querySelector.bind(document);
window.$$ = document.querySelectorAll.bind(document);
Node.prototype.on = window.on = function(name, fn) {
    this.addEventListener(name, fn);
};
NodeList.prototype.__proto__ = Array.prototype;
NodeList.prototype.on = NodeList.prototype.addEventListener = function(name, fn) {
    this.forEach(function(elem, i) {
        elem.on(name, fn);
    });
};

// ====================================================================================================
var banner_controls = (function banner_controls() {
    var $element;
    var $window = window;
    var $iframe = $('.banner-content');

    var timelineReady = new Promise(function(resolve, reject) {
        (function waitForTimeline() {
            if ($window.timeline) { resolve(); }
            else { setTimeout(waitForTimeline, 250); }
        })();
    });

    var attachControls = function(selector) {
        var element = selector || 'body';
        $element = $(element);
    };

    /* Control HTML structure
    ----------------------------------------------------------------------- */
    var tml_controls = '' +
        '<ul class="banner-controls">' +
        '    <li class="play-pause"><button class="btn-play-pause" type="button"><div class="icon-play-pause"></div></button></li>' +
        '    <li class="duration"><span class="time-current">00.00</span> / <span class="time-total">00.00</span></li>' +
        '    <li class="progress">' +
        '        <div class="progress-bar">' +
        '            <div class="total"></div>' +
        '            <div class="thumb handle"></div>' +
        '        </div>' +
        '    </li>' +
        '</ul>';

    function buildControls() {
        /* Cache Control Elements
        ----------------------------------------------------------------------- */
        var activeSlider = false;
        var hasCompleted = false;
        var timeline = $window.timeline.get();

        var $banner_controls = $('.banner-controls');
        if (!$banner_controls) {
            $element.insertAdjacentHTML('beforeend', tml_controls);
            $banner_controls = $('.banner-controls');
        }

        var $btnPlayPause = $banner_controls.querySelector('.btn-play-pause');
        var $timeCurrent = $banner_controls.querySelector('.time-current');
        var $timeTotal = $banner_controls.querySelector('.time-total');

        var $progressbar = $banner_controls.querySelector('.progress-bar');
        var $progressbarTotal = $banner_controls.querySelector('.total');
        var $progressbarBkgd = $banner_controls.querySelectorAll('.progress-bar, .thumb');
        var $progressbarHandle;

        /* Event Listeners: Play/Pause Button
        ----------------------------------------------------------------------- */
        $window.addEventListener('start', function(e) {
            if (e.detail.hasStarted) {
                $btnPlayPause.parentNode.classList.add('pause');
            }
        }, false);

        $window.addEventListener('complete', function(e) {
            if (e.detail.hasStopped) {
                $btnPlayPause.parentNode.classList.remove('pause');
                hasCompleted = true;
            }
        }, false);

        $btnPlayPause.addEventListener('click', function(e) {
            e.currentTarget.parentNode.classList.toggle('pause');

            if (hasCompleted) {
                hasCompleted = false;
                timeline.restart();
                return;
            }

            timeline.paused(!timeline.paused());
        }, false);

        /* Event Listeners: Progress Bar / Thumb
        ----------------------------------------------------------------------- */
        $progressbarHandle = new Dragdealer($progressbar, {
            animationCallback: function(x, y) {
                timeline.totalProgress(x);
            }
        });

        $progressbarBkgd.addEventListener('mousedown', function() {
            activeSlider = true;
            if (!timeline.paused()) { timeline.pause(); }
            $btnPlayPause.parentNode.classList.remove('pause');
        }, false);

        $progressbarBkgd.addEventListener('mouseup', function() {
            activeSlider = false;
        }, false);

        /* Event Listeners: Update Time Display and Progress Bar
        ----------------------------------------------------------------------- */
        $window.addEventListener('stats', function(e) {
            var duration = e.detail;
            $progressbarTotal.style.width = (duration.totalProgress * 100) + '%';
            $progressbarHandle.setValue(duration.totalProgress, 0, true);
            $timeCurrent.textContent = duration.totalTime.toFixed(2);
            $timeTotal.textContent = duration.totalDuration.toFixed(2);
        }, false);
    }

    /* Init
    --------------------------------------------------------------------------- */
    if ($iframe) {
        $iframe.addEventListener('load', function() {
            $window = $iframe.contentWindow;
            timelineReady.then(buildControls);
        }, false);
    }
    else {
        timelineReady.then(buildControls);
    }

    return {
        attachTo: attachControls
    };
})();
