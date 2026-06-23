"use client";

import { gql } from "@apollo/client";
import type { TypedDocumentNode } from "@apollo/client";
import { createCell } from "@rwsdk/cell";

import { welcomeStyles as styles } from "./welcomeStyles.js";

type RedwoodApolloPocData = {
  readonly redwoodApolloPoc: {
    readonly framework: string;
    readonly integration: string;
    readonly notes: readonly string[];
    readonly runtime: string;
    readonly transport: string;
  };
};

let redwoodApolloPocQuery: TypedDocumentNode<RedwoodApolloPocData> | undefined;

const getRedwoodApolloPocQuery = (): TypedDocumentNode<RedwoodApolloPocData> => {
  redwoodApolloPocQuery ??= gql`
    query RedwoodApolloPoc {
      redwoodApolloPoc {
        framework
        runtime
        integration
        transport
        notes
      }
    }
  `;
  return redwoodApolloPocQuery;
};

export const ApolloPocCell = createCell<RedwoodApolloPocData, Record<string, never>>({
  QUERY: () => getRedwoodApolloPocQuery(),
  beforeQuery: () => ({}),
  Loading: () => (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Apollo query result</h2>
      <p>Loading from GraphQL...</p>
    </section>
  ),
  Failure: ({ error }) => (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Apollo query result</h2>
      <p>{error.message}</p>
    </section>
  ),
  Success: ({ redwoodApolloPoc }) => (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Apollo query result</h2>
      <dl className={styles.details}>
        <div>
          <dt>Framework</dt>
          <dd>{redwoodApolloPoc.framework}</dd>
        </div>
        <div>
          <dt>Runtime</dt>
          <dd>{redwoodApolloPoc.runtime}</dd>
        </div>
        <div>
          <dt>Integration</dt>
          <dd>{redwoodApolloPoc.integration}</dd>
        </div>
        <div>
          <dt>Transport</dt>
          <dd>{redwoodApolloPoc.transport}</dd>
        </div>
      </dl>

      <ul className={styles.list}>
        {redwoodApolloPoc.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </section>
  ),
});
