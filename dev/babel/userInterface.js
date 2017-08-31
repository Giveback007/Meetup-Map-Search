let api =
{
  omit: `description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url`,
eventUrl: function()
  {
    return `https://api.meetup.com/find/events?&sign=true&photo-host=public&lat=${this.state.local[0]}&lon=${this.state.local[1]}&radius=${this.state.radius}&fields=group_photo,group_category&omit=${this.state.api.omit}&key=${this.state.meetupKey}`
  }
}

class Control extends React.Component
{
  constructir(props)
  {
    super(props);
    this.state = {
      local: ['41.957819', '-87.994403'], // temp
      radius: 15, // max 100.00
      dateLimit: Date.now() + 1 * (24 * 60 * 60000), // temp -- make this adjustable
      api: {
        key: '457b71183481b13752d69755d97632',
        omit: `description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url`,
        eventUrl: function()
        {
          return `https://api.meetup.com/find/events?&sign=true&photo-host=public&lat=${this.state.local[0]}&lon=${this.state.local[1]}&radius=${this.state.radius}&fields=group_photo,group_category&omit=${this.state.api.omit}&key=${this.state.api.key}`
        }
      },
      mem: {}
    }
  }
  render()
  {
    return(

    )
  }
}



ReactDOM.render(<Control />, document.getElementById('nav'));
