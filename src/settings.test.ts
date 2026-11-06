import { describe, expect, it } from "vitest";
import { parseRepository } from "./settings.js";

describe("parseRepository", () => {
  it("returns the owner and name of an owner/name input", () => {
    expect(parseRepository("octo-cat/my.repo_1")).toEqual({
      owner: "octo-cat",
      name: "my.repo_1",
    });
  });

  it("ignores whitespace around a pasted input", () => {
    expect(parseRepository("  octocat/hello  ")).toEqual({
      owner: "octocat",
      name: "hello",
    });
  });

  const ownerOf39Chars = "a".repeat(39);
  const nameOf100Chars = "n".repeat(100);

  it("accepts the longest owner and name GitHub allows", () => {
    expect(parseRepository(`${ownerOf39Chars}/${nameOf100Chars}`)).toEqual({
      owner: ownerOf39Chars,
      name: nameOf100Chars,
    });
  });

  it.each([
    ["an empty input", ""],
    ["a path climbing out of the repository", "../x"],
    ["three path segments", "a/b/c"],
    ["a single dot", "."],
    ["two dots", ".."],
    ["a name of a single dot", "octocat/."],
    ["a name of two dots", "octocat/.."],
    ["a missing name", "octocat/"],
    ["a missing owner", "/hello"],
    ["an owner starting with a hyphen", "-octocat/hello"],
    ["an owner ending with a hyphen", "octocat-/hello"],
    ["an owner with consecutive hyphens", "octo--cat/hello"],
    ["an owner with an underscore", "octo_cat/hello"],
    ["an owner of 40 characters", `${"a".repeat(40)}/hello`],
    ["a name of 101 characters", `octocat/${"n".repeat(101)}`],
    ["a name with a space", "octocat/hello world"],
    ["a name with a percent sign", "octocat/hello%2F"],
  ])("rejects %s", (_case, input) => {
    expect(parseRepository(input)).toBeUndefined();
  });
});
