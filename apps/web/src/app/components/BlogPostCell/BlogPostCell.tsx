"use client";

import { gql } from "@apollo/client";
import { createCell } from "@rwgql/cell";

import type { FindBlogPostQuery, FindBlogPostQueryVariables } from "@/app/graphql/types";

import type { CellSuccessProps, CellFailureProps, TypedDocumentNode } from "@/app/redwood/web";

import BlogPost from "@/app/components/BlogPost/BlogPost";

export const QUERY = (): TypedDocumentNode<FindBlogPostQuery, FindBlogPostQueryVariables> => gql`
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
`;

export const Loading = () => <div>Loading...</div>;

export const Empty = () => <div>Empty</div>;

export const Failure = ({ error }: CellFailureProps<FindBlogPostQueryVariables>) => (
  <div style={{ color: "red" }}>Error: {error?.message}</div>
);

export const Success = ({
  blogPost,
}: CellSuccessProps<FindBlogPostQuery, FindBlogPostQueryVariables>) => (
  <BlogPost blogPost={blogPost} />
);

export default createCell<FindBlogPostQuery, FindBlogPostQueryVariables>({
  QUERY,
  Loading,
  Empty,
  Failure,
  Success,
});
