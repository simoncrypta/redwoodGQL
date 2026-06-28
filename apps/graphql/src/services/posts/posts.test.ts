import { beforeEach, describe, expect, it } from "vite-plus/test";

import type { Post } from "db";

import { resetDatabase, seedPostsFixture } from "../../test/db.js";
import { createPost, deletePost, post, posts, updatePost } from "./posts.js";

describe("posts", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("returns all posts", async () => {
    const fixture = await seedPostsFixture();
    const result = await posts({});

    expect(result.length).toEqual(Object.keys(fixture.post).length);
  });

  it("returns a single post", async () => {
    const fixture = await seedPostsFixture();
    const result = await post({ id: fixture.post.one.id });

    expect(result).toEqual(fixture.post.one);
  });

  it("creates a post", async () => {
    const fixture = await seedPostsFixture();
    const result = await createPost({
      input: {
        authorId: fixture.post.two.authorId,
        body: "String",
        title: "String",
      },
    });

    expect(result.title).toEqual("String");
    expect(result.body).toEqual("String");
    expect(result.authorId).toEqual(fixture.post.two.authorId);
  });

  it("updates a post", async () => {
    const fixture = await seedPostsFixture();
    const original = (await post({ id: fixture.post.one.id })) as Post;
    const result = await updatePost({
      id: original.id,
      input: { title: "String2" },
    });

    expect(result.title).toEqual("String2");
  });

  it("deletes a post", async () => {
    const fixture = await seedPostsFixture();
    const original = (await deletePost({ id: fixture.post.one.id })) as Post;
    const result = await post({ id: original.id });

    expect(result).toEqual(null);
  });
});
