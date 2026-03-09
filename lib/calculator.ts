/**
 * Pure calculator logic — no side effects, fully testable.
 */

export type Operator = '+' | '-' | '×' | '÷';

export interface CalculatorState {
  /** The value shown in the main display */
  displayValue: string;
  /** The expression shown above the main value (e.g. "9 × 14 =") */
  expression: string;
  /** The first operand, stored as a number */
  firstOperand: number | null;
  /** The operator that was pressed */
  operator: Operator | null;
  /** True while the user is entering the second operand */
  waitingForSecondOperand: boolean;
  /** True after = was pressed — next digit starts fresh */
  justEvaluated: boolean;
  /** True when a division-by-zero or other error occurred */
  isError: boolean;
  /** The operator used in the last evaluation — enables repeated = */
  lastOperator: Operator | null;
  /** The second operand used in the last evaluation — enables repeated = */
  lastSecondOperand: number | null;
}

export const initialState: CalculatorState = {
  displayValue: '0',
  expression: '',
  firstOperand: null,
  operator: null,
  waitingForSecondOperand: false,
  justEvaluated: false,
  isError: false,
  lastOperator: null,
  lastSecondOperand: null,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format a numeric result for display.
 * - Strips unnecessary trailing zeros after the decimal point.
 * - Caps at 12 significant digits to avoid floating-point noise.
 */
export function formatResult(value: number): string {
  if (!isFinite(value)) return 'Error';

  // Use toPrecision to limit significant digits, then strip trailing zeros.
  const raw = parseFloat(value.toPrecision(12)).toString();

  // If the number is too long even after toPrecision, fall back to exponential
  if (raw.length > 15) {
    return value.toExponential(6);
  }

  return raw;
}

// ---------------------------------------------------------------------------
// Input handlers — each returns a *new* state object
// ---------------------------------------------------------------------------

/** Handle a digit button (0-9). */
export function inputDigit(
  state: CalculatorState,
  digit: string,
): CalculatorState {
  if (state.isError) return state;

  const { displayValue, waitingForSecondOperand, justEvaluated } = state;

  // After evaluation, a new digit starts a fresh entry
  if (justEvaluated) {
    return {
      ...state,
      displayValue: digit,
      expression: '',
      justEvaluated: false,
      firstOperand: null,
      operator: null,
      waitingForSecondOperand: false,
    };
  }

  if (waitingForSecondOperand) {
    return {
      ...state,
      displayValue: digit,
      waitingForSecondOperand: false,
    };
  }

  // Prevent adding more digits once the display is 12 chars long
  if (displayValue.replace('-', '').replace('.', '').length >= 12) {
    return state;
  }

  const newValue =
    displayValue === '0' ? digit : displayValue + digit;

  return { ...state, displayValue: newValue };
}

/** Handle the decimal point button. */
export function inputDecimal(state: CalculatorState): CalculatorState {
  if (state.isError) return state;

  const { displayValue, waitingForSecondOperand, justEvaluated } = state;

  if (justEvaluated) {
    return {
      ...state,
      displayValue: '0.',
      expression: '',
      justEvaluated: false,
      firstOperand: null,
      operator: null,
      waitingForSecondOperand: false,
    };
  }

  if (waitingForSecondOperand) {
    return { ...state, displayValue: '0.', waitingForSecondOperand: false };
  }

  if (!displayValue.includes('.')) {
    return { ...state, displayValue: displayValue + '.' };
  }

  return state;
}

/** Handle an operator button (+, -, ×, ÷). */
export function inputOperator(
  state: CalculatorState,
  nextOperator: Operator,
): CalculatorState {
  if (state.isError) return state;

  const { displayValue, firstOperand, operator, waitingForSecondOperand, justEvaluated } =
    state;

  const inputValue = parseFloat(displayValue);

  // If an operator is already pending and the user hasn't typed a second
  // operand yet, just update the operator (no computation yet).
  if (waitingForSecondOperand) {
    return {
      ...state,
      operator: nextOperator,
      expression: `${formatResult(firstOperand!)} ${nextOperator}`,
    };
  }

  if (firstOperand === null || justEvaluated) {
    // First operand — just store it
    return {
      ...state,
      firstOperand: inputValue,
      operator: nextOperator,
      waitingForSecondOperand: true,
      justEvaluated: false,
      expression: `${formatResult(inputValue)} ${nextOperator}`,
    };
  }

  // Chain calculation: evaluate the pending operation first
  const result = evaluate(firstOperand, inputValue, operator!);

  if (result === null) {
    return {
      ...initialState,
      isError: true,
      displayValue: 'Error',
      expression: `${formatResult(firstOperand)} ${operator} ${formatResult(inputValue)} =`,
    };
  }

  return {
    ...state,
    displayValue: formatResult(result),
    firstOperand: result,
    operator: nextOperator,
    waitingForSecondOperand: true,
    justEvaluated: false,
    expression: `${formatResult(result)} ${nextOperator}`,
  };
}

/** Handle the equals button. */
export function inputEquals(state: CalculatorState): CalculatorState {
  if (state.isError) return state;

  const {
    displayValue,
    firstOperand,
    operator,
    waitingForSecondOperand,
    justEvaluated,
    lastOperator,
    lastSecondOperand,
  } = state;

  // Repeated = — replay the last operation using the stored operator and second operand
  if (justEvaluated && lastOperator !== null && lastSecondOperand !== null) {
    const base = parseFloat(displayValue);
    const expressionStr = `${formatResult(base)} ${lastOperator} ${formatResult(lastSecondOperand)} =`;
    const result = evaluate(base, lastSecondOperand, lastOperator);

    if (result === null) {
      return {
        ...initialState,
        isError: true,
        displayValue: 'Error',
        expression: expressionStr,
      };
    }

    return {
      ...state,
      displayValue: formatResult(result),
      expression: expressionStr,
      firstOperand: result,
      operator: null,
      waitingForSecondOperand: false,
      justEvaluated: true,
      lastOperator,
      lastSecondOperand,
    };
  }

  // Nothing to evaluate
  if (firstOperand === null || operator === null) {
    return { ...state, expression: `${displayValue} =`, justEvaluated: true };
  }

  const secondOperand = waitingForSecondOperand
    ? parseFloat(displayValue) // edge: operator then = immediately
    : parseFloat(displayValue);

  const expressionStr = `${formatResult(firstOperand)} ${operator} ${formatResult(secondOperand)} =`;

  const result = evaluate(firstOperand, secondOperand, operator);

  if (result === null) {
    return {
      ...initialState,
      isError: true,
      displayValue: 'Error',
      expression: expressionStr,
    };
  }

  return {
    ...state,
    displayValue: formatResult(result),
    expression: expressionStr,
    firstOperand: result,
    operator: null,
    waitingForSecondOperand: false,
    justEvaluated: true,
    lastOperator: operator,
    lastSecondOperand: secondOperand,
  };
}

/** Handle the % button — converts current value to percentage. */
export function inputPercent(state: CalculatorState): CalculatorState {
  if (state.isError) return state;

  const value = parseFloat(state.displayValue);
  const result = value / 100;
  return { ...state, displayValue: formatResult(result) };
}

/** Handle the +/- (negate) button. */
export function inputNegate(state: CalculatorState): CalculatorState {
  if (state.isError) return state;

  const value = parseFloat(state.displayValue);
  if (value === 0) return state;
  return { ...state, displayValue: formatResult(-value) };
}

/** Handle the backspace button. */
export function inputBackspace(state: CalculatorState): CalculatorState {
  if (state.isError) return { ...initialState };
  if (state.waitingForSecondOperand) return state;
  if (state.justEvaluated) return { ...initialState };

  const { displayValue } = state;

  if (displayValue.length === 1 || (displayValue.length === 2 && displayValue.startsWith('-'))) {
    return { ...state, displayValue: '0' };
  }

  return { ...state, displayValue: displayValue.slice(0, -1) };
}

/** Handle AC (all clear) — full reset. */
export function allClear(): CalculatorState {
  return { ...initialState, lastOperator: null, lastSecondOperand: null };
}

/** Handle C (clear entry) — clear only the current display value. */
export function clearEntry(state: CalculatorState): CalculatorState {
  if (state.isError) return { ...initialState };
  return { ...state, displayValue: '0', isError: false };
}

// ---------------------------------------------------------------------------
// Core arithmetic
// ---------------------------------------------------------------------------

/**
 * Evaluate a binary operation.
 * Returns null on division by zero.
 */
export function evaluate(
  a: number,
  b: number,
  operator: Operator,
): number | null {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      if (b === 0) return null;
      return a / b;
    default: {
      const _exhaustive: never = operator;
      throw new Error(`Unknown operator: ${_exhaustive}`);
    }
  }
}
