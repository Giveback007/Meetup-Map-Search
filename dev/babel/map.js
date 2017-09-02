// This React class encapsulates the leaflet map
class Map extends React.Component
{
  constructor(props)
  {
    super(props);
  }
  mainMap;
  centerMarker;
  centerRadius;
  markerCluster = L.markerClusterGroup();
  // -- initMap -- //
  initMap = () =>
  {
    this.mainMap = L.map('map')
      .setView([38.366473, -96.262056], 5);
    let openstreetmaps = new L.tileLayer(
      'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="http://openstreetmap.org/">'
        +'OpenStreetMap</a> contributors'
      }
    );
    this.mainMap.addLayer(openstreetmaps);
  }
  // -- initMap -- //

  // -- clearMap -- //
  clearMap = () =>
  {

  }
  // -- clearMap -- //

  // -- newSearch -- //
  center = (loc, rds) =>
  {
    this.mainMap.flyTo(loc, 10, {duration: 3});

    let centerIcon = L.divIcon(
      {
      className: 'centerMarker',
      iconSize: new L.Point(100, 100),
      html: '<div><i class="fa fa-compass" aria-hidden="true"></i></div>'
      }
    );
    this.centerMarker = L.marker(
      loc,
      {icon: centerIcon}
    ).bindTooltip(
      `Search Center`,
      {
      offset: [0, 0],
      direction: 'top'
      }
    );
    //.bindPopup("<b>Search Center</b>"); ///////////
    this.mainMap.addLayer(this.centerMarker);

    this.centerRadius = L.circle(
      loc,
      {
        radius: 1609.344 * rds,
        interactive: false,
        fillOpacity: 0.07,
        opacity: 0.4
      }
    );
    this.mainMap.addLayer(this.centerRadius);
  }
  // -- newSearch -- //

  // -- putEventsOnMap -- //
  putEventsOnMap = (events) =>
  {
    events.map(x =>
    {
      let loc = x.loc ? x.loc : [x.group.lat, x.group.lon];
      if (!loc[0] && !loc[1]) {loc = [x.group.lat, x.group.lon]} // x.loc || (!x.loc[0] && !x.loc[1])
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
            ${time.timeString}
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

      this.markerCluster.addLayer(marker);
    });
    this.mainMap.addLayer(this.markerCluster);
  }
  // -- putEventsOnMap -- //

  componentDidMount()
  {
    this.initMap();
  }

  render()
  {
    if (this.props.isReady) {
      console.log('render -> map');
      this.center(this.props.center, this.props.radius);
      this.putEventsOnMap(this.props.events)
    }
    return (null);
  }
}
/////////////////////



// -- renderEventsOnMap -- //
// function renderEventsOnMap(events)
// {
//   // -- Create Markers From Events Data -- //
//   let markerCluster = L.markerClusterGroup();
//   events.map(x =>
//   {
//     let loc = x.loc ? x.loc : [x.group.lat, x.group.lon];
//     if (!loc[0] && !loc[1]) {loc = [x.group.lat, x.group.lon]}
//     let img = x.group.photo ?
//       x.group.photo.thumb_link : 'assets/imgs/meetup_logo.png';
//
//     let icon = L.divIcon(
//     {
//       className: 'marker',
//       iconSize: new L.Point(50, 50),
//       html: `<div class='marker-img' style='background-image: url(${img})'></div>`
//     });
//
//     let marker = new L.marker(
//       loc,
//       {icon: icon}
//     )
//       .bindPopup(
//         `<b>${x.group.name}</b>
//         <br/>${x.name}
//         <br/><i class="fa fa-clock-o" aria-hidden="true"></i>
//           ${getFullTime(x.time)}
//         <br/><a href='${x.link}' target='_blank'>More Info</a>`,
//         {offset: [0, -5]}
//       )
//       .bindTooltip(
//         `${x.group.name}`,
//         {
//         offset: [0, -20],
//         direction: 'top'
//         }
//       );
//
//     markerCluster.addLayer(marker);
//   });
//   this.mainMap.addLayer(markerCluster);
// }
// -- renderEventsOnMap -- //
