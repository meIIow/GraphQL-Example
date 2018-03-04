import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import App from './App.js';

const wsLink = new WebSocketLink({
    uri: `ws://localhost:3000/subscriptions`,
    options: {
        reconnect: true
    }
});

const httpLink = new HttpLink({
    uri: 'http://localhost:3000/graphql'
});  

const client = new ApolloClient({
    // Now I can instantiate ApolloClient by passing in the httpLink and a new 
    // instance of an InMemoryCache.
    link: split(
        // split based on operation type
        ({ query }) => {
          const { kind, operation } = getMainDefinition(query);
          return kind === 'OperationDefinition' && operation === 'subscription';
        },
        wsLink,
        httpLink,
      ), 
    cache: new InMemoryCache()
});
ReactDOM.render(
     <ApolloProvider client={client}>
         <App />
     </ApolloProvider>, 
    document.getElementById('root')
);