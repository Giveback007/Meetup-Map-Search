Out of frustration with using the meetup search to find events I decided to use the provided meetup api to see if I can solve this problem.

This collects all the events within a search radius, and maps it out using open-street-map and leafletJS.

The meetup API can throttle and block for up to an hour if too many calls are made. Limiter functions are installed to prevent this.

To be included:
1) Can click on marker to view details and go to main event page
2) OAuth-signed requests
3) Filtering out of events by date and other criteria
