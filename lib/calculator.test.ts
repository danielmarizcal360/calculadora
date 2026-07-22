import { describe, expect, it } from 'vitest';
import {
  initialState,
  inputDigit,
  inputOperator,
  inputEquals,
  allClear,
  clearEntry,
  memoryAdd,
  memorySubtract,
  memoryRecall,
  memoryClear,
  CalculatorState,
} from './calculator';

function withDisplay(value: string): CalculatorState {
  return { ...initialState, displayValue: value };
}

describe('memoryAdd', () => {
  it('stores the current display value when memory is empty', () => {
    const state = memoryAdd(withDisplay('5'));
    expect(state.memory).toBe(5);
  });

  it('accumulates onto an existing memory value', () => {
    const state = memoryAdd(withDisplay('5'));
    const next = memoryAdd({ ...state, displayValue: '3' });
    expect(next.memory).toBe(8);
  });

  it('does not modify memory while in an error state', () => {
    const errored: CalculatorState = { ...withDisplay('Error'), isError: true, memory: 10 };
    const state = memoryAdd(errored);
    expect(state.memory).toBe(10);
  });
});

describe('memorySubtract', () => {
  it('subtracts from an empty memory (treated as 0)', () => {
    const state = memorySubtract(withDisplay('4'));
    expect(state.memory).toBe(-4);
  });

  it('subtracts the current display value from an existing memory value', () => {
    const state = memorySubtract({ ...withDisplay('3'), memory: 10 });
    expect(state.memory).toBe(7);
  });

  it('does not modify memory while in an error state', () => {
    const errored: CalculatorState = { ...withDisplay('Error'), isError: true, memory: 10 };
    const state = memorySubtract(errored);
    expect(state.memory).toBe(10);
  });
});

describe('memoryRecall', () => {
  it('does not modify state when no value is stored', () => {
    const state = withDisplay('42');
    expect(memoryRecall(state)).toBe(state);
  });

  it('sets the display to the stored value as a fresh entry', () => {
    const state = memoryRecall({ ...withDisplay('0'), memory: 7 });
    expect(state.displayValue).toBe('7');
    expect(state.firstOperand).toBeNull();
    expect(state.operator).toBeNull();
  });

  it('feeds the stored value as the pending second operand', () => {
    const pending = inputOperator(inputDigit(initialState, '9'), '+');
    const state = memoryRecall({ ...pending, memory: 4 });
    expect(state.displayValue).toBe('4');
    expect(state.waitingForSecondOperand).toBe(false);
    expect(state.firstOperand).toBe(9);
    expect(state.operator).toBe('+');
  });

  it('clears the error flag when recalling', () => {
    const errored: CalculatorState = { ...withDisplay('Error'), isError: true, memory: 2 };
    const state = memoryRecall(errored);
    expect(state.isError).toBe(false);
    expect(state.displayValue).toBe('2');
  });
});

describe('memoryClear', () => {
  it('clears a stored value', () => {
    const state = memoryClear({ ...withDisplay('1'), memory: 99 });
    expect(state.memory).toBeNull();
  });

  it('is a no-op when memory is already empty', () => {
    const state = memoryClear(withDisplay('1'));
    expect(state.memory).toBeNull();
  });
});

describe('memory persistence across resets and errors', () => {
  it('survives AC (allClear)', () => {
    const stored: CalculatorState = { ...withDisplay('1'), memory: 5 };
    expect(allClear(stored).memory).toBe(5);
  });

  it('survives C (clearEntry)', () => {
    const stored: CalculatorState = { ...withDisplay('1'), memory: 5 };
    expect(clearEntry(stored).memory).toBe(5);
  });

  it('is untouched by an operation that results in a division-by-zero error', () => {
    let state: CalculatorState = { ...initialState, memory: 5 };
    state = inputDigit(state, '8');
    state = inputOperator(state, '÷');
    state = inputDigit(state, '0');
    state = inputEquals(state);

    expect(state.isError).toBe(true);
    expect(state.memory).toBe(5);
  });
});
