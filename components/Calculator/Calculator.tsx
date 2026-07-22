'use client';

import { useCallback, useEffect, useReducer, useState } from 'react';
import Display from './Display';
import ButtonGrid from './ButtonGrid';
import HistoryPanel from './HistoryPanel';
import styles from './calculator.module.css';
import {
  CalculatorState,
  Operator,
  HistoryEntry,
  initialState,
  inputDigit,
  inputDecimal,
  inputOperator,
  inputEquals,
  inputPercent,
  inputNegate,
  inputBackspace,
  allClear,
  clearEntry,
  clearHistory,
  reuseHistoryEntry,
} from '@/lib/calculator';

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

type CalculatorAction =
  | { type: 'DIGIT'; payload: string }
  | { type: 'DECIMAL' }
  | { type: 'OPERATOR'; payload: Operator }
  | { type: 'EQUALS' }
  | { type: 'PERCENT' }
  | { type: 'NEGATE' }
  | { type: 'BACKSPACE' }
  | { type: 'CLEAR' }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'USE_HISTORY_ENTRY'; payload: HistoryEntry };

function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  switch (action.type) {
    case 'DIGIT':
      return inputDigit(state, action.payload);
    case 'DECIMAL':
      return inputDecimal(state);
    case 'OPERATOR':
      return inputOperator(state, action.payload);
    case 'EQUALS':
      return inputEquals(state);
    case 'PERCENT':
      return inputPercent(state);
    case 'NEGATE':
      return inputNegate(state);
    case 'BACKSPACE':
      return inputBackspace(state);
    case 'CLEAR':
      // AC when display is "0", otherwise C
      return state.displayValue === '0' && !state.operator && !state.firstOperand
        ? allClear(state)
        : clearEntry(state);
    case 'CLEAR_HISTORY':
      return clearHistory(state);
    case 'USE_HISTORY_ENTRY':
      return reuseHistoryEntry(state, action.payload);
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Calculator() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  // UI-only state: opening/closing the panel never touches the reducer, so it
  // provably cannot mutate the current calculation.
  const [historyOpen, setHistoryOpen] = useState(false);

  // Derived helpers
  const isZero =
    state.displayValue === '0' && !state.operator && !state.firstOperand;

  // ------------------------------------------------------------------
  // Keyboard support
  // ------------------------------------------------------------------
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore modifier combos (e.g. Ctrl+R, Cmd+Z)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // While the history panel is open, the calculator keyboard is inert.
      // Escape closes the panel; nothing else reaches the reducer, so the
      // current calculation is left untouched.
      if (historyOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setHistoryOpen(false);
        }
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        dispatch({ type: 'DIGIT', payload: e.key });
      } else if (e.key === '.') {
        e.preventDefault();
        dispatch({ type: 'DECIMAL' });
      } else if (e.key === '+') {
        e.preventDefault();
        dispatch({ type: 'OPERATOR', payload: '+' });
      } else if (e.key === '-') {
        e.preventDefault();
        dispatch({ type: 'OPERATOR', payload: '-' });
      } else if (e.key === '*') {
        e.preventDefault();
        dispatch({ type: 'OPERATOR', payload: '×' });
      } else if (e.key === '/') {
        e.preventDefault();
        dispatch({ type: 'OPERATOR', payload: '÷' });
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        dispatch({ type: 'EQUALS' });
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        dispatch({ type: 'BACKSPACE' });
      } else if (e.key === 'Escape') {
        e.preventDefault();
        dispatch({ type: 'CLEAR' });
      } else if (e.key === '%') {
        e.preventDefault();
        dispatch({ type: 'PERCENT' });
      }
    },
    [historyOpen],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ------------------------------------------------------------------
  // Stable callbacks — memoised to avoid unnecessary re-renders of ButtonGrid
  // ------------------------------------------------------------------
  const handleDigit = useCallback(
    (d: string) => dispatch({ type: 'DIGIT', payload: d }),
    [],
  );
  const handleDecimal = useCallback(
    () => dispatch({ type: 'DECIMAL' }),
    [],
  );
  const handleOperator = useCallback(
    (op: Operator) => dispatch({ type: 'OPERATOR', payload: op }),
    [],
  );
  const handleEquals = useCallback(
    () => dispatch({ type: 'EQUALS' }),
    [],
  );
  const handlePercent = useCallback(
    () => dispatch({ type: 'PERCENT' }),
    [],
  );
  const handleNegate = useCallback(
    () => dispatch({ type: 'NEGATE' }),
    [],
  );
  const handleBackspace = useCallback(
    () => dispatch({ type: 'BACKSPACE' }),
    [],
  );
  const handleAllClear = useCallback(
    () => dispatch({ type: 'CLEAR' }),
    [],
  );
  const handleClearHistory = useCallback(
    () => dispatch({ type: 'CLEAR_HISTORY' }),
    [],
  );
  const handleUseHistoryEntry = useCallback(
    (entry: HistoryEntry) => dispatch({ type: 'USE_HISTORY_ENTRY', payload: entry }),
    [],
  );

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className={styles.calculator} role="application" aria-label="Calculadora">
      <div className={styles.header}>
        <button
          type="button"
          className={styles.historyToggle}
          onClick={() => setHistoryOpen((open) => !open)}
          aria-label="Historial"
          aria-expanded={historyOpen}
        >
          🕘
        </button>
      </div>

      <Display
        value={state.displayValue}
        expression={state.expression}
        isError={state.isError}
      />
      <ButtonGrid
        isZero={isZero}
        activeOperator={state.operator}
        waitingForSecondOperand={state.waitingForSecondOperand}
        onDigit={handleDigit}
        onDecimal={handleDecimal}
        onOperator={handleOperator}
        onEquals={handleEquals}
        onPercent={handlePercent}
        onNegate={handleNegate}
        onBackspace={handleBackspace}
        onClear={handleAllClear}
      />

      <HistoryPanel
        entries={state.history}
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleUseHistoryEntry}
        onClear={handleClearHistory}
      />
    </div>
  );
}
