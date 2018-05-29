import React , { Component } from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

class Listener extends Component {
  constructor(props) {
    super(props)

    this.state = {
      accounts: []
    }
  }

  componentWillMount() {
    if (this.props.id == '') { return; }
    
    this.props.data.subscribeToMore({
      document: Subscription,
      variables: {
        id: this.props.id,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) { return prev; }
        const updatedAccount = subscriptionData.data.accountUpdated;
        this.setState(
          { accounts: [...this.state.accounts, updatedAccount] }
        );
      }
    });
  }

  render() {
    return (
      <div>
        <div>
          {this.state.accounts.map((a, ns) =>
              <div key={n}>{JSON.stringify(a)}</div>
          )}
        </div>
      </div>
    );
  }
}

const Subscription = gql`
    subscription AccountUpdated($id: String!) {
        accountUpdated(id:$id) {
            id
            balance
        }
    }
`;

const Query = gql`
    query Room($channel: String!) {
        room(name: $channel) {
            messages { id text createdBy }
        }
    }
`;
//
// const Mutation = gql`
//     mutation sendMessage($text: String!, $channel: String!, $name: String!) {
//         post(text:$text, roomName:$channel, username:$name) { id }
//     }
// `;


export default graphql(Query)(Room); //compose(graphql(Mutation), graphql(Query))(Room);
