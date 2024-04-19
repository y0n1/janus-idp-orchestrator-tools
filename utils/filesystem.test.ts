import { assertObjectMatch, assertStrictEquals } from "@std/assert";
import { tryExists } from "./filesystem.ts";

Deno.test("Returns TRUE when the path is URL and exists", async () => {
  const existingPath = new URL("file:/tmp");
  const result = await tryExists(existingPath);
  assertStrictEquals(result, true);
});

Deno.test("Returns TRUE when the path is String and exists", async () => {
  const existingPath = "/tmp";
  const result = await tryExists(existingPath);
  assertStrictEquals(result, true);
});

Deno.test("Returns TRUE when the path exists and spits out the FileInfo object", async () => {
  const existingPath = "/tmp";
  const fileInfo = {};
  const result = await tryExists(existingPath, fileInfo);
  assertStrictEquals(result, true);
  assertObjectMatch(fileInfo, { isDirectory: true });
});

Deno.test("Doesn't throw when the path doesn't exist", async () => {
  const existingPath = "/tmpZ";
  let didThrow = false;
  try {
    await tryExists(existingPath);
  } catch {
    didThrow = true;
  }
  assertStrictEquals(didThrow, false);
});

Deno.test("Returns FALSE when the path doesn't exist", async () => {
  const existingPath = "/tmpZ";
  const result = await tryExists(existingPath);
  assertStrictEquals(result, false);
});

Deno.test("FileInfo out param remains unchanged when the path doesn't exist", async () => {
  const existingPath = "/tmpZ";
  const fileInfo = {};
  const result = await tryExists(existingPath, fileInfo);
  assertStrictEquals(result, false);
  assertStrictEquals(Array.from(Object.keys(fileInfo)).length, 0);
});
