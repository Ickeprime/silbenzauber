/* Silbenzauber: pure game logic; usable in the browser and in Node.js tests. */
(function (root, factory) {
  const result = factory();
  if (typeof module === 'object' && module.exports) module.exports = result;
  if (root) root.SilbenzauberLogic = result;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const ALL_VOWELS = ['A', 'E', 'I', 'O', 'U', 'Ä', 'Ö', 'Ü'];
  const ALL_CONSONANTS = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
  const DEFAULT_CONFIG = Object.freeze({
    reelCount: 3,
    vowels: ['A', 'E', 'I', 'O', 'U'],
    consonants: ['L', 'M', 'S', 'T'],
    reelStars: [false, false, true],
    reelCases: ['initial', 'lower', 'lower'],
    reelSelections: [],
    soundEnabled: false,
    reducedMotion: false
  });
  const STORAGE_KEY = 'silbenzauber:phase2:config';

  function copyConfig(config) {
    return {
      ...config,
      vowels: [...(config.vowels || [])],
      consonants: [...(config.consonants || [])],
      reelStars: [...(config.reelStars || [])],
      reelCases: [...(config.reelCases || [])],
      reelSelections: Array.isArray(config.reelSelections) ? config.reelSelections.map(items => [...items]) : []
    };
  }

  function defaultStarState(reelCount) {
    return Array.from({ length: reelCount }, (_, index) => index !== 0 && index === reelCount - 1);
  }

  function defaultCaseForReel(index) {
    return index === 0 ? 'initial' : 'lower';
  }

  function sanitizeLetters(source, allowed) {
    if (!Array.isArray(source)) return [];
    return allowed.filter(letter => source.includes(letter));
  }

  function generateSyllables(config) {
    const consonants = ALL_CONSONANTS.filter(letter => Array.isArray(config.consonants) && config.consonants.includes(letter));
    const vowels = ALL_VOWELS.filter(letter => Array.isArray(config.vowels) && config.vowels.includes(letter));
    return consonants.flatMap(consonant => vowels.map(vowel => `${consonant.toLowerCase()}${vowel.toLowerCase()}`));
  }

  function normalizeConfig(input) {
    const raw = input && typeof input === 'object' ? input : {};
    const reelCount = [1, 2, 3, 4, 5].includes(raw.reelCount) ? raw.reelCount : DEFAULT_CONFIG.reelCount;
    const vowels = Array.isArray(raw.vowels) ? sanitizeLetters(raw.vowels, ALL_VOWELS) : [...DEFAULT_CONFIG.vowels];
    const consonants = Array.isArray(raw.consonants) ? sanitizeLetters(raw.consonants, ALL_CONSONANTS) : [...DEFAULT_CONFIG.consonants];
    const soundEnabled = typeof raw.soundEnabled === 'boolean' ? raw.soundEnabled : DEFAULT_CONFIG.soundEnabled;
    const reducedMotion = typeof raw.reducedMotion === 'boolean' ? raw.reducedMotion : DEFAULT_CONFIG.reducedMotion;
    const availableSyllables = generateSyllables({ vowels, consonants });

    const rawStars = Array.isArray(raw.reelStars) ? raw.reelStars : defaultStarState(reelCount);
    const reelStars = Array.from({ length: reelCount }, (_, index) => {
      if (index === 0) return false;
      if (index < rawStars.length) return Boolean(rawStars[index]);
      return defaultStarState(reelCount)[index];
    });

    const allowedCases = ['initial', 'lower', 'upper'];
    const reelCases = Array.from({ length: reelCount }, (_, index) => {
      const value = Array.isArray(raw.reelCases) ? raw.reelCases[index] : null;
      return allowedCases.includes(value) ? value : defaultCaseForReel(index);
    });

    const reelSelections = Array.from({ length: reelCount }, (_, index) => {
      const candidate = Array.isArray(raw.reelSelections) && Array.isArray(raw.reelSelections[index])
        ? raw.reelSelections[index].filter(syllable => availableSyllables.includes(syllable))
        : [];
      if (!availableSyllables.length) return [];
      return candidate.length ? [...new Set(candidate)] : [...availableSyllables];
    });

    return { reelCount, vowels, consonants, reelStars, reelCases, reelSelections, soundEnabled, reducedMotion };
  }

  function pick(items, random = Math.random) {
    return items[Math.floor(random() * items.length) % items.length];
  }

  function drawResult(config, previous = null, random = Math.random, spinsWithoutStar = 0) {
    const normalized = normalizeConfig(config);
    const allSyllables = generateSyllables(normalized);
    if (!allSyllables.length) throw new Error('Mindestens eine Silbe erforderlich.');

    let result = [];
    for (let attempt = 0; attempt < 10; attempt++) {
      result = normalized.reelSelections.map((syllables, index) => {
        const pool = syllables.length ? syllables : allSyllables;
        const mayShowStar = normalized.reelStars[index] && index !== 0;
        if (mayShowStar && random() < 0.24) return '★';
        return pick(pool, random);
      });
      if (!previous || result.join('|') !== previous.join('|')) break;
    }

    if (previous && result.join('|') === previous.join('|')) {
      const movableIndexes = result.map((_, index) => index).filter(index => normalized.reelSelections[index].length > 1 || normalized.reelStars[index]);
      const slot = movableIndexes.length ? pick(movableIndexes, random) : 0;
      const pool = normalized.reelSelections[slot].length ? normalized.reelSelections[slot] : allSyllables;
      const alternatives = pool.filter(syllable => syllable !== result[slot]);
      if (alternatives.length) result[slot] = pick(alternatives, random);
      else if (slot !== 0 && normalized.reelStars[slot] && result[slot] !== '★') result[slot] = '★';
    }

    const starReels = normalized.reelStars
      .map((allowed, index) => allowed && index > 0 ? index : -1)
      .filter(index => index >= 0);
    const starIsDue = starReels.length > 0 && Number(spinsWithoutStar) >= 3;
    if (starIsDue && !result.includes('★')) {
      result[pick(starReels, random)] = '★';
    }

    if (result[0] === '★') result[0] = normalized.reelSelections[0][0] || allSyllables[0];
    return result;
  }

  function nextStarStreak(config, result, current = 0) {
    const normalized = normalizeConfig(config);
    const canShowStar = normalized.reelStars.some((allowed, index) => allowed && index > 0);
    if (!canShowStar || result.includes('★')) return 0;
    return Math.max(0, Number(current) || 0) + 1;
  }

  function resultInstruction(result) {
    const count = result.filter(item => item !== '★').length;
    const stars = result.length - count;
    if (count < 1) return 'Drehe noch einmal!';
    const instruction = `Lies die ${count === 1 ? 'Silbe' : 'Silben'}.`;
    if (stars === 0) return instruction;
    const names = { 1: 'Ein Stern ist', 2: 'Zwei Sterne sind', 3: 'Drei Sterne sind', 4: 'Vier Sterne sind' };
    return `${names[stars] || `${stars} Sterne sind`} dabei! ${instruction}`;
  }

  function formatForReel(symbol, reelIndex, caseStyle) {
    if (symbol === '★') return symbol;
    const normalized = String(symbol).toLowerCase();
    const style = ['initial', 'lower', 'upper'].includes(caseStyle) ? caseStyle : defaultCaseForReel(reelIndex);
    if (style === 'upper') return normalized.toUpperCase();
    if (style === 'initial') return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    return normalized;
  }

  return {
    ALL_VOWELS,
    ALL_CONSONANTS,
    DEFAULT_CONFIG,
    STORAGE_KEY,
    copyConfig,
    defaultStarState,
    defaultCaseForReel,
    normalizeConfig,
    generateSyllables,
    drawResult,
    nextStarStreak,
    resultInstruction,
    formatForReel
  };
});
