import { useState } from "react";

export interface UseCounterOptions {
  /**
   * 初期値
   */
  initialValue?: number;
  /**
   * 最小値
   */
  min?: number;
  /**
   * 最大値
   */
  max?: number;
  /**
   * ステップ値
   */
  step?: number;
}

export interface UseCounterReturn {
  /**
   * カウンター値
   */
  count: number;
  /**
   * カウンターをインクリメントする関数
   */
  increment: () => void;
  /**
   * カウンターをデクリメントする関数
   */
  decrement: () => void;
  /**
   * カウンターをリセットする関数
   */
  reset: () => void;
}

/**
 * カウンター機能を提供するカスタムフックですわ
 */
export function useCounter({
  initialValue = 0,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
}: UseCounterOptions = {}): UseCounterReturn {
  const [count, setCount] = useState(initialValue);

  const increment = () => {
    setCount((prev) => Math.min(prev + step, max));
  };

  const decrement = () => {
    setCount((prev) => Math.max(prev - step, min));
  };

  const reset = () => {
    setCount(initialValue);
  };

  return {
    count,
    increment,
    decrement,
    reset,
  };
}
