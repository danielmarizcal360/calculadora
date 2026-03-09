import styles from './calculator.module.css';

interface DisplayProps {
  value: string;
  expression: string;
  isError: boolean;
}

/**
 * Derives a CSS class name for dynamic font-size reduction based on
 * the number of characters in the display value.
 */
function getValueSizeClass(value: string, isError: boolean): string {
  if (isError) return styles.isError;

  const len = value.replace('-', '').length;

  if (len > 12) return styles.sizeOverflow;
  if (len > 9) return styles.size10plus;
  if (len > 8) return styles.size9plus;
  return '';
}

export default function Display({ value, expression, isError }: DisplayProps) {
  const sizeClass = getValueSizeClass(value, isError);

  return (
    <div className={styles.display}>
      <div className={styles.displayExpression} aria-hidden="true">
        {expression}
      </div>
      {/* role="status" + aria-live so screen readers announce value changes */}
      <div
        className={`${styles.displayValue} ${sizeClass}`}
        role="status"
        aria-live="polite"
        aria-label={isError ? 'Error' : `Resultado: ${value}`}
      >
        {value}
      </div>
    </div>
  );
}
