import React from 'react';
import CalcButton, { ButtonVariant } from './CalcButton';
import styles from './calculator.module.css';
import { Operator } from '@/lib/calculator';

interface ButtonGridProps {
  /** Whether the display is showing "0" or not — controls AC vs C label */
  isZero: boolean;
  /** Which operator (if any) is currently in "active" state */
  activeOperator: Operator | null;
  /** True if we are waiting for the second operand after an operator press */
  waitingForSecondOperand: boolean;
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onOperator: (op: Operator) => void;
  onEquals: () => void;
  onPercent: () => void;
  onNegate: () => void;
  onBackspace: () => void;
  onClear: () => void;
}

interface ButtonDef {
  label: string;
  ariaLabel?: string;
  variant: ButtonVariant;
  action: () => void;
  /** The Operator value this button represents, for active-state comparison */
  operatorValue?: Operator;
}

function ButtonGrid({
  isZero,
  activeOperator,
  waitingForSecondOperand,
  onDigit,
  onDecimal,
  onOperator,
  onEquals,
  onPercent,
  onNegate,
  onBackspace,
  onClear,
}: ButtonGridProps) {
  const clearLabel = isZero ? 'AC' : 'C';

  // Row-major definition matching the 5×4 grid spec:
  // [ AC/C ][ +/- ][  %  ][  ÷  ]
  // [  7   ][  8  ][  9  ][  ×  ]
  // [  4   ][  5  ][  6  ][  −  ]
  // [  1   ][  2  ][  3  ][  +  ]
  // [  0   ][  .  ][  ⌫  ][  =  ]
  const buttons: ButtonDef[] = [
    // Row 1
    {
      label: clearLabel,
      ariaLabel: isZero ? 'Borrar todo' : 'Borrar entrada',
      variant: 'function',
      action: onClear,
    },
    {
      label: '+/-',
      ariaLabel: 'Cambiar signo',
      variant: 'function',
      action: onNegate,
    },
    {
      label: '%',
      ariaLabel: 'Porcentaje',
      variant: 'function',
      action: onPercent,
    },
    {
      label: '÷',
      ariaLabel: 'Dividir',
      variant: 'operator',
      operatorValue: '÷',
      action: () => onOperator('÷'),
    },
    // Row 2
    { label: '7', variant: 'number', action: () => onDigit('7') },
    { label: '8', variant: 'number', action: () => onDigit('8') },
    { label: '9', variant: 'number', action: () => onDigit('9') },
    {
      label: '×',
      ariaLabel: 'Multiplicar',
      variant: 'operator',
      operatorValue: '×',
      action: () => onOperator('×'),
    },
    // Row 3
    { label: '4', variant: 'number', action: () => onDigit('4') },
    { label: '5', variant: 'number', action: () => onDigit('5') },
    { label: '6', variant: 'number', action: () => onDigit('6') },
    {
      label: '−',
      ariaLabel: 'Restar',
      variant: 'operator',
      operatorValue: '-',
      action: () => onOperator('-'),
    },
    // Row 4
    { label: '1', variant: 'number', action: () => onDigit('1') },
    { label: '2', variant: 'number', action: () => onDigit('2') },
    { label: '3', variant: 'number', action: () => onDigit('3') },
    {
      label: '+',
      ariaLabel: 'Sumar',
      variant: 'operator',
      operatorValue: '+',
      action: () => onOperator('+'),
    },
    // Row 5
    { label: '0', variant: 'number', action: () => onDigit('0') },
    {
      label: '.',
      ariaLabel: 'Punto decimal',
      variant: 'number',
      action: onDecimal,
    },
    {
      label: '⌫',
      ariaLabel: 'Borrar último dígito',
      variant: 'number',
      action: onBackspace,
    },
    {
      label: '=',
      ariaLabel: 'Igual',
      variant: 'operator',
      action: onEquals,
    },
  ];

  return (
    <div className={styles.buttonGrid}>
      {buttons.map((btn) => {
        // Determine if this operator button should show the "active" highlight
        const isOperatorActive =
          btn.variant === 'operator' &&
          btn.label !== '=' &&
          waitingForSecondOperand &&
          activeOperator === (btn.operatorValue ?? btn.label as Operator);

        return (
          <CalcButton
            key={btn.label}
            label={btn.label}
            ariaLabel={btn.ariaLabel}
            variant={btn.variant}
            isOperatorActive={isOperatorActive}
            onClick={btn.action}
          />
        );
      })}
    </div>
  );
}

export default React.memo(ButtonGrid);
