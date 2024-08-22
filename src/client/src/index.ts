import { MapServer } from "@openvps/dnsspatialdiscovery";
import { initialize } from "./initialize";
import { localize } from "./openvps/discover-localize";

initialize();

// Poll for localization every 5 seconds
setInterval(() => {
    localize().then((cameraPose) => {
        let debugText = "";
        for (let mapServerName in globalThis.discoveryObj.mapServers) {
            let mapServer: MapServer = globalThis.discoveryObj.mapServers[mapServerName];
            let localizationData = mapServer.getLatestLocalizationData();
            if (localizationData) {
                debugText += `${mapServerName}: ${localizationData.serverConfidence}\n`;
            }
        }
        globalThis.debugEl.setAttribute('value', debugText);
    });
}, 5000);