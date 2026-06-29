import type { Contact } from "db";
import { db } from "db";

import type {
  MutationCreateContactArgs,
  MutationDeleteContactArgs,
  MutationUpdateContactArgs,
  QueryContactArgs,
  ResolverFn,
} from "types/graphql";

export const contacts: ResolverFn<Contact[], unknown, unknown, Record<string, never>> = () =>
  db.contact.findMany();

export const contact: ResolverFn<Contact | null, unknown, unknown, QueryContactArgs> = (
  _parent,
  { id },
) =>
  db.contact.findUnique({
    where: { id },
  });

export const createContact: ResolverFn<
  Contact | null,
  unknown,
  unknown,
  MutationCreateContactArgs
> = (_parent, { input }) =>
  db.contact.create({
    data: input,
  });

export const updateContact: ResolverFn<Contact, unknown, unknown, MutationUpdateContactArgs> = (
  _parent,
  { id, input },
) =>
  db.contact.update({
    data: input as Parameters<typeof db.contact.update>[0]["data"],
    where: { id },
  });

export const deleteContact: ResolverFn<Contact, unknown, unknown, MutationDeleteContactArgs> = (
  _parent,
  { id },
) =>
  db.contact.delete({
    where: { id },
  });
