import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./index";

describe("Button", () => {
  it("should be rendered with children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByTestId("button")).toHaveTextContent("Click me");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByTestId("button")).toBeDisabled();
  });

  it("should call onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByTestId("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should not call onClick handler when disabled and clicked", () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>,
    );

    fireEvent.click(screen.getByTestId("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should have primary variant classes by default", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByTestId("button")).toHaveClass("bg-blue-500");
  });

  it("should have secondary variant classes when variant is secondary", () => {
    render(<Button variant="secondary">Click me</Button>);
    expect(screen.getByTestId("button")).toHaveClass("bg-gray-200");
  });

  it("should have danger variant classes when variant is danger", () => {
    render(<Button variant="danger">Click me</Button>);
    expect(screen.getByTestId("button")).toHaveClass("bg-red-500");
  });
});
