import type React from "react";

export interface ButtonProps {
  /**
   * ボタンのテキスト
   */
  children: React.ReactNode;
  /**
   * クリック時のハンドラー
   */
  onClick?: () => void;
  /**
   * ボタンの種類
   */
  variant?: "primary" | "secondary" | "danger";
  /**
   * 無効状態
   */
  disabled?: boolean;
}

/**
 * 汎用的なボタンコンポーネントですわ
 */
export function Button({ children, onClick, variant = "primary", disabled = false }: ButtonProps) {
  const baseClasses = "px-4 py-2 rounded font-medium focus:outline-none";

  const variantClasses = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses}`}
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
    >
      {children}
    </button>
  );
}
