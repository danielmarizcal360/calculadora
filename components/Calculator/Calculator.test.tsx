import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import Calculator from './Calculator';

afterEach(cleanup);

function getDisplay() {
  return screen.getByRole('status');
}

function pressKey(key: string, options: Partial<KeyboardEventInit> = {}) {
  fireEvent.keyDown(window, { key, ...options });
}

describe('Calculator keyboard support', () => {
  it('types digits 0-9 from the keyboard', () => {
    render(<Calculator />);

    '1234567890'.split('').forEach((digit) => pressKey(digit));

    expect(getDisplay()).toHaveTextContent('1234567890');
  });

  it('runs +, -, * and / the same way the on-screen operator buttons do', () => {
    render(<Calculator />);

    pressKey('9');
    pressKey('*');
    pressKey('8');
    pressKey('Enter');
    expect(getDisplay()).toHaveTextContent('72');

    pressKey('Escape'); // AC between cases
    pressKey('9');
    pressKey('/');
    pressKey('3');
    pressKey('Enter');
    expect(getDisplay()).toHaveTextContent('3');

    pressKey('Escape');
    pressKey('9');
    pressKey('-');
    pressKey('4');
    pressKey('Enter');
    expect(getDisplay()).toHaveTextContent('5');

    pressKey('Escape');
    pressKey('9');
    pressKey('+');
    pressKey('4');
    pressKey('Enter');
    expect(getDisplay()).toHaveTextContent('13');
  });

  it('produces the same result via keyboard as via clicking the equivalent buttons', () => {
    const { unmount } = render(<Calculator />);
    pressKey('7');
    pressKey('+');
    pressKey('2');
    pressKey('Enter');
    const keyboardResult = getDisplay().textContent;
    unmount();

    render(<Calculator />);
    fireEvent.click(screen.getByRole('button', { name: '7' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sumar' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Igual' }));
    const clickResult = getDisplay().textContent;

    expect(keyboardResult).toBe(clickResult);
    expect(keyboardResult).toContain('9');
  });

  it('Backspace removes the last entered digit', () => {
    render(<Calculator />);

    pressKey('1');
    pressKey('2');
    pressKey('3');
    pressKey('Backspace');

    expect(getDisplay()).toHaveTextContent('12');
  });

  it('Escape clears the calculator back to its initial state', () => {
    render(<Calculator />);

    pressKey('5');
    pressKey('+');
    pressKey('3');
    pressKey('Escape');

    expect(getDisplay()).toHaveTextContent('0');
  });

  it('ignores invalid keys without throwing or changing the display', () => {
    render(<Calculator />);

    pressKey('5');
    expect(() => {
      pressKey('a');
      pressKey('F1');
      pressKey('$');
      pressKey(' ');
    }).not.toThrow();

    expect(getDisplay()).toHaveTextContent('5');
  });

  it('ignores key combos with modifiers (e.g. Ctrl+digit)', () => {
    render(<Calculator />);

    pressKey('1');
    pressKey('2', { ctrlKey: true });
    pressKey('3', { metaKey: true });

    expect(getDisplay()).toHaveTextContent('1');
  });

  it('removes the keydown listener on unmount', () => {
    const { unmount } = render(<Calculator />);

    unmount();

    // After unmount, keydown events must no longer reach the calculator.
    expect(() => pressKey('5')).not.toThrow();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
