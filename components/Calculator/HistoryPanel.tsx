import { memo } from 'react';
import styles from './calculator.module.css';
import type { HistoryEntry } from '@/lib/calculator';

interface HistoryPanelProps {
  entries: HistoryEntry[];
  isOpen: boolean;
  /** Close the panel without touching the calculator state. */
  onClose: () => void;
  /** Reuse a past result as the current value. */
  onSelect: (entry: HistoryEntry) => void;
  /** Clear all history entries. */
  onClear: () => void;
}

/**
 * Presentational panel that overlays the calculator to show the operation
 * history. Purely driven by props — it never owns calculator state, so opening
 * or closing it cannot affect the current calculation.
 */
function HistoryPanel({
  entries,
  isOpen,
  onClose,
  onSelect,
  onClear,
}: HistoryPanelProps) {
  if (!isOpen) return null;

  return (
    <div
      className={styles.historyPanel}
      role="dialog"
      aria-modal="true"
      aria-label="Historial de operaciones"
    >
      <div className={styles.historyHeader}>
        <span className={styles.historyTitle}>Historial</span>
        <div className={styles.historyActions}>
          <button
            type="button"
            className={styles.historyClearBtn}
            onClick={onClear}
            disabled={entries.length === 0}
          >
            Borrar
          </button>
          <button
            type="button"
            className={styles.historyCloseBtn}
            onClick={onClose}
            aria-label="Cerrar historial"
          >
            ✕
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className={styles.historyEmpty}>Sin operaciones</p>
      ) : (
        <ul className={styles.historyList}>
          {entries.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                className={styles.historyItem}
                onClick={() => {
                  onSelect(entry);
                  onClose();
                }}
              >
                {entry.expression}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default memo(HistoryPanel);
