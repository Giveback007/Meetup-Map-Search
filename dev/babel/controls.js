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

      categList: [],
      selected_day: time.now, //time.getTimeObj(new Date(2017, 8, 7), new Date(2017, 8, 7).getTimezoneOffset() * 60000),//
      selected_categ: [],//["Tech", "Games"],

      tracker: {}, // for loaded days
      eventsOnMap: [],

      isLoading: false,
      locErr: false,
      locErrMessage: '',
      locInputValue: '',

      week: [{}, {}, {}, {}, {}, {}, {}],

      toggle:
      {
        radius: false,
        location: false,
        filter: false,
      }
    };
  };

  params =
  {
    events: {},
    meta: {},
    timeLimit: time.getWeekLimit(0),
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
    this.setToggle('all');
    if(!loc){ this.setState({locErr: true}); return; }

    this.params.timeLimit = limit;
    this.params.events = time.createCalendarObj(limit);
    this.todayIsLoaded = false;
    this.setLocName(loc)
    this.setState(
      {
        tracker: time.createCalendarObj(limit, true),
        latLon: loc,
        locErr: false,
        locInputValue: '',
      }
    );
    this.eventsFindLoop(loc, radius, limit);
  };
  // -- newSearch -- //

  // -- setToggle --//
  popupClosedState; // defined in componentDidMount
  setToggle = (target) =>
  {
    if (target === 'all') {this.setState({toggle: this.popupClosedState});}
    let tempObj = task.clone(this.popupClosedState);
    tempObj[target] = !this.state.toggle[target];
    this.setState({toggle: tempObj});
  }
  // -- setToggle --//

  // -- setCateg -- //
  setCateg = (target) =>
  {
    let tempArr = this.state.selected_categ
    let idx = tempArr.indexOf(target);
    if (idx === -1) {tempArr.push(target)}
    else
    {
      delete tempArr[idx]
      tempArr = tempArr.filter(x => x)
    }
    this.setState({selected_categ: tempArr});
    this.filterEvents(tempArr);
  }
  // -- setCateg -- //


  // -- setEventState -- //
  setEventState = (data) =>
  {
    let tracker = time.updateDateTracker(
      this.state.tracker, data.lastEventTime
    );

    this.params.events = data.events;
    this.setState({tracker: tracker});
  };
  // -- setEventState -- //

  // -- setLocName -- //
  setLocName = (loc) =>
  {
    async.reverseGeo(loc)
      .then(x => this.setState({locName: x}));
  };
  // -- setLocName -- //

  // -- setRadius -- //
  setRadius = (r) =>
  {
    this.setState({radius: r});
    this.newSearch(this.state.latLon, r);
  };
  // -- setRadius -- //

  // -- geocodeLatLon -- //
  setLatLonViaGeocode = (locStr = this.state.locInputValue) =>
  {
    async.geocode(locStr)
      .then(x =>
      {
        if (!x[0])
        {
          this.setState({locErrMessage: x[1], locErr: true});
          return;
        }
        this.newSearch(x[1], this.state.radius);
      });
  };
  // -- geocodeLatLon -- //

  // -- handleChange_locValue -- //
  handleChange_locValue = (e) =>
  {
    this.setState({locInputValue: e.target.value});
  }
  // -- handleChange_locValue -- //

  // -- filterEvents -- //
  filterEvents = (categ = this.state.selected_categ) =>
  {
    let day = this.state.selected_day.key;
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
  };
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
  };
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
  };
  // -- eventsFindLoop -- //

  // -- componentDidMount -- //
  componentDidMount = () =>
  {
    this.popupClosedState = task.clone(this.state.toggle);
    async.getCategories(this.api.getCategoriesUrl())
      .then(x =>
      {
        this.setState({categList: x})
        return async.geoLocate();
      })
      .then(x =>
      {
          return this.newSearch(x, this.state.radius);
      });
  };
  // -- componentDidMount -- //

  locErr_submitForm = (e) =>
  {
    e.preventDefault();
    this.setLatLonViaGeocode();
  }

  // -- render -- //
  render()
  {
    let err = this.state.locErrMessage;
    let errMsg = err !== '' ? <h4>{err}</h4> : null;
    return(
      <div id='controls'>
        <Map
          events={this.state.eventsOnMap}
          latLon={this.state.latLon}
          radius={this.state.radius}
        />
        <Nav
          categ_list={this.state.categList}
          categ_stateOf={this.state.selected_categ}
          categ_onClick={this.setCateg}
          toggle={this.setToggle}
          toggle_stateOf={this.state.toggle}
          calendar_date={this.state.selected_day}
          calendar_week={this.state.week}
          eventsFound={this.state.eventsOnMap.length}
          radius_range={this.params.radius_range}
          radius_onClick={this.setRadius}
          radius={this.state.radius}
          loc_onSubmit={this.setLatLonViaGeocode}
          loc_inputValue={this.state.locInputValue}
          loc_inputHandleChange={this.handleChange_locValue}
          loc={this.state.locName}
        />
        <div
          className='locErrHandler'
          style={this.state.locErr ? {display: 'inline'}: {display: 'none'}}
        >
          {errMsg}
          <form onSubmit={this.locErr_submitForm}>
            <input
              type='text'
              placeholder='City or postal code'
              onChange={this.handleChange_locValue}
              value={this.state.locInputValue}
            />
        </form>
        </div>

      </div>
    );
  };
  // -- render -- //
};
