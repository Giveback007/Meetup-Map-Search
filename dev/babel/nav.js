function Nav(props)
{
  let t = props.calendar_date;
  let date = `${time.daysOfWeek[t.weekDay]}, ${time.months[t.month]} ${t.day}`;
  let week = props.calendar_week.map((x, i) =>
  {
    return <div>{time.daysOfWeek[i]}</div>
  });
  let radius_range = props.radius_range.map(x =>
  {
    return(
    <li
      id={'radius-'+x}
      className={props.radius === x ? 'active' : ''}
      onClick={
        () =>
        {
          props.toggle('radius');
          props.radius_onClick(x);
        }
      }
    >{x} miles</li>
    );
  });

  let categList = props.categ_list.map(x =>
  {
    let name = props.categ_stateOf.indexOf(x) !== -1 ? 'on' : 'off'
    return(
      <span
        onClick={() => props.categ_onClick(x)}
        className={name}
      >
        {x}
      </span>
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
            <span
              className='search_radius'
              onClick={() => {props.toggle('radius')}}
              id='radius'>
              {props.radius} miles
              {' '}<i className="fa fa-map-o" aria-hidden="true"></i>
            </span>
            <div
              className='popup'
              id='radius-popup'
              style={props.toggle_stateOf.radius ? {} : {display: 'none'}}
            >
              <ul>{radius_range}</ul>
            </div>
          </div>
          <div>of</div>
          <div>
            <span
              className='search_location'
              id='location'
              onClick={() => {props.toggle('location')}}
            >
              {props.loc + ' '}
              <i className="fa fa-map-marker" aria-hidden="true"></i>
            </span>
            <div
              className='popup'
              id='location-popup'
              style={props.toggle_stateOf.location ? {} : {display: 'none'}}
            >
              <form id='location-search' onSubmit={handleSubmit}>
                <input
                  id='location-input'
                  type='text'
                  name='location-input'
                  onChange={props.loc_inputHandleChange}
                  value={props.loc_inputValue}
                  placeholder='City or postal code'
                />
              </form>
            </div>
          </div>
          <div>on</div>
          <div>
            <span
              className='search_date'
              onClick={() => {props.toggle('filter')}}
              id='date'>
              {date + ' '}
              <i className="fa fa-calendar" aria-hidden="true"></i>
            </span>
          </div>
        </div>

        {/*  */}
        <div
          className={`search_filter ${props.toggle_stateOf.filter ? 'on' : 'off'}`}
        >

          <div className='line'/>
          <h3>Calendar</h3>
          <div className='search_filter_week'>
            {week}
            <span className='arrows'>
              <div><i className="fa fa-arrow-up" aria-hidden="true"></i></div>
              <div><i className="fa fa-arrow-down" aria-hidden="true"></i></div>
            </span>
          </div>

          <h3>Categories</h3>
          <div className='search_filter_categ'>{categList}</div>

        </div>
        <div
          className='search_filter-toggle'
          onClick={() => {props.toggle('filter')}}
        >
          {/* <div>Filter</div> */}
          {props.toggle_stateOf.filter ?
            <i className="fa fa-sort-asc" aria-hidden="true"></i> :
            <i className="fa fa-sort-desc" aria-hidden="true"></i>
          }
        </div>
        {/*  */}

        {/* onClick={() => {props.toggle('location')}} */}
        {/* style={props.toggle_stateOf.location ? {} : {display: 'none'}} */}

      </div>

    </nav>
  );
}
