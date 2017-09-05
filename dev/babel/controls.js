class Controls extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
      radius: 35, // max 100.00 (miles)
      latLon: [], // [38.366473, -96.262056]
      locName: '...',
      events: {},
      loadedDates: {},
      selected_day: time.now,
      selected_categ: [],//["Tech", "Games"],
      eventsFound: 0,
      setEventsOnMap: [],
    };
  }

  params =
  {
    lastDay: {},
    monthKeys: [], // are created in order -- use as refrence
    categList: {},
    meta: {},
    timeLimit: time.getDayLimit(1),
  }

  api =
  {
    key: apiKey.meetup || console.log('MEETUP API KEY ERROR'),
    omit: `description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url`,
    getEventUrl: (loc = this.state.latLon) =>
      `https://api.meetup.com/find/events?` +
      `&sign=true&photo-host=public&` +
      `lat=${loc[0]}&lon=${loc[1]}` +
      `&radius=${this.state.radius}&fields=group_photo,group_category` +
      `&omit=${this.api.omit}`+
      `&key=${this.api.key}`,
    getCategoriesUrl: () =>
      `https://api.meetup.com/2/categories?` +
      `&sign=true&photo-host=public&key=${this.api.key}`
  }

  // -- setEventState -- //
  setEventState = (data) =>
  {
    let tracker = task.updateDateTracker(
      this.state.loadedDates, data.lastEventTime
    );

    this.params.meta = data.meta;
    this.setState({events: data.events, loadedDates: tracker});
  }
  // -- setEventState -- //

  // -- setLocName -- //
  setLocName = (loc) =>
  {
    async.reverseGeo(loc)
      .then(x => this.setState({locName: x}));
  }
  // -- setLocName -- //

  // -- setLocName -- //
  setLatLon = (locStr) =>
  {
    async.geocode(locStr)
      .then(x =>
      {
        setLocName(x)
        this.setState({latLon: x})
      });
  }
  // -- setLocName -- //

  // -- filterEvents -- //
  filterEvents = () =>
  {
    const day = this.state.selected_day.key;
    const categories = this.state.selected_categ;
    let events = this.state.events[day[0]][day[1]];
    let filtered;
    if (!categories.length) {filtered = events}
    else
    {
      filtered = events.filter(x =>
        categories.indexOf(x.category) !== -1
      );
    }

    this.setState({setEventsOnMap: filtered, eventsFound: filtered.length});
  }
  // -- filterEvents -- //

  // -- newSearch -- //
  newSearch = () =>
  {
    // TODO
  }
  // -- newSearch -- //

  // -- loadToday -- //
  todayIsLoaded = false;
  loadToday = (forceLoad = false) =>
  {
    const key = this.state.selected_day.key;
    if (!this.todayIsLoaded || forceLoad)
      if(this.state.loadedDates[key[0]][key[1]] || forceLoad)
      {
        this.todayIsLoaded = true;
        this.filterEvents();
      }
  }
  // -- loadToday -- //

  // -- findEventsLoop -- //
  findEventsLoop = (loc, limit) =>
  {
    // let count = 0; // temp
    const loop = (obj) =>
    {
      // count++; // temp
      this.loadToday();
      this.setEventState(obj);
      if (obj.meta.next_link && obj.lastEventTime.unix < limit.unix)
      {
        async.limiter(obj.meta)
          .then(() => {
            // console.log('loop-'+count); // temp
            return async.findEvents(
              obj.meta.next_link + `&key=${this.api.key}`,
              this.state.events
            );
          })
          .then(x => loop(x));
      }
      else
      {
        // set all days to loaded
        let end = task.clone(this.params.lastDay);
        end.day++;
        let tracker = task.updateDateTracker(this.state.loadedDates, end);
        this.setState({loadedDates: tracker})

        this.loadToday(true);
        console.log(this.state.events); // temp
      }
    }
    // triger the loop
    async.findEvents(this.api.getEventUrl(loc), this.state.events)
      .then(x => loop(x));
  }
  // -- findEventsLoop -- //

  // -- componentDidMount -- //
  componentDidMount = () =>
  {
    let lastDay = this.params.timeLimit;
    let calendarObj = time.createCalendarObj(lastDay);
    let tracker = time.createCalendarObj(lastDay, true);

    this.params.lastDay = lastDay;
    this.params.monthKeys = calendarObj.months;
    this.setState(
      {
        events: calendarObj.calendar,
        loadedDates: tracker.calendar,
        // TODO reinstate \/
        // filterParams: {day: [calendarObj.months[0], time.now.day], categories: []},
      }
    );
    async.getCategories(this.api.getCategoriesUrl())
      .then(x => {
        this.params.categList = x;
        return async.geoLocate()
      })
      .then(x =>
      {
        this.setState(
          {
            latLon: x,
            radius: this.state.radius,
          }
        );
        this.setLocName(x);
        this.findEventsLoop(x, this.params.lastDay);
      });
  }
  // -- componentDidMount -- //

  // -- render -- //
  render()
  {
    if (this.state.setEventsOnMap.length)
    {
      this.setState({setEventsOnMap: []});
    }
    if (this.state.latLon.length)
    {
      this.setState({latLon: []});
    }
    return(
      <div>
        <Map
          events={this.state.setEventsOnMap}
          center={this.state.latLon}
          radius={this.state.radius}
        />
        <Search
          date={this.state.selected_day}
          eventsFound={this.state.eventsFound}
          radius={this.state.radius}
          loc={this.state.locName}
        />
      </div>
    );
  }
  // -- render -- //
}
