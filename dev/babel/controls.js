class Controls extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
      local: ['41.957819', '-87.994403'], // temp -- update by user location
      //radius: 15, // max 100.00
      dateLimit: Date.now() + 1 * (24 * 60 * 60000), // temp -- make this adjustable
      events: []
      // next_link: ''
    }
  }
  // getEvents = () =>
  // {
  //   findEvents(this.state.api.getUrl(), this.state.dateLimit)
  //     .then(x => this.setState({events: x}));
  // }
  // params.mem.events = findEvents(params.api.eventUrl(), params.dateLimit);

  // params.mem.events.then(x => renderMap(params.local, x));
  componentDidMount()
  {
    // this.getEvents()
  }

  render()
  {
    console.log('react running');
    return(
      <div><Map/></div>
    );
  }
}
