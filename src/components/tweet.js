import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

let query = gql`
{
  tweets {
    text
    author
    messages {
      text
      author
      likeCount
      _id
    }
  }
}
`;

const subQuery = gql`
  subscription {
    count {
      text
      author
      likeCount
    }
  }
`;

class Tweet extends Component {

  componentWillMount() {
    this.props.data.subscribeToMore({
      document: subQuery,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }
        const newMessage = subscriptionData.data.count;
        console.log(subscriptionData.data);
        const newTweets = prev.tweets.map(val => {
          console.log('varst', val);
          return Object.assign({}, val, {
            messages: val.messages.map((mess) => {
              let copy = Object.assign({}, mess)
              if (copy.text === newMessage.text) {
                copy.likeCount = newMessage.likeCount;
              }
              return copy;
            })
          })
        });
        // console.log(tweets)
        console.log(newTweets)
        return Object.assign({}, prev, {
          tweets: newTweets
        });

      }
    });
  }

  render() {
    const { data: { tweets } } = this.props;
    if (Array.isArray(tweets)) {
      return (
        <ul>
          {tweets.map(({ text, author, messages }, ind) => (
            <div key={ind * 22}>
              <li key={ind}> {text} </li>
              <li key={ind + 10 * 45}> {author} </li>
              <ul key={ind + 7 * 12}> {messages.map(({ text, author, likeCount }, ind) => {
                // console.log(text);
                return (
                  <div key={ind * 5 + 35}>
                    <li key={ind + 2 * 5}>Message: {text}</li>
                    <li key={ind + 2 * 6}>Author: {author}</li>
                    <li key={ind + 2 * 7}>LikeCount: {likeCount}</li>
                  </div>
                )
              })} </ul>
            </div>
          ))}
        </ul>
      );
    } else {
      return (
        <li>Loading...</li>
      );
    }
  }
}
export default graphql(query)(Tweet);