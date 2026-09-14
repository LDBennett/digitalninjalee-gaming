import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NumberInput } from "../NumberInput";

describe("NumberInput", () => {
  it("renders with label, placeholder, and suffix", () => {
    render(
      <NumberInput
        label="Main Story"
        value={15}
        placeholder="e.g. 15"
        suffix="h"
        onChange={() => {}}
      />,
    );

    expect(screen.getByText("Main Story")).toBeInTheDocument();
    expect(screen.getByDisplayValue("15")).toBeInTheDocument();
    expect(screen.getByText("h")).toBeInTheDocument();
  });

  it("handles direct typing and clearing to null", () => {
    const handleChange = vi.fn();
    render(<NumberInput value={10} onChange={handleChange} />);

    const input = screen.getByDisplayValue("10");
    fireEvent.change(input, { target: { value: "25.5" } });
    expect(handleChange).toHaveBeenCalledWith(25.5);

    fireEvent.change(input, { target: { value: "" } });
    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it("increments value by step using plus button", () => {
    const handleChange = vi.fn();
    render(
      <NumberInput
        label="Hours"
        value={15.5}
        step={0.5}
        onChange={handleChange}
      />,
    );

    const plusBtn = screen.getByRole("button", { name: /Increase Hours/i });
    fireEvent.click(plusBtn);
    expect(handleChange).toHaveBeenCalledWith(16);
  });

  it("decrements value by step using minus button", () => {
    const handleChange = vi.fn();
    render(
      <NumberInput
        label="Hours"
        value={16}
        step={0.5}
        onChange={handleChange}
      />,
    );

    const minusBtn = screen.getByRole("button", { name: /Decrease Hours/i });
    fireEvent.click(minusBtn);
    expect(handleChange).toHaveBeenCalledWith(15.5);
  });

  it("respects min and max bounds", () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <NumberInput
        label="Playthroughs"
        value={1}
        min={1}
        max={3}
        onChange={handleChange}
      />,
    );

    const minusBtn = screen.getByRole("button", { name: /Decrease Playthroughs/i });
    const plusBtn = screen.getByRole("button", { name: /Increase Playthroughs/i });

    expect(minusBtn).toBeDisabled();
    expect(plusBtn).not.toBeDisabled();

    rerender(
      <NumberInput
        label="Playthroughs"
        value={3}
        min={1}
        max={3}
        onChange={handleChange}
      />,
    );
    expect(plusBtn).toBeDisabled();
    expect(minusBtn).not.toBeDisabled();
  });

  it("handles keyboard ArrowUp and ArrowDown inside input", () => {
    const handleChange = vi.fn();
    render(
      <NumberInput
        value={5}
        step={1}
        onChange={handleChange}
      />,
    );

    const input = screen.getByDisplayValue("5");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(handleChange).toHaveBeenCalledWith(6);

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it("starts at min ?? 0 when clicking plus from null value", () => {
    const handleChange = vi.fn();
    render(
      <NumberInput
        label="New Field"
        value={null}
        min={5}
        step={1}
        onChange={handleChange}
      />,
    );

    const plusBtn = screen.getByRole("button", { name: /Increase New Field/i });
    fireEvent.click(plusBtn);
    expect(handleChange).toHaveBeenCalledWith(6);
  });
});
