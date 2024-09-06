import { initialize } from "./initialize";
import { localize } from "./openvps/discover-localize";
import { updateDebugText } from "./utils/update-debug-text";
import { renderNavigationPath } from "./render/render-navpath";


initialize();

// Poll for localization every 5 seconds
setInterval(() => {
    localize().then((localizationResult) => {
        updateDebugText();
        renderNavigationPath(localizationResult);
    });
}, 5000);