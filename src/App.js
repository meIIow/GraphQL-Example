import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';


import Homeboard from "./components/Homeboard.js";
import Tweet from "./components/tweet.js";

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tweet: false,
    }
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    console.log('Clicked button!')
    this.setState(() => {
      return {tweet: true}
    }); 
  }

  render() {
    let check = this.state.tweet === true ? <ul> <Tweet /> </ul> : <div></div>
    console.log(this.state.tweet);
    return (
      <div>
        {/* <div>{elements}</div> */}
        <button onClick={this.handleClick}>
          Click Me Max
        </button>
        {check}
      </div>
    );
  }
}
export default App;