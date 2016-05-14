/* global Zepto, timeline, Dragdealer */
(function($) {
    'use strict';

    $.banner_controls = function(element, options) {
        var defaults = {};

        var $element = $(element);
        var $iframe = $('.banner-content');
        var $window = ($iframe.length) ? $iframe[0].contentWindow : window;

        var timelineReady = function() {
            var deferred = $.Deferred();

            (function waitForTimeline() {
                if ($window.timeline) { deferred.resolve(); }
                else { setTimeout(waitForTimeline, 250); }
            })();

            return deferred.promise();
        };

        /* Control HTML structure
        --------------------------------------------------------------------------- */
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

        var plugin = this;
        plugin.settings = {};
        plugin.init = function() {
            plugin.settings = $.extend({}, defaults, options);

            /* Cache Control Elements
            ----------------------------------------------------------------------- */
            var activeSlider = false;
            var hasCompleted = false;
            var timeline = $window.timeline;
            var $controls = $(tml_controls).appendTo($element);
            var $btnPlayPause = $controls.find('.btn-play-pause');
            var $timeCurrent = $controls.find('.time-current');
            var $timeTotal = $controls.find('.time-total');

            var $progressbarThumb;
            var $progressbar = $controls.find('.progress-bar');
            var $progressbarTotal = $progressbar.find('.total');

            /* Event Listeners: Play/Pause Button
            ----------------------------------------------------------------------- */
            $window.addEventListener('start', function(e) {
                if (e.detail.hasStarted) {
                    $btnPlayPause.parent().addClass('pause');
                }
            }, false);

            $window.addEventListener('complete', function(e) {
                if (e.detail.hasStopped) {
                    $btnPlayPause.parent().removeClass('pause');
                    hasCompleted = true;
                }
            }, false);

            $btnPlayPause.on('click', function() {
                $(this).parent().toggleClass('pause');

                if (hasCompleted) {
                    hasCompleted = false;
                    timeline.get().restart();
                    return;
                }

                timeline.get().paused(!timeline.get().paused());
            });

            /* Event Listeners: Progress Bar / Thumb
            ----------------------------------------------------------------------- */
            $progressbarThumb = new Dragdealer($progressbar[0], {
                animationCallback: function(x, y) {
                    timeline.get().totalProgress(x);
                }
            });

            $progressbar.add($progressbar.find('.thumb')).mousedown(function() {
                activeSlider = true;
                if (!timeline.get().paused()) { timeline.get().pause(); }
                $btnPlayPause.parent().removeClass('pause');
            }).mouseup(function() {
                activeSlider = false;
            });

            // /* Event Listeners: Update Time Display and Progress Bar
            // ----------------------------------------------------------------------- */
            $window.addEventListener('stats', function(e) {
                var duration = e.detail;
                $progressbarTotal.width((duration.totalProgress * 100) + '%');
                $progressbarThumb.setValue(duration.totalProgress, 0, true);
                $timeCurrent.text(duration.totalTime.toFixed(2));
                $timeTotal.text(duration.totalDuration.toFixed(2));
            }, false);
        };

        /* Init
        --------------------------------------------------------------------------- */
        if ($iframe.length) {
            $iframe.on('load', function() {
                timelineReady().done(plugin.init);
            });
        }
        else {
            timelineReady().done(plugin.init);
        }
    };

    /* Attach as a plugin
    --------------------------------------------------------------------------- */
    $.fn.banner_controls = function(options) {
        return this.each(function() {
            if ($(this).data('banner_controls') === undefined) {
                var plugin = new $.banner_controls(this, options);
                $(this).data('banner_controls', plugin);
            }
        });
    };

})(Zepto);
