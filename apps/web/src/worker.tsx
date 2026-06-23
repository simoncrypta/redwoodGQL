import { route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";
import { createApolloRwsdkTransportId, renderApolloRwsdkStream } from "@rwsdk/apollo/worker";

import { Document } from "@/app/document";
import { handleGraphqlPost } from "@/app/graphql/route";
import { setCommonHeaders } from "@/app/headers";
import { Home } from "@/app/pages/home";

export type AppContext = {};

export default defineApp([
  setCommonHeaders(),
  route("/graphql", { post: handleGraphqlPost }),
  route("/", async (requestInfo) => {
    const apolloTransportId = createApolloRwsdkTransportId();
    const stream = await renderApolloRwsdkStream(
      <Home {...requestInfo} apolloTransportId={apolloTransportId} />,
      {
        Document,
        requestInfo,
        transportId: apolloTransportId,
      },
    );

    return new Response(stream, {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  }),
]);
