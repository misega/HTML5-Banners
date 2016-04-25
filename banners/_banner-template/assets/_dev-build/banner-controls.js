/* global timeline, Dragdealer */
(function($) {
    'use strict';

    $.banner_controls = function(element, options) {
        var defaults = {};

        var $element = $(element);
        var $win = $(window);

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
            var timeline = window.timeline;
            var $controls = $(tml_controls).appendTo('body');
            var $btnPlayPause = $controls.find('.btn-play-pause');
            var $timeCurrent = $controls.find('.time-current');
            var $timeTotal = $controls.find('.time-total');

            var $progressbarThumb;
            var $progressbar = $controls.find('.progress-bar');
            var $progressbarTotal = $progressbar.find('.total');

            /* Event Listeners: Play/Pause Button
            ----------------------------------------------------------------------- */
            $(window).on('start', function(e) {
                if (e.detail.hasStarted) {
                    $btnPlayPause.parent().addClass('pause');
                }
            }).on('complete', function(e) {
                if (e.detail.hasStopped) {
                    $btnPlayPause.parent().removeClass('pause');
                    hasCompleted = true;
                }
            });

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

            /* Event Listeners: Update Time Display and Progress Bar
            ----------------------------------------------------------------------- */
            $(window).on('stats', function(e) {
                var duration = e.detail;
                $progressbarTotal.width((duration.totalProgress * 100) + '%');
                $progressbarThumb.setValue(duration.totalProgress, 0, true);
                $timeCurrent.text(duration.totalTime.toFixed(2));
                $timeTotal.text(duration.totalDuration.toFixed(2));
            });
        };

        /* Init
        --------------------------------------------------------------------------- */
        (function waitForTimeline() {
            if (window.timeline) {
                setTimeout(plugin.init);
            }
            else {
                setTimeout(waitForTimeline, 25);
            }
        })();
    };

    /* Attach as jQuery Plugin
    --------------------------------------------------------------------------- */
    $.fn.banner_controls = function(options) {
        return this.each(function() {
            if ($(this).data('banner_controls') === undefined) {
                var plugin = new $.banner_controls(this, options);
                $(this).data('banner_controls', plugin);
            }
        });
    };

})(jQuery);
