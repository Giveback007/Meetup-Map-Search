class Controls extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state =
    {
      search:
      {
        radius: 12, // max 100.00 (miles)
        loc: [] // [38.366473, -96.262056]
      },
      events: {},
      dateIsLoaded: {},
      filterParams: {day: [], categories: []},
      setEventsOnMap: [],
      meta: {},
    };

  }

  params =
  {
    lastDay: {},
    loadMonths: 2, // 0 loads this month only
    monthKeys: [], // are created in order -- use as refrence
  }

  api =
  {
    key: '457b71183481b13752d69755d97632',
    omit: `description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url`,
    getUrl: (loc = this.state.search.loc) =>
      `https://api.meetup.com/find/events?` +
      `&sign=true&photo-host=public&` +
      `lat=${loc[0]}&lon=${loc[1]}` +
      `&radius=${this.state.search.radius}&fields=group_photo,group_category` +
      `&omit=${this.api.omit}&key=${this.api.key}`,
  }

  counter = 2; // TEMP
  filterEvents = (opt = this.state.filterParams) =>
  {
    let events = this.state.events[opt.day[0]][opt.day[1]];
    let filtered;
    if (!opt.categories.length) {filtered = events}
    else
    {
      // TODO filter events by id#
    }

    // console.log(["2017-Sep", this.counter]); // <- TEMP
    this.setState({setEventsOnMap: filtered});

    this.counter++ // <- TEMP // TEMP \/
    setTimeout(() => {this.filterEvents({day: ["2017-09", this.counter], categories: []})}, 5000); // TEMP

  }

  newSearch = () =>
  {
    // TODO
  }

  setEventState = (data) =>
  {

    let tracker = task.updateDateTracker(
      this.state.dateIsLoaded, data.lastEventTime
    );

    this.setState(
      {
        events: data.events,
        meta: data.meta,
        dateIsLoaded: tracker
      }
    );
  }

  findEventsLoop = (data, limit) =>
  {
    let count = 0; // temp
    const loop = (obj) =>
    {
      count++; // temp
      this.setEventState(obj);
      if (obj.meta.next_link && obj.lastEventTime.unix < limit.unix)
      {
        async.limiter(obj.meta)
        .then(() => {
          console.log('loop-'+count);
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
        let tracker = task.updateDateTracker(this.state.dateIsLoaded, end);
        this.setState({dateIsLoaded: tracker})

        this.filterEvents(); // TODO triger after firstDay is loaded
        console.log(this.state.events); // TODO temp
        return;
      }
    }
    // triger the loop
    async.findEvents(this.api.getUrl(data), this.state.events)
      .then(x => loop(x));
  }

  componentDidMount = () =>
  {
    let lastDay = time.getMonthLimit(this.params.loadMonths);
    let calendarObj = time.createCalendarObj(lastDay);
    let tracker = time.createCalendarObj(lastDay, true);

    this.params.lastDay = lastDay;
    this.params.monthKeys = calendarObj.months;
    this.setState(
      {
        events: calendarObj.calendar,
        dateIsLoaded: tracker.calendar,
        filterParams: {day: [calendarObj.months[0], time.now.day], categories: []}
      }
    );

    async.geoLocate()
      .then(x =>
      {
        let temp = task.clone(this.state.search);
        temp.loc = x;
        this.setState({search: temp});
        return this.findEventsLoop(x, this.params.lastDay);
      });
  }

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
}
