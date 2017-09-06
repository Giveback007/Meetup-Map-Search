function Nav(props)
{
  let date = `${time.daysOfWeek[props.date.weekDay]}, ${time.months[props.date.month]} ${props.date.day}`
  return(
    <section className='nav'>

      <div className='search'>

        <div className='search_selector'>
          <div>
            {props.eventsFound} meetups within
          </div>

          <div>
            <span  id='search_radius'>
              {props.radius} miles
              {' '}<i className="fa fa-map-o" aria-hidden="true"></i>
            </span>
            <div id='search_radius-popup'>
              <ul>
                <li>5 miles</li>
                <li>10 miles</li>
                <li>25 miles</li>
                <li>35 miles</li>
                <li>50 miles</li>
                <li>100 miles</li>
              </ul>
            </div>
          </div>

          <div>of</div>

          <div>
            <span id='search_location'>
              {props.loc + ' '}
              <i className="fa fa-map-marker" aria-hidden="true"></i>
            </span>
            <div id='search_location-popup'>
              <input type='text' placeholder='City or postal code'/>
            </div>
          </div>

          <div>on</div>

          <div>
            <span id='search_calendar'>
              {date + ' '}
              <i className="fa fa-calendar" aria-hidden="true"></i>
            </span>
            <div id='search_calendar-popup'>
              <input type='text' placeholder='City or postal code'/>
            </div>
          </div>
        </div>

        <div className='search_filter-toggle'>
          {/* <i className="fa fa-sort-asc" aria-hidden="true"></i> */}
          <i className="fa fa-sort-desc" aria-hidden="true"></i>
        </div>

    </div>

      {/* <div className='search_filter-drop search_child'>
        <i className="fa fa-sort-desc" aria-hidden="true"></i>
        <i className="fa fa-sort-asc" aria-hidden="true"></i>
      </div> */}

    </section>

  );
}
