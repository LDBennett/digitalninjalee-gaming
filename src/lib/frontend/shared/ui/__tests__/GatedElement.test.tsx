import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GatedElement } from "@/src/lib/frontend/shared/ui/GatedElement";

describe("GatedElement", () => {
  it("renders children directly when authenticated", () => {
    render(
      <GatedElement isAuthenticated onSignIn={() => {}}>
        <button>Edit</button>
      </GatedElement>,
    );
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    // No wrapper div — authenticated users get the fragment directly
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
  });

  it("renders children inside a wrapper when unauthenticated", () => {
    render(
      <GatedElement isAuthenticated={false} onSignIn={() => {}}>
        <button>Edit</button>
      </GatedElement>,
    );
    // Children still appear (behind the overlay)
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    // Popover is not open yet
    expect(screen.queryByText("This action requires you to be signed in")).not.toBeInTheDocument();
  });

  it("shows the sign-in popover when the overlay is clicked", async () => {
    const user = userEvent.setup();
    render(
      <GatedElement isAuthenticated={false} onSignIn={() => {}}>
        <button>Edit</button>
      </GatedElement>,
    );
    // The overlay is an absolute div covering the children
    const overlay = document.querySelector(".absolute.inset-0.cursor-pointer");
    expect(overlay).toBeTruthy();
    await user.click(overlay!);
    expect(
      screen.getByText("This action requires you to be signed in"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("calls onSignIn when the Sign in button is clicked", async () => {
    const user = userEvent.setup();
    const onSignIn = vi.fn();
    render(
      <GatedElement isAuthenticated={false} onSignIn={onSignIn}>
        <span>Action</span>
      </GatedElement>,
    );
    const overlay = document.querySelector(".absolute.inset-0.cursor-pointer");
    await user.click(overlay!);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(onSignIn).toHaveBeenCalledOnce();
  });

  it("closes the popover after Sign in is clicked", async () => {
    const user = userEvent.setup();
    render(
      <GatedElement isAuthenticated={false} onSignIn={() => {}}>
        <span>Action</span>
      </GatedElement>,
    );
    const overlay = document.querySelector(".absolute.inset-0.cursor-pointer");
    await user.click(overlay!);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(
      screen.queryByText("This action requires you to be signed in"),
    ).not.toBeInTheDocument();
  });
});
