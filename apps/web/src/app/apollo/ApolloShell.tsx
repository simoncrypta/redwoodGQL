"use client";

import { ApolloLink, HttpLink } from "@apollo/client";
import {
  ApolloClient,
  ApolloRwsdkProvider,
  InMemoryCache,
  SSRMultipartLink,
} from "@rwgql/rwsdk-apollo-client";
import type { ReactNode } from "react";
import { useMemo } from "react";

import { AuthProvider } from "@/app/auth";

export const ApolloShell = ({
  children,
  graphqlUrl,
  nonce,
  transportId,
}: {
  readonly children: ReactNode;
  readonly graphqlUrl: string;
  readonly nonce: string;
  readonly transportId: string;
}) => {
  const makeClient = useMemo(
    () => () => {
      const httpLink = new HttpLink({
        credentials: "include",
        uri: graphqlUrl,
      });

      return new ApolloClient({
        cache: new InMemoryCache(),
        link:
          typeof window === "undefined"
            ? ApolloLink.from([
                new SSRMultipartLink({
                  stripDefer: true,
                }),
                httpLink,
              ])
            : httpLink,
      });
    },
    [graphqlUrl],
  );

  return (
    <AuthProvider>
      <ApolloRwsdkProvider makeClient={makeClient} nonce={nonce} transportId={transportId}>
        {children}
      </ApolloRwsdkProvider>
    </AuthProvider>
  );
};
