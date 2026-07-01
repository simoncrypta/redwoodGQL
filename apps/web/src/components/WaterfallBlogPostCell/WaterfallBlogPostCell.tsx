"use client";

import { createCell } from "@rwgql/cell";

import type { CellSuccessProps, CellFailureProps } from "@app/types/cell";

import AuthorCell from "@/components/AuthorCell/AuthorCell";
import { graphql } from "@/gql";
import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";

export const FindWaterfallBlogPostQueryDocument = graphql(`
  query FindWaterfallBlogPostQuery($id: Int!) {
    waterfallBlogPost: post(id: $id) {
      id
      title
      body
      authorId
      createdAt
    }
  }
`);

export const QUERY = FindWaterfallBlogPostQueryDocument;

export const Loading = () => <div>Loading...</div>;

export const Empty = () => <div>Empty</div>;

export const Failure = ({
  error,
}: CellFailureProps<VariablesOf<typeof FindWaterfallBlogPostQueryDocument>>) => (
  <div style={{ color: "red" }}>Error: {error?.message}</div>
);

export const Success = ({
  waterfallBlogPost,
}: CellSuccessProps<
  ResultOf<typeof FindWaterfallBlogPostQueryDocument>,
  VariablesOf<typeof FindWaterfallBlogPostQueryDocument>
>) => (
  <article>
    {waterfallBlogPost && (
      <>
        <header className="mt-4">
          <p className="text-sm">
            {new Intl.DateTimeFormat("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }).format(new Date(waterfallBlogPost.createdAt))}{" "}
            - By: <AuthorCell id={waterfallBlogPost.authorId} />
          </p>
          <h2 className="mt-2 text-xl font-semibold">{waterfallBlogPost.title}</h2>
        </header>
        <div className="mb-4 mt-2 font-light text-gray-900">{waterfallBlogPost.body}</div>
      </>
    )}
  </article>
);

export default createCell<
  ResultOf<typeof FindWaterfallBlogPostQueryDocument>,
  VariablesOf<typeof FindWaterfallBlogPostQueryDocument>
>({
  QUERY,
  Loading,
  Empty,
  Failure,
  Success,
});
