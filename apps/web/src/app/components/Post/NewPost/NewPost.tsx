"use client";

import { gql } from "@apollo/client";

import type {
  CreatePostMutation,
  CreatePostInput,
  CreatePostMutationVariables,
} from "@/app/graphql/types";

import { navigate, routes } from "@/app/redwood/router";
import { useMutation } from "@/app/redwood/web";
import type { TypedDocumentNode } from "@/app/redwood/web";
import { toast } from "@/app/redwood/toast";

import PostForm from "@/app/components/Post/PostForm/PostForm";

const createPostMutation = (): TypedDocumentNode<
  CreatePostMutation,
  CreatePostMutationVariables
> => gql`
  mutation CreatePostMutation($input: CreatePostInput!) {
    createPost(input: $input) {
      id
    }
  }
`;

const NewPost = () => {
  const [createPost, { loading, error }] = useMutation(createPostMutation(), {
    onCompleted: () => {
      toast.success("Post created");
      navigate(routes.posts());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSave = (input: CreatePostInput) => {
    void createPost({ variables: { input } });
  };

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New Post</h2>
      </header>
      <div className="rw-segment-main">
        <PostForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default NewPost;
