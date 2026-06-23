import type { RequestInfo } from "rwsdk/worker";

import { ApolloPoc } from "./apollo-poc.js";
import { welcomeStyles as styles } from "./welcomeStyles.js";

export const Home = ({
  request,
  rw,
  apolloTransportId,
}: RequestInfo & { readonly apolloTransportId: string }) => {
  const graphqlUrl = new URL("/graphql", request.url).toString();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Apollo Client on RedwoodSDK</h1>
        <p className={styles.subtitle}>
          A minimal proof of concept for Apollo GraphQL inside a RedwoodSDK React Server Components
          app.
        </p>
      </header>

      <main>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Boundary under test</h2>
          <p>
            This route is rendered by RedwoodSDK as a server component. The Apollo provider is a
            local RWSDK integration that can transport Suspense query data from server rendering
            into browser hydration.
          </p>
        </section>

        <ApolloPoc graphqlUrl={graphqlUrl} nonce={rw.nonce} transportId={apolloTransportId} />
      </main>
    </div>
  );
};
