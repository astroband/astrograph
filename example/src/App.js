import React, { Component } from 'react';
import Subscription from './Subscription';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
        account_id: ''
    }
  }
  render() {
    return (
      <div>
        <div>
          <label for="account_id">Account ID:</label>
          <input id="account_id" value={this.state.account_id} onChange={(e) => this.setState({id: e.target.value })} />
        </div>

        <Subscription account_id={this.state.account_id} />
      </div>
    );
  }
}


export default App;
