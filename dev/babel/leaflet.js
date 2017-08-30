var mainMap = L.map('map').setView(params.local, 10); // TODO: set zoom to full view of radius

function initMap() {
  var openstreetmaps = new L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {attribution: '&copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> contributors'}
  );
  mainMap.addLayer(openstreetmaps);
}
initMap();

function setMap(center = params.local, events = []) {
  // let centerIcon = L.divIcon({className: 'centerMarker'});
  // let centerMarker = L.marker(center, {icon: centerIcon}).addTo(mainMap);
  // centerMarker.bindPopup("<b>You Are Here</b>");

  // -- Create Markers From Events Data -- //
  var markerCluster = L.markerClusterGroup();
  events.map(x => {
    // if (!x.loc) {coord = [x.group.lat, x.group.lon]}
    if (!x.loc) {return}
    let marker = new L.marker(x.loc);
    var popup = new L.Popup({closeButton: false, offset: new L.Point(0.5, -24)});
    markerCluster.addLayer(marker);
  });
  mainMap.addLayer(markerCluster);

  // -- Circle Of The Search Radius -- //
  let radius = L.circle(params.local, {
      radius: 1609.344 * params.radius,
      interactive: false,
      fillOpacity: 0.07,
      opacity: 0.4
  }).addTo(mainMap);

  var markerCluster

}
