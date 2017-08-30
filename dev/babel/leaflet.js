var map = L.map('map').setView(params.local, 8);
var osm = new L.tileLayer(
  'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {attribution: '&copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> contributors'}
                          );
map.addLayer(osm);

var marker = L.marker(params.local).addTo(map);
marker.bindPopup("<b>You Are Here</b>")



var circle = L.circle(params.local, {
    // color: 'red',
    // fillColor: '#f03',
    fillOpacity: 0.05,
    radius: 1609.34 * params.radius
}).addTo(map);
