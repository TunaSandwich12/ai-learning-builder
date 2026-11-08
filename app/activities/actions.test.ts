import { beforeEach, describe, expect, test, vi } from "vitest";
import { samples } from "@/src/lib/samples";
import { DELETE_MESSAGES, SAVE_MESSAGES, SHARE_MESSAGES } from "@/src/lib/save-activity";

// A fake Supabase client that records the calls the action makes.
const getClaims = vi.fn();
const insert = vi.fn();
const update = vi.fn();
const eq = vi.fn();
const single = vi.fn();
const maybeSingle = vi.fn();
const from = vi.fn();
const del = vi.fn();
const delEq = vi.fn();
const delSelect = vi.fn();
const shareUpdate = vi.fn();
const shareEq = vi.fn();
const shareSelect = vi.fn();

vi.mock("@/src/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getClaims }, from }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { deleteActivity, saveActivity, shareActivity, stopSharing } = await import("./actions");

const ID = "3f2b8c1e-5d4a-4b6e-9c7f-1a2b3c4d5e6f";
const NEW_ID = "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d";

describe("saveActivity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    getClaims.mockResolvedValue({ data: { claims: { sub: "teacher-1" } } });

    // insert(row).select("id").single()
    insert.mockReturnValue({ select: () => ({ single }) });
    // update(row).eq("id", id).select("id").maybeSingle()
    update.mockReturnValue({ eq });
    eq.mockReturnValue({ select: () => ({ maybeSingle }) });
    from.mockReturnValue({ insert, update, delete: del });

    single.mockResolvedValue({ data: { id: NEW_ID }, error: null });
    maybeSingle.mockResolvedValue({ data: { id: ID }, error: null });
  });

  test("signed out: returns a message and touches no data", async () => {
    getClaims.mockResolvedValue({ data: null });
    const result = await saveActivity(null, samples.flashcards);
    expect(result).toEqual({ ok: false, message: SAVE_MESSAGES.signedOut });
    expect(from).not.toHaveBeenCalled();
  });

  test("invalid activity: returns a message and touches no data", async () => {
    const result = await saveActivity(null, { ...samples.flashcards, cards: [] });
    expect(result).toEqual({ ok: false, message: SAVE_MESSAGES.invalid });
    expect(from).not.toHaveBeenCalled();
  });

  test("null id inserts type, title and content only, and returns the new id", async () => {
    const result = await saveActivity(null, { ...samples.flashcards, owner_id: "someone-else" });
    expect(result).toEqual({ ok: true, id: NEW_ID });
    expect(from).toHaveBeenCalledWith("activities");
    const row = insert.mock.calls[0][0];
    expect(Object.keys(row).sort()).toEqual(["content", "title", "type"]);
    expect(row.content).not.toHaveProperty("owner_id");
    expect(update).not.toHaveBeenCalled();
  });

  test("an id updates that row and returns the same id", async () => {
    const result = await saveActivity(ID, samples.ordering);
    expect(result).toEqual({ ok: true, id: ID });
    expect(update.mock.calls[0][0]).toEqual({
      type: "ordering",
      title: samples.ordering.title,
      content: samples.ordering,
    });
    expect(eq).toHaveBeenCalledWith("id", ID);
    expect(insert).not.toHaveBeenCalled();
  });

  test("a row hidden by RLS (or deleted) gives the not-found message", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    expect(await saveActivity(ID, samples.ordering)).toEqual({
      ok: false,
      message: SAVE_MESSAGES.notFound,
    });
  });

  test("database errors give the friendly failure message", async () => {
    single.mockResolvedValue({ data: null, error: { message: "boom" } });
    expect(await saveActivity(null, samples.matching)).toEqual({
      ok: false,
      message: SAVE_MESSAGES.failed,
    });

    maybeSingle.mockResolvedValue({ data: null, error: { message: "boom" } });
    expect(await saveActivity(ID, samples.matching)).toEqual({
      ok: false,
      message: SAVE_MESSAGES.failed,
    });
  });

  test("never throws", async () => {
    getClaims.mockRejectedValue(new Error("network down"));
    expect(await saveActivity(null, samples.matching)).toEqual({
      ok: false,
      message: SAVE_MESSAGES.failed,
    });
  });
});

describe("deleteActivity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    getClaims.mockResolvedValue({ data: { claims: { sub: "teacher-1" } } });

    // delete().eq("id", id).eq("owner_id", sub).select("id")
    const chain = { eq: delEq, select: delSelect };
    del.mockReturnValue(chain);
    delEq.mockReturnValue(chain);
    delSelect.mockResolvedValue({ data: [{ id: ID }], error: null });
    from.mockReturnValue({ delete: del });
  });

  test("signed out: returns a message and touches no data", async () => {
    getClaims.mockResolvedValue({ data: null });
    expect(await deleteActivity(ID)).toEqual({ ok: false, message: DELETE_MESSAGES.signedOut });
    expect(from).not.toHaveBeenCalled();
  });

  test.each([["abc"], [""], [null], [123]])("bad id %j touches no data", async (id) => {
    expect(await deleteActivity(id)).toEqual({ ok: false, message: DELETE_MESSAGES.notFound });
    expect(from).not.toHaveBeenCalled();
  });

  test("deletes the row filtered by id and the teacher's owner_id", async () => {
    expect(await deleteActivity(ID)).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("activities");
    expect(delEq).toHaveBeenCalledWith("id", ID);
    expect(delEq).toHaveBeenCalledWith("owner_id", "teacher-1");
  });

  test("nothing deleted (missing, or another teacher's) gives the not-found message", async () => {
    delSelect.mockResolvedValue({ data: [], error: null });
    expect(await deleteActivity(ID)).toEqual({ ok: false, message: DELETE_MESSAGES.notFound });
  });

  test("database errors give the friendly failure message", async () => {
    delSelect.mockResolvedValue({ data: null, error: { message: "boom" } });
    expect(await deleteActivity(ID)).toEqual({ ok: false, message: DELETE_MESSAGES.failed });
  });

  test("never throws", async () => {
    getClaims.mockRejectedValue(new Error("network down"));
    expect(await deleteActivity(ID)).toEqual({ ok: false, message: DELETE_MESSAGES.failed });
  });
});

describe.each([
  ["shareActivity", () => shareActivity, true],
  ["stopSharing", () => stopSharing, false],
] as const)("%s", (_name, getAction, isPublic) => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    getClaims.mockResolvedValue({ data: { claims: { sub: "teacher-1" } } });

    // update({ is_public }).eq("id", id).eq("owner_id", sub).select("id")
    const chain = { eq: shareEq, select: shareSelect };
    shareUpdate.mockReturnValue(chain);
    shareEq.mockReturnValue(chain);
    shareSelect.mockResolvedValue({ data: [{ id: ID }], error: null });
    from.mockReturnValue({ update: shareUpdate });
  });

  test("signed out: returns a message and touches no data", async () => {
    getClaims.mockResolvedValue({ data: null });
    expect(await getAction()(ID)).toEqual({ ok: false, message: SHARE_MESSAGES.signedOut });
    expect(from).not.toHaveBeenCalled();
  });

  test.each([["abc"], [""], [null], [123]])("bad id %j touches no data", async (id) => {
    expect(await getAction()(id)).toEqual({ ok: false, message: SHARE_MESSAGES.notFound });
    expect(from).not.toHaveBeenCalled();
  });

  test(`sets is_public to ${isPublic}, only on the teacher's own row`, async () => {
    expect(await getAction()(ID)).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("activities");
    expect(shareUpdate).toHaveBeenCalledWith({ is_public: isPublic });
    expect(shareEq).toHaveBeenCalledWith("id", ID);
    expect(shareEq).toHaveBeenCalledWith("owner_id", "teacher-1");
    expect(shareSelect).toHaveBeenCalledWith("id");
  });

  test("no row updated (missing, or another teacher's) gives the not-found message", async () => {
    shareSelect.mockResolvedValue({ data: [], error: null });
    expect(await getAction()(ID)).toEqual({ ok: false, message: SHARE_MESSAGES.notFound });
  });

  test("database errors give the friendly failure message", async () => {
    shareSelect.mockResolvedValue({ data: null, error: { message: "boom" } });
    expect(await getAction()(ID)).toEqual({ ok: false, message: SHARE_MESSAGES.failed });
  });

  test("never throws", async () => {
    getClaims.mockRejectedValue(new Error("network down"));
    expect(await getAction()(ID)).toEqual({ ok: false, message: SHARE_MESSAGES.failed });
  });
});
