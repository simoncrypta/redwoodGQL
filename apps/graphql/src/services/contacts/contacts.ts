import { db, type Contact } from "db";

import type { CreateContactInput, ServiceResolver, UpdateContactInput } from "../../types.js";

export const contacts: ServiceResolver<readonly Contact[]> = () => db.contact.findMany();

export const contact: ServiceResolver<Contact | null, { readonly id: number }> = ({ id }) =>
  db.contact.findUnique({
    where: { id },
  });

export const createContact: ServiceResolver<Contact, { readonly input: CreateContactInput }> = ({
  input,
}) =>
  db.contact.create({
    data: input,
  });

export const updateContact: ServiceResolver<
  Contact,
  { readonly id: number; readonly input: UpdateContactInput }
> = ({ id, input }) =>
  db.contact.update({
    data: input,
    where: { id },
  });

export const deleteContact: ServiceResolver<Contact, { readonly id: number }> = ({ id }) =>
  db.contact.delete({
    where: { id },
  });
