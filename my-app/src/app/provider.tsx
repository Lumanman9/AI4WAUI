'use client';

import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createApolloClient } from '@/lib/apollo-client';
import { setContext } from '@apollo/client/link/context';
import theme from './theme';

const authLink = setContext((_, { headers }) => {
    // Get the token from localStorage or cookies
    const token = localStorage.getItem('authToken');
    return {
        headers: {
            ...headers,
            Authorization: token ? `Bearer ${token}` : '',
        },
    };
});

const client = createApolloClient();

export function Providers({ children }) {
    return (
        <ApolloProvider client={client}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ApolloProvider>
    );
}