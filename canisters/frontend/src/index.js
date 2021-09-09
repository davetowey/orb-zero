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
import { get as getProjection, transform} from "ol/proj";
import { Vector as VectorLayer } from "ol/layer";
import {getArea} from 'ol/sphere';
import {Control, defaults as defaultControls} from 'ol/control';

import { getGeometry } from "./queries";
import styles from "./styles";
import Polygon from "ol/geom/Polygon";
import colormap from "colormap";

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
for (let i = 0; i <= 10; ++i) {
  resolutions.push(156543.03392804097 / Math.pow(2, i * 2));
}

function clamp(value, low, high) {
  return Math.max(low, Math.min(value, high));
}

function getColor(feature) {
  const area = getArea(feature.getGeometry());
  console.log(area);
  const f = Math.pow(clamp((area - min) / (max - min), 0, 1), 1 / 2);
  const index = Math.round(f * (steps - 1));
  return ramp[index];
}

// create a source for our vector features
const vectorSource = new VectorSource();

getGeometry().then((features) => {
  console.log(features);
  features.forEach((f) => {
    if (f.geometryType === "POINT") {
      vectorSource.addFeature(new Feature(new Circle(f.coordinates, 1e5)));
    }else if(f.geometryType === "POLYGON") {

      const allCoords = JSON.parse(f.coordinates).map( coordSet => {
      const coords = coordSet.map(c => {
        const cf = transform(c, "EPSG:4326", "EPSG:3857");
        return [cf[0], cf[1]];
      });
      return coords;
    })
      vectorSource.addFeature(new Feature(new Polygon(allCoords)));
    }
  });
});

//vectorSource.addFeature(new Feature(new Circle([16832620.20, -4011359.53], 1e5)));
//vectorSource.addFeature(new Feature(new LineString([[16832620.20, -4005997.96], [16835660.34, -4005997.96]])));

const min = 590986; // the smallest area
const max = 10000000; // the biggest area
const steps = 50;
const ramp = colormap({
  colormap: 'cool',
  format: 'rgba',
  nshades: steps,
  alpha: 0.5
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
  style: function(feature) {
    return new Style({
      fill: new Fill({
        color: getColor(feature)
      }),
      stroke: new Stroke({
        color: 'rgba(255,255,255,0.8)'
      })
    });
  }
});

class Toggle extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(opt_options) {
    const options = opt_options || {};

    const button = document.createElement('button');
    button.innerHTML = 'T';

    const element = document.createElement('div');
    element.className = 'toggle ol-unselectable ol-control';
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });

    button.addEventListener('click', this.handleToggle.bind(this), false);
  }

  handleToggle() {
    const vis = this.getMap().getLayers().getArray()[1].getVisible();
    this.getMap().getLayers().getArray()[1].setVisible(!vis);
  }
}

const map = new Map({
  controls: defaultControls().extend([new Toggle()]),
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
    center: [16832620.20, -4011359.53],
    minZoom: 1,
    zoom: 10,
  }),
});
