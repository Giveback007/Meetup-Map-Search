// This React class encapsulates the leaflet map
class Map extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {
      radius: 25,
      dateLimit: Date.now() + (1 * 24 * 60 * 60000),
      searchLoc: '',
      api:
      {
        key: '457b71183481b13752d69755d97632',
        omit: `description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url`,
        getUrl: () =>
        {
          return `https://api.meetup.com/find/events?&sign=true&photo-host=public&lat=${this.state.searchLoc[0]}&lon=${this.state.searchLoc[1]}&radius=${this.state.radius}&fields=group_photo,group_category&omit=${this.state.api.omit}&key=${this.state.api.key}`
        }
      },
    }
  }

  mainMap;
  // -- initMap -- //
  initMap = (loc) =>
  {
    // set zoom to full view of radius
    this.mainMap = L.map('map').setView(loc, 10);
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

  // -- geoLocate -- //
  geoLocate = () =>
  {
    return new Promise((resolve, reject) =>
    {
      const options =
      {
        enableHighAccuracy: true,
        maximumAge: Infinity
      }
      const success = (pos) =>
      {
        let crd = pos.coords;
        this.setState({searchLoc: [crd.latitude, crd.longitude]});
        resolve([crd.latitude, crd.longitude]);
      }
      const error = (err) =>
      {
        console.log(err, 'put in custom location');
        reject(err);
      }

      navigator.geolocation.getCurrentPosition(success, error, options);
    });
  }
  // -- geoLocate -- //

  // -- newSearch -- //
  newSearch = (loc) => {
    findEvents(this.state.api.getUrl(), this.state.dateLimit, this.state.api.key)
      .then(x =>
      {
        this.setState({events: x});
        this.renderEventsOnMap(x);
      });

    let centerIcon = L.divIcon(
      {
      className: 'centerMarker',
      iconSize: new L.Point(100, 100),
      html: '<div><i class="fa fa-compass" aria-hidden="true"></i></div>'
      }
    );
    let centerMarker = L.marker(
      loc,
      {icon: centerIcon}
    ).addTo(this.mainMap);
    centerMarker.bindPopup("<b>Search Center</b>");

    let radius = L.circle(
      loc,
      {
        radius: 1609.344 * this.state.radius,
        interactive: false,
        fillOpacity: 0.07,
        opacity: 0.4
      }
    );
    radius.addTo(this.mainMap);
  }
  // -- newSearch -- //

  // -- renderEventsOnMap -- //
  renderEventsOnMap = (events) =>
  {
    let markerCluster = L.markerClusterGroup();
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
            ${getTimeString(x.time)}
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
    this.mainMap.addLayer(markerCluster);
  }
  // -- renderEventsOnMap -- //

  componentDidMount()
  {
    this.geoLocate()
      .then(x =>
      {
        this.initMap(x);
        this.newSearch(x);
      });
  }

  render()
  {
    return (null);
  }
}
/////////////////////



// -- renderEventsOnMap -- //
function renderEventsOnMap(events)
{
  // -- Create Markers From Events Data -- //
  let markerCluster = L.markerClusterGroup();
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
  this.mainMap.addLayer(markerCluster);
}
// -- renderEventsOnMap -- //
