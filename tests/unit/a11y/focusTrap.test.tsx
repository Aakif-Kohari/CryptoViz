import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { useFocusTrap } from "@/hooks/useFocusTrap";

function TestDialog({ onClose = vi.fn() }: { onClose?: () => void }) {
  const [open, setOpen] = useState(true);

  const dialogRef = useFocusTrap({
    enabled: open,
    onEscape: () => {
      onClose();
      setOpen(false);
    },
  });

  return (
    <>
      <button type="button" data-testid="opener">
        Open dialog
      </button>

      {open && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          tabIndex={-1}
        >
          <h2 id="dialog-title">Test dialog</h2>

          <button type="button">First action</button>
          <button type="button">Second action</button>
        </div>
      )}

      <button type="button">Background action</button>
    </>
  );
}

describe("useFocusTrap", () => {
  it("moves focus into the dialog when opened", async () => {
    render(<TestDialog />);

    await act(async () => {
      await new Promise((resolve) => {
        window.requestAnimationFrame(() => resolve(undefined));
      });
    });

    expect(screen.getByRole("button", { name: "First action" })).toHaveFocus();
  });

  it("cycles focus from the last element to the first on Tab", async () => {
    render(<TestDialog />);

    const first = screen.getByRole("button", {
      name: "First action",
    });

    const second = screen.getByRole("button", {
      name: "Second action",
    });

    first.focus();

    fireEvent.keyDown(second, {
      key: "Tab",
    });

    expect(first).toHaveFocus();
  });

  it("cycles focus from the first element to the last on Shift+Tab", async () => {
    render(<TestDialog />);

    const first = screen.getByRole("button", {
      name: "First action",
    });

    const second = screen.getByRole("button", {
      name: "Second action",
    });

    first.focus();

    fireEvent.keyDown(first, {
      key: "Tab",
      shiftKey: true,
    });

    expect(second).toHaveFocus();
  });

  it("prevents focus from escaping when focus is outside the dialog", async () => {
    render(<TestDialog />);

    const first = screen.getByRole("button", {
      name: "First action",
    });

    first.focus();

    const backgroundButton = screen.getByRole("button", {
      name: "Background action",
    });

    backgroundButton.focus();

    fireEvent.keyDown(backgroundButton, {
      key: "Tab",
    });

    expect(first).toHaveFocus();
  });

  it("closes the dialog on Escape", async () => {
    const onClose = vi.fn();

    render(<TestDialog onClose={onClose} />);

    const first = screen.getByRole("button", {
      name: "First action",
    });

    first.focus();

    fireEvent.keyDown(first, {
      key: "Escape",
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

it("restores focus to the opener when the dialog closes", async () => {
  function Wrapper() {
    const [open, setOpen] = useState(false);

    const dialogRef = useFocusTrap({
      enabled: open,
      onEscape: () => setOpen(false),
    });

    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
        >
          Open
        </button>

        {open && (
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        )}
      </>
    );
  }

  render(<Wrapper />);

  const opener = screen.getByRole("button", {
    name: "Open",
  });

  opener.focus();

  fireEvent.click(opener);

  const closeButton = screen.getByRole("button", {
    name: "Close",
  });

  await act(async () => {
    await new Promise((resolve) => {
      window.requestAnimationFrame(() => resolve(undefined));
    });
  });

  expect(closeButton).toHaveFocus();

  fireEvent.click(closeButton);

  await act(async () => {
    await new Promise((resolve) => {
      window.requestAnimationFrame(() => resolve(undefined));
    });
  });

  expect(opener).toHaveFocus();
});

  it("handles dynamically added focusable content", () => {
    function DynamicDialog() {
      const [showExtra, setShowExtra] = useState(false);

      const dialogRef = useFocusTrap({
        enabled: true,
      });

      return (
        <div ref={dialogRef} role="dialog" aria-modal="true" tabIndex={-1}>
          <button type="button">First</button>

          <button type="button" onClick={() => setShowExtra(true)}>
            Add control
          </button>

          {showExtra && <button type="button">Dynamic control</button>}
        </div>
      );
    }

    render(<DynamicDialog />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Add control",
      }),
    );

    const dynamicControl = screen.getByRole("button", {
      name: "Dynamic control",
    });

    dynamicControl.focus();

    fireEvent.keyDown(dynamicControl, {
      key: "Tab",
    });

    expect(
      screen.getByRole("button", {
        name: "First",
      }),
    ).toHaveFocus();
  });
});
