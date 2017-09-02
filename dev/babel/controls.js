class Controls extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state =
    {
      isReady: false, // signal to Map if ready to render
      loadDone: false,
      radius: 10, // max 100.00 (miles)
      searchLoc: [38.366473, -96.262056],
      loadMonths: 0, // 0 loads this month only
      api:
      {
        key: '457b71183481b13752d69755d97632',
        omit: `description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url`,
        getUrl: (loc = this.state.searchLoc) =>
          `https://api.meetup.com/find/events?` +
          `&sign=true&photo-host=public&` +
          `lat=${loc[0]}&lon=${loc[1]}` +
          `&radius=${this.state.radius}&fields=group_photo,group_category` +
          `&omit=${this.state.api.omit}&key=${this.state.api.key}`,
      },
      events: {},
      dayIsLoaded: {},
      months: [],
      today: {},
      lastDay: {},
      filter: {day: [], categories: []},
      onMapEvents: [],
      meta: {},
    };

  }

  filterEvents = (opt = this.state.filter) =>
  {
    let events = this.state.events[opt.day[0]][opt.day[1]];
    let filtered;
    if (!opt.categories[0]) {filtered = events}
    else
    {
      // TODO filter events by id#
    }
    this.setState({onMapEvents: filtered, isReady: false})
  }

  findEventsLoop = (data, limit, meta = this.state.meta) =>
  {
    let count = 0; // temp
    const loop = (obj) =>
    {
      count++; // temp
      this.filterEvents(); // TODO triger after firstDay is loaded
      this.setState({events: obj.events, meta: obj.meta});
      if (obj.meta.next_link && obj.lastEventTime.unix < limit.unix)
      {
        async.limiter(obj.meta)
        .then(() => {
          console.log('loop-'+count);
          return async.findEvents(
            obj.meta.next_link + `&key=&{this.state.api.key}`,
            this.state.events
          );
        })
        .then(x => {
          loop(x);
        });
      }
      else
      {
        this.setState({loadDone: true, isReady: true});
        console.log('loop-done, set all days to loaded'); // TODO
        console.log(this.state.events); // TODO temp
        return;
      }
    }
    // triger the loop
    async.findEvents(this.state.api.getUrl(data), this.state.events)
      .then(x =>
      {
        loop(x);
        console.log('isReady: true');
        this.setState({isReady: true}); // TODO temp only triger when firsDay done
      });
  }

  shouldRender = () =>
  {
    // TODO create more conditionals
    return this.state.isReady ? true : false;
  }

  componentDidMount = () =>
  {
    let end = time.getMonthLimit(this.state.loadMonths);
    let calendarObj = time.createCalendarObj(end);
    let tracker = time.createCalendarObj(end, true);
    let today = time.getTimeObj(
      new Date(), new Date().getTimezoneOffset() * 60000
    );
    let lastDay = new Date(end);
    lastDay = time.getTimeObj(
      lastDay, lastDay.getTimezoneOffset() * 60000
    );
    this.setState(
      {
        events: calendarObj.calendar,
        dayIsLoaded: tracker.calendar,
        months: calendarObj.months,
        today: today,
        lastDay: lastDay,
        filter: {day: [calendarObj.months[0], today.day], categories: []}
      }
    );

    async.geoLocate()
      .then(x =>
      {
        this.setState({searchLoc: x, isReady: true});
        return this.findEventsLoop(x, this.state.lastDay);
      });
  }

  render()
  {
    // console.log('render -> this.state.onMapEvents', this.state.onMapEvents);
    if (this.shouldRender())
    {
      this.filterEvents();
      // this.setState({isReady: false})
    }
    return(
      <div>
        <Map
          isReady={this.state.isReady}
          events={this.state.onMapEvents}
          center={this.state.searchLoc}
          radius={this.state.radius}
        />
      </div>
    );
  }
}
