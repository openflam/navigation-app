import { initialize } from "./initialize";
import { localize } from "./openvps/discover-localize";
import { updateDebugText } from "./utils/update-debug-text";
import { renderNavigationPath } from "./render/render-navpath";


initialize();

// Poll for localization every 2 seconds
async function pollLocalization() {
    try {
        let localizationResult = await localize();
        updateDebugText();
        renderNavigationPath(localizationResult);
    } catch (e) { }

    setTimeout(pollLocalization, 2000);
}
pollLocalization();

