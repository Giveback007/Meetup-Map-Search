# Meetup Map Search

![example-1](https://user-images.githubusercontent.com/26166787/31026704-690f2424-a515-11e7-845e-e67e400e8a1f.PNG)

![example-2](https://user-images.githubusercontent.com/26166787/31026785-b0bcff30-a515-11e7-8978-14f212dc7426.PNG)


Out of frustration with using the meetup search to find events I decided to use the provided meetup api to see if I can solve this problem.

This utilizes the meetup api to take all events within a search radius, and maps them using open-street-map and leafletJS.

The meetup API can throttle and block for up to an hour if too many calls are made at once, this is especially a problem when using a single api key. To prevent this the user needs to log in to authorize the application.

The project can be viewed here:

http://codedave.me/meetup-map/

Further improvements can be made, but I am just one dude.
