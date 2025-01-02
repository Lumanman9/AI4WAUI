import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { setContext } from '@apollo/client/link/context';

// HTTP Link for queries and mutations
const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql',
});



// Auth middleware for HTTP requests
const authLink = setContext((_, { headers }) => {
    // Get the authentication token from local storage if it exists
    const token = localStorage.getItem('jwt_token');

    // Return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            Authorization: token ? `Bearer ${token}` : '',
            // Keep admin secret if you still need it
            "x-hasura-admin-secret": "youradminsecret",
        }
    };
});

// WebSocket Link for subscriptions
const wsLink = typeof window !== 'undefined'
    ? new GraphQLWsLink(
        createClient({
            url: process.env.NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT || 'ws://localhost:8080/v1/graphql',
            connectionParams: () => {
                // Get token at the time of connection
                const token = localStorage.getItem('jwt_token');
                return {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                        "x-hasura-admin-secret": "youradminsecret",
                    }
                };
            }
        })
    )
    : null;

// Split links based on operation type
const splitLink = typeof window !== 'undefined' && wsLink
    ? split(
        ({ query }) => {
            const definition = getMainDefinition(query);
            return (
                definition.kind === 'OperationDefinition' &&
                definition.operation === 'subscription'
            );
        },
        wsLink,
        authLink.concat(httpLink) // Combine authLink with httpLink
    )
    : authLink.concat(httpLink);

export const createApolloClient = () => {
    return new ApolloClient({
        link: splitLink,
        cache: new InMemoryCache(),
        defaultOptions: {
            watchQuery: {
                fetchPolicy: 'no-cache',
                errorPolicy: 'all',
            },
            query: {
                fetchPolicy: 'no-cache',
                errorPolicy: 'all',
            },
        },
    });
};