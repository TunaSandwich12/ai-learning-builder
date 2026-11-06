import { describe, expect, test } from "vitest";
import { authRedirect } from "./redirect";

describe("authRedirect", () => {
  test("signed-out visitors on /dashboard go to /login", () => {
    expect(authRedirect("/dashboard", false)).toBe("/login");
    expect(authRedirect("/dashboard/anything", false)).toBe("/login");
  });

  test("signed-in teachers on /dashboard stay", () => {
    expect(authRedirect("/dashboard", true)).toBeNull();
  });

  test("signed-in teachers on /login go to /dashboard", () => {
    expect(authRedirect("/login", true)).toBe("/dashboard");
  });

  test("signed-out visitors on /login stay", () => {
    expect(authRedirect("/login", false)).toBeNull();
  });

  test("does not catch look-alike paths", () => {
    expect(authRedirect("/dashboards", false)).toBeNull();
  });

  test("signed-out visitors on /activities go to /login", () => {
    expect(authRedirect("/activities", false)).toBe("/login");
    expect(authRedirect("/activities/new", false)).toBe("/login");
  });

  test("signed-in teachers on /activities stay", () => {
    expect(authRedirect("/activities/new", true)).toBeNull();
  });

  test("student links and look-alikes stay public", () => {
    expect(authRedirect("/a/abc123", false)).toBeNull();
    expect(authRedirect("/a", false)).toBeNull();
    expect(authRedirect("/activitiesx", false)).toBeNull();
  });

  test("other pages are left alone", () => {
    expect(authRedirect("/", false)).toBeNull();
    expect(authRedirect("/", true)).toBeNull();
  });
});
