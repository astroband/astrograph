import React, { Component } from 'react';
import Listener from './Listener';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: ''
    }
  }

  render() {
    return (
      <div>
        <div>
          <label htmlFor="account_id">Account ID:</label>
          <input id="account_id" value={this.state.id} onChange={(e) => this.setState({id: e.target.value })} />
        </div>

        <Listener id={this.state.id} />
      </div>
    );
  }
}


export default App;
