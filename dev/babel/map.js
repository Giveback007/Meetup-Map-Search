// This React class encapsulates the leaflet map
class Map extends React.Component
{
  constructor(props)
  {
    super(props);
  }
  mainMap;
  centerMarker = L.marker();
  centerRadius = L.circle();
  markerCluster = L.markerClusterGroup();
  // -- initMap -- //
  initMap = () =>
  {
    this.mainMap = L.map('map')
      .setView([38.366473, -96.262056], 5);
    let openstreetmaps = new L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="http://openstreetmap.org/">'
        +'OpenStreetMap</a> contributors'
      }
    );
    this.mainMap.addLayer(openstreetmaps);
  }
  // -- initMap -- //

  // -- newSearch -- //
  newCenter = (loc, rds) =>
  {
    this.mainMap.removeLayer(this.centerMarker);
    this.mainMap.removeLayer(this.centerRadius);

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

  ////////////////////////////////////
  // Getting the bounds of a cluster
  //
  // When you receive an event from a cluster you can query it for the bounds.
  //
  // markers.on('clusterclick', function (a) {
  // 	var latLngBounds = a.layer.getBounds();
  // });
  ////////////////////////////////////

  // -- putEventsOnMap -- //
  putEventsOnMap = (events) =>
  {
    this.markerCluster.eachLayer((x) => this.markerCluster.removeLayer(x));
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
            ${x.time.timeString}
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
    if (this.props.center.length)
    {
      this.newCenter(this.props.center, this.props.radius);
    }
    if (this.props.events.length)
    {
      console.log('render -> map', this.props.events);
      this.putEventsOnMap(this.props.events);

    }
    return (null);
  }
}
