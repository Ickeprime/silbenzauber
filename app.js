(function () {
  'use strict';

  const Logic = window.SilbenzauberLogic;
  const $ = selector => document.querySelector(selector);
  const defaultConfig = Logic.normalizeConfig(Logic.copyConfig(Logic.DEFAULT_CONFIG));
  const STAR_STREAK_STORAGE_KEY = `${Logic.STORAGE_KEY}:star-streak`;

  let config = readConfig();
  let pendingConfig = Logic.copyConfig(config);
  let symbols = [];
  let previousResult = null;
  let spinsWithoutStar = readStarStreak(config);
  let spinning = false;
  let audioCtx = null;

  const spinButton = $('#spinButton');
  const spinButtonText = $('#spinButtonText');
  const reelsElement = $('#reels');
  const instructionElement = $('#instruction');
  const settingsDialog = $('#settingsDialog');
  const mascotArea = $('#mascotArea');
  const mascotMessage = $('#mascotMessage');

  function setMascotState(state, message) {
    if (!mascotArea || !mascotMessage) return;
    mascotArea.dataset.state = state;
    mascotMessage.textContent = message;
  }

  function readConfig() {
    try {
      const saved = localStorage.getItem(Logic.STORAGE_KEY);
      return saved ? Logic.normalizeConfig(JSON.parse(saved)) : Logic.normalizeConfig(Logic.copyConfig(Logic.DEFAULT_CONFIG));
    } catch (_) {
      return Logic.normalizeConfig(Logic.copyConfig(Logic.DEFAULT_CONFIG));
    }
  }

  function saveConfig() {
    try {
      localStorage.setItem(Logic.STORAGE_KEY, JSON.stringify(config));
    } catch (_) {
      /* app works without localStorage */
    }
  }

  function readStarStreak(currentConfig) {
    if (!currentConfig.reelStars.some((allowed, index) => allowed && index > 0)) return 0;
    try {
      const saved = Number(localStorage.getItem(STAR_STREAK_STORAGE_KEY));
      return Number.isFinite(saved) ? Math.min(3, Math.max(0, Math.floor(saved))) : 0;
    } catch (_) {
      return 0;
    }
  }

  function saveStarStreak() {
    try {
      localStorage.setItem(STAR_STREAK_STORAGE_KEY, String(spinsWithoutStar));
    } catch (_) {
      /* the game remains usable if storage is unavailable */
    }
  }

  function sound(frequency, duration = 0.08, delay = 0, loudness = 0.012, type = 'sine', endFrequency = frequency) {
    if (!config.soundEnabled) return;
    try {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioClass) return;
      if (!audioCtx) audioCtx = new AudioClass();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const when = audioCtx.currentTime + delay;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, when);
      oscillator.frequency.linearRampToValueAtTime(endFrequency, when + duration);
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.linearRampToValueAtTime(loudness, when + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      oscillator.start(when);
      oscillator.stop(when + duration + 0.02);
    } catch (_) {
      /* sound is optional */
    }
  }

  function createSymbolElement(index, value) {
    const symbol = document.createElement('span');
    symbol.className = `reel-symbol ${value === '★' ? 'symbol-star' : ''}`;
    symbol.textContent = Logic.formatForReel(value, index, config.reelCases[index]);
    symbol.setAttribute('aria-hidden', 'true');
    return symbol;
  }

  function updateReelLabel(reel, index, value) {
    const label = value === '★' ? 'Stern' : Logic.formatForReel(value, index, config.reelCases[index]);
    reel.setAttribute('aria-label', `Walze ${index + 1}: ${label}`);
  }

  function createReelElement(index, value) {
    const reel = document.createElement('div');
    reel.className = 'reel';
    reel.dataset.reel = String(index);
    updateReelLabel(reel, index, value);
    reel.appendChild(createSymbolElement(index, value));
    return reel;
  }

  function renderReels() {
    reelsElement.style.setProperty('--reel-count', String(config.reelCount));
    reelsElement.dataset.count = String(config.reelCount);
    reelsElement.setAttribute('aria-label', `${config.reelCount} Silbenwalzen`);
    reelsElement.innerHTML = '';
    symbols.forEach((value, index) => reelsElement.appendChild(createReelElement(index, value)));
  }

  function setSymbol(index, value) {
    symbols[index] = value;
    const reel = reelsElement.children[index];
    if (!reel) return;
    updateReelLabel(reel, index, value);
    reel.replaceChildren(createSymbolElement(index, value));
  }

  function startReelRoll(reel, index, pool, target, duration) {
    const itemCount = 14 + index * 3;
    const sequence = [target, ...Array.from(
      { length: itemCount - 1 },
      () => pool[Math.floor(Math.random() * pool.length)] || pool[0],
    )];

    const track = document.createElement('div');
    track.className = 'reel-track';
    const cellHeight = Math.max(1, reel.clientHeight);
    track.style.setProperty('--reel-cell-height', `${cellHeight}px`);
    sequence.forEach(value => track.appendChild(createSymbolElement(index, value)));

    reel.setAttribute('aria-busy', 'true');
    track.style.transform = `translateY(-${cellHeight * (sequence.length - 1)}px)`;
    reel.replaceChildren(track);
    void track.offsetHeight;
    window.requestAnimationFrame(() => {
      track.style.transitionDuration = `${duration}ms`;
      track.style.transform = 'translateY(0)';
    });
  }

  function renderSummary() {
    const summary = $('#selectionSummary');
    const reelInfo = config.reelSelections.map((items, index) => `W${index + 1}: ${items.length}`).join(' · ');
    summary.innerHTML = '';
    const dot = document.createElement('span');
    dot.className = 'selection-dot';
    dot.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.textContent = 'Silben pro Walze: ';
    const strong = document.createElement('strong');
    strong.textContent = reelInfo;
    summary.append(dot, label, strong);
    updateSoundButton();
  }

  function updateSoundButton() {
    const button = $('#soundButton');
    button.classList.toggle('enabled', config.soundEnabled);
    button.setAttribute('aria-pressed', String(config.soundEnabled));
    button.setAttribute('aria-label', config.soundEnabled ? 'Ton ausschalten' : 'Ton einschalten');
    button.title = config.soundEnabled ? 'Ton ausschalten' : 'Ton einschalten';
  }

  function refreshGame() {
    const allSyllables = Logic.generateSyllables(config);
    symbols = Array.from({ length: config.reelCount }, (_, index) => {
      const selections = config.reelSelections[index] || [];
      return selections[0] || allSyllables[0] || 'ma';
    });
    previousResult = null;
    renderReels();
    renderSummary();
    instructionElement.textContent = 'Drücke START und lies danach die Silben.';
  }

  function spin() {
    if (spinning) return;
    const pool = Logic.generateSyllables(config);
    if (!pool.length) return;
    spinning = true;
    spinButton.disabled = true;
    $('#settingsOpen').disabled = true;
    spinButton.classList.add('is-spinning');
    spinButtonText.textContent = 'DREHT …';
    instructionElement.textContent = 'Die Walzen drehen sich …';
    setMascotState('spinning', 'Hui, sie drehen sich!');

    const target = Logic.drawResult(config, previousResult, Math.random, spinsWithoutStar);
    const reduced = config.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const baseDuration = reduced ? 120 : 1050;
    const stagger = reduced ? 80 : 280;
    let finished = 0;
    sound(370, 0.09, 0, 0.012, 'triangle', 480);
    sound(520, 0.10, 0.07, 0.01, 'sine', 590);
    const rollSoundTimer = config.soundEnabled && !reduced
      ? window.setInterval(() => sound(165, 0.045, 0, 0.004, 'triangle', 205), 230)
      : null;

    Array.from(reelsElement.children).forEach((reel, index) => {
      const localPool = [ ...(config.reelSelections[index] || pool) ];
      if (config.reelStars[index] && index !== 0) localPool.push('★');
      const duration = baseDuration + index * stagger;

      if (!reduced) {
        reel.classList.add('rolling');
        startReelRoll(reel, index, localPool, target[index], duration);
        window.setTimeout(() => {
          settle();
        }, duration + 90);
      } else {
        window.setTimeout(settle, duration);
      }

      function settle() {
        setSymbol(index, target[index]);
        reel.removeAttribute('aria-busy');
        reel.classList.remove('rolling');
        reel.classList.add('landed');
        window.setTimeout(() => reel.classList.remove('landed'), 320);
        sound(470 + index * 38, 0.06, 0, 0.014, 'triangle', 410 + index * 38);
        finished += 1;
        if (finished === config.reelCount) {
          previousResult = target;
          spinsWithoutStar = Logic.nextStarStreak(config, target, spinsWithoutStar);
          saveStarStreak();
          spinning = false;
          if (rollSoundTimer !== null) window.clearInterval(rollSoundTimer);
          spinButton.disabled = false;
          $('#settingsOpen').disabled = false;
          spinButton.classList.remove('is-spinning');
          spinButtonText.textContent = 'NOCH MAL!';
          instructionElement.textContent = Logic.resultInstruction(target);
          setMascotState(target.includes('★') ? 'pause' : 'landed', target.includes('★') ? 'Zeit zum Lesen!' : 'Was steht dort?');
          sound(520, 0.10, 0.03, 0.01);
          sound(660, 0.13, 0.13, 0.01);
        }
      }
    });
  }

  function renderLetterOptions(element, allLetters, selectedLetters, kind) {
    element.innerHTML = '';
    allLetters.forEach(letter => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'letter-chip';
      button.dataset.kind = kind;
      button.dataset.letter = letter;
      button.setAttribute('aria-pressed', String(selectedLetters.includes(letter)));
      button.textContent = letter;
      element.appendChild(button);
    });
  }

  function renderReelSettings() {
    const container = $('#reelSettings');
    const allSyllables = Logic.generateSyllables(pendingConfig);
    container.innerHTML = '';

    for (let index = 0; index < pendingConfig.reelCount; index += 1) {
      const card = document.createElement('section');
      card.className = 'reel-settings-card';
      card.dataset.reelCard = String(index);

      const header = document.createElement('div');
      header.className = 'reel-settings-header';

      const titleWrap = document.createElement('div');
      const title = document.createElement('h4');
      title.textContent = `Walze ${index + 1}`;
      const subtitle = document.createElement('p');
      subtitle.textContent = index === 0
        ? 'Kein Stern auf dieser Walze'
        : 'Stern optional';
      titleWrap.append(title, subtitle);

      const actions = document.createElement('div');
      actions.className = 'reel-settings-actions';
      const allButton = document.createElement('button');
      allButton.type = 'button';
      allButton.className = 'mini-action';
      allButton.dataset.action = 'select-all';
      allButton.dataset.reelIndex = String(index);
      allButton.textContent = 'Alle';
      const noneButton = document.createElement('button');
      noneButton.type = 'button';
      noneButton.className = 'mini-action';
      noneButton.dataset.action = 'select-none';
      noneButton.dataset.reelIndex = String(index);
      noneButton.textContent = 'Keine';
      actions.append(allButton, noneButton);
      header.append(titleWrap, actions);

      const caseSetting = document.createElement('fieldset');
      caseSetting.className = 'case-setting';
      const caseLegend = document.createElement('legend');
      caseLegend.textContent = 'Schreibweise';
      const caseOptions = document.createElement('div');
      caseOptions.className = 'case-options';
      caseOptions.setAttribute('aria-label', `Schreibweise für Walze ${index + 1}`);
      [
        { value: 'initial', label: 'Ma', title: 'Anfangsbuchstabe groß' },
        { value: 'lower', label: 'ma', title: 'Alles klein' },
        { value: 'upper', label: 'MA', title: 'Alles groß' }
      ].forEach(option => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'case-option';
        button.dataset.caseStyle = option.value;
        button.dataset.reelIndex = String(index);
        button.textContent = option.label;
        button.title = option.title;
        button.setAttribute('aria-label', option.title);
        button.setAttribute('aria-pressed', String(pendingConfig.reelCases[index] === option.value));
        caseOptions.appendChild(button);
      });
      caseSetting.append(caseLegend, caseOptions);

      const toggleRow = document.createElement('label');
      toggleRow.className = 'toggle-row reel-toggle';
      const toggleText = document.createElement('span');
      toggleText.innerHTML = index === 0
        ? '<strong>Stern auf dieser Walze</strong><small>Auf der ersten Walze ist kein Stern erlaubt.</small>'
        : '<strong>Stern auf dieser Walze</strong><small>Der Stern ist eine Lesepause.</small>';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.dataset.reelStar = String(index);
      checkbox.checked = Boolean(pendingConfig.reelStars[index]);
      checkbox.disabled = index === 0;
      const track = document.createElement('span');
      track.className = 'toggle-track';
      track.setAttribute('aria-hidden', 'true');
      toggleRow.append(toggleText, checkbox, track);

      const info = document.createElement('p');
      info.className = 'reel-selection-info';
      const selectedCount = (pendingConfig.reelSelections[index] || []).length;
      info.textContent = allSyllables.length
        ? `${selectedCount} von ${allSyllables.length} Silben gewählt`
        : 'Bitte zuerst Vokale und Konsonanten auswählen.';

      const chips = document.createElement('div');
      chips.className = 'syllable-options';
      chips.dataset.reelOptions = String(index);
      if (allSyllables.length) {
        allSyllables.forEach(syllable => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'syllable-chip';
          button.dataset.syllable = syllable;
          button.dataset.reelIndex = String(index);
          const active = (pendingConfig.reelSelections[index] || []).includes(syllable);
          button.setAttribute('aria-pressed', String(active));
          button.textContent = Logic.formatForReel(syllable, index, pendingConfig.reelCases[index]);
          chips.appendChild(button);
        });
      }

      card.append(header, caseSetting, toggleRow, info, chips);
      container.appendChild(card);
    }
  }

  function validateSettings() {
    const errorElement = $('#formError');
    const overview = $('#syllableOverview');
    const allSyllables = Logic.generateSyllables(pendingConfig);
    const hasLetters = pendingConfig.vowels.length > 0 && pendingConfig.consonants.length > 0;
    const missingReel = pendingConfig.reelSelections.some(items => !items.length);
    const valid = hasLetters && !missingReel;

    $('#saveButton').disabled = !valid;
    errorElement.hidden = valid;
    if (!hasLetters) {
      errorElement.textContent = 'Wähle mindestens einen Vokal und einen Konsonanten.';
    } else if (missingReel) {
      errorElement.textContent = 'Jede Walze braucht mindestens eine Silbe.';
    }

    overview.innerHTML = '';
    const heading = document.createElement('p');
    heading.className = 'overview-copy';
    heading.textContent = allSyllables.length
      ? `Aus den Buchstaben entstehen ${allSyllables.length} mögliche Silben.`
      : 'Es sind noch keine Silben auswählbar.';
    overview.appendChild(heading);

    const preview = document.createElement('div');
    preview.className = 'preview-chips';
    allSyllables.slice(0, 24).forEach(syllable => {
      const chip = document.createElement('span');
      chip.className = 'preview-chip';
      chip.textContent = Logic.formatForReel(syllable, 1);
      preview.appendChild(chip);
    });
    if (allSyllables.length > 24) {
      const extra = document.createElement('span');
      extra.className = 'preview-extra';
      extra.textContent = `+ ${allSyllables.length - 24} weitere`;
      preview.appendChild(extra);
    }
    overview.appendChild(preview);
  }

  function renderSettings() {
    $('#reelCountButtons').querySelectorAll('button').forEach(button => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.reelCount) === pendingConfig.reelCount));
    });
    renderLetterOptions($('#vowelOptions'), Logic.ALL_VOWELS, pendingConfig.vowels, 'vowel');
    renderLetterOptions($('#consonantOptions'), Logic.ALL_CONSONANTS, pendingConfig.consonants, 'consonant');
    $('#soundToggle').checked = pendingConfig.soundEnabled;
    $('#motionToggle').checked = pendingConfig.reducedMotion;
    renderReelSettings();
    validateSettings();
  }

  function openSettings() {
    if (spinning) return;
    pendingConfig = Logic.copyConfig(config);
    renderSettings();
    if (typeof settingsDialog.showModal === 'function') settingsDialog.showModal();
    else settingsDialog.setAttribute('open', '');
  }

  function closeSettings() {
    if (typeof settingsDialog.close === 'function') settingsDialog.close();
    else settingsDialog.removeAttribute('open');
  }

  function toggleLetter(kind, value) {
    const key = kind === 'vowel' ? 'vowels' : 'consonants';
    const previousPool = Logic.generateSyllables(pendingConfig);
    // Preserve a teacher's intentional per-reel selection while adapting a
    // reel that previously contained ALL syllables to the changed letter pool.
    const selectedAll = pendingConfig.reelSelections.map(items =>
      previousPool.length === 0 || (items.length === previousPool.length && previousPool.every(s => items.includes(s)))
    );
    pendingConfig[key] = pendingConfig[key].includes(value)
      ? pendingConfig[key].filter(letter => letter !== value)
      : [...pendingConfig[key], value];
    const available = Logic.generateSyllables(pendingConfig);
    pendingConfig.reelSelections = pendingConfig.reelSelections.map((items, index) =>
      selectedAll[index] ? [...available] : items.filter(syllable => available.includes(syllable))
    );
    renderSettings();
  }

  function toggleSyllable(reelIndex, syllable) {
    const current = pendingConfig.reelSelections[reelIndex] || [];
    pendingConfig.reelSelections[reelIndex] = current.includes(syllable)
      ? current.filter(value => value !== syllable)
      : [...current, syllable];
    renderSettings();
  }

  function setAllSyllablesForReel(reelIndex, shouldSelectAll) {
    const allSyllables = Logic.generateSyllables(pendingConfig);
    pendingConfig.reelSelections[reelIndex] = shouldSelectAll ? [...allSyllables] : [];
    renderSettings();
  }

  $('#settingsOpen').addEventListener('click', openSettings);
  $('#settingsClose').addEventListener('click', closeSettings);
  settingsDialog.addEventListener('click', event => {
    if (event.target === settingsDialog) closeSettings();
  });

  $('#reelCountButtons').addEventListener('click', event => {
    const button = event.target.closest('[data-reel-count]');
    if (!button) return;
    const nextCount = Number(button.dataset.reelCount);
    const available = Logic.generateSyllables(pendingConfig);
    pendingConfig.reelStars = Array.from({ length: nextCount }, (_, index) =>
      index !== 0 && (pendingConfig.reelStars[index] ?? index === nextCount - 1)
    );
    pendingConfig.reelSelections = Array.from({ length: nextCount }, (_, index) =>
      pendingConfig.reelSelections[index] ? [...pendingConfig.reelSelections[index]] : [...available]
    );
    pendingConfig.reelCases = Array.from({ length: nextCount }, (_, index) =>
      pendingConfig.reelCases[index] || Logic.defaultCaseForReel(index)
    );
    pendingConfig.reelCount = nextCount;
    renderSettings();
  });

  $('#vowelOptions').addEventListener('click', event => {
    const button = event.target.closest('button[data-letter]');
    if (button) toggleLetter('vowel', button.dataset.letter);
  });

  $('#consonantOptions').addEventListener('click', event => {
    const button = event.target.closest('button[data-letter]');
    if (button) toggleLetter('consonant', button.dataset.letter);
  });

  $('#reelSettings').addEventListener('click', event => {
    const syllableButton = event.target.closest('button[data-syllable]');
    if (syllableButton) {
      toggleSyllable(Number(syllableButton.dataset.reelIndex), syllableButton.dataset.syllable);
      return;
    }
    const caseButton = event.target.closest('button[data-case-style]');
    if (caseButton) {
      const reelIndex = Number(caseButton.dataset.reelIndex);
      pendingConfig.reelCases[reelIndex] = caseButton.dataset.caseStyle;
      renderSettings();
      return;
    }
    const actionButton = event.target.closest('button[data-action]');
    if (actionButton) {
      const reelIndex = Number(actionButton.dataset.reelIndex);
      setAllSyllablesForReel(reelIndex, actionButton.dataset.action === 'select-all');
    }
  });

  $('#reelSettings').addEventListener('change', event => {
    const starToggle = event.target.closest('input[data-reel-star]');
    if (!starToggle) return;
    const reelIndex = Number(starToggle.dataset.reelStar);
    pendingConfig.reelStars[reelIndex] = starToggle.checked && reelIndex !== 0;
    renderSettings();
  });

  $('#soundToggle').addEventListener('change', event => {
    pendingConfig.soundEnabled = event.target.checked;
  });

  $('#motionToggle').addEventListener('change', event => {
    pendingConfig.reducedMotion = event.target.checked;
  });

  $('#resetButton').addEventListener('click', () => {
    pendingConfig = Logic.normalizeConfig(Logic.copyConfig(Logic.DEFAULT_CONFIG));
    renderSettings();
  });

  $('#settingsForm').addEventListener('submit', event => {
    event.preventDefault();
    const valid = pendingConfig.vowels.length > 0
      && pendingConfig.consonants.length > 0
      && pendingConfig.reelSelections.every(items => items.length > 0);
    if (!valid) return;
    config = Logic.normalizeConfig(pendingConfig);
    saveConfig();
    spinsWithoutStar = 0;
    saveStarStreak();
    refreshGame();
    closeSettings();
  });

  $('#soundButton').addEventListener('click', () => {
    config.soundEnabled = !config.soundEnabled;
    saveConfig();
    updateSoundButton();
    if (config.soundEnabled) sound(620, 0.12);
  });

  spinButton.addEventListener('click', spin);

  refreshGame();
})();
