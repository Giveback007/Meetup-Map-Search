# Meetup Map Search

![example](https://user-images.githubusercontent.com/26166787/30184455-b6999c12-93e3-11e7-8392-c83cd7545a59.jpg)

Out of frustration with using the meetup search to find events I decided to use the provided meetup api to see if I can solve this problem.

This collects all the events within a search radius, and maps it out using open-street-map and leafletJS.

The meetup API can throttle and block for up to an hour if too many calls are made. Limiter functions are installed to prevent this.

To be included:
1) Filter out events by date and category
2) OAuth

