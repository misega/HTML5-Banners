## DoubleClick
<https://support.google.com/richmedia>

1) Add script library from CDN to `index.html`.
```script-lib
<script src="https://s0.2mdn.net/ads/studio/Enabler.js"></script>
```

2) Enable ad-platform specific init script.
```script-init
// Initialize Enabler
if (Enabler.isInitialized()) {
    init();
}
else {
    Enabler.addEventListener(studio.events.StudioEvent.INIT, init);
}

function init() {
    if (Enabler.isPageLoaded()) {
        startAd();
    }
    else {
        Enabler.addEventListener(studio.events.StudioEvent.PAGE_LOADED, startAd);
    }
}

function startAd() {
    document.getElementById('clickthrough-button').addEventListener('click', bgExitHandler, false);
    timeline.init();
}

var bgExitHandler = function() {
    Enabler.exit('HTML5_Background_Clickthrough');
};
```
