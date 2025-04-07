import { ApolloClient, InMemoryCache } from "@apollo/client";

export function getClient() {
  const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL;
  
  if (!SUBGRAPH_URL) {
    throw new Error("NEXT_PUBLIC_SUBGRAPH_URL is not defined");
  }

  return new ApolloClient({
    uri: SUBGRAPH_URL,
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'no-cache', // Disable caching for now
      },
    },
  });
}