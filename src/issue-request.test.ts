import { describe, expect, it, vi } from "vitest";
import { createIssue } from "./issue-request";

const settings = { owner: "octo", name: "inbox", token: "secret-token" };
const page = { title: "Hello", url: "https://example.com/a" };

function stubFetch(status: number) {
  return vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response("{}", { status }),
  );
}

async function sentBody(title: string, url = page.url) {
  const fetchFn = stubFetch(201);
  await createIssue(settings, { title, url }, fetchFn);
  const init = fetchFn.mock.calls[0]?.[1];
  return JSON.parse(String(init?.body)) as { title: string; body: string };
}

describe("request content", () => {
  it("uses the page title as the issue title and the URL as the body", async () => {
    expect(await sentBody("Hello")).toEqual({
      title: "Hello",
      body: "https://example.com/a",
    });
  });

  it("falls back to the URL as title when the page title is empty", async () => {
    const sent = await sentBody("");
    expect(sent.title).toBe("https://example.com/a");
    expect(sent.body).toBe("https://example.com/a");
  });

  it("never puts the title into the body", async () => {
    const sent = await sentBody("@someone look");
    expect(sent.body).toBe("https://example.com/a");
  });

  it("cuts a 300-character title to 256 code units ending with an ellipsis", async () => {
    const sent = await sentBody("a".repeat(300));
    expect(sent.title).toBe(`${"a".repeat(255)}…`);
    expect(sent.title.length).toBe(256);
  });

  it("keeps a title of exactly 256 characters unchanged", async () => {
    const title = "a".repeat(256);
    expect((await sentBody(title)).title).toBe(title);
  });

  it("does not split a surrogate pair at the cut", async () => {
    // 254 'a' + emoji (2 units) straddling the 255-unit limit
    const sent = await sentBody(`${"a".repeat(254)}😀${"b".repeat(10)}`);
    expect(sent.title).toBe(`${"a".repeat(254)}…`);
    expect(sent.title.length).toBeLessThanOrEqual(256);
    expect(sent.title).not.toMatch(/[\ud800-\udbff](?![\udc00-\udfff])/);
  });

  it("keeps an emoji that fits entirely before the cut", async () => {
    const sent = await sentBody(`${"a".repeat(253)}😀${"b".repeat(10)}`);
    expect(sent.title).toBe(`${"a".repeat(253)}😀…`);
    expect(sent.title.length).toBe(256);
  });
});

describe("request shape", () => {
  it("POSTs to the URI-encoded repository issues endpoint", async () => {
    const fetchFn = stubFetch(201);
    await createIssue(
      { ...settings, owner: "o/x", name: "a b" },
      page,
      fetchFn,
    );
    const [url, init] = fetchFn.mock.calls[0] ?? [];
    expect(url).toBe("https://api.github.com/repos/o%2Fx/a%20b/issues");
    expect(init?.method).toBe("POST");
  });

  it("sends the auth and GitHub headers and omits credentials", async () => {
    const fetchFn = stubFetch(201);
    await createIssue(settings, page, fetchFn);
    const init = fetchFn.mock.calls[0]?.[1];
    expect(init?.credentials).toBe("omit");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer secret-token",
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    });
  });
});

describe("outcome classification", () => {
  it("classifies 201 as created", async () => {
    expect(await createIssue(settings, page, stubFetch(201))).toEqual({
      kind: "created",
    });
  });

  it("classifies 401 as unauthorized", async () => {
    expect(await createIssue(settings, page, stubFetch(401))).toEqual({
      kind: "unauthorized",
    });
  });

  it.each([404, 422, 500])("classifies %i as failure", async (status) => {
    expect(await createIssue(settings, page, stubFetch(status))).toEqual({
      kind: "failure",
    });
  });

  it("classifies a rejected fetch as failure", async () => {
    const fetchFn = vi.fn(async () => {
      throw new TypeError("network down");
    });
    expect(await createIssue(settings, page, fetchFn)).toEqual({
      kind: "failure",
    });
  });
});
