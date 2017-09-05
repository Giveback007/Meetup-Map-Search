function Search(props)
{
  let date = `${time.daysOfWeek[props.date.weekDay]}, ${time.months[props.date.month]} ${props.date.day}`
  return(
    <div className='search'>

    <h2>
      {props.eventsFound} Events within
      <div>
        {' '}<a href='#'><u>{props.radius} miles</u></a> <span>...</span>
      </div>
        {' '}of
      <div>
        {' '}<a href='#'><u>{props.loc}</u></a> <span>...</span>
      </div>
    </h2>

    <h2>{date}</h2>

    </div>

  );
}
