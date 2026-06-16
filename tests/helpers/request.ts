import type { NextRequest } from "next/server";

type RequestOptions = {
  body?: unknown;
  cookies?: Record<string, string>;
  headers?: HeadersInit;
  method?: string;
};

export function makeRequest(path: string, options: RequestOptions = {}) {
  const url = new URL(path, "http://localhost");
  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined;
  const body =
    typeof options.body === "string" || options.body instanceof FormData
      ? options.body
      : hasBody
        ? JSON.stringify(options.body)
        : undefined;

  if (hasBody && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const request = new Request(url, {
    body,
    headers,
    method: options.method ?? (hasBody ? "POST" : "GET"),
  });
  const cookies = new Map(Object.entries(options.cookies ?? {}));

  return Object.assign(request, {
    cookies: {
      get(name: string) {
        const value = cookies.get(name);

        return value === undefined ? undefined : { name, value };
      },
    },
    nextUrl: url,
  }) as NextRequest;
}

export async function readJson(response: Response) {
  return response.json() as Promise<unknown>;
}
