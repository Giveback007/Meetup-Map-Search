function AdressSearchBar(props)
{
  let date = `${time.daysOfWeek[props.date.weekDay]}, ${time.months[props.date.month]} ${props.date.day}`
  return(
    <div className='searchBar'>
    <h2>{props.eventsFound} Events Within <u>{props.radius} miles</u> of <u>{props.loc}</u></h2>
    <h2>{date}</h2>
    </div>

  );
}
