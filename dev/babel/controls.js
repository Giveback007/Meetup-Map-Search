class Controls extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
      search:
      {
        radius: 35, // max 100.00 (miles)
        loc: [] // [38.366473, -96.262056]
      },
      events: {},
      loadedDates: {},
      selected_day: time.now.key,//time.getKey(2017, 8, 7),
      selected_categ: [],//["Tech", "Games"],
      setEventsOnMap: [],
    };
  }

  params =
  {
    lastDay: {},
    loadWeeks: 0, // 0 loads this month only
    monthKeys: [], // are created in order -- use as refrence
    categList: {},
    meta: {},
  }

  api =
  {
    key: apiKey.meetup || console.log('MEETUP API KEY ERROR'),
    omit: `description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url`,
    getEventUrl: (loc = this.state.search.loc) =>
      `https://api.meetup.com/find/events?` +
      `&sign=true&photo-host=public&` +
      `lat=${loc[0]}&lon=${loc[1]}` +
      `&radius=${this.state.search.radius}&fields=group_photo,group_category` +
      `&omit=${this.api.omit}`+
      `&key=${this.api.key}`,
    getCategoriesUrl: () =>
      `https://api.meetup.com/2/categories?` +
      `&sign=true&photo-host=public&key=${this.api.key}`
  }


  // -- filterEvents -- //
  filterEvents = () =>
  {
    const day = this.state.selected_day;
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

    this.setState({setEventsOnMap: filtered});
  }
  // -- filterEvents -- //

  // -- newSearch -- //
  newSearch = () =>
  {
    // TODO
  }
  // -- newSearch -- //

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

  // -- loadToday -- //
  todayIsLoaded = false;
  loadToday = (forceLoad = false) =>
  {
    const key = this.state.selected_day;
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
    let lastDay = time.getWeekLimit(this.params.loadWeeks);
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
        this.setState({search: {loc: x, radius: this.state.search.radius}});
        return this.findEventsLoop(x, this.params.lastDay);
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
    if (this.state.search.loc.length)
    {
      let rad = this.state.search.radius;
      this.setState({ search: {radius: rad, loc: []} });
    }
    return(
      <div>
        <Map
          events={this.state.setEventsOnMap}
          center={this.state.search.loc}
          radius={this.state.search.radius}
        />
      </div>
    );
  }
  // -- render -- //
}
