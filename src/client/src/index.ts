import { initialize } from "./initialize";
import { localize } from "./openvps/discover-localize";
import { updateDebugText } from "./utils/update-debug-text";
import { renderNavPath } from "./render-navpath/render-navpath";


initialize();

// Poll for localization every 5 seconds
setInterval(() => {
    localize().then((localizationResult) => {
        updateDebugText();
        renderNavPath(localizationResult);
    });
}, 5000);