import React from 'react';
// import { AddCircleOutlineIcon } from './material-icons';
import { Dialog, DialogTitle, List, ListItem, ListItemText } from '../../material-ui';
import { linker, State } from '../../store';
import './Login.sass';
import logo from '../../assets/logo.svg';

type S = { };
type P = { } & ReturnType<typeof link>;

const redirectUrl = () => 'https://secure.meetup.com/oauth2/authorize'
    + '?client_id=2hdi2rl38imnr4pjip0iuo1t4p'
    + '&response_type=token'
    + '&redirect_uri=https://giveback007.github.io/Meetup-Map-Search/dist/index.html';

class Login extends React.Component<P, S> {

    handleLogin = () => window.location.href = redirectUrl();

    render = () => <Dialog
        id="login-modal"
        aria-labelledby="login-prompt"
        open={this.props.open || false}
    >
        <DialogTitle>...oops you're logged out.</DialogTitle>

        <List>
          <ListItem button onClick={this.handleLogin}>
            <ListItemText>
              <img src={logo} />
              <span>Log In</span>
            </ListItemText>
          </ListItem>
      </List>
    </Dialog>
}

const link = (s: State) => ({ open: s.showLogin });
export default linker(link, Login);
