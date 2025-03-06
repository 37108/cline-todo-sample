import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCounter } from "./index";

describe("useCounter", () => {
  it("should be 0 when initialized with default values", () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it("should be 10 when initialized with initialValue 10", () => {
    const { result } = renderHook(() => useCounter({ initialValue: 10 }));
    expect(result.current.count).toBe(10);
  });

  it("should be 11 when increment is called with default step", () => {
    const { result } = renderHook(() => useCounter({ initialValue: 10 }));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(11);
  });

  it("should be 8 when decrement is called with default step", () => {
    const { result } = renderHook(() => useCounter({ initialValue: 10 }));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(9);
  });

  it("should be 10 when reset is called", () => {
    const { result } = renderHook(() => useCounter({ initialValue: 10 }));

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(10);
  });

  it("should be 15 when increment is called with step 5", () => {
    const { result } = renderHook(() => useCounter({ initialValue: 10, step: 5 }));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(15);
  });

  it("should be 5 when decrement is called with step 5", () => {
    const { result } = renderHook(() => useCounter({ initialValue: 10, step: 5 }));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(5);
  });

  it("should not exceed max value when increment is called", () => {
    const { result } = renderHook(() => useCounter({ initialValue: 8, max: 10 }));

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.increment();
    });

    expect(result.current.count).toBe(10);
  });

  it("should not go below min value when decrement is called", () => {
    const { result } = renderHook(() => useCounter({ initialValue: 2, min: 0 }));

    act(() => {
      result.current.decrement();
      result.current.decrement();
      result.current.decrement();
    });

    expect(result.current.count).toBe(0);
  });
});
