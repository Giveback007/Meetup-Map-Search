function Nav(props)
{
  let date = `${time.daysOfWeek[props.date.weekDay]}, ${time.months[props.date.month]} ${props.date.day}`;
  let radius_range = props.radius_range.map(x =>
    {
      return(
      <li
        id={'radius-'+x}
        className={props.radius === x ? 'active' : ''}
        onClick={() => props.radius_onClick(x)}
      >{x} miles</li>
      );
    });

  return(
    <nav className='nav'>
      <h1>Meetup Map Search</h1>
      <p>... events in the next 7 days</p>
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
              <input
                id='location-input'
                type='text'
                placeholder='City or postal code'
              />
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

window.onload = () => {
// radius
document.getElementById('radius').addEventListener('click', function()
{
  document.getElementById('radius-popup').style.display = 'none';
  document.getElementById('location-popup').style.display = 'none';
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
  document.getElementById('radius-popup').style.display = 'none';
  document.getElementById('location-popup').style.display = 'none';
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
