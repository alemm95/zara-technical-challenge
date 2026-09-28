import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ErrorPage from "./error";
import GlobalError from "./global-error";
import NotFound from "./not-found";

describe("error pages", () => {
  it("offers a retry from the route error boundary", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    render(<ErrorPage retry={retry} />);

    expect(
      screen.getByRole("heading", { name: "Something went wrong" }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(retry).toHaveBeenCalledOnce();
  });

  it("renders the global error fallback with its own document", () => {
    const markup = renderToString(<GlobalError retry={() => undefined} />);

    expect(markup).toContain('<html lang="en">');
    expect(markup).toContain("Something went wrong");
  });

  it("links back to the catalog from not-found", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Continue shopping" }),
    ).toHaveAttribute("href", "/");
  });
});
