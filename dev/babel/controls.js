class Controls extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
      radius: 25, // max 100.00 (miles)
      latLon: [],
      locName: '...',

      categList: {},
      selected_day: time.now, //time.getTimeObj(new Date(2017, 8, 7), new Date(2017, 8, 7).getTimezoneOffset() * 60000),//
      selected_categ: [],//["Tech", "Games"],

      tracker: {}, // for loaded days
      eventsOnMap: [],
    };
  };

  params =
  {
    events: {},
    meta: {},
    timeLimit: time.getDayLimit(1),
    radius_range: [5, 10, 25, 35, 50, 100]
  };

  api =
  {
    key: apiKey.meetup || console.log('MEETUP API KEY ERROR'),
    omit: `description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url`,
    getEventUrl: (latLon, radius) =>
      `https://api.meetup.com/find/events?` +
      `&sign=true&photo-host=public&` +
      `lat=${latLon[0]}&lon=${latLon[1]}` +
      `&radius=${radius}&fields=group_photo,group_category` +
      `&omit=${this.api.omit}`+
      `&key=${this.api.key}`,
    getCategoriesUrl: () =>
      `https://api.meetup.com/2/categories?` +
      `&sign=true&photo-host=public&key=${this.api.key}`,
    addKey: (url) =>
      url + `&key=${this.api.key}`
  };

  // -- newSearch -- //
  newSearch = (loc, radius, limit = this.params.timeLimit) =>
  {
    this.params.timeLimit = limit;
    this.params.events = time.createCalendarObj(limit);
    this.todayIsLoaded = false;
    this.setState({tracker: time.createCalendarObj(limit, true)});
    this.eventsFindLoop(loc, radius, limit);
  }
  // -- newSearch -- //

  // -- setEventState -- //
  setEventState = (data) =>
  {
    let tracker = time.updateDateTracker(
      this.state.tracker, data.lastEventTime
    );

    this.params.events = data.events;
    this.setState({tracker: tracker});
  }
  // -- setEventState -- //

  // -- setLocName -- //
  setLocName = (loc) =>
  {
    async.reverseGeo(loc)
      .then(x => this.setState({locName: x}));
  }
  // -- setLocName -- //

  // -- geocodeLatLon -- //
  geocodeLatLon = (locStr) =>
  {
    async.geocode(locStr)
      .then(x =>
      {
        setLocName(x)
        this.setState({latLon: x})
        this.newSearch(x, this.state.radius);
      });
  }
  // -- geocodeLatLon -- //

  // -- filterEvents -- //
  filterEvents = () =>
  {
    let day = this.state.selected_day.key;
    let categ = this.state.selected_categ;
    let events = this.params.events[day[0]][day[1]];
    let filtered;
    if (!categ.length) {filtered = events}
    else
    {
      filtered = events.filter(x =>
        categ.indexOf(x.category) !== -1
      );
    }

    this.setState({eventsOnMap: filtered});
  }
  // -- filterEvents -- //

  // -- loadToday -- //
  todayIsLoaded = false;
  loadToday = (forceLoad = false) =>
  {
    const key = this.state.selected_day.key;
    if (!this.todayIsLoaded || forceLoad)
      if(this.state.tracker[key[0]][key[1]] || forceLoad)
      {
        this.todayIsLoaded = true;
        this.filterEvents();
      }
  }
  // -- loadToday -- //

  // -- eventsFindLoop -- //
  eventsFindLoop = (loc, radius, limit) =>
  {
    const loop = (obj) =>
    {
      this.loadToday();
      this.setEventState(obj);
      if (obj.meta.next_link && obj.lastEventTime.unix < limit.unix)
      {
        async.limiter(obj.meta)
          .then(() => {
            // console.log('loop-'+count); // temp
            return async.findEvents(
              this.api.addKey(obj.meta.next_link),
              this.params.events
            );
          })
          .then(x => loop(x));
      }
      else
      {
        // set all tracker days to loaded
        limit.day++;
        let tracker = time.updateDateTracker(this.state.tracker, limit);
        this.setState({tracker: tracker})

        this.loadToday(true);
        console.log(this.params.events); // temp
      }
    }
    // triger the loop
    async.findEvents(this.api.getEventUrl(loc, radius), this.params.events)
      .then(x => loop(x));
  }
  // -- eventsFindLoop -- //

  // -- setRadius -- //
  setRadius = (r) =>
  {
    this.setState({radius: r});
    this.newSearch(this.state.latLon, r);
  }
  // -- setRadius -- //

  // -- componentDidMount -- //
  componentDidMount = () =>
  {
    async.getCategories(this.api.getCategoriesUrl())
      .then(x =>
      {
        this.setState({categList: x})
        return async.geoLocate();
      })
      .then(x =>
      {
        this.setState({latLon: x});
        this.setLocName(x);
        return this.newSearch(x, this.state.radius);
      });
  }
  // -- componentDidMount -- //

  // -- render -- //
  render()
  {
    return(
      <div>
        <Map
          events={this.state.eventsOnMap}
          latLon={this.state.latLon}
          radius={this.state.radius}
        />
        <Nav
          date={this.state.selected_day}
          eventsFound={this.state.eventsOnMap.length}
          radius_range={this.params.radius_range}
          radius_onClick={this.setRadius}
          radius={this.state.radius}
          loc={this.state.locName}
        />
      </div>
    );
  }
  // -- render -- //
}
