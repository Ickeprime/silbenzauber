const test = require('node:test');
const assert = require('node:assert/strict');
const logic = require('../logic.js');

test('generiert die ausgewaehlten offenen Silben klein', () => {
  const config = logic.normalizeConfig({ vowels: ['A', 'I'], consonants: ['L', 'M'], reelCount: 3 });
  assert.deepEqual(logic.generateSyllables(config), ['la', 'li', 'ma', 'mi']);
});

test('erste Walze wird gross, spaetere klein angezeigt', () => {
  assert.equal(logic.formatForReel('ma', 0), 'Ma');
  assert.equal(logic.formatForReel('mi', 1), 'mi');
  assert.equal(logic.formatForReel('★', 2), '★');
});

test('auf der ersten Walze erscheint niemals ein Stern', () => {
  const config = logic.normalizeConfig({
    reelCount: 4, vowels: ['A'], consonants: ['M'],
    reelStars: [true, true, true, true],
    reelSelections: [['ma'], ['ma'], ['ma'], ['ma']]
  });
  for (let i = 0; i < 30; i += 1) {
    assert.notEqual(logic.drawResult(config, null, () => 0)[0], '★');
  }
  assert.equal(config.reelStars[0], false);
});

test('konfiguriert Walzenzahl, Sternfelder und Silbenauswahl', () => {
  const config = logic.normalizeConfig({
    reelCount: 2, vowels: ['A'], consonants: ['L'],
    reelStars: [true, true, true],
    reelSelections: [['la'], ['la'], ['la']]
  });
  assert.deepEqual(config.reelStars, [false, true]);
  assert.equal(config.reelSelections.length, 2);
});

test('normalisiert fehlende Silbenauswahl auf verfuegbare Silben', () => {
  const config = logic.normalizeConfig({
    reelCount: 3, vowels: ['A'], consonants: ['L', 'M'],
    reelSelections: [[], ['ma'], []]
  });
  assert.deepEqual(config.reelSelections[0], ['la', 'ma']);
  assert.deepEqual(config.reelSelections[1], ['ma']);
  assert.deepEqual(config.reelSelections[2], ['la', 'ma']);
});

test('Leseauftrag passt sich an Sterne und sichtbare Silben an', () => {
  assert.equal(logic.resultInstruction(['ma', 'mi', 'la']), 'Lies die Silben.');
  assert.equal(logic.resultInstruction(['ma', '★', 'la']), 'Ein Stern ist dabei! Lies die Silben.');
  assert.equal(logic.resultInstruction(['ma', '★', '★']), 'Zwei Sterne sind dabei! Lies die Silbe.');
});

test('vermeidet gleiche Kombinationen, wenn Alternativen existieren', () => {
  const config = logic.normalizeConfig({
    reelCount: 2, vowels: ['A'], consonants: ['L', 'M'],
    reelStars: [false, false],
    reelSelections: [['la', 'ma'], ['la', 'ma']]
  });
  assert.notDeepEqual(logic.drawResult(config, ['la', 'la'], () => 0), ['la', 'la']);
});
