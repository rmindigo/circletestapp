import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";

function mockFetch(responses: unknown[]) {
  const fn = vi.fn();
  for (const body of responses) {
    fn.mockResolvedValueOnce({ ok: true, json: async () => body });
  }
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe("App", () => {
  it("renders tasks from the API", async () => {
    mockFetch([[{ id: 1, title: "Existing", done: false }]]);
    render(<App />);
    expect(await screen.findByText("Existing")).toBeInTheDocument();
  });

  it("adds a task", async () => {
    const fetchMock = mockFetch([[], { id: 1, title: "New one", done: false }]);
    render(<App />);
    await userEvent.type(screen.getByLabelText("New task"), "New one");
    await userEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(await screen.findByText("New one")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith("/api/tasks", expect.objectContaining({ method: "POST" }));
  });

  it("toggles a task done", async () => {
    mockFetch([[{ id: 1, title: "Existing", done: false }], { id: 1, title: "Existing", done: true }]);
    render(<App />);
    await userEvent.click(await screen.findByRole("checkbox"));
    expect(await screen.findByText("0 of 1 remaining")).toBeInTheDocument();
  });

  it("deletes a task", async () => {
    const fetchMock = mockFetch([[{ id: 1, title: "Existing", done: false }], null]);
    render(<App />);
    await userEvent.click(await screen.findByRole("button", { name: "Delete Existing" }));
    expect(screen.queryByText("Existing")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith("/api/tasks/1", { method: "DELETE" });
  });
});
