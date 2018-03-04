const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools')
const { execute, subscribe } = require('graphql')
const { createServer } = require('http')
const { SubscriptionServer } = require('subscriptions-transport-ws');
const cors = require('cors')
const app = express();
const tweetModel = require('./models/tweetModel.js');
const messageModel = require('./models/messagesModel.js');
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();

const url = 'mongodb://sky:sky@ds249818.mlab.com:49818/wwtb';
mongoose.connect(url, (err, db) => console.log('Connection established to', url));

const tweets =  [{
  text: "Harry Potter is da bessst.",
  author: 'J.K. Rowling',
  messages: [],
},
{
  text: 'Jurassic Park is scary, bring a girl to hide behind.',
  author: 'Michael Crichton',
  messages: [],
}];
const message = { 
  text: 'Max stop eating my barrrzzz.',
  author: 'Skyler'
}
// id of each unique tweet
// let id;

// Never do this in real life, just getting data in mlab, lol. 
// tweetModel.deleteMany({}, () => console.log('Deleted Database'))
// tweetModel.create(tweets, (err, result) => {
//   // console.log('tweetModel', result[0]._id)
//   id = result[0]._id;
// });

// messageModel.deleteMany({}, () => console.log('Deleted Database'))
// messageModel.create(message, (err, result) => {
//   let messageID = result._id;
//   tweetModel.findOne({ _id: id }, (err, result) => {
//     result.messages.push(messageID);
//     result.save();
//   });
//   // console.log('messageModel', result._id)
// }); 


// The GraphQL type schema
const typeDefs = `
  type Query { tweets: [Tweet] }
  type Tweet { text: String, author: String, messages: [Message], _id: String }
  type Message { text: String, author: String, likeCount: Int, _id: String }
  type Mutation { likeMessage(messageId: String): Message }
  type Subscription { count: Message }
  `;
  // count = what I'm lisetening for 
  // Message = the output of what I'm listening for


// The Resolver Functions: How you update and access data in the cache
const resolvers = {
  Query:  {
    tweets: async () => {
      return (await tweetModel.find({}))
    }
  },
  Tweet: {
    messages: async (obj) => {
      let obj_ids = obj.messages;
      return (await messageModel.find({_id: {$in: obj_ids}}));
    }
  },
  Mutation: {
    likeMessage:  (content, args) => {
      return messageModel.findOne({_id: args.messageId}, (err, result) => {
        result.likeCount++
        result.save();
        pubsub.publish('increment', {count: result}) //Everyone who is subscribed to 'increment', will get {count: result} object 
      });
    }
  },
  Subscription: {
    count: {
      subscribe: (obj) => pubsub.asyncIterator('increment') //emits messages to sent over to the client
    }
  }
}

// Put together a schema 
const glue = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const ws = createServer(app);
ws.listen(3000, () => {
  console.log(`Apollo Server is now running on http://localhost:3000`);
  // Set up the WebSocket for handling GraphQL subscriptions
  new SubscriptionServer({
    execute,
    subscribe,
    schema: glue
  }, {
    server: ws,
    path: '/subscriptions',
  });
});

app.use('*', cors({ origin: `http://localhost:3000/subscriptions` }))

// The GraphQL endpoint
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: glue }));

// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({ 
  endpointURL: '/graphql',
  subscriptionsEndpoint: `ws://localhost:3000/subscriptions`
}));

app.use(express.static(__dirname + './../public'));