class Controls extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state =
    {
      isReady: false,
      radius: 100, // max 100.00
      searchLoc: [38.366473, -96.262056],
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
      months: [],
      today: {},
      filter: {day: [], categories: []},
      onMapEvents: [],
      meta: {},
    };

  }

  filterEvents = (opt = this.state.filter) =>
  {
    let events = this.state.events[opt.day[0]][opt.day[1] + 1]; // -- temp TODO +1 remove
    let filtered;
    if (!opt.categories[0]) {filtered = events}
    else
    {
      // TODO filter events by id#
    }
    this.setState({onMapEvents: filtered})
  }



  componentDidMount()
  {
    let calendarObj = help.createCalendarObj(help.getMonthLimit(3));
    let today = help.getTimeObj(
      new Date() - new Date().getTimezoneOffset() * 60000
    );
    this.setState(
      {
        events: calendarObj.calendar,
        months: calendarObj.months,
        today: today,
        filter: {day: [calendarObj.months[0], today.day], categories: []}
      }
    );

    geoLocate()
      .then(x =>
      {
        this.setState({searchLoc: x, isReady: true});
        return findEvents(this.state.api.getUrl(x), this.state.events); // TODO create a native function
      })
      .then(x =>
      {
        this.setState({events: x.events, meta: x.meta});
        this.filterEvents();
      });
  }

  render()
  {
    console.log('render -> this.state.onMapEvents', this.state.onMapEvents);
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
