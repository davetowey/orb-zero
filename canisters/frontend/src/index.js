import "ol/ol.css";
import MVT from "ol/format/MVT";
import Map from "ol/Map";
import Circle from "ol/geom/Circle";
import Feature from "ol/Feature";
// import GeoJSON from 'ol/format/GeoJSON';
import TileGrid from "ol/tilegrid/TileGrid";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import View from "ol/View";
import {
  Fill,
  Icon,
  Stroke,
  Style,
  Text,
  Circle as CircleStyle,
} from "ol/style";
import { Vector as VectorSource } from "ol/source";
import { get as getProjection } from "ol/proj";
import { Vector as VectorLayer } from "ol/layer";

import { getGeometry } from "./queries";
import styles from "./styles";

// setup tile url for the base map
function tileUrlFunction(tileCoord) {
  return "http://r7inp-6aaaa-aaaaa-aaabq-cai.localhost:8000/{z}/{x}/{y}.pbf"
    .replace("{z}", String(tileCoord[0] * 2 - 1))
    .replace("{x}", String(tileCoord[1]))
    .replace("{y}", String(tileCoord[2]));
}

// get style for geometry type
const styleFunction = function (feature) {
  return styles[feature.getGeometry().getType()];
};

const resolutions = [];
for (let i = 0; i <= 8; ++i) {
  resolutions.push(156543.03392804097 / Math.pow(2, i * 2));
}

// create a source for our vector features
const vectorSource = new VectorSource();

getGeometry().then((features) => {
  features.forEach((f) => {
    if (f.geometryType === "POINT") {
      vectorSource.addFeature(new Feature(new Circle(f.coordinates, 1e5)));
    }
  });
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
  style: styleFunction,
});

const map = new Map({
  layers: [
    new VectorTileLayer({
      source: new VectorTileSource({
        attributions:
          '© <a href="https://www.openstreetmap.org/copyright">' +
          "OpenStreetMap contributors</a>",
        format: new MVT(),
        tileGrid: new TileGrid({
          extent: getProjection("EPSG:3857").getExtent(),
          resolutions: resolutions,
          tileSize: 512,
        }),
        tileUrlFunction: tileUrlFunction,
      }),
      style: createMapboxStreetsV6Style(Style, Fill, Stroke, Icon, Text),
    }),
    vectorLayer,
  ],
  target: "map",
  view: new View({
    center: [0, 0],
    minZoom: 1,
    zoom: 1,
  }),
});
