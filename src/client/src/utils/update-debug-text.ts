function updateDebugText() {
    let debugText = "";
    let activeServer = globalThis.discoveryObj.activeServer;
    if (activeServer) {
        let localizationData = activeServer.getLatestLocalizationData();
        if (localizationData) {
            debugText += `Active Server: ${localizationData.localizationID}: ${localizationData.serverConfidence}, ${localizationData.errorWithVIO}\n`;
        }
    }
    for (let mapServerName in globalThis.discoveryObj.mapServers) {
        let mapServer = globalThis.discoveryObj.mapServers[mapServerName];
        let localizationData = mapServer.getLatestLocalizationData();
        if (localizationData) {
            debugText += `${mapServerName}: ${localizationData.localizationID}: ${localizationData.serverConfidence}, ${localizationData.errorWithVIO}\n`;
        }
    }
    globalThis.debugEl.setAttribute('value', debugText);
}

export { updateDebugText };