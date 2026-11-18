/**
 * Typing Boss - Interactive On-Screen Virtual Keyboard
 * Provides real-time key glow feedback and next-key visual finger guidance.
 */

export class VirtualKeyboard {
  constructor(containerElement) {
    this.container = containerElement;
    this.keyElementsMap = new Map();
    this.visible = true;
    this.nextKeyGuide = true;
    this.initLayout();
  }

  initLayout() {
    if (!this.container) return;

    const rows = [
      [
        { code: 'Backquote', label: '`', shift: '~' },
        { code: 'Digit1', label: '1', shift: '!' },
        { code: 'Digit2', label: '2', shift: '@' },
        { code: 'Digit3', label: '3', shift: '#' },
        { code: 'Digit4', label: '4', shift: '$' },
        { code: 'Digit5', label: '5', shift: '%' },
        { code: 'Digit6', label: '6', shift: '^' },
        { code: 'Digit7', label: '7', shift: '&' },
        { code: 'Digit8', label: '8', shift: '*' },
        { code: 'Digit9', label: '9', shift: '(' },
        { code: 'Digit0', label: '0', shift: ')' },
        { code: 'Minus', label: '-', shift: '_' },
        { code: 'Equal', label: '=', shift: '+' },
        { code: 'Backspace', label: 'Backspace', width: 'key-w-wide' }
      ],
      [
        { code: 'Tab', label: 'Tab', width: 'key-w-tab' },
        { code: 'KeyQ', label: 'Q' },
        { code: 'KeyW', label: 'W' },
        { code: 'KeyE', label: 'E' },
        { code: 'KeyR', label: 'R' },
        { code: 'KeyT', label: 'T' },
        { code: 'KeyY', label: 'Y' },
        { code: 'KeyU', label: 'U' },
        { code: 'KeyI', label: 'I' },
        { code: 'KeyO', label: 'O' },
        { code: 'KeyP', label: 'P' },
        { code: 'BracketLeft', label: '[', shift: '{' },
        { code: 'BracketRight', label: ']', shift: '}' },
        { code: 'Backslash', label: '\\', shift: '|' }
      ],
      [
        { code: 'CapsLock', label: 'Caps', width: 'key-w-caps' },
        { code: 'KeyA', label: 'A' },
        { code: 'KeyS', label: 'S' },
        { code: 'KeyD', label: 'D' },
        { code: 'KeyF', label: 'F' },
        { code: 'KeyG', label: 'G' },
        { code: 'KeyH', label: 'H' },
        { code: 'KeyJ', label: 'J' },
        { code: 'KeyK', label: 'K' },
        { code: 'KeyL', label: 'L' },
        { code: 'Semicolon', label: ';', shift: ':' },
        { code: 'Quote', label: "'", shift: '"' },
        { code: 'Enter', label: 'Enter', width: 'key-w-enter' }
      ],
      [
        { code: 'ShiftLeft', label: 'Shift', width: 'key-w-shift' },
        { code: 'KeyZ', label: 'Z' },
        { code: 'KeyX', label: 'X' },
        { code: 'KeyC', label: 'C' },
        { code: 'KeyV', label: 'V' },
        { code: 'KeyB', label: 'B' },
        { code: 'KeyN', label: 'N' },
        { code: 'KeyM', label: 'M' },
        { code: 'Comma', label: ',', shift: '<' },
        { code: 'Period', label: '.', shift: '>' },
        { code: 'Slash', label: '/', shift: '?' },
        { code: 'ShiftRight', label: 'Shift', width: 'key-w-shift' }
      ],
      [
        { code: 'ControlLeft', label: 'Ctrl', width: 'key-w-mod' },
        { code: 'AltLeft', label: 'Alt', width: 'key-w-mod' },
        { code: 'Space', label: 'Spacebar', width: 'key-w-space' },
        { code: 'AltRight', label: 'Alt', width: 'key-w-mod' },
        { code: 'ControlRight', label: 'Ctrl', width: 'key-w-mod' }
      ]
    ];

    this.container.innerHTML = '';
    this.keyElementsMap.clear();

    rows.forEach(row => {
      const rowEl = document.createElement('div');
      rowEl.className = 'keyboard-row';

      row.forEach(key => {
        const keyEl = document.createElement('div');
        keyEl.className = `keyboard-key ${key.width || ''}`;
        keyEl.dataset.code = key.code;

        if (key.shift) {
          keyEl.innerHTML = `<span class="shift-char">${key.shift}</span><span class="main-char">${key.label}</span>`;
        } else {
          keyEl.innerHTML = `<span class="main-char">${key.label}</span>`;
        }

        rowEl.appendChild(keyEl);
        this.keyElementsMap.set(key.code, keyEl);
      });

      this.container.appendChild(rowEl);
    });
  }

  pressKey(code) {
    const el = this.keyElementsMap.get(code);
    if (el) {
      el.classList.add('key-active');
    }
  }

  releaseKey(code) {
    const el = this.keyElementsMap.get(code);
    if (el) {
      el.classList.remove('key-active');
    }
  }

  highlightNextChar(char) {
    if (!this.nextKeyGuide) return;

    // Clear previous guide
    this.keyElementsMap.forEach(el => el.classList.remove('key-target', 'key-shift-target'));

    if (!char) return;

    const { code, requiresShift } = this.charToKeyCode(char);
    if (code) {
      const el = this.keyElementsMap.get(code);
      if (el) el.classList.add('key-target');

      if (requiresShift) {
        const shiftLeft = this.keyElementsMap.get('ShiftLeft');
        if (shiftLeft) shiftLeft.classList.add('key-shift-target');
      }
    }
  }

  charToKeyCode(char) {
    if (char === ' ') return { code: 'Space', requiresShift: false };

    // Standard alphabet
    if (/^[a-z]$/.test(char)) {
      return { code: `Key${char.toUpperCase()}`, requiresShift: false };
    }
    if (/^[A-Z]$/.test(char)) {
      return { code: `Key${char}`, requiresShift: true };
    }
    // Digits
    if (/^[0-9]$/.test(char)) {
      return { code: `Digit${char}`, requiresShift: false };
    }
    // Shifted symbols
    const shiftMap = {
      '~': 'Backquote', '!': 'Digit1', '@': 'Digit2', '#': 'Digit3',
      '$': 'Digit4', '%': 'Digit5', '^': 'Digit6', '&': 'Digit7',
      '*': 'Digit8', '(': 'Digit9', ')': 'Digit0', '_': 'Minus',
      '+': 'Equal', '{': 'BracketLeft', '}': 'BracketRight', '|': 'Backslash',
      ':': 'Semicolon', '"': 'Quote', '<': 'Comma', '>': 'Period', '?': 'Slash'
    };
    if (shiftMap[char]) {
      return { code: shiftMap[char], requiresShift: true };
    }

    // Unshifted symbols
    const unshiftMap = {
      '`': 'Backquote', '-': 'Minus', '=': 'Equal', '[': 'BracketLeft',
      ']': 'BracketRight', '\\': 'Backslash', ';': 'Semicolon', "'": 'Quote',
      ',': 'Comma', '.': 'Period', '/': 'Slash'
    };
    if (unshiftMap[char]) {
      return { code: unshiftMap[char], requiresShift: false };
    }

    return { code: null, requiresShift: false };
  }

  toggleVisibility(show) {
    this.visible = show !== undefined ? show : !this.visible;
    if (this.container) {
      this.container.parentElement.style.display = this.visible ? 'block' : 'none';
    }
    return this.visible;
  }
}
