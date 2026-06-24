"use client";

import { HttpLink } from "@apollo/client";
import { ApolloClient, ApolloRwsdkProvider, InMemoryCache } from "@rwgql/rwsdk-apollo-client";
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
    () => () =>
      new ApolloClient({
        cache: new InMemoryCache(),
        link: new HttpLink({
          credentials: "include",
          uri: graphqlUrl,
        }),
      }),
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
