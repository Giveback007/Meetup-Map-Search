var mainMap = L.map('map').setView(params.local, 10); // TODO: set zoom to full view of radius

(function initMap()
{
  var openstreetmaps = new L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {attribution: '&copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> contributors'}
  );
  mainMap.addLayer(openstreetmaps);
})();

// -- setMap -- //
function renderMap(center = params.local, events = [])
{
  let centerIcon = L.divIcon(
    {
    className: 'centerMarker',
    iconSize: new L.Point(100, 100),
    html: '<div><i class="fa fa-compass" aria-hidden="true"></i></div>'
    }
  );
  let centerMarker = L.marker(
    center,
    {icon: centerIcon}
  ).addTo(mainMap);
  centerMarker.bindPopup("<b>Search Center</b>");

  // -- Create Markers From Events Data -- //
  var markerCluster = L.markerClusterGroup();
  events.map(x =>
  {
    let loc = x.loc ? x.loc : [x.group.lat, x.group.lon];
    if (!loc[0] && !loc[1]) {loc = [x.group.lat, x.group.lon]}
    let img = x.group.photo ?
      x.group.photo.thumb_link : 'assets/imgs/meetup_logo.png';

    let icon = L.divIcon(
    {
      className: 'marker',
      iconSize: new L.Point(50, 50),
      html: `<div class='marker-img' style='background-image: url(${img})'></div>`
    });

    let marker = new L.marker(
      loc,
      {icon: icon}
    )
      .bindPopup(
        `<b>${x.group.name}</b>
        <br/>${x.name}
        <br/><i class="fa fa-clock-o" aria-hidden="true"></i>
          ${getFullTime(x.time)}
        <br/><a href='${x.link}' target='_blank'>More Info</a>`,
        {offset: [0, -5]}
      )
      .bindTooltip(
        `${x.group.name}`,
        {
        offset: [0, -20],
        direction: 'top'
        }
      );

    markerCluster.addLayer(marker);
  });
  mainMap.addLayer(markerCluster);

  // -- Circle Of The Search Radius -- //
  let radius = L.circle(
    params.local,
    {
      radius: 1609.344 * params.radius,
      interactive: false,
      fillOpacity: 0.07,
      opacity: 0.4
  });
  radius.addTo(mainMap);
}
// -- setMap -- //
