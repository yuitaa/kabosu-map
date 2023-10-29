var map;
var icons = {};

fetch("./data/icons.json")
  .then((response) => response.json())
  .then((data) =>
    data.forEach((iconUrl) => {
      icons[iconUrl] = L.icon({
        iconUrl: iconUrl,
        iconSize: [24, 24],
      });
    })
  );

function positionToLatLng(x, y) {
  return L.latLng([y / -8, x / 8]);
}

function drawMultipleLines(data, pane) {
  data.forEach((lineData) => {
    lineData["position"] = lineData["position"].map((pos) =>
      positionToLatLng(pos[0], pos[1])
    );

    L.polyline([lineData["position"]], {
      color: lineData["color"] || "#ffffff",
      weight: lineData["weight"] || 4,
      opacity: lineData["opacity"] || 0.7,
      pane: pane,
    }).addTo(map);
  });
}

function setMarkers(data, pane, icon) {
  data.forEach((markerData) => {
    let marker = L.marker(positionToLatLng(...markerData["position"]), {
      pane: pane,
    });
    if (markerData["tooltip"]) {
      marker.bindTooltip(markerData["tooltip"], { direction: "bottom" });
    }
    if (icon) {
      marker.setIcon(icons[icon]);
    }
    marker.addTo(map);
  });
}

window.onload = () => {
  map = L.map("map", {
    crs: L.CRS.Simple,
    maxzoom: 0,
    minzoom: 0,
  });

  let bounds = [
    [0, 0],
    [4096, 4096],
  ];
  map.fitBounds(bounds);

  for (let x = -10; x <= 9; x++) {
    for (let y = -9; y <= 10; y++) {
      L.imageOverlay(
        `http://kabosu.work:8123/tiles/world/flat/-1_0/zzzzzz_${x * 64}_${
          y * 64
        }.jpg`,
        [
          [(y - 1) * 128, x * 128],
          [y * 128, (x + 1) * 128],
        ]
      ).addTo(map);
    }
  }

  map.createPane("markers");
  map.setView([0, 0]);
  map.zoomControl.setPosition("bottomright");

  fetch("./data/markers.json")
    .then((response) => response.json())
    .then((data) =>
      data.forEach((marker) => {
        if (marker["type"] == "multipleLines") {
          if (marker["pane"]) {
            map.createPane(marker["pane"]);
          }
          drawMultipleLines(marker["data"], marker["pane"] || "markers");
        }

        if (marker["type"] == "icons") {
          if (marker["pane"]) {
            map.createPane(marker["pane"]);
          }
          setMarkers(marker["data"], marker["pane"] || "markers", marker["icon"]);
        }
      })
    );
};
