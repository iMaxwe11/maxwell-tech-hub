/**
 * One-off generator: rasterize Natural Earth 110m land polygons (public
 * domain) into a compact hex bitmap for the ISS Mission Control dot map.
 * Grid: 4° cells, lon [-180,180) x lat [88,-88] top-to-bottom.
 * Output: 90 cols x 44 rows -> 23 hex chars per row.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");

const geo = JSON.parse(
  fs.readFileSync(path.join(os.tmpdir(), "ne_110m_land.geojson"), "utf8")
);

// Collect all rings (outer + holes; 110m land holes are tiny lakes, treat
// via even-odd counting so they subtract naturally).
const rings = [];
for (const f of geo.features) {
  const g = f.geometry;
  if (g.type === "Polygon") rings.push(g.coordinates);
  else if (g.type === "MultiPolygon") for (const p of g.coordinates) rings.push(p);
}

function pointInPolygon(lon, lat, polygon) {
  // even-odd across all rings of the polygon (holes flip parity)
  let inside = false;
  for (const ring of polygon) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
  }
  return inside;
}

function isLand(lon, lat) {
  for (const poly of rings) if (pointInPolygon(lon, lat, poly)) return true;
  return false;
}

const STEP = 4;
const COLS = 360 / STEP; // 90
const rowsOut = [];
let dotCount = 0;

for (let lat = 88 - STEP / 2; lat > -88; lat -= STEP) {
  let bits = "";
  for (let c = 0; c < COLS; c++) {
    const lon = -180 + c * STEP + STEP / 2;
    const land = isLand(lon, lat);
    bits += land ? "1" : "0";
    if (land) dotCount++;
  }
  // pad to nibble boundary, encode hex
  while (bits.length % 4 !== 0) bits += "0";
  let hex = "";
  for (let i = 0; i < bits.length; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  rowsOut.push(hex);
}

console.log("ROWS", rowsOut.length, "COLS", COLS, "DOTS", dotCount);
console.log(JSON.stringify(rowsOut));
