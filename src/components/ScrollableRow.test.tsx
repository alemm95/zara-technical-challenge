import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollableRow } from "./ScrollableRow";

let nextFrameId: number;
let frameCallbacks: Map<number, FrameRequestCallback>;

beforeEach(() => {
  nextFrameId = 1;
  frameCallbacks = new Map();
  vi.stubGlobal(
    "PointerEvent",
    class PointerEventMock extends MouseEvent {
      readonly pointerId: number;

      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 0;
      }
    },
  );
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    const frameId = nextFrameId++;
    frameCallbacks.set(frameId, callback);
    return frameId;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((frameId) => {
    frameCallbacks.delete(frameId);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function flushAnimationFrames() {
  const callbacks = [...frameCallbacks.values()];
  frameCallbacks.clear();
  act(() => {
    callbacks.forEach((callback) => {
      callback(0);
    });
  });
}

function mockScrollMetrics(
  element: HTMLElement,
  { scrollWidth, clientWidth }: { scrollWidth: number; clientWidth: number },
) {
  Object.defineProperty(element, "scrollWidth", {
    configurable: true,
    value: scrollWidth,
  });
  Object.defineProperty(element, "clientWidth", {
    configurable: true,
    value: clientWidth,
  });
}

describe("ScrollableRow", () => {
  it("exposes a keyboard-focusable region with the provided label", () => {
    render(
      <ScrollableRow ariaLabel="Similar items">
        <span>Phone</span>
      </ScrollableRow>,
    );

    expect(
      screen.getByRole("region", { name: "Similar items" }),
    ).toHaveAttribute("tabindex", "0");
  });

  it("sizes the custom thumb according to the visible content ratio", () => {
    const { container } = render(
      <ScrollableRow ariaLabel="Similar items">
        <span>Phone</span>
      </ScrollableRow>,
    );
    const region = screen.getByRole("region", { name: "Similar items" });
    const thumb = container.querySelector("[class*=thumb]");
    mockScrollMetrics(region, { scrollWidth: 1000, clientWidth: 500 });
    fireEvent.scroll(region);
    flushAnimationFrames();

    expect(thumb).toHaveStyle({ width: "50%", left: "0%" });
  });

  it("moves the scroll position when the custom track is clicked", () => {
    const { container } = render(
      <ScrollableRow ariaLabel="Similar items">
        <span>Phone</span>
      </ScrollableRow>,
    );
    const region = screen.getByRole("region", { name: "Similar items" });
    const track = container.querySelector("[class*=track]");
    if (!track) {
      throw new Error("Scroll indicator track was not rendered.");
    }

    mockScrollMetrics(region, { scrollWidth: 1000, clientWidth: 500 });
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      left: 0,
      width: 500,
      top: 0,
      right: 500,
      bottom: 1,
      height: 1,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    fireEvent.pointerDown(track, { clientX: 500, pointerId: 1 });
    flushAnimationFrames();

    expect(region.scrollLeft).toBe(500);
  });
});
