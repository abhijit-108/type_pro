/**
 * Typing Boss - SSC & Banking Evaluation Engine
 * Implements official Staff Selection Commission (DEST/CHSL/CGL) and
 * Banking (IBPS/SBI) calculation rules and sequence alignment algorithms.
 */

export class TypingEvaluator {
  /**
   * Evaluates the typed text against the master text using token alignment.
   * @param {string} masterText - Original source passage
   * @param {string} typedText - User input text
   * @param {number} timeSeconds - Elapsed time in seconds
   * @param {Object} options - Exam mode options { mode: 'ssc'|'banking'|'practice', categoryCutoff: 7.0, speedTarget: 35 }
   */
  static evaluate(masterText, typedText, timeSeconds, options = {}) {
    const isLive = options.isLive || false;
    const elapsedMinutes = Math.max(timeSeconds / 60, 0.05); // prevent div by zero
    
    // Normalize and tokenize master and typed texts
    const masterWords = this.tokenize(masterText);
    const typedWords = this.tokenize(typedText);
    
    // Total raw keystrokes (depressions) count
    const totalKeystrokes = typedText.length;

    if (typedWords.length === 0) {
      return {
        grossWpm: 0,
        netWpm: 0,
        kdph: 0,
        accuracy: 100,
        totalKeystrokes: 0,
        masterWordsCount: masterWords.length,
        typedWordsCount: 0,
        correctWords: 0,
        fullMistakes: 0,
        halfMistakes: 0,
        effectiveMistakes: 0,
        errorPercentage: 0,
        allowedErrorPct: options.categoryCutoff || 7.0,
        speedBenchmark: options.speedTarget || 35,
        passedSsc: false,
        passedBanking: false,
        timeSeconds,
        elapsedMinutes: 0,
        wordDiffs: []
      };
    }

    // In live HUD tracking during the test, restrict the master window
    // to prevent common words like "the/and/in" from erroneously aligning 200 words down the document!
    let masterWordsToEvaluate = masterWords;
    if (isLive) {
      const windowEnd = Math.min(masterWords.length, typedWords.length + 3);
      masterWordsToEvaluate = masterWords.slice(0, windowEnd);
    }
    
    // Align tokens using dynamic programming (Needleman-Wunsch / LCS alignment)
    const rawAlignment = this.alignTokens(masterWordsToEvaluate, typedWords);

    // Find the index of the last typed word in the alignment
    // Master words after the last typed word are trailing unattempted words, NOT mistakes during typing!
    let lastTypedIndex = -1;
    for (let k = rawAlignment.length - 1; k >= 0; k--) {
      if (rawAlignment[k].typed && rawAlignment[k].typed.length > 0) {
        lastTypedIndex = k;
        break;
      }
    }

    let fullMistakes = 0;
    let halfMistakes = 0;
    let correctWords = 0;
    let correctKeystrokes = 0;
    const wordDiffs = []; // for detailed visual breakdown
    
    rawAlignment.forEach((item, idx) => {
      // If this is an omission that appears AFTER the user's last typed word:
      if (item.type === 'omission' && idx > lastTypedIndex) {
        // Trailing unattempted master word - ignore during live test or mark as pending
        if (!isLive && options.strictOmissions) {
          fullMistakes += 1.0;
          wordDiffs.push({
            master: item.master,
            typed: '',
            status: 'omission',
            penalty: 1.0,
            reason: 'Uncompleted word at end of test (Full Mistake)'
          });
        }
        return;
      }

      if (item.type === 'match') {
        correctWords++;
        correctKeystrokes += item.typed.length + 1; // word + space
        wordDiffs.push({
          master: item.master,
          typed: item.typed,
          status: 'correct',
          penalty: 0,
          reason: 'Exact Match'
        });
      } else if (item.type === 'substitution') {
        const subEvaluation = this.classifyWordError(item.master, item.typed);
        if (subEvaluation.errorType === 'half') {
          halfMistakes += 0.5;
          wordDiffs.push({
            master: item.master,
            typed: item.typed,
            status: 'half-mistake',
            penalty: 0.5,
            reason: subEvaluation.reason
          });
        } else {
          fullMistakes += 1.0;
          wordDiffs.push({
            master: item.master,
            typed: item.typed,
            status: 'full-mistake',
            penalty: 1.0,
            reason: subEvaluation.reason
          });
        }
      } else if (item.type === 'omission') {
        // Skipped master word between typed words
        fullMistakes += 1.0;
        wordDiffs.push({
          master: item.master,
          typed: '',
          status: 'omission',
          penalty: 1.0,
          reason: 'Omission of word (Full Mistake)'
        });
      } else if (item.type === 'addition') {
        // Extra word added by user
        fullMistakes += 1.0;
        wordDiffs.push({
          master: '',
          typed: item.typed,
          status: 'addition',
          penalty: 1.0,
          reason: 'Addition of unauthorized word (Full Mistake)'
        });
      }
    });

    // Total effective mistakes (Full + Half mistakes)
    const effectiveMistakes = fullMistakes + halfMistakes;
    
    // Standard speeds based on 5 strokes per standard word (official rule)
    const grossWpm = Math.round((totalKeystrokes / 5) / elapsedMinutes);
    const netWpm = Math.max(0, Math.round(grossWpm - (effectiveMistakes / elapsedMinutes)));
    
    // Keystrokes Per Hour (KDPH)
    const kdph = Math.round((totalKeystrokes / elapsedMinutes) * 60);

    // SSC Error Percentage = (Effective Mistakes / Master Words Count) * 100
    const baseWordCount = Math.max(typedWords.length, 1);
    const errorPercentage = parseFloat(((effectiveMistakes / baseWordCount) * 100).toFixed(2));
    
    // Accuracy percentage based on attempted words
    let accuracy = 100;
    if (totalKeystrokes > 0) {
      if (isLive) {
        const attempted = Math.max(1, correctWords + effectiveMistakes);
        accuracy = Math.max(0, Math.min(100, parseFloat(((correctWords / attempted) * 100).toFixed(1))));
      } else {
        accuracy = Math.max(0, Math.min(100, parseFloat(((1 - (effectiveMistakes / baseWordCount)) * 100).toFixed(1))));
      }
    }

    // Passing benchmarks
    const allowedErrorPct = options.categoryCutoff || 7.0; // UR: 5-7%, Reserved: 10%
    const speedBenchmark = options.speedTarget || 35; // 35 WPM for SSC CHSL English, 30 for Hindi
    
    const passedSsc = (errorPercentage <= allowedErrorPct) && (grossWpm >= speedBenchmark);
    const passedBanking = (netWpm >= speedBenchmark) && (accuracy >= 90);

    return {
      grossWpm,
      netWpm,
      kdph,
      accuracy,
      totalKeystrokes,
      masterWordsCount: masterWords.length,
      typedWordsCount: typedWords.length,
      correctWords,
      fullMistakes,
      halfMistakes,
      effectiveMistakes,
      errorPercentage,
      allowedErrorPct,
      speedBenchmark,
      passedSsc,
      passedBanking,
      timeSeconds,
      elapsedMinutes: parseFloat(elapsedMinutes.toFixed(2)),
      wordDiffs
    };
  }

  /**
   * Classify an error into Full Mistake or Half Mistake per SSC guidelines
   */
  static classifyWordError(masterWord, typedWord) {
    if (!typedWord) {
      return { errorType: 'full', reason: 'Omission of word' };
    }
    
    // 1. Check for capitalization error only (Half Mistake)
    if (masterWord.toLowerCase() === typedWord.toLowerCase() && masterWord !== typedWord) {
      return {
        errorType: 'half',
        reason: 'Wrong Capitalization (Half Mistake: 0.5)'
      };
    }

    // 2. Check for punctuation mismatch only (Half Mistake)
    const cleanMaster = masterWord.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '');
    const cleanTyped = typedWord.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '');
    if (cleanMaster.toLowerCase() === cleanTyped.toLowerCase()) {
      return {
        errorType: 'half',
        reason: 'Punctuation Error (Half Mistake: 0.5)'
      };
    }

    // 3. Check Levenshtein distance for minor spelling vs severe distortion
    const dist = this.levenshtein(masterWord, typedWord);
    if (dist <= 2 && masterWord.length > 4) {
      // Minor typo / 1-2 character transposition
      return {
        errorType: 'half',
        reason: 'Minor Spelling/Letter Discrepancy (Half Mistake: 0.5)'
      };
    }

    // Severe spelling distortion, substitution, or completely different word
    return {
      errorType: 'full',
      reason: 'Word Substitution / Major Distortion (Full Mistake: 1.0)'
    };
  }

  /**
   * Split string into words preserving essential whitespace bounds
   */
  static tokenize(text) {
    if (!text) return [];
    return text.trim().split(/\s+/).filter(w => w.length > 0);
  }

  /**
   * Align master tokens and typed tokens using dynamic programming (LCS-based alignment)
   */
  static alignTokens(master, typed) {
    const m = master.length;
    const n = typed.length;
    
    // DP cost matrix
    // match = +2, substitution = -1, omission/addition = -1
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    
    for (let i = 0; i <= m; i++) dp[i][0] = -i;
    for (let j = 0; j <= n; j++) dp[0][j] = -j;
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const isMatch = master[i - 1] === typed[j - 1];
        const isSoftMatch = master[i - 1].toLowerCase() === typed[j - 1].toLowerCase();
        
        let matchScore = -2;
        if (isMatch) {
          matchScore = 3;
        } else if (isSoftMatch) {
          matchScore = 1;
        } else if (this.levenshtein(master[i - 1], typed[j - 1]) <= 2) {
          matchScore = 0;
        }

        dp[i][j] = Math.max(
          dp[i - 1][j - 1] + matchScore, // match / substitution
          dp[i - 1][j] - 1,             // omission (deletion)
          dp[i][j - 1] - 1              // addition (insertion)
        );
      }
    }
    
    // Traceback to build alignment list
    let i = m;
    let j = n;
    const aligned = [];
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0) {
        const isMatch = master[i - 1] === typed[j - 1];
        const isSoftMatch = master[i - 1].toLowerCase() === typed[j - 1].toLowerCase();
        const isClose = this.levenshtein(master[i - 1], typed[j - 1]) <= 2;
        const score = isMatch ? 3 : (isSoftMatch ? 1 : (isClose ? 0 : -2));

        if (score > -2 && dp[i][j] === dp[i - 1][j - 1] + score) {
          if (isMatch) {
            aligned.push({ type: 'match', master: master[i - 1], typed: typed[j - 1] });
          } else {
            aligned.push({ type: 'substitution', master: master[i - 1], typed: typed[j - 1] });
          }
          i--;
          j--;
          continue;
        }
      }

      if (i > 0 && (j === 0 || dp[i][j] === dp[i - 1][j] - 1)) {
        aligned.push({ type: 'omission', master: master[i - 1], typed: '' });
        i--;
      } else if (j > 0 && (i === 0 || dp[i][j] === dp[i][j - 1] - 1)) {
        aligned.push({ type: 'addition', master: '', typed: typed[j - 1] });
        j--;
      } else {
        aligned.push({ type: 'substitution', master: master[i - 1], typed: typed[j - 1] });
        i--;
        j--;
      }
    }
    
    return aligned.reverse();
  }

  /**
   * Standard Levenshtein distance for string edit calculation
   */
  static levenshtein(a, b) {
    const an = a ? a.length : 0;
    const bn = b ? b.length : 0;
    if (an === 0) return bn;
    if (bn === 0) return an;
    const matrix = [];
    for (let i = 0; i <= bn; i++) matrix[i] = [i];
    for (let j = 0; j <= an; j++) matrix[0][j] = j;
    for (let i = 1; i <= bn; i++) {
      for (let j = 1; j <= an; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[bn][an];
  }
}
