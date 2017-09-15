//@prepros-append babel/helper.js
//@prepros-append babel/time.js
//@prepros-append babel/async.js

//@prepros-append babel/controls.js
//@prepros-append babel/map.js
//@prepros-append babel/nav.js

//@prepros-append babel/start.js

const task = {};

// -- clone -- //
task.clone = (obj) =>
{
	let clone = JSON.stringify(obj);
	return JSON.parse(clone);
}
// -- clone -- //

// -- isEqual -- //
task.isEqual = (obj1, obj2) =>
{
	return JSON.stringify(obj1) === JSON.stringify(obj2)
}
// -- isEqual -- //

// -- capitalizeWords -- //
task.capitalizeWords = (x) =>
{
	let str = x.toLowerCase();
	let arr = str.split(' ');
	arr = arr.map(x => x.charAt(0).toUpperCase() + x.slice(1));
	return arr.join(' ');
}
// -- capitalizeWords -- //

const time = {};

time.months =
	[
		'Jan', 'Feb', 'Mar',
		'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep',
		'Oct', 'Nov', 'Dec'
	];

time.daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

time.getKey = (y, m, d) =>
{
	// return [`${y}-${m < 9 ? '0' + (m + 1): m + 1}`, `${d}`]; <- Diff key format
	return [`${y}-${time.months[m]}`, `${d}`];
}

time.getTimeObj = (unix, offset) =>
{
	const getTimeString = (t) =>
	{
		let hour = ((t.hour + 11) % 12 + 1);
		let amPm = t.hour < 12 ? 'am' : 'pm';
		let min = t.min < 10 ? '0' + t.min : t.min;
		return(
			`${time.daysOfWeek[t.weekDay]},` +
			` ${time.months[t.month]}` +
			` ${t.day}, ${hour}:${min} ${amPm}`
		);
	}

	let date = new Date(unix - offset);

	let obj =
	{
		unix: new Date(unix),
		offset: offset,
		year: date.getUTCFullYear(),
		month: date.getUTCMonth(),
		day: date.getUTCDate(),
		hour: date.getUTCHours(),
		min: date.getUTCMinutes(),
		weekDay: date.getUTCDay(),
	}
	obj.timeString = getTimeString(obj);
	obj.key = time.getKey(obj.year, obj.month, obj.day);

	return obj;
}

time.now = time.getTimeObj(
	new Date(), new Date().getTimezoneOffset() * 60000
);

time.getDayLimit = (daysFromNow) =>
{
	const now = time.now;
	const lastDay = new Date(now.year, now.month, now.day + daysFromNow);
	const end = lastDay.setHours(23, 59, 59, 999);
	const offset = new Date(end).getTimezoneOffset() * 60000;

	return time.getTimeObj(end, offset);
}

time.getWeekLimit = (weeksFromNow) =>
{
	const now = time.now;
	const day = now.day + (6 - now.weekDay) + (weeksFromNow * 7);
	const lastDay = new Date(now.year, now.month, day);
	const end = lastDay.setHours(23, 59, 59, 999);
	const offset = new Date(end).getTimezoneOffset() * 60000;

	return time.getTimeObj(end, offset);
}

time.getMonthLimit = (monthsFromNow) =>
{
	const now = time.now;
	const lastDay = new Date(now.year, now.month + monthsFromNow + 1, 0);
	const end = lastDay.setHours(23, 59, 59, 999);
	const offset = new Date(end).getTimezoneOffset() * 60000;

	return time.getTimeObj(end, offset);
}

time.createCalendarObj = (limit, tracker = false) =>
{
	let now = time.now;
  let calendar = {};
	let oneDay = 24 * 60 * 60 * 1000;

  let today = Date.UTC(now.year, now.month, now.day, 23, 59, 59, 999);
	let lastDay = Date.UTC(limit.year, limit.month, limit.day, 23, 59, 59, 999);

	let numDays = (lastDay - today) / oneDay;

	for (let i = 0; i <= numDays; i++)
	{
		let refDay = new Date(now.year, now.month, now.day + i);
		let key = time.getKey(refDay.getFullYear(), refDay.getMonth(), refDay.getDate())
		let m = key[0], d = key[1];
		if (!calendar[m]) {calendar[m] = {}}

		tracker ? calendar[m][d] = false : calendar[m][d] = [];
	}
  return calendar;
}

time.updateDateTracker = (tracker, limit) =>
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

	return loaded;
}

const async = {};
// -- ajaxCall -- //
async.ajaxCall = (url) =>
{
	return new Promise((resolve, reject) =>
	{
		$.ajax
		({
			url: url,
			type: 'get',
			dataType: "jsonp",
			success: (x) =>
			{
				// console.log('ajax', x); // temp
				resolve(x)
			},
			error: (err) =>
			{
				reject(err)
			}
		});
	});
}
// -- ajaxCall -- //

// -- limiter -- //
async.limiter = (meta) =>
{
	let limit = Number(meta['X-RateLimit-Remaining']);
	let reset = Number(meta['X-RateLimit-Reset']);
	console.log('calls left ' + limit, ', reset in ' + reset + ' sec') // temp
	return new Promise((resolve, reject) =>
	{
		if (limit <= 10)
		{
			console.log('limit reached, ' + reset + ' seconds until reset'); // temp
			setTimeout(resolve, (reset * 1000) + 500);
		}
		else
		{
			resolve();
		}
	});
};
// -- limiter -- //

// -- geoLocate -- //
async.geoLocate = () =>
{
	return new Promise((resolve, reject) =>
	{
		const options = {maximumAge: Infinity}
		const success = (pos) =>
		{
			let crd = pos.coords;
			resolve([crd.latitude, crd.longitude]);
		}
		const error = (err) =>
		{
			resolve(false)
		}
		navigator.geolocation.getCurrentPosition(success, error, options);
	});
};
// -- geoLocate -- //

// -- findEvents -- //
async.overflowEvents = [];
async.findEvents = (url, allEvents) =>
{
	return new Promise((resolve, reject) =>
	{
		const parseData = (dt) =>
		{
			let events = task.clone(allEvents);
			// Forms the data
			let data = dt.data.map(x =>
			{
				let obj = x;
				obj.loc = obj.venue ?
					[obj.venue.lat, obj.venue.lon] : null;
				obj.time = time.getTimeObj(obj.time, obj.utc_offset * -1);
				obj.duration = obj.duration / 60000 || null;
				obj.category = obj.group.category.name;
				delete obj.group.category;
				delete obj.utc_offset;
				delete obj.venue;
				return obj;
			});

			// Merge data with overflow
			let overflow = task.clone(async.overflowEvents);
			async.overflowEvents = [];
			let newData = data.concat(overflow);

			// Merge the data into existing calendar
			newData.map(x => {
				let key = x.time.key;
				if (!events[key[0]] || !events[key[0]][key[1]])
				{
					async.overflowEvents.push(x);
					return;
				}
				events[key[0]][key[1]].push(x);
			});

			let obj = {};
			obj.events = events;
			obj.meta = dt.meta;
			obj.lastEventTime = data[data.length - 1].time;

			return obj; // <-
		}

		async.ajaxCall(url).then( x => resolve(parseData(x)) );
	});
};
// -- findEvents -- //

// -- getCategories -- //
async.getCategories = (url) =>
{
	return new Promise((resolve) => {
		function parseData(data)
		{
			let arr = [];
			data.results.map(x =>
			{
				arr.push(x.name);
			});
			return arr;
		}
		async.ajaxCall(url).then( x => resolve(parseData(x)) );
	});
};
// -- getCategories -- //

// -- reverseGeo -- //
async.reverseGeo = (loc) =>
{
	return new Promise(resolve => {
		async.ajaxCall(`https://geocode.xyz/${loc[0]},${loc[1]}?geoit=json`)
			.then(x =>
			{
				let state = x.prov.toUpperCase();
				let city = task.capitalizeWords(x.city);
				resolve(`${city}, ${state}`);
			});
	});
};
// -- reverseGeo -- //

// -- geocode -- //
async.geocode = (locStr) =>
{
	return new Promise(resolve => {
		async.ajaxCall(`https://geocode.xyz/${locStr}?geoit=json`)
			.then(x =>
				{
					console.log('geocode', x);
					if(x.error)
					{
						console.log('x.error', x);
						console.log('geocode error handeled'); // TEMP
						resolve([false, 'Location Not Found, Please Try Again']);
						return;
					}
					resolve([true, [x.latt, x.longt]])
				});
	});
};

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

      isLoading: false,
      locErr: false,
      locErrMessage: '',
      locInputValue: '',

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
    timeLimit: time.getDayLimit(0),
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
    nav.closePopups(true); // TODO replace and remove

    if(!loc){ return }

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

  // -- closeAllPopups -- //
  // closeAllPopups = () =>
  // {
  //   this.setState({toggle: this.popupClosedState})
  // }
  // -- closeAllPopups -- //

  // -- setToggle --//
  popupClosedState; // defined in componentDidMount
  setToggle = (target) =>
  {
    let tempObj = task.clone(this.popupClosedState);
    console.log(tempObj);
    tempObj[target] = !this.state.[target]
    this.setState({toggle: tempObj});
  }
  // -- setToggle --//


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
        this.setState({categList: x, locErr: true})
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

          toggleState={this.state.toggle}
          date={this.state.selected_day}
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

// This React class encapsulates the leaflet map
class Map extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
      events: [],
      latLon: [],
      radius: 25
    }
  }

  mainMap; // <- main variable
  centerMarker = L.marker();
  centerRadius = L.circle();
  markerCluster = L.markerClusterGroup();
  // -- initMap -- //
  initMap = () =>
  {
    this.mainMap = L.map('map', {zoomControl: false})
      .setView([38.366473, -96.262056], 5);

    const zoomBtns = L.control.zoom(
      {
        position: 'bottomright'
      }
    ).addTo(this.mainMap);
    let tiles = new L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="http://openstreetmap.org/">'
        +'OpenStreetMap</a> contributors'
      }
    );
    // const tiles = new L.tileLayer(
    //   'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
    //   {
    //     id: 'outdoors-v10',
    //     accessToken: apiKey.mapbox || console.log('MAPBOX API KEY ERROR'),
    //     attribution: '&copy; <a href="http://mapbox.com/">'
    //     +'Mapbox</a> &copy; <a href="http://openstreetmap.org/">'
    //     +'OpenStreetMap</a>'
    //   }
    // );
    this.mainMap.addLayer(tiles);
  };
  // -- initMap -- //

  // -- newSearch -- //
  newSearchParams = (loc, rds) =>
  {
    this.mainMap.removeLayer(this.centerMarker);
    this.mainMap.removeLayer(this.centerRadius);

    this.mainMap.flyTo(loc, 10, {duration: 3});

    let centerIcon = L.divIcon(
      {
      className: 'centerMarker',
      iconSize: new L.Point(50, 50),
      html: '<div><i class="fa fa-compass" aria-hidden="true"></i></div>'
      }
    );
    this.centerMarker = L.marker(
      loc,
      {
        icon: centerIcon,
        // interactive: false,
        title: 'Search Center'
      }
    );

    this.mainMap.addLayer(this.centerMarker);

    this.centerRadius = L.circle(
      loc,
      {
        radius: 1609.344 * rds,
        interactive: false,
        fillOpacity: 0.07,
        opacity: 0.4
      }
    );
    this.mainMap.addLayer(this.centerRadius);
  }
  // -- newSearch -- //

  ////////////////////////////////////
  // Getting the bounds of a cluster
  //
  // When you receive an event from a cluster you can query it for the bounds.
  //
  // markers.on('clusterclick', function (a) {
  // 	var latLngBounds = a.layer.getBounds();
  // });
  ////////////////////////////////////

  // -- putEventsOnMap -- //
  putEventsOnMap = (events) =>
  {
    this.markerCluster.eachLayer((x) => this.markerCluster.removeLayer(x));
    events.map(x =>
    {
      let loc = x.loc ? x.loc : [x.group.lat, x.group.lon];
      if (!loc[0] && !loc[1]) {loc = [x.group.lat, x.group.lon]} // x.loc || (!x.loc[0] && !x.loc[1])
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
            ${x.time.timeString}
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

      this.markerCluster.addLayer(marker);
    });
    this.mainMap.addLayer(this.markerCluster);
  }
  // -- putEventsOnMap -- //

  componentWillMount()
  {
    this.initMap();
  }

  render()
  {
    if (!task.isEqual(this.props.latLon, this.state.latLon) ||
        !task.isEqual(this.props.radius, this.state.radius) )
    {
      this.setState({latLon: this.props.latLon, radius: this.props.radius})
      if (this.props.latLon.length)
      {
        this.newSearchParams(this.props.latLon, this.props.radius);
      }
    }
    if (!task.isEqual(this.props.events, this.state.events))
    {
      this.setState({events: this.props.events})
      this.putEventsOnMap(this.props.events);
    }
    return (null);
  }
}

function Nav(props)
{
  let date = `${time.daysOfWeek[props.date.weekDay]}, ${time.months[props.date.month]} ${props.date.day}`;
  let radius_range = props.radius_range.map(x =>
    {
      return(
      <li
        id={'radius-'+x}
        className={props.radius === x ? 'active' : ''}
        onClick={
          () =>
          {
            nav.closePopups(true);
            props.radius_onClick(x);
          }
        }
      >{x} miles</li>
      );
    });
  function handleSubmit(e)
  {
    e.preventDefault();
    props.loc_onSubmit();
  }
  return(
    <nav className='nav'>
      <h1>Meetup Map Search</h1>
      {/* <p>... events in the next 7 days</p> */}
      <div className='search'>

        <div className='search_selector'>
          <div>
            {props.eventsFound} meetups within
          </div>

          <div>
            <span className='search_radius' id='radius'>
              {props.radius} miles
              {' '}<i className="fa fa-map-o" aria-hidden="true"></i>
            </span>
            <div className='popup' id='radius-popup'>
              <ul>{radius_range}</ul>
            </div>
          </div>
          <div>of</div>
          <div>
            <span className='search_location' id='location'>
              {props.loc + ' '}
              <i className="fa fa-map-marker" aria-hidden="true"></i>
            </span>
            <div className='popup' id='location-popup'>
              <form id='location-search' onSubmit={handleSubmit}>
                <input
                  id='location-input'
                  type='text'
                  name='location-input'
                  onChange={props.loc_inputHandleChange}
                  value={props.loc_inputValue}
                  placeholder='City or postal code'
                />
                {/* <input type='submit' style={{display: 'none'}}/> */}
              </form>
            </div>
          </div>
          <div>on</div>
          <div>
            <span className='search_calendar' id='calendar'>
              {date + ' '}
              <i className="fa fa-calendar" aria-hidden="true"></i>
            </span>
          </div>
        </div>

        {/*  */}
        <div className='search_filter-toggle'>
          {/* <div>Filter</div> */}
          {/* <i className="fa fa-sort-asc" aria-hidden="true"></i> */}
          <i className="fa fa-sort-desc" aria-hidden="true"></i>
        </div>

        <div className='search_filter'>
          <div className='search_filter_categ'></div>
          <div className='search_filter_calendar'></div>
        </div>
        {/*  */}

    </div>

      {/* <div className='search_filter-drop search_child'>
        <i className="fa fa-sort-desc" aria-hidden="true"></i>
        <i className="fa fa-sort-asc" aria-hidden="true"></i>
      </div> */}

    </nav>

  );
}

const nav = {};
nav['radius'] = false;
nav['location'] = false;

nav.closePopups = (offAll = false) =>
{
  document.getElementById('radius-popup').style.display = 'none';
  document.getElementById('location-popup').style.display = 'none';
  if (offAll)
  {
    nav['radius'] = false;
    nav['location'] = false;
  }
}

window.onload = () => {
// radius
document.getElementById('radius').addEventListener('click', function()
{
  nav.closePopups();
  if (!nav['radius'])
  {
    nav['radius'] = true;
    nav['location'] = false;
    document.getElementById('radius-popup').style.display = 'block';
  }
  else
  {
    nav['radius'] = false;
    nav['location'] = false;
  }
});
// location
document.getElementById('location').addEventListener('click', function()
{
  nav.closePopups();
  if (!nav['location'])
  {
    nav['location'] = true;
    nav['radius'] = false;
    document.getElementById('location-popup').style.display = 'block';
    document.getElementById('location-input').focus();
  }
  else
  {
    nav['radius'] = false;
    nav['location'] = false;
  }
});

}

(function() {
  ReactDOM.render(<Controls />, document.getElementById('controls'));
})();
