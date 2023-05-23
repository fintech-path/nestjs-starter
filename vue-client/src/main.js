import { createApp } from 'vue';
import App from './App.vue';
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  split,
} from '@apollo/client/core';
import { provideApolloClient } from '@vue/apollo-composable';
import { getMainDefinition } from 'apollo-utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

// Create an http link to connect to the graphql server
const httpLink = createHttpLink({
  uri: 'http://localhost:3333/graphql',
});

export const wsClient = createClient({
  url: 'ws://localhost:3333/graphql',
  retryAttempts: Infinity,
  retryInterval: 5000,
});

export const wsLink = new GraphQLWsLink(wsClient);

// Use the split function to determine whether to use the httpLink or wsLink
const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
);

// Create an apollo client instance
const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

// Create a vue app instance
const app = createApp(App);

// Provide the apollo client to the app
provideApolloClient(apolloClient);

// Mount the app
app.mount('#app');
