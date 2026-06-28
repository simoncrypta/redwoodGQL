import { beforeEach, describe, expect, it } from "vite-plus/test";

import type { Contact } from "db";

import { resetDatabase, seedContactsFixture } from "../../test/db.js";
import { contact, contacts, createContact, deleteContact, updateContact } from "./contacts.js";

describe("contacts", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("returns all contacts", async () => {
    const fixture = await seedContactsFixture();
    const result = await contacts({});

    expect(result.length).toEqual(Object.keys(fixture.contact).length);
  });

  it("returns a single contact", async () => {
    const fixture = await seedContactsFixture();
    const result = await contact({ id: fixture.contact.one.id });

    expect(result).toEqual(fixture.contact.one);
  });

  it("creates a contact", async () => {
    const result = await createContact({
      input: { email: "String", message: "String", name: "String" },
    });

    expect(result.name).toEqual("String");
    expect(result.email).toEqual("String");
    expect(result.message).toEqual("String");
  });

  it("updates a contact", async () => {
    const fixture = await seedContactsFixture();
    const original = (await contact({ id: fixture.contact.one.id })) as Contact;
    const result = await updateContact({
      id: original.id,
      input: { name: "String2" },
    });

    expect(result.name).toEqual("String2");
  });

  it("deletes a contact", async () => {
    const fixture = await seedContactsFixture();
    const original = (await deleteContact({ id: fixture.contact.one.id })) as Contact;
    const result = await contact({ id: original.id });

    expect(result).toEqual(null);
  });
});
