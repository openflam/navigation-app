interface MapInfo {
    highestLocalizationConfidence: number;
    waypointColor: string;
}

type MapInfoDict = { [name: string]: MapInfo };
