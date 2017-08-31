'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//@prepros-append babel/getEventData.js
//@prepros-append babel/map.js
//@prepros-append babel/controls.js
//@prepros-append babel/start.js

// -- helpers -- //
function ajaxCall(url) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: url,
      type: 'get',
      dataType: "jsonp",
      success: function success(x) {
        console.log('ajax', x); // temp
        resolve(x);
      },
      error: function error(err) {
        reject(err);
      }
    });
  });
}

function limiter(meta) {
  var limit = Number(meta['X-RateLimit-Remaining']);
  var reset = Number(meta['X-RateLimit-Reset']);
  // console.log('limit left ' + limit, ', reset ' + reset) // temp
  return new Promise(function (resolve, reject) {
    if (limit <= 1) {
      console.log('limit reached, ' + reset + ' seconds until reset'); // temp -- change to load counter
      setTimeout(resolve, reset * 1000 + 500);
    } else {
      resolve();
    }
  });
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getTimeObj(time) {
  var date = new Date(time);
  return {
    unix: time,
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    min: date.getUTCMinutes(),
    weekDay: date.getUTCDay()
  };
}

function getTimeString(time) {
  var hour = (time.hour + 11) % 12 + 1;
  var amPm = time.hour < 12 ? 'am' : 'pm';
  var min = time.min === 0 ? '00' : time.min;
  var full = daysOfWeek[time.weekDay] + ', ' + months[time.month] + ' ' + time.day + ', ' + hour + ':' + min + amPm;
  return full;
}

function createDaysObj() {}

function dateLimit(monthsFromNow) {
  var date = new Date();
  var m = date.getMonth();
  var y = date.getFullYear();

  var lastDay = new Date(y, m + monthsFromNow + 1, 0);
  var end = lastDay.setHours(23, 59, 59, 999);

  return end;
}
// -- helpers -- //


// -- findEvents -- //
function findEvents(url, dateLimit, key) {
  var events = [];
  return new Promise(function (resolve, reject) {
    // -- nextPage -- //
    function nextPage(result) {
      var tempArr = result.data.map(function (x) {
        var obj = x;
        obj.loc = obj.venue ? [obj.venue.lat, obj.venue.lon] : null;
        obj.time = getTimeObj(obj.time + obj.utc_offset);
        obj.duration = obj.duration / 60000 || null;
        delete obj.utc_offset;
        delete obj.venue;
        return obj;
      });
      events = events.concat(tempArr);

      var lastDate = tempArr[tempArr.length - 1].time.unix;

      if (result.meta.next_link && lastDate < dateLimit) {
        limiter(result.meta).then(function () {
          ajaxCall(result.meta.next_link + ('&key=' + key)).then(function (x) {
            return nextPage(x);
          });
        });
      } else {
        console.log('find events', events); // temp
        // params.mem.next_link = result.meta.next_link
        resolve(events);
      }
    }
    // -- nextPage -- //
    ajaxCall(url).then(function (x) {
      return nextPage(x);
    });
  });
}

// -- event data -- //
var params = {
  // meetupKey: '457b71183481b13752d69755d97632',
  // local: ['41.957819', '-87.994403'],
  // radius: 10, // max 100.00
  //
  // api:
  // {
  // 	omit: `description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url`,
  // 	eventUrl: function()
  // 	{
  // 		return `https://api.meetup.com/find/events?&sign=true&photo-host=public&lat=${params.local[0]}&lon=${params.local[1]}&radius=${params.radius}&fields=group_photo,group_category&omit=${params.api.omit}&key=${params.meetupKey}`
  // 	}
  // },
  mem: {}

  // params.mem.events = findEvents(params.api.eventUrl(), params.dateLimit);

  // params.mem.events.then(x => renderMap(params.local, x));

  // This React class encapsulates the leaflet map
};
var Map = function (_React$Component) {
  _inherits(Map, _React$Component);

  function Map(props) {
    _classCallCheck(this, Map);

    var _this = _possibleConstructorReturn(this, (Map.__proto__ || Object.getPrototypeOf(Map)).call(this, props));

    _this.initMap = function (loc) {
      // set zoom to full view of radius
      _this.mainMap = L.map('map').setView(loc, 10);
      var openstreetmaps = new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://openstreetmap.org/">' + 'OpenStreetMap</a> contributors'
      });
      _this.mainMap.addLayer(openstreetmaps);
    };

    _this.geoLocate = function () {
      return new Promise(function (resolve, reject) {
        var options = {
          enableHighAccuracy: true,
          maximumAge: Infinity
        };
        var success = function success(pos) {
          var crd = pos.coords;
          _this.setState({ searchLoc: [crd.latitude, crd.longitude] });
          resolve([crd.latitude, crd.longitude]);
        };
        var error = function error(err) {
          console.log(err, 'put in custom location');
          reject(err);
        };

        navigator.geolocation.getCurrentPosition(success, error, options);
      });
    };

    _this.newSearch = function (loc) {
      findEvents(_this.state.api.getUrl(), _this.state.dateLimit, _this.state.api.key).then(function (x) {
        _this.setState({ events: x });
        _this.renderEventsOnMap(x);
      });

      var centerIcon = L.divIcon({
        className: 'centerMarker',
        iconSize: new L.Point(100, 100),
        html: '<div><i class="fa fa-compass" aria-hidden="true"></i></div>'
      });
      var centerMarker = L.marker(loc, { icon: centerIcon }).addTo(_this.mainMap);
      centerMarker.bindPopup("<b>Search Center</b>");

      var radius = L.circle(loc, {
        radius: 1609.344 * _this.state.radius,
        interactive: false,
        fillOpacity: 0.07,
        opacity: 0.4
      });
      radius.addTo(_this.mainMap);
    };

    _this.renderEventsOnMap = function (events) {
      var markerCluster = L.markerClusterGroup();
      events.map(function (x) {
        var loc = x.loc ? x.loc : [x.group.lat, x.group.lon];
        if (!loc[0] && !loc[1]) {
          loc = [x.group.lat, x.group.lon];
        }
        var img = x.group.photo ? x.group.photo.thumb_link : 'assets/imgs/meetup_logo.png';

        var icon = L.divIcon({
          className: 'marker',
          iconSize: new L.Point(50, 50),
          html: '<div class=\'marker-img\' style=\'background-image: url(' + img + ')\'></div>'
        });

        var marker = new L.marker(loc, { icon: icon }).bindPopup('<b>' + x.group.name + '</b>\n          <br/>' + x.name + '\n          <br/><i class="fa fa-clock-o" aria-hidden="true"></i>\n            ' + getTimeString(x.time) + '\n          <br/><a href=\'' + x.link + '\' target=\'_blank\'>More Info</a>', { offset: [0, -5] }).bindTooltip('' + x.group.name, {
          offset: [0, -20],
          direction: 'top'
        });

        markerCluster.addLayer(marker);
      });
      _this.mainMap.addLayer(markerCluster);
    };

    _this.state = {
      radius: 25,
      dateLimit: Date.now() + 1 * 24 * 60 * 60000,
      searchLoc: '',
      api: {
        key: '457b71183481b13752d69755d97632',
        omit: 'description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url',
        getUrl: function getUrl() {
          return 'https://api.meetup.com/find/events?&sign=true&photo-host=public&lat=' + _this.state.searchLoc[0] + '&lon=' + _this.state.searchLoc[1] + '&radius=' + _this.state.radius + '&fields=group_photo,group_category&omit=' + _this.state.api.omit + '&key=' + _this.state.api.key;
        }
      }
    };
    return _this;
  }
  // -- initMap -- //

  // -- initMap -- //

  // -- geoLocate -- //

  // -- geoLocate -- //

  // -- newSearch -- //

  // -- newSearch -- //

  // -- renderEventsOnMap -- //


  _createClass(Map, [{
    key: 'componentDidMount',

    // -- renderEventsOnMap -- //

    value: function componentDidMount() {
      var _this2 = this;

      this.geoLocate().then(function (x) {
        _this2.initMap(x);
        _this2.newSearch(x);
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return null;
    }
  }]);

  return Map;
}(React.Component);
/////////////////////


// -- renderEventsOnMap -- //


function renderEventsOnMap(events) {
  // -- Create Markers From Events Data -- //
  var markerCluster = L.markerClusterGroup();
  events.map(function (x) {
    var loc = x.loc ? x.loc : [x.group.lat, x.group.lon];
    if (!loc[0] && !loc[1]) {
      loc = [x.group.lat, x.group.lon];
    }
    var img = x.group.photo ? x.group.photo.thumb_link : 'assets/imgs/meetup_logo.png';

    var icon = L.divIcon({
      className: 'marker',
      iconSize: new L.Point(50, 50),
      html: '<div class=\'marker-img\' style=\'background-image: url(' + img + ')\'></div>'
    });

    var marker = new L.marker(loc, { icon: icon }).bindPopup('<b>' + x.group.name + '</b>\n        <br/>' + x.name + '\n        <br/><i class="fa fa-clock-o" aria-hidden="true"></i>\n          ' + getFullTime(x.time) + '\n        <br/><a href=\'' + x.link + '\' target=\'_blank\'>More Info</a>', { offset: [0, -5] }).bindTooltip('' + x.group.name, {
      offset: [0, -20],
      direction: 'top'
    });

    markerCluster.addLayer(marker);
  });
  this.mainMap.addLayer(markerCluster);
}
// -- renderEventsOnMap -- //

var Controls = function (_React$Component2) {
  _inherits(Controls, _React$Component2);

  function Controls(props) {
    _classCallCheck(this, Controls);

    var _this3 = _possibleConstructorReturn(this, (Controls.__proto__ || Object.getPrototypeOf(Controls)).call(this, props));

    _this3.state = {
      local: ['41.957819', '-87.994403'], // temp -- update by user location
      //radius: 15, // max 100.00
      dateLimit: Date.now() + 1 * (24 * 60 * 60000), // temp -- make this adjustable
      events: []
      // next_link: ''
    };
    return _this3;
  }
  // getEvents = () =>
  // {
  //   findEvents(this.state.api.getUrl(), this.state.dateLimit)
  //     .then(x => this.setState({events: x}));
  // }
  // params.mem.events = findEvents(params.api.eventUrl(), params.dateLimit);

  // params.mem.events.then(x => renderMap(params.local, x));


  _createClass(Controls, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      // this.getEvents()
    }
  }, {
    key: 'render',
    value: function render() {
      console.log('react running');
      return React.createElement(
        'div',
        null,
        React.createElement(Map, null)
      );
    }
  }]);

  return Controls;
}(React.Component);

(function () {
  ReactDOM.render(React.createElement(Controls, null), document.getElementById('nav'));
  // render controls
  // find events
  // render map
})();