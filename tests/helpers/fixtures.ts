export function userFixture(overrides: Record<string, unknown> = {}) {
  return {
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    email: "rider@example.com",
    firstName: "Ada",
    id: 7,
    lastName: "Lovelace",
    passwordHash: "hidden",
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    ...overrides,
  };
}
