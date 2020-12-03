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
      selected_day: time.getDayLimit(0),
      selected_categ: [],

      tracker: {}, // for loaded days
      eventsOnMap: [],

      locErr: false,
      locErrMessage: '',
      locInputValue: '',

      selected_week: 0,
      week: [{}, {}, {}, {}, {}, {}, {}],

      toggle:
      {
        radius: false,
        location: false,
        filter: false,
      }
    };
  };

  weekLimit = 4;

  params =
  {
    events: {},
    meta: {},
    timeLimit: time.getWeekLimit(this.weekLimit),
    radius_range: [5, 10, 25, 35, 50, 100]
  };

  api =
  {
    token: /#access_token=\s*(.*?)\s*&/g.exec(window.location.href)[1],
    // token: 'eef7e98fd4c8314c1a95860958978860',
    omit: `description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url`,
    getEventUrl: (latLon, radius) =>
      `https://api.meetup.com/find/events?` +
      `&sign=true&photo-host=public&` +
      `lat=${latLon[0]}&lon=${latLon[1]}` +
      `&radius=${radius}&fields=group_photo,group_category` +
      `&omit=${this.api.omit}`+
      `&access_token=${this.api.token}`,
    getCategoriesUrl: () =>
      `https://api.meetup.com/2/categories?` +
      `&sign=true&photo-host=public&access_token=${this.api.token}`,
    addKey: (url) =>
      url + `&access_token=${this.api.token}`
  };

  // -- newSearch -- //
  newSearch = (loc, radius, limit = this.params.timeLimit) =>
  {
    this.setToggle('all');
    if(!loc){ this.setState({locErr: true}); return; }

    this.params.timeLimit = limit;
    this.params.events = time.createCalendarObj(limit);
    this.todayIsLoaded = false;
    this.setLocName(loc);
    this.setWeek(-1, true);
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

  // -- setTracker -- //
  setTracker = (tracker, limit) =>
  {
  	let loaded = task.clone(tracker);

  	let y = limit.year, m = limit.month, d = limit.day;
  	let stop = false;
  	while (!stop)
  	{
  		d--;
  		if (d < 1) {m--; d = 31}
  		if (m < 0) {y--; m = 11}
  		let key = time.getKey(y, m, d);
  		if (tracker[key[0]] !== undefined)
  		{
  			if (loaded[key[0]][key[1]] !== undefined)
  			{
  				loaded[key[0]][key[1]] = true;
  			}
  		}
  		else { stop = true }
  	}
    this.setWeek();
  	return loaded;
  }
  // -- setTracker -- //

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
    let tempArr = this.state.selected_categ;
    let idx = tempArr.indexOf(target);
    if (idx === -1) {tempArr.push(target)}
    else
    {
      delete tempArr[idx]
      tempArr = tempArr.filter(x => x)
    }
    this.setState({selected_categ: tempArr});
    this.setWeek(0, false, tempArr);
    this.setEventsOnMap(tempArr);
  }
  // -- setCateg -- //

  // -- setDate -- //
  setDate = (date) =>
  {
    this.setState({selected_day: date})
    this.setEventsOnMap(this.state.selected_categ, date.key);
  }
  // -- setDate -- //

  // -- setWeek -- //
  setWeek = (adj = 0, reset = false, categ = this.state.selected_categ) =>
  {
    let w = this.state.selected_week + adj;
    if (reset) {w = 0}
    if (w < 0 || w > this.weekLimit) {return}
    let tempArr = time.createWeekObj(w);
    tempArr.map((x, i) =>
    {
      tempArr[i].length =
        this.filterEvents(categ, x.key).length;
    });
    this.setState({selected_week: w, week: tempArr})
  }
  // -- setWeek -- //

  // -- setEventState -- //
  setEventState = (data) =>
  {
    let tracker = this.setTracker(
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
  filterEvents = (categ, key) =>
  {
    let events = this.params.events[key[0]][key[1]];
    let filtered;
    if (!categ.length) {filtered = events}
    else if (!events) {events = []}
    else
    {
      filtered = events.filter(x =>
        categ.indexOf(x.category) !== -1
      );
    }
    if (filtered === undefined) {filtered = []}
    return filtered;
  };
  // -- filterEvents -- //

  // -- setEventsOnMap -- //
  setEventsOnMap = (categ = this.state.selected_categ, key = this.state.selected_day.key) =>
  {
    this.setState({eventsOnMap: this.filterEvents(categ, key)});
  }
  // -- setEventsOnMap -- //

  // -- loadToday -- //
  todayIsLoaded = false;
  loadToday = (forceLoad = false) =>
  {
    const key = this.state.selected_day.key;
    if (!this.todayIsLoaded || forceLoad)
      if(this.state.tracker[key[0]][key[1]] || forceLoad)
      {
        this.todayIsLoaded = true;
        this.setEventsOnMap();
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
        let tracker = this.setTracker(this.state.tracker, limit);
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
          date={this.state.selected_day}
          date_set={this.setDate}
          week={this.state.week}
          week_set={this.setWeek}
          week_selected={this.state.selected_week}
          week_limit={this.weekLimit}
          loadStatus={this.state.tracker}
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
