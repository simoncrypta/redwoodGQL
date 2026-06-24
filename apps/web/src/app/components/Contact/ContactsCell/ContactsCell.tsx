"use client";

import { gql } from "@apollo/client";
import { createCell } from "@rwgql/cell";

import type { FindContacts, FindContactsVariables } from "@/app/graphql/types";

import { Link, routes } from "@/app/redwood/router";
import type { CellSuccessProps, CellFailureProps, TypedDocumentNode } from "@/app/redwood/web";

import Contacts from "@/app/components/Contact/Contacts/Contacts";

export const QUERY = (): TypedDocumentNode<FindContacts, FindContactsVariables> =>
  gql`
    query FindContacts {
      contacts {
        id
        name
        email
        message
        createdAt
      }
    }
  `;

export const Loading = () => <div>Loading...</div>;

export const Empty = () => {
  return (
    <div className="rw-text-center">
      No contacts yet.{" "}
      <Link to={routes.newContact()} className="rw-link">
        Create one?
      </Link>
    </div>
  );
};

export const Failure = ({ error }: CellFailureProps<FindContactsVariables>) => (
  <div className="rw-cell-error">{error?.message}</div>
);

export const Success = ({ contacts }: CellSuccessProps<FindContacts, FindContactsVariables>) => {
  return <Contacts contacts={contacts} />;
};

export default createCell<FindContacts, FindContactsVariables>({
  QUERY,
  Loading,
  Empty,
  Failure,
  Success,
});
