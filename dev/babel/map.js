// This React class encapsulates the leaflet map
class Map extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
      events: [],
      latLon: [],
      radius: 25
    }
  }

  mainMap; // <- main variable
  centerMarker = L.marker();
  centerRadius = L.circle();
  markerCluster = L.markerClusterGroup();
  // -- initMap -- //
  initMap = () =>
  {
    this.mainMap = L.map('map', {zoomControl: false})
      .setView([38.366473, -96.262056], 5);

    const zoomBtns = L.control.zoom(
      {
        position: 'bottomright'
      }
    ).addTo(this.mainMap);
    let tiles = new L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="http://openstreetmap.org/">'
        +'OpenStreetMap</a> contributors'
      }
    );
    // const tiles = new L.tileLayer(
    //   'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
    //   {
    //     id: 'outdoors-v10',
    //     accessToken: apiKey.mapbox || console.log('MAPBOX API KEY ERROR'),
    //     attribution: '&copy; <a href="http://mapbox.com/">'
    //     +'Mapbox</a> &copy; <a href="http://openstreetmap.org/">'
    //     +'OpenStreetMap</a>'
    //   }
    // );
    this.mainMap.addLayer(tiles);
  };
  // -- initMap -- //

  // -- newSearch -- //
  newSearchParams = (loc, rds) =>
  {
    this.mainMap.removeLayer(this.centerMarker);
    this.mainMap.removeLayer(this.centerRadius);

    this.mainMap.flyTo(loc, 10, {duration: 3});

    let centerIcon = L.divIcon(
      {
      className: 'centerMarker',
      iconSize: new L.Point(50, 50),
      html: '<div><i class="fa fa-compass" aria-hidden="true"></i></div>'
      }
    );
    this.centerMarker = L.marker(
      loc,
      {
        icon: centerIcon,
        // interactive: false,
        title: 'Search Center'
      }
    );

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

  componentWillMount()
  {
    this.initMap();
  }

  render()
  {
    if (!task.isEqual(this.props.latLon, this.state.latLon) ||
        !task.isEqual(this.props.radius, this.state.radius) )
    {
      this.setState({latLon: this.props.latLon, radius: this.props.radius})
      if (this.props.latLon.length)
      {
        this.newSearchParams(this.props.latLon, this.props.radius);
      }
    }
    if (!task.isEqual(this.props.events, this.state.events))
    {
      this.setState({events: this.props.events})
      this.putEventsOnMap(this.props.events);
    }
    return (null);
  }
}
