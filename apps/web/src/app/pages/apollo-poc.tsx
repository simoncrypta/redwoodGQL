"use client";

import { HttpLink } from "@apollo/client";
import { ApolloClient, ApolloRwsdkProvider, InMemoryCache } from "@rwsdk/apollo";
import { useMemo } from "react";

import { ApolloPocCell } from "./apollo-poc-cell.js";

export const ApolloPoc = ({
  graphqlUrl,
  nonce,
  transportId,
}: {
  readonly graphqlUrl: string;
  readonly nonce: string;
  readonly transportId: string;
}) => {
  const makeClient = useMemo(
    () => () =>
      new ApolloClient({
        cache: new InMemoryCache(),
        link: new HttpLink({ uri: graphqlUrl }),
      }),
    [graphqlUrl],
  );

  return (
    <ApolloRwsdkProvider makeClient={makeClient} nonce={nonce} transportId={transportId}>
      <ApolloPocCell />
    </ApolloRwsdkProvider>
  );
};
