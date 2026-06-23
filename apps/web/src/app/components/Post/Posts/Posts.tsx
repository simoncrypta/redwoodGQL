"use client";

import { gql } from "@apollo/client";

import type {
  DeletePostMutation,
  DeletePostMutationVariables,
  FindPosts,
} from "@/app/graphql/types";

import { Link, routes } from "@/app/redwood/router";
import { useMutation } from "@/app/redwood/web";
import type { TypedDocumentNode } from "@/app/redwood/web";
import { toast } from "@/app/redwood/toast";

import { QUERY } from "@/app/components/Post/PostsCell/PostsCell";
import { timeTag, truncate } from "@/app/lib/formatters";

const deletePostMutation = (): TypedDocumentNode<
  DeletePostMutation,
  DeletePostMutationVariables
> => gql`
  mutation DeletePostMutation($id: Int!) {
    deletePost(id: $id) {
      id
    }
  }
`;

const PostsList = ({ posts }: FindPosts) => {
  const [deletePost] = useMutation(deletePostMutation(), {
    onCompleted: () => {
      toast.success("Post deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
    // This refetches the query on the list page. Read more about other ways to
    // update the cache over here:
    // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
    refetchQueries: [{ query: QUERY() }],
    awaitRefetchQueries: true,
  });

  const onDeleteClick = (id: DeletePostMutationVariables["id"]) => {
    if (confirm("Are you sure you want to delete post " + id + "?")) {
      void deletePost({ variables: { id } });
    }
  };

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Title</th>
            <th>Body</th>
            <th>Author id</th>
            <th>Created at</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>{truncate(post.id)}</td>
              <td>{truncate(post.title)}</td>
              <td>{truncate(post.body)}</td>
              <td>{truncate(post.authorId)}</td>
              <td>{timeTag(post.createdAt)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.post({ id: post.id })}
                    title={"Show post " + post.id + " detail"}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editPost({ id: post.id })}
                    title={"Edit post " + post.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    title={"Delete post " + post.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(post.id)}
                  >
                    Delete
                  </button>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PostsList;
