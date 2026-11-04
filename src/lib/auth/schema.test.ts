import { describe, expect, test } from "vitest";
import { credentialsSchema } from "./schema";

describe("credentialsSchema", () => {
  test("accepts a valid email and password, trimming the email", () => {
    const result = credentialsSchema.safeParse({
      email: "  teacher@school.org ",
      password: "longenough",
    });
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("teacher@school.org");
  });

  test("rejects a bad email", () => {
    const result = credentialsSchema.safeParse({ email: "not-an-email", password: "longenough" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Enter a valid email address.");
  });

  test("rejects a short password", () => {
    const result = credentialsSchema.safeParse({ email: "t@school.org", password: "short" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Password must be at least 8 characters.");
  });

  test("rejects missing fields", () => {
    expect(credentialsSchema.safeParse({ email: null, password: null }).success).toBe(false);
  });
});
