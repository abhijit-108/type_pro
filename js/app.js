/**
 * Typing Boss - Main Application Orchestrator
 * High-performance exam-grade typing engine with liquid glass aesthetics,
 * visible 3-4 line typing box below master passage, 10s auto-pause,
 * multi-word backspacing, and comprehensive SSC/Banking metrics.
 */

import { OFFLINE_PASSAGES, PASSAGE_CATEGORIES, fetchOnlinePassage, getRandomOfflinePassage } from './passages.js?v=1.5';
import { TypingEvaluator } from './evaluator.js?v=1.5';
import { sound } from './audio.js?v=1.5';
import { PerformanceChart } from './chart.js?v=1.5';

class TypingBossApp {
  constructor() {
    // Application State
    this.state = 'idle'; // 'idle' | 'running' | 'auto_paused' | 'finished'
    this.mode = 'ssc'; // 'ssc' | 'banking' | 'practice'
    this.duration = 900; // default 15 minutes (900s)
    this.remainingSeconds = 900;
    this.elapsedSeconds = 0;
    this.timerInterval = null;
    
    // Auto-pause parameters
    this.inactivitySeconds = 0;
    this.inactivityThreshold = 10; // Auto-pause triggered after 10 seconds of no typing
    this.inactivityCheckInterval = null;
    this.lastKeystrokeTimestamp = 0;

    // Passage data
    this.currentPassage = null;
    this.masterText = '';
    this.masterWords = [];
    
    // Typing tracking
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;
    this.typedWords = []; // array of submitted strings for each word
    this.currentInputWord = '';
    this.totalKeystrokes = 0;
    this.backspaceCount = 0;

    // High-performance DOM node caching
    this.wordElements = []; // array of HTMLSpanElement for each master word
    this.charElements = []; // 2D array: charElements[wordIdx][charIdx]
    this.spaceElements = []; // array of space spans for each word
    
    // Configuration options
    this.settings = {
      backspaceMode: 'enabled', // 'enabled' | 'word-lock' | 'disabled'
      autoScroll: true,
      soundTheme: 'mechanical',
      volume: 0.35,
      sscCategory: 'ur',
      speedTarget: 35
    };

    // Performance Timeline for charts
    this.timeline = []; // [{ second, grossWpm, netWpm, errors }]
    
    // History
    this.history = this.loadHistory();

    // DOM Elements Cache
    this.initDOMElements();
    
    // Instantiate components
    this.chart = new PerformanceChart(this.dom.resultChartCanvas);

    // Event Bindings
    this.bindEvents();

    // Load initial passage
    this.loadPassage('ssc');
    this.applySettingsToUI();
  }

  initDOMElements() {
    this.dom = {
      // Containers & Panes
      appContainer: document.getElementById('app-container'),
      textDisplay: document.getElementById('text-display'),
      masterPassageView: document.getElementById('master-passage-view'),
      typingInputBox: document.getElementById('typing-input-box'),
      typingWordCounter: document.getElementById('typing-word-counter'),

      // Overlays
      autoPauseOverlay: document.getElementById('auto-pause-overlay'),
      resumeBtn: document.getElementById('btn-resume-autopause'),
      resultModal: document.getElementById('result-modal'),
      closeResultBtn: document.getElementById('btn-close-result'),
      restartBtn: document.getElementById('btn-restart-test'),
      newPassageBtn: document.getElementById('btn-new-passage'),
      onlinePassageBtn: document.getElementById('btn-online-passage'),
      customPassageModal: document.getElementById('custom-passage-modal'),
      historyModal: document.getElementById('history-modal'),

      // Slim Stats Bar
      timerDisplay: document.getElementById('stat-timer'),
      grossWpmDisplay: document.getElementById('stat-gross-wpm'),
      netWpmDisplay: document.getElementById('stat-net-wpm'),
      accuracyDisplay: document.getElementById('stat-accuracy'),
      keystrokeDisplay: document.getElementById('stat-keystrokes'),
      errorsDisplay: document.getElementById('stat-errors'),
      kdphDisplay: document.getElementById('stat-kdph'),
      progressFill: document.getElementById('passage-progress-fill'),
      passageTitleBadge: document.getElementById('passage-title-badge'),
      passageTargetInfo: document.getElementById('passage-target-info'),

      // Control Toolbar
      modeSelect: document.getElementById('select-mode'),
      durationSelect: document.getElementById('select-duration'),
      backspaceToggleBtn: document.getElementById('btn-toggle-backspace'),
      autoScrollToggleBtn: document.getElementById('btn-toggle-autoscroll'),
      soundToggleBtn: document.getElementById('btn-toggle-sound'),
      btnOpenCustomModal: document.getElementById('btn-open-custom-modal'),
      btnOpenHistoryModal: document.getElementById('btn-open-history-modal'),

      // Custom Passage Form
      customTextInput: document.getElementById('custom-text-input'),
      btnApplyCustomText: document.getElementById('btn-apply-custom-text'),
      btnCloseCustomModal: document.getElementById('btn-close-custom-modal'),

      // History
      historyTableBody: document.getElementById('history-table-body'),
      btnClearHistory: document.getElementById('btn-clear-history'),
      btnCloseHistoryModal: document.getElementById('btn-close-history-modal'),

      // Results Elements
      resultVerdictBanner: document.getElementById('result-verdict-banner'),
      resultGrossWpm: document.getElementById('res-gross-wpm'),
      resultNetWpm: document.getElementById('res-net-wpm'),
      resultAccuracy: document.getElementById('res-accuracy'),
      resultKeystrokes: document.getElementById('res-keystrokes'),
      resultErrorPct: document.getElementById('res-error-pct'),
      resultFullMistakes: document.getElementById('res-full-mistakes'),
      resultHalfMistakes: document.getElementById('res-half-mistakes'),
      resultBackspaces: document.getElementById('res-backspaces'),
      resultTimeTaken: document.getElementById('res-time-taken'),
      resultChartCanvas: document.getElementById('result-chart-canvas'),
      resultWordDiffsList: document.getElementById('result-word-diffs-list'),
      btnDownloadResult: document.getElementById('btn-download-result'),
      btnCopyResult: document.getElementById('btn-copy-result')
    };
  }

  bindEvents() {
    // Focus capture: clicking the passage view automatically focuses the typing box below
    this.dom.masterPassageView.addEventListener('click', () => {
      this.dom.typingInputBox.focus();
    });

    // Primary Typing Text Box Event Handlers
    this.dom.typingInputBox.addEventListener('input', (e) => {
      this.handleTypingInput(e);
    });

    this.dom.typingInputBox.addEventListener('keydown', (e) => {
      // If auto-paused, resume immediately
      if (this.state === 'auto_paused') {
        this.resumeFromAutoPause();
        return;
      }

      // Check for backspace enforcement
      if (e.key === 'Backspace') {
        if (!this.handleBackspace(e)) {
          e.preventDefault();
          return;
        }
      }
    });

    // Auto-pause resume button
    this.dom.resumeBtn.addEventListener('click', () => {
      this.resumeFromAutoPause();
    });

    // Toolbar dropdowns and buttons
    this.dom.modeSelect.addEventListener('change', (e) => {
      this.setMode(e.target.value);
    });

    this.dom.durationSelect.addEventListener('change', (e) => {
      this.setDuration(parseInt(e.target.value, 10));
    });

    this.dom.backspaceToggleBtn.addEventListener('click', () => {
      this.cycleBackspaceMode();
    });

    this.dom.autoScrollToggleBtn.addEventListener('click', () => {
      this.settings.autoScroll = !this.settings.autoScroll;
      this.updateToolbarBadges();
    });

    this.dom.soundToggleBtn.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      this.dom.soundToggleBtn.classList.toggle('active', !isMuted);
      this.dom.soundToggleBtn.title = isMuted ? 'Sound: Muted' : 'Sound: Mechanical Click';
    });

    // Passage selection buttons
    this.dom.restartBtn.addEventListener('click', () => this.resetTest());
    this.dom.newPassageBtn.addEventListener('click', () => this.loadPassage(this.mode));
    this.dom.onlinePassageBtn.addEventListener('click', () => this.fetchAndLoadOnlinePassage());

    // Custom passage modal
    this.dom.btnOpenCustomModal.addEventListener('click', () => {
      this.dom.customPassageModal.classList.add('active');
      this.dom.customTextInput.focus();
    });
    this.dom.btnCloseCustomModal.addEventListener('click', () => {
      this.dom.customPassageModal.classList.remove('active');
    });
    this.dom.btnApplyCustomText.addEventListener('click', () => {
      const text = this.dom.customTextInput.value.trim();
      if (text.length >= 20) {
        this.setCustomPassage(text);
        this.dom.customPassageModal.classList.remove('active');
      } else {
        alert('Please paste at least 20 characters for a typing passage.');
      }
    });

    // History modal
    this.dom.btnOpenHistoryModal.addEventListener('click', () => {
      this.renderHistory();
      this.dom.historyModal.classList.add('active');
    });
    this.dom.btnCloseHistoryModal.addEventListener('click', () => {
      this.dom.historyModal.classList.remove('active');
    });
    this.dom.btnClearHistory.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your typing test history?')) {
        this.clearHistory();
      }
    });

    // Result modal controls
    this.dom.closeResultBtn.addEventListener('click', () => {
      this.dom.resultModal.classList.remove('active');
      this.resetTest();
    });
    this.dom.btnCopyResult.addEventListener('click', () => this.copyResultSummary());
    this.dom.btnDownloadResult.addEventListener('click', () => window.print());
  }

  applySettingsToUI() {
    this.dom.modeSelect.value = this.mode;
    this.dom.durationSelect.value = this.duration.toString();
    this.updateToolbarBadges();
  }

  updateToolbarBadges() {
    const bsLabel = {
      enabled: 'Backspace: ON',
      'word-lock': 'Backspace: Word-Lock',
      disabled: 'Backspace: OFF'
    }[this.settings.backspaceMode];
    
    this.dom.backspaceToggleBtn.textContent = bsLabel;
    this.dom.backspaceToggleBtn.className = `glass-btn pill ${this.settings.backspaceMode !== 'enabled' ? 'warning' : ''}`;

    this.dom.autoScrollToggleBtn.textContent = `Auto-Scroll: ${this.settings.autoScroll ? 'ON' : 'OFF'}`;
    this.dom.autoScrollToggleBtn.classList.toggle('active', this.settings.autoScroll);
  }

  cycleBackspaceMode() {
    const modes = ['enabled', 'word-lock', 'disabled'];
    const nextIdx = (modes.indexOf(this.settings.backspaceMode) + 1) % modes.length;
    this.settings.backspaceMode = modes[nextIdx];
    this.updateToolbarBadges();

    if (this.settings.backspaceMode === 'disabled') {
      sound.playError();
    }
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === 'ssc') {
      this.setDuration(900); // 15 mins for SSC DEST
      this.settings.backspaceMode = 'enabled';
      this.settings.speedTarget = 35;
      this.loadPassage('ssc');
    } else if (mode === 'banking') {
      this.setDuration(600); // 10 mins
      this.settings.backspaceMode = 'disabled'; // strict banking
      this.settings.speedTarget = 30;
      this.loadPassage('banking');
    } else if (mode === 'practice') {
      this.setDuration(120);
      this.settings.backspaceMode = 'enabled';
      this.loadPassage('general');
    }
    this.applySettingsToUI();
  }

  setDuration(secs) {
    this.duration = secs;
    this.remainingSeconds = secs;
    this.dom.durationSelect.value = secs.toString();
    this.updateTimerDisplay();
  }

  loadPassage(category = 'ssc') {
    const passage = getRandomOfflinePassage(category);
    this.applyPassage(passage);
  }

  async fetchAndLoadOnlinePassage() {
    this.dom.onlinePassageBtn.disabled = true;
    this.dom.onlinePassageBtn.innerHTML = 'Fetching...';
    try {
      const passage = await fetchOnlinePassage();
      this.applyPassage(passage);
    } catch (e) {
      console.error(e);
      this.loadPassage('general');
    } finally {
      this.dom.onlinePassageBtn.disabled = false;
      this.dom.onlinePassageBtn.innerHTML = '<span class="icon">&#127760;</span> Random Online';
    }
  }

  setCustomPassage(text) {
    this.applyPassage({
      id: 'custom_' + Date.now(),
      title: 'Custom User Passage',
      category: 'custom',
      text: text
    });
  }

  applyPassage(passage) {
    this.currentPassage = passage;
    this.masterText = passage.text;
    this.masterWords = passage.text.trim().split(/\s+/);
    
    // Update passage info badges
    this.dom.passageTitleBadge.textContent = passage.title || 'Official Typing Passage';
    const totalChars = passage.text.length;
    const approxWords = Math.round(totalChars / 5);
    this.dom.passageTargetInfo.textContent = `${totalChars} Keystrokes (~${approxWords} Std Words)`;

    this.resetTest();
  }

  resetTest() {
    // Clear timers
    clearInterval(this.timerInterval);
    clearInterval(this.inactivityCheckInterval);
    this.timerInterval = null;
    this.inactivityCheckInterval = null;

    // Reset state
    this.state = 'idle';
    this.remainingSeconds = this.duration;
    this.elapsedSeconds = 0;
    this.inactivitySeconds = 0;
    this.lastKeystrokeTimestamp = 0;

    this.currentWordIndex = 0;
    this.currentCharIndex = 0;
    this.typedWords = [];
    this.currentInputWord = '';
    this.totalKeystrokes = 0;
    this.backspaceCount = 0;
    this.timeline = [];

    // Reset input box
    this.dom.typingInputBox.value = '';
    this.dom.autoPauseOverlay.classList.remove('active');
    this.dom.resultModal.classList.remove('active');

    // Build DOM structure in master passage view
    this.buildPassageDOM();

    // Reset container scroll position
    if (this.dom.masterPassageView) {
      this.dom.masterPassageView.scrollTop = 0;
    }

    // Update displays
    this.updateTimerDisplay();
    this.updateHUDStats();
    this.dom.typingWordCounter.textContent = `Word 0 of ${this.masterWords.length}`;

    // Focus visible typing box below
    this.dom.typingInputBox.focus();
  }

  /**
   * Pre-builds master passage DOM nodes ONCE for zero-latency in-place tracking
   */
  buildPassageDOM() {
    if (!this.dom.textDisplay) return;
    this.dom.textDisplay.innerHTML = '';

    this.wordElements = [];
    this.charElements = [];
    this.spaceElements = [];

    const fragment = document.createDocumentFragment();

    this.masterWords.forEach((wordText, wordIdx) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = wordIdx === 0 ? 'passage-word word-active' : 'passage-word';
      wordSpan.dataset.index = wordIdx;

      const charSpansForWord = [];

      for (let i = 0; i < wordText.length; i++) {
        const charSpan = document.createElement('span');
        charSpan.className = (wordIdx === 0 && i === 0) ? 'char char-cursor' : 'char';
        charSpan.textContent = wordText[i];
        wordSpan.appendChild(charSpan);
        charSpansForWord.push(charSpan);
      }

      // Space character span
      const spaceSpan = document.createElement('span');
      spaceSpan.className = 'char char-space';
      spaceSpan.innerHTML = '&nbsp;';
      wordSpan.appendChild(spaceSpan);

      fragment.appendChild(wordSpan);

      this.wordElements.push(wordSpan);
      this.charElements.push(charSpansForWord);
      this.spaceElements.push(spaceSpan);
    });

    this.dom.textDisplay.appendChild(fragment);
  }

  /**
   * Start timer & 10-second inactivity monitor on first keystroke
   */
  startTest() {
    if (this.state === 'running') return;
    this.state = 'running';
    sound.init();

    const startTime = Date.now() - (this.elapsedSeconds * 1000);
    this.lastKeystrokeTimestamp = Date.now();

    // 1-second cadence timer for clock & accurate HUD evaluation
    this.timerInterval = setInterval(() => {
      if (this.state !== 'running') return;

      this.elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      this.remainingSeconds = Math.max(0, this.duration - this.elapsedSeconds);

      this.updateTimerDisplay();
      this.recordTimelinePoint();
      this.updateHUDStats();

      if (this.remainingSeconds <= 0) {
        this.finishTest();
      }
    }, 1000);

    // 10-second inactivity / auto-pause monitor
    this.inactivityCheckInterval = setInterval(() => {
      if (this.state !== 'running') return;

      const idleDuration = (Date.now() - this.lastKeystrokeTimestamp) / 1000;
      if (idleDuration >= this.inactivityThreshold) {
        this.triggerAutoPause();
      }
    }, 500);
  }

  triggerAutoPause() {
    if (this.state !== 'running') return;
    this.state = 'auto_paused';
    
    clearInterval(this.timerInterval);
    clearInterval(this.inactivityCheckInterval);

    this.dom.autoPauseOverlay.classList.add('active');
    sound.playError();
  }

  resumeFromAutoPause() {
    if (this.state !== 'auto_paused') return;
    this.dom.autoPauseOverlay.classList.remove('active');
    this.lastKeystrokeTimestamp = Date.now();
    this.state = 'idle';
    this.startTest();
    this.dom.typingInputBox.focus();
  }

  /**
   * Backspace enforcement:
   * - 'disabled': blocked
   * - 'word-lock': blocked across word boundaries
   * - 'enabled': full cross-word backspacing supported natively in the textarea
   */
  handleBackspace(event) {
    this.backspaceCount++;

    if (this.settings.backspaceMode === 'disabled') {
      sound.playError();
      this.flashBackspaceWarning('Backspace is strictly DISABLED in this exam mode!');
      return false;
    }

    if (this.settings.backspaceMode === 'word-lock') {
      const val = this.dom.typingInputBox.value;
      const cursor = this.dom.typingInputBox.selectionStart;
      
      // If cursor is immediately after space or attempting to delete previous word space
      if (cursor > 0 && val[cursor - 1] === ' ') {
        sound.playError();
        this.flashBackspaceWarning('Word locked! You cannot backspace into previous words.');
        return false;
      }
    }

    return true;
  }

  flashBackspaceWarning(msg) {
    const banner = document.createElement('div');
    banner.className = 'glass-alert-toast';
    banner.innerHTML = `<span class="toast-icon">&#9888;</span> ${msg}`;
    document.body.appendChild(banner);
    setTimeout(() => {
      banner.classList.add('fade-out');
      setTimeout(() => banner.remove(), 400);
    }, 1500);
  }

  /**
   * Main typing input handler for visible text box below passage
   */
  handleTypingInput(e) {
    if (this.state === 'idle') {
      this.startTest();
    }
    this.lastKeystrokeTimestamp = Date.now();

    const rawVal = this.dom.typingInputBox.value;
    const isSpace = rawVal.endsWith(' ');
    sound.playKeypress(isSpace);

    this.totalKeystrokes = rawVal.length;

    // Parse words from visible textarea
    const endsWithWhitespace = /\s$/.test(rawVal);
    const tokens = rawVal.trim().split(/\s+/).filter(w => w.length > 0);

    let activeWordIdx = 0;
    let activeWordText = '';

    if (rawVal.trim().length === 0) {
      activeWordIdx = 0;
      activeWordText = '';
      this.typedWords = [];
    } else if (endsWithWhitespace) {
      this.typedWords = [...tokens];
      activeWordIdx = this.typedWords.length;
      activeWordText = '';
    } else {
      this.typedWords = tokens.slice(0, -1);
      activeWordIdx = this.typedWords.length;
      activeWordText = tokens[tokens.length - 1];
    }

    this.currentWordIndex = activeWordIdx;
    this.currentInputWord = activeWordText;
    this.currentCharIndex = activeWordText.length;

    // Update master passage words state in upper pane
    this.syncMasterPassageHighlights(activeWordIdx, activeWordText);

    // Update word counter
    const displayWordNum = Math.min(activeWordIdx + 1, this.masterWords.length);
    this.dom.typingWordCounter.textContent = `Word ${displayWordNum} of ${this.masterWords.length}`;

    // Fast counters update (< 0.001ms)
    this.dom.keystrokeDisplay.textContent = this.totalKeystrokes;
    const elapsedMins = Math.max(0.01, this.elapsedSeconds / 60);
    this.dom.grossWpmDisplay.textContent = Math.round((this.totalKeystrokes / 5) / elapsedMins);

    // Progress bar
    const totalTarget = Math.max(1, this.masterText.length);
    const progress = Math.min(100, Math.round((this.totalKeystrokes / totalTarget) * 100));
    this.dom.progressFill.style.width = `${progress}%`;

    // Check completion
    if (activeWordIdx >= this.masterWords.length) {
      this.finishTest();
    }
  }

  /**
   * Synchronizes words and characters in the upper master passage pane
   */
  syncMasterPassageHighlights(activeWordIdx, activeWordText) {
    const total = this.masterWords.length;

    for (let w = 0; w < total; w++) {
      const wordEl = this.wordElements[w];
      if (!wordEl) continue;

      if (w < activeWordIdx) {
        // Completed word
        const typedWord = this.typedWords[w] || '';
        const targetWord = this.masterWords[w];
        wordEl.className = (typedWord === targetWord) 
          ? 'passage-word word-correct' 
          : 'passage-word word-incorrect';

        const chars = this.charElements[w] || [];
        chars.forEach(c => c.classList.remove('char-cursor'));
        if (this.spaceElements[w]) this.spaceElements[w].classList.remove('char-cursor');

      } else if (w === activeWordIdx) {
        // Active word being typed
        wordEl.className = 'passage-word word-active';
        this.updateActiveWordChars(w, activeWordText);

      } else {
        // Pending future word
        wordEl.className = 'passage-word';
        const chars = this.charElements[w] || [];
        chars.forEach(c => c.className = 'char');
        if (this.spaceElements[w]) this.spaceElements[w].className = 'char char-space';
      }
    }

    // Line-aware smooth scrolling of master passage view
    if (this.settings.autoScroll && this.wordElements[activeWordIdx]) {
      const container = this.dom.masterPassageView;
      const activeEl = this.wordElements[activeWordIdx];
      const wordTop = activeEl.offsetTop;
      const viewScroll = container.scrollTop;
      const relY = wordTop - viewScroll;

      if (relY > 130) {
        container.scrollTop = wordTop - 60;
      } else if (relY < 20) {
        container.scrollTop = Math.max(0, wordTop - 40);
      }
    }
  }

  updateActiveWordChars(wordIdx, inputVal) {
    const targetWord = this.masterWords[wordIdx] || '';
    const currentWordEl = this.wordElements[wordIdx];
    const charSpans = this.charElements[wordIdx] || [];
    const spaceSpan = this.spaceElements[wordIdx];
    const inputLen = inputVal.length;

    for (let i = 0; i < targetWord.length; i++) {
      const charEl = charSpans[i];
      if (!charEl) continue;

      if (i < inputLen) {
        if (inputVal[i] === targetWord[i]) {
          charEl.className = 'char char-correct';
        } else {
          charEl.className = 'char char-incorrect';
        }
      } else if (i === inputLen) {
        charEl.className = 'char char-cursor';
      } else {
        charEl.className = 'char';
      }
    }

    if (currentWordEl) {
      const existingExtras = currentWordEl.querySelectorAll('.char-extra');
      existingExtras.forEach(el => el.remove());

      if (inputLen > targetWord.length) {
        for (let k = targetWord.length; k < inputLen; k++) {
          const extraSpan = document.createElement('span');
          extraSpan.className = 'char char-incorrect char-extra';
          extraSpan.textContent = inputVal[k];
          currentWordEl.insertBefore(extraSpan, spaceSpan);
        }
      }
    }

    if (spaceSpan) {
      if (inputLen >= targetWord.length) {
        spaceSpan.classList.add('char-cursor');
      } else {
        spaceSpan.classList.remove('char-cursor');
      }
    }
  }

  getTypedFullText() {
    return this.dom.typingInputBox.value;
  }

  /**
   * Evaluates HUD statistics on 1-second interval ticks
   */
  updateHUDStats() {
    if (this.state === 'idle' && this.totalKeystrokes === 0) {
      this.dom.grossWpmDisplay.textContent = '0';
      this.dom.netWpmDisplay.textContent = '0';
      this.dom.accuracyDisplay.textContent = '100%';
      this.dom.keystrokeDisplay.textContent = '0';
      this.dom.kdphDisplay.textContent = '0';
      this.dom.errorsDisplay.textContent = '0F / 0H';
      this.dom.progressFill.style.width = '0%';
      return;
    }

    const typedText = this.getTypedFullText();
    const evaluation = TypingEvaluator.evaluate(
      this.masterText,
      typedText,
      this.elapsedSeconds,
      {
        mode: this.mode,
        isLive: true,
        categoryCutoff: this.settings.sscCategory === 'ur' ? 7.0 : 10.0,
        speedTarget: this.settings.speedTarget
      }
    );

    this.dom.grossWpmDisplay.textContent = evaluation.grossWpm;
    this.dom.netWpmDisplay.textContent = evaluation.netWpm;
    this.dom.accuracyDisplay.textContent = `${evaluation.accuracy}%`;
    this.dom.keystrokeDisplay.textContent = evaluation.totalKeystrokes;
    this.dom.kdphDisplay.textContent = evaluation.kdph;
    this.dom.errorsDisplay.textContent = `${evaluation.fullMistakes}F / ${evaluation.halfMistakes}H`;
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    this.dom.timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  recordTimelinePoint() {
    const typedText = this.getTypedFullText();
    const evalData = TypingEvaluator.evaluate(
      this.masterText,
      typedText,
      this.elapsedSeconds,
      { mode: this.mode, isLive: true }
    );

    this.timeline.push({
      second: this.elapsedSeconds,
      grossWpm: evalData.grossWpm,
      netWpm: evalData.netWpm,
      errors: evalData.effectiveMistakes
    });
  }

  /**
   * Finalizes test and triggers detailed scorecard modal
   */
  finishTest() {
    if (this.state === 'finished') return;
    this.state = 'finished';

    clearInterval(this.timerInterval);
    clearInterval(this.inactivityCheckInterval);

    sound.playSuccess();

    const typedText = this.getTypedFullText();
    const finalEvaluation = TypingEvaluator.evaluate(
      this.masterText,
      typedText,
      this.elapsedSeconds,
      {
        mode: this.mode,
        isLive: false,
        categoryCutoff: this.settings.sscCategory === 'ur' ? 7.0 : 10.0,
        speedTarget: this.settings.speedTarget
      }
    );

    this.saveResult(finalEvaluation);
    this.renderResultModal(finalEvaluation);
  }

  renderResultModal(res) {
    const isQualified = this.mode === 'ssc' ? res.passedSsc : res.passedBanking;
    
    // Verdict Banner
    this.dom.resultVerdictBanner.className = `verdict-banner ${isQualified ? 'verdict-pass' : 'verdict-fail'}`;
    this.dom.resultVerdictBanner.innerHTML = `
      <div class="verdict-icon">${isQualified ? '&#10004;' : '&#10008;'}</div>
      <div class="verdict-content">
        <h3>${isQualified ? 'QUALIFIED / SELECTED' : 'NOT QUALIFIED'}</h3>
        <p>${
          this.mode === 'ssc'
            ? `SSC CHSL/CGL DEST Criteria: Allowed Error Limit ${res.allowedErrorPct}% | Your Error: ${res.errorPercentage}% | Speed Target: ${res.speedBenchmark} WPM`
            : `Banking Criteria: Minimum Speed ${res.speedBenchmark} WPM | Your Net WPM: ${res.netWpm}`
        }</p>
      </div>
    `;

    // Metrics
    this.dom.resultGrossWpm.textContent = res.grossWpm;
    this.dom.resultNetWpm.textContent = res.netWpm;
    this.dom.resultAccuracy.textContent = `${res.accuracy}%`;
    this.dom.resultKeystrokes.textContent = `${res.totalKeystrokes} (${res.kdph} KDPH)`;
    this.dom.resultErrorPct.textContent = `${res.errorPercentage}%`;
    this.dom.resultFullMistakes.textContent = res.fullMistakes;
    this.dom.resultHalfMistakes.textContent = res.halfMistakes;
    this.dom.resultBackspaces.textContent = this.backspaceCount;
    this.dom.resultTimeTaken.textContent = `${Math.floor(res.timeSeconds / 60)}m ${res.timeSeconds % 60}s`;

    // Word Mistake Breakdown List
    this.dom.resultWordDiffsList.innerHTML = '';
    const errorDiffs = res.wordDiffs.filter(d => d.status !== 'correct');

    if (errorDiffs.length === 0) {
      this.dom.resultWordDiffsList.innerHTML = '<li class="no-mistakes-item">&#10024; Flawless! Zero errors detected across the passage.</li>';
    } else {
      errorDiffs.forEach(diff => {
        const li = document.createElement('li');
        li.className = `diff-item ${diff.status}`;
        li.innerHTML = `
          <div class="diff-words">
            <span class="diff-master">Expected: "<strong>${escapeHtml(diff.master || '[None]')}</strong>"</span>
            <span class="diff-typed">Typed: "<strong>${escapeHtml(diff.typed || '[Omitted]')}</strong>"</span>
          </div>
          <div class="diff-badge">${diff.reason}</div>
        `;
        this.dom.resultWordDiffsList.appendChild(li);
      });
    }

    // Render Canvas Graph
    setTimeout(() => {
      this.chart.render(this.timeline);
    }, 100);

    // Show modal
    this.dom.resultModal.classList.add('active');
  }

  saveResult(res) {
    const record = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      mode: this.mode.toUpperCase(),
      grossWpm: res.grossWpm,
      netWpm: res.netWpm,
      accuracy: res.accuracy,
      errorPct: res.errorPercentage,
      passed: this.mode === 'ssc' ? res.passedSsc : res.passedBanking,
      timeSeconds: res.timeSeconds,
      keystrokes: res.totalKeystrokes
    };

    this.history.unshift(record);
    if (this.history.length > 50) this.history.pop();
    try {
      localStorage.setItem('typing_boss_history', JSON.stringify(this.history));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }

  loadHistory() {
    try {
      const data = localStorage.getItem('typing_boss_history');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  renderHistory() {
    if (!this.dom.historyTableBody) return;
    this.dom.historyTableBody.innerHTML = '';

    if (this.history.length === 0) {
      this.dom.historyTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No test history yet. Complete a typing test to see your analytics.</td></tr>';
      return;
    }

    this.history.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.date}</td>
        <td><span class="badge ${item.mode.toLowerCase()}">${item.mode}</span></td>
        <td><strong>${item.grossWpm}</strong></td>
        <td><strong>${item.netWpm}</strong></td>
        <td>${item.accuracy}%</td>
        <td>${item.errorPct}%</td>
        <td><span class="badge ${item.passed ? 'pass' : 'fail'}">${item.passed ? 'Qualified' : 'Failed'}</span></td>
      `;
      this.dom.historyTableBody.appendChild(tr);
    });
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('typing_boss_history');
    this.renderHistory();
  }

  copyResultSummary() {
    const text = `🎯 Typing Boss Test Result
Mode: ${this.mode.toUpperCase()}
Gross Speed: ${this.dom.resultGrossWpm.textContent} WPM
Net Speed: ${this.dom.resultNetWpm.textContent} WPM
Accuracy: ${this.dom.resultAccuracy.textContent}
Keystrokes: ${this.dom.resultKeystrokes.textContent}
Error %: ${this.dom.resultErrorPct.textContent}
Status: ${this.dom.resultVerdictBanner.querySelector('h3').textContent}`;

    navigator.clipboard.writeText(text).then(() => {
      alert('Result copied to clipboard!');
    });
  }
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.typingBoss = new TypingBossApp();
});
