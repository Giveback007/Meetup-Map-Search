class Controls extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state =
    {
      // loadDone: false,
      search:
      {
        radius: 10, // max 100.00 (miles)
        loc: [] // [38.366473, -96.262056]
      },
      loadMonths: 0, // 0 loads this month only
      api:
      {
        key: '457b71183481b13752d69755d97632',
        omit: `description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url`,
        getUrl: (loc = this.state.search.loc) =>
          `https://api.meetup.com/find/events?` +
          `&sign=true&photo-host=public&` +
          `lat=${loc[0]}&lon=${loc[1]}` +
          `&radius=${this.state.search.radius}&fields=group_photo,group_category` +
          `&omit=${this.state.api.omit}&key=${this.state.api.key}`,
      },
      events: {},
      dayIsLoaded: {},
      months: [],
      today: time.now,
      lastDay: {},
      filter: {day: [], categories: []},
      onMapEvents: [],
      meta: {},
    };

  }
  counter = 2;
  filterEvents = (opt = this.state.filter) =>
  {
    let events = this.state.events[opt.day[0]][opt.day[1]];
    let filtered;
    if (!opt.categories.length) {filtered = events}
    else
    {
      // TODO filter events by id#
    }

    this.setState({onMapEvents: filtered});
    this.counter++
    console.log(["2017-Sep", this.counter]);
    setTimeout(() => {this.filterEvents({day: ["2017-Sep", this.counter], categories: []})}, 5000);
  }

  newSearch = () =>
  {

  }

  findEventsLoop = (data, limit, meta = this.state.meta) =>
  {
    let count = 0; // temp
    const loop = (obj) =>
    {
      count++; // temp
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
        // this.setState({loadDone: true});
        this.filterEvents(); // TODO triger after firstDay is loaded
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
        // this.setState({isReady: true}); // TODO temp only triger when firsDay done
      });
  }

  componentDidMount = () =>
  {
    let end = time.getMonthLimit(this.state.loadMonths);
    let calendarObj = time.createCalendarObj(end);
    let tracker = time.createCalendarObj(end, true);
    let lastDay = new Date(end);
    lastDay = time.getTimeObj(
      lastDay, lastDay.getTimezoneOffset() * 60000
    );
    this.setState(
      {
        events: calendarObj.calendar,
        dayIsLoaded: tracker.calendar,
        months: calendarObj.months,
        lastDay: lastDay,
        filter: {day: [calendarObj.months[0], time.now.day], categories: []}
      }
    );

    async.geoLocate()
      .then(x =>
      {
        let temp = clone(this.state.search);
        temp.loc = x;
        this.setState({search: temp});
        return this.findEventsLoop(x, this.state.lastDay);
      });
  }

  render()
  {
    // console.log('render -> this.state.onMapEvents', this.state.onMapEvents);
    if (this.state.onMapEvents.length)
    {
      this.setState({onMapEvents: []});
    }
    if (this.state.search.loc.length)
    {
      let rad = this.state.search.radius;
      this.setState({ search: {radius: rad, loc: []} });
    }
    return(
      <div>
        <Map
          events={this.state.onMapEvents}
          center={this.state.search.loc}
          radius={this.state.search.radius}
        />
      </div>
    );
  }
}
