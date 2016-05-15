## Sizmek
<https://support.sizmek.com>

1) Add script library from CDN to `index.html`. First checks for url protocol (`http` vs `https`).
```script-lib
<script src="assets/js/EBLoader.js"></script>
```

2) Enable ad-platform specific init script.
```script-init
function initEB() {
    if (!EB.isInitialized()) {
        EB.addEventListener(EBG.EventName.EB_INITIALIZED, startAd);
    }
    else {
        startAd();
    }
}

function startAd() {
    document.getElementById('clickthrough-button').addEventListener('click', clickthru, false);
    timeline.init();
}

var clickthru = function() {
    EB.clickthrough();
};

window.addEventListener('load', initEB);
```
