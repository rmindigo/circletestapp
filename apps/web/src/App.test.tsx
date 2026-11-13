import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";

function mockFetch(responses: unknown[]) {
  const fn = vi.fn();
  for (const body of responses) {
    fn.mockResolvedValueOnce({ json: async () => body });
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
});
