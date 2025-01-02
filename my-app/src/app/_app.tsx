import { ApolloProvider } from "@apollo/client";
import client from "src/lib/apollo-client";

export default function App({ Component, pageProps }: unknown) {
    return (
        <ApolloProvider client={client}>
            <Component {...pageProps} />
        </ApolloProvider>
    );
}
