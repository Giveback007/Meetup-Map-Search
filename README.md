# Meetup Map Search

![example-1](https://user-images.githubusercontent.com/26166787/31026704-690f2424-a515-11e7-845e-e67e400e8a1f.PNG)

![example-2](https://user-images.githubusercontent.com/26166787/31026785-b0bcff30-a515-11e7-8978-14f212dc7426.PNG)

The project can be viewed here:

[Meetup-Map-Search](https://secure.meetup.com/oauth2/authorize?client_id=2hdi2rl38imnr4pjip0iuo1t4p&response_type=token&redirect_uri=https://giveback007.github.io/Meetup-Map-Search/dist/index.html)

### Goals:
* HMR with live reloading
* Rewritten in TypeScript
* TS lint
* Using Redux
* Completely ported to webpack base development
* Local storage to keep selected category settings
* Improve the UI to be more mobile friendly
* Load only the data as needed rather then a month or more in advance
* Tooltip for buttons
* If no token received or expired redirect  get new one
* Handle if the user rejects location tracking