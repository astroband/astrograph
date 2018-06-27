import React , { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

class Listener extends Component {
  constructor(props) {
    super(props)

    this.state = {
      accounts: []
    }
  }

  componentWillUpdate() {
    if (this.props.id === '') { return; }

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
          {this.state.accounts.map((a, n) =>
              <div key={n}>{JSON.stringify(a)}</div>
          )}
        </div>
      </div>
    );
  }
}

const Subscription = gql`
    subscription AccountUpdated($id: AccountID!) {
        accountUpdated(id:$id) {
            id
            balance
            sequenceNumber
            numSubentries
            inflationDest
            trustlines {
              limit
              balance
            }
        }
    }
`;

const Query = gql`
    query Room($id: AccountID!) {
        room(name: $id) {
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


export default graphql(Query)(Listener); //compose(graphql(Mutation), graphql(Query))(Room);
