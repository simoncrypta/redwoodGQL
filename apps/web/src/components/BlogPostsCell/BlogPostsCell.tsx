"use client";

import { createCell } from "@rwgql/cell";

import type { CellSuccessProps, CellFailureProps } from "@app/types/cell";

import BlogPost from "@/components/BlogPost/BlogPost";
import { graphql } from "@/gql";
import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";

export const BlogPostsQueryDocument = graphql(`
  query BlogPostsQuery {
    blogPosts: posts {
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

export const QUERY = BlogPostsQueryDocument;

export const Loading = () => <div>Loading...</div>;

export const Empty = () => <div>Empty</div>;

export const Failure = ({
  error,
}: CellFailureProps<VariablesOf<typeof BlogPostsQueryDocument>>) => (
  <div style={{ color: "red" }}>Error: {error?.message}</div>
);

export const Success = ({
  blogPosts,
}: CellSuccessProps<
  ResultOf<typeof BlogPostsQueryDocument>,
  VariablesOf<typeof BlogPostsQueryDocument>
>) => (
  <div className="divide-grey-700 divide-y">
    {blogPosts.map((post) => (
      <BlogPost key={post.id} blogPost={post} />
    ))}
  </div>
);

export default createCell<
  ResultOf<typeof BlogPostsQueryDocument>,
  VariablesOf<typeof BlogPostsQueryDocument>
>({
  QUERY,
  Loading,
  Empty,
  Failure,
  Success,
});
