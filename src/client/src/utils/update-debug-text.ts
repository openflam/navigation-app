function updateDebugText() {
    let debugText = "";
    for (let mapServerName in globalThis.discoveryObj.mapServers) {
        let mapServer = globalThis.discoveryObj.mapServers[mapServerName];
        let localizationData = mapServer.getLatestLocalizationData();
        if (localizationData) {
            debugText += `${mapServerName}: ${localizationData.serverConfidence}\n`;
        }
    }
    globalThis.debugEl.setAttribute('value', debugText);
}

export { updateDebugText };