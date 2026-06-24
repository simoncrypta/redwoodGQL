"use client";

import { gql } from "@apollo/client";
import { createCell } from "@rwgql/cell";

import type { FindPosts, FindPostsVariables } from "@/app/graphql/types";

import { Link, routes } from "@/app/redwood/router";
import type { CellSuccessProps, CellFailureProps, TypedDocumentNode } from "@/app/redwood/web";

import Posts from "@/app/components/Post/Posts/Posts";

export const QUERY = (): TypedDocumentNode<FindPosts, FindPostsVariables> => gql`
  query FindPosts {
    posts {
      id
      title
      body
      authorId
      createdAt
    }
  }
`;

export const Loading = () => <div>Loading...</div>;

export const Empty = () => {
  return (
    <div className="rw-text-center">
      No posts yet.{" "}
      <Link to={routes.newPost()} className="rw-link">
        Create one?
      </Link>
    </div>
  );
};

export const Failure = ({ error }: CellFailureProps<FindPostsVariables>) => (
  <div className="rw-cell-error">{error?.message}</div>
);

export const Success = ({ posts }: CellSuccessProps<FindPosts, FindPostsVariables>) => {
  return <Posts posts={posts} />;
};

export default createCell<FindPosts, FindPostsVariables>({
  QUERY,
  Loading,
  Empty,
  Failure,
  Success,
});
