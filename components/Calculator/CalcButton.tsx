import styles from './calculator.module.css';

export type ButtonVariant = 'number' | 'operator' | 'function';

interface CalcButtonProps {
  label: string;
  /** Accessible label for symbolic buttons (e.g. aria-label="dividir") */
  ariaLabel?: string;
  variant: ButtonVariant;
  /** True when this operator button is in the "active" state */
  isOperatorActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export default function CalcButton({
  label,
  ariaLabel,
  variant,
  isOperatorActive = false,
  disabled = false,
  onClick,
}: CalcButtonProps) {
  const variantClass = styles[variant];
  const activeClass = isOperatorActive ? styles.operatorActive : '';

  return (
    <button
      className={`${styles.button} ${variantClass} ${activeClass}`}
      aria-label={ariaLabel ?? label}
      disabled={disabled}
      onClick={onClick}
      // Prevent double-fire on Enter keypress when button has focus —
      // the keyboard handler in Calculator.tsx manages Enter globally.
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
