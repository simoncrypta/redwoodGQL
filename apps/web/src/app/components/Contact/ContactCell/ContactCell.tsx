"use client";

import { gql } from "@apollo/client";
import { createCell } from "@rwsdk/cell";

import type { FindContactById, FindContactByIdVariables } from "@/app/graphql/types";

import type { CellSuccessProps, CellFailureProps, TypedDocumentNode } from "@/app/redwood/web";

import Contact from "@/app/components/Contact/Contact/Contact";

export const QUERY = (): TypedDocumentNode<FindContactById, FindContactByIdVariables> => gql`
  query FindContactById($id: Int!) {
    contact: contact(id: $id) {
      id
      name
      email
      message
      createdAt
    }
  }
`;

export const Loading = () => <div>Loading...</div>;

export const Empty = () => <div>Contact not found</div>;

export const Failure = ({ error }: CellFailureProps<FindContactByIdVariables>) => (
  <div className="rw-cell-error">{error?.message}</div>
);

export const Success = ({
  contact,
}: CellSuccessProps<FindContactById, FindContactByIdVariables>) => {
  if (!contact) {
    return <Empty />;
  }

  return <Contact contact={contact} />;
};

export default createCell<FindContactById, FindContactByIdVariables>({
  QUERY,
  Loading,
  Empty,
  Failure,
  Success,
});
