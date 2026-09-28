import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { server } from "./server";

describe("testing foundation", () => {
  it("renders an accessible interactive component with RTL and axe", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <main>
        <h1>Phone catalog</h1>
        <button onClick={onClick} type="button">
          Open cart
        </button>
      </main>,
    );

    await user.click(screen.getByRole("button", { name: "Open cart" }));

    expect(onClick).toHaveBeenCalledOnce();
    const accessibilityResults = await axe(container, {
      rules: { "color-contrast": { enabled: false } },
    });

    expect(accessibilityResults.violations).toEqual([]);
  });

  it("intercepts API requests with MSW", async () => {
    server.use(
      http.get("http://localhost/test-api", () =>
        HttpResponse.json({ ready: true }),
      ),
    );

    const response = await fetch("http://localhost/test-api");

    expect(await response.json()).toEqual({ ready: true });
  });
});
