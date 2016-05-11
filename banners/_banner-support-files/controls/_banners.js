(function() {
    // Modern Browsers Only (https://twitter.com/jaffathecake/status/570872103227953153)
    if (!('visibilityState' in document)) { return; }

    loadCss('assets/_dev-build/banner-controls.css');

    var files = [
        'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.3/jquery.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/dragdealer/0.9.8/dragdealer.min.js',
        'assets/_dev-build/banner-controls.js'
    ];

    function loadCss(url) {
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        head.appendChild(link);
    }

    (function loadNextScript() {
        if (files.length) {
            var done = false;
            var script = document.createElement('script');
            script.src = files.shift();

            script.onload = script.onreadystatechange = function() {
                if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                    done = true;
                    // Handle memory leak in IE
                    script.onload = script.onreadystatechange = null;
                    loadNextScript();
                }
            };
            document.body.appendChild(script);
        }
        else {
            $('body').banner_controls();
        }
    })();
})();
