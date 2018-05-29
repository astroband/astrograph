import React , {Component} from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

class Room extends Component {
    constructor(props) {
        super(props)

        this.state = {balances: []}
    }

    componentWillMount() {
        this.props.data.subscribeToMore({
            document: Subscription,
            variables: {
                id: this.props.channel,
            },
            updateQuery: (prev, {subscriptionData}) => {
                if (!subscriptionData.data) { return prev; }
                const newAccount = subscriptionData.data.accountUpdated;
                console.log("C1");
                this.setState(
                  { balances: [...this.state.balances, newAccount.balance] }
                );
            }
        });
    }

    render() {
        return <div>
            <div>
                {this.state.balances.map((msg) =>
                    <div key={msg}>{msg}</div>
                )}
            </div>
        </div>;
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
