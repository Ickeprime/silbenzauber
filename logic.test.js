const test = require('node:test');
const assert = require('node:assert/strict');
const logic = require('../public/logic.js');

test('erzeugt alle ausgewählten Silben in Kleinbuchstaben', () => {
  const config = logic.normalizeConfig({ vowels: ['A', 'I'], consonants: ['L', 'M'], reelCount: 3 });
  assert.deepEqual(logic.generateSyllables(config), ['la', 'li', 'ma', 'mi']);
});

test('erste Walze wird in Druckschrift mit großem Anfangsbuchstaben formatiert', () => {
  assert.equal(logic.formatForReel('ma', 0), 'Ma');
  assert.equal(logic.formatForReel('mi', 1), 'mi');
});

test('auf der ersten Walze kann nie ein Stern erscheinen', () => {
  const config = logic.normalizeConfig({
    reelCount: 4,
    vowels: ['A'],
    consonants: ['M'],
    reelStars: [true, true, true, true],
    reelSelections: [['ma'], ['ma'], ['ma'], ['ma']]
  });
  const results = Array.from({ length: 30 }, () => logic.drawResult(config, null, () => 0));
  assert.ok(results.every(result => result[0] !== '★'));
});

test('normalisiert Walzen-Sterne und Syllable-Auswahl passend zur Walzenzahl', () => {
  const config = logic.normalizeConfig({
    reelCount: 2,
    vowels: ['A'],
    consonants: ['L'],
    reelStars: [true, true, true],
    reelSelections: [['la'], ['la'], ['la']]
  });
  assert.deepEqual(config.reelStars, [false, true]);
  assert.equal(config.reelSelections.length, 2);
});

test('ohne Silben auf einer Walze werden beim Normalisieren alle verfügbaren Silben gewählt', () => {
  const config = logic.normalizeConfig({
    reelCount: 3,
    vowels: ['A'],
    consonants: ['L', 'M'],
    reelSelections: [[], ['ma'], []]
  });
  assert.deepEqual(config.reelSelections[0], ['la', 'ma']);
  assert.deepEqual(config.reelSelections[1], ['ma']);
  assert.deepEqual(config.reelSelections[2], ['la', 'ma']);
});

test('korrekte Leseaufträge mit null, einem und zwei Sternen', () => {
  assert.equal(logic.resultInstruction(['ma', 'mi', 'la']), 'Lies die Silben.');
  assert.equal(logic.resultInstruction(['ma', '★', 'la']), 'Ein Stern ist dabei! Lies die Silben.');
  assert.equal(logic.resultInstruction(['ma', '★', '★']), 'Zwei Sterne sind dabei! Lies die Silbe.');
});

test('ein Wiederholungsfall wird nach Möglichkeit vermieden', () => {
  const config = logic.normalizeConfig({
    reelCount: 2,
    vowels: ['A'],
    consonants: ['L', 'M'],
    reelStars: [false, false],
    reelSelections: [['la', 'ma'], ['la', 'ma']]
  });
  const result = logic.drawResult(config, ['la', 'la'], () => 0);
  assert.notDeepEqual(result, ['la', 'la']);
});
