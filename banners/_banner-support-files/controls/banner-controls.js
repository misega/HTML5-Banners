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
var banner_controls = (function() {
    var activeSlider = false;
    var hasCompleted = false;

    var $element;
    var $iframe = $('.banner-content');
    var $window = ($iframe.length) ? $iframe[0].contentWindow : window;

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
        attachControls();
        /* Cache Control Elements
        ----------------------------------------------------------------------- */
        var activeSlider = false;
        var hasCompleted = false;
        var timeline = $window.timeline;
        var $controls = $element.appendChild(tml_controls);
        var $btnPlayPause = $('.banner-controls .btn-play-pause');
        var $timeCurrent = $('.banner-controls .time-current');
        var $timeTotal = $('.banner-controls .time-total');

        var $progressbarThumb;
        var $progressbar = $('.banner-controls .progress-bar');
        var $progressbarTotal = $progressbar.querySelector('.total');

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

        // $btnPlayPause.on('click', function() {
        //     $(this).parent().toggleClass('pause');

        //     if (hasCompleted) {
        //         hasCompleted = false;
        //         timeline.get().restart();
        //         return;
        //     }

        //     timeline.get().paused(!timeline.get().paused());
        // });

        /* Event Listeners: Progress Bar / Thumb
        ----------------------------------------------------------------------- */
        $progressbarThumb = new Dragdealer($progressbar, {
            animationCallback: function(x, y) {
                timeline.get().totalProgress(x);
            }
        });

        // $progressbar.add($progressbar.find('.thumb')).mousedown(function() {
        //     activeSlider = true;
        //     if (!timeline.get().paused()) { timeline.get().pause(); }
        //     $btnPlayPause.parentNode.classList.remove('pause');
        // }).mouseup(function() {
        //     activeSlider = false;
        // });

        /* Event Listeners: Update Time Display and Progress Bar
        ----------------------------------------------------------------------- */
        $window.addEventListener('stats', function(e) {
            var duration = e.detail;
            $progressbarTotal.style.width = (duration.totalProgress * 100) + '%';
            $progressbarThumb.setValue(duration.totalProgress, 0, true);
            $timeCurrent.textContent = duration.totalTime.toFixed(2);
            $timeTotal.textContent = duration.totalDuration.toFixed(2);
        }, false);
    }

    /* Init
    --------------------------------------------------------------------------- */
    if ($iframe.length) {
        $iframe.addEventListener('load', function() {
            timelineReady().then(buildControls);
        }, false);
    }
    else {
        timelineReady().then(buildControls);
    }

    return {
        attach: attachControls
    };
})();
