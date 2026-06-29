import { beforeEach, describe, expect, it } from "vite-plus/test";

import type { Post } from "db";

import { callResolver, callResolverWithoutArgs } from "../../lib/resolvers.js";
import { resetDatabase, seedPostsFixture } from "../../test/db.js";
import { createPost, deletePost, post, posts, updatePost } from "./posts.js";

describe("posts", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("returns all posts", async () => {
    const fixture = await seedPostsFixture();
    const result = await callResolverWithoutArgs(posts);

    expect(result.length).toEqual(Object.keys(fixture.post).length);
  });

  it("returns a single post", async () => {
    const fixture = await seedPostsFixture();
    const result = await callResolver(post, { id: fixture.post.one.id });

    expect(result).toEqual(fixture.post.one);
  });

  it("creates a post", async () => {
    const fixture = await seedPostsFixture();
    const result = await callResolver(createPost, {
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
    const original = (await callResolver(post, { id: fixture.post.one.id })) as Post;
    const result = await callResolver(updatePost, {
      id: original.id,
      input: { title: "String2" },
    });

    expect(result.title).toEqual("String2");
  });

  it("deletes a post", async () => {
    const fixture = await seedPostsFixture();
    const original = (await callResolver(deletePost, { id: fixture.post.one.id })) as Post;
    const result = await callResolver(post, { id: original.id });

    expect(result).toEqual(null);
  });
});
