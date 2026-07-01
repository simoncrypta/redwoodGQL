"use client";

import { createCell } from "@rwgql/cell";

import type { CellSuccessProps, CellFailureProps } from "@/redwood/web";

import BlogPost from "@/components/BlogPost/BlogPost";
import { graphql } from "@/gql";
import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";

export const FindBlogPostQueryDocument = graphql(`
  query FindBlogPostQuery($id: Int!) {
    blogPost: post(id: $id) {
      id
      title
      body
      author {
        email
        fullName
      }
      createdAt
    }
  }
`);

export const QUERY = FindBlogPostQueryDocument;

export const Loading = () => <div>Loading...</div>;

export const Empty = () => <div>Empty</div>;

export const Failure = ({
  error,
}: CellFailureProps<VariablesOf<typeof FindBlogPostQueryDocument>>) => (
  <div style={{ color: "red" }}>Error: {error?.message}</div>
);

export const Success = ({
  blogPost,
}: CellSuccessProps<
  ResultOf<typeof FindBlogPostQueryDocument>,
  VariablesOf<typeof FindBlogPostQueryDocument>
>) => <BlogPost blogPost={blogPost} />;

export default createCell<
  ResultOf<typeof FindBlogPostQueryDocument>,
  VariablesOf<typeof FindBlogPostQueryDocument>
>({
  QUERY,
  Loading,
  Empty,
  Failure,
  Success,
});
