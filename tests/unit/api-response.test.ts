import { describe, expect, it } from "vitest";
import { jsonError, parseJsonObject } from "@/lib/api-response";

describe("api-response utilities", () => {
  it("returns JSON errors with the requested status", async () => {
    const response = jsonError("Invalid input", 422);

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({ error: "Invalid input" });
  });

  it("accepts only plain JSON objects", () => {
    expect(parseJsonObject({ name: "Road bike" })).toEqual({
      name: "Road bike",
    });

    expect(() => parseJsonObject(null)).toThrow("JSON body must be an object");
    expect(() => parseJsonObject(["not", "an", "object"])).toThrow(
      "JSON body must be an object",
    );
    expect(() => parseJsonObject("text")).toThrow(
      "JSON body must be an object",
    );
  });
});
