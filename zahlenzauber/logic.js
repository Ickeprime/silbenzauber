/* Zahlenzauber – reine, testbare Spielregeln (auch in Node verwendbar) */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ZahlenzauberLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DEFAULTS = Object.freeze({
    mode: "tens",
    maxField: 100,
    maxTotal: 100,
    centerMode: "afterTwoMisses",
    allowMisses: true
  });
  const RINGS = [
    [10,10,10,10,10,10,10,10],
    [50,30,40,20,50,30,40,20],
    [80,90,60,70,80,90,60,70]
  ];
  const PALETTES = [
    ["#073a9e","#40c915","#ed3223","#ffd523","#073a9e","#40c915","#ed3223","#ffd523"],
    ["#40c915","#e83223","#ffd523","#073a9e","#40c915","#e83223","#ffd523","#073a9e"],
    ["#ffd523","#073a9e","#e83223","#40c915","#ffd523","#073a9e","#e83223","#40c915"]
  ];
  const CELL_RADIUS = [202,145,81];

  function minValue(s) { return s.mode === "tens" ? 10 : 1; }
  function validate(s) {
    if (!s || !["tens","mixed"].includes(s.mode)) return "Bitte eine Zahlenart wählen.";
    if (!Number.isInteger(s.maxField) || s.maxField < minValue(s) || s.maxField > 1000)
      return "Die größte Feldzahl muss zwischen " + minValue(s) + " und 1000 liegen.";
    if (s.mode === "tens" && s.maxField % 10 !== 0)
      return "Bei Zehnerzahlen muss die Feldgrenze eine Zehnerzahl sein.";
    if (!Number.isInteger(s.maxTotal) || s.maxTotal < minValue(s) * 3 || s.maxTotal > 3000)
      return "Die Höchstsumme muss zwischen " + (3 * minValue(s)) + " und 3000 liegen.";
    if (!["normal","never","afterTwoMisses"].includes(s.centerMode))
      return "Bitte eine Einstellung für die Mitte wählen.";
    if (typeof s.allowMisses !== "boolean") return "Bitte die Fehlwürfe einstellen.";
    if (s.centerMode === "afterTwoMisses" && !s.allowMisses)
      return "Für die 100 nach zwei Nieten müssen Fehlwürfe erlaubt sein.";
    return "";
  }
  function settingsFrom(value) {
    const s = Object.assign({}, DEFAULTS, value);
    return validate(s) ? Object.assign({}, DEFAULTS) : s;
  }
  function maxOrdinary(s) {
    const reserved = s.allowMisses ? 0 : 2 * minValue(s);
    const cap = Math.min(s.maxField, s.maxTotal - reserved);
    return s.mode === "tens" ? Math.floor(cap / 10) * 10 : Math.floor(cap);
  }
  function makeCells(s, random) {
    if (validate(s)) throw new Error(validate(s));
    const rand = typeof random === "function" ? random : Math.random;
    const cap = maxOrdinary(s), min = minValue(s);
    const cells = [];
    for (let ring = 0; ring < 3; ring++) {
      for (let i = 0; i < 8; i++) {
        const original = RINGS[ring][i];
        let score;
        if (ring === 0) {
          score = min;
        } else {
          score = Math.max(min, Math.round((original / 100) * cap / min) * min);
          if (s.mode === "mixed") {
            const spread = Math.max(1, Math.round(cap / 16));
            score = Math.max(min, score + Math.floor(rand() * (spread * 2 + 1)) - spread);
            score = Math.min(cap, score);
          }
        }
        score = Math.max(min, Math.min(cap, score));
        const angle = (-90 + 22.5 + 45 * i) * Math.PI / 180;
        cells.push({
          id: ring + "-" + i, ring, index: i, kind: "field", value: score,
          color: PALETTES[ring][i],
          textX: 250 + CELL_RADIUS[ring] * Math.cos(angle),
          textY: 250 + CELL_RADIUS[ring] * Math.sin(angle),
          ballX: 250 + [188,132,69][ring] * Math.cos(angle + 0.15),
          ballY: 250 + [188,132,69][ring] * Math.sin(angle + 0.15)
        });
      }
    }
    cells.push({
      id: "center", kind: "center", ring: 3, index: 0, value: 100,
      color: "#c20a63", textX: 250, textY: 250, ballX: 280, ballY: 281
    });
    return cells;
  }
  function choices(s, cells, thrown) {
    const used = new Set(thrown.filter(x => x.kind !== "miss").map(x => x.id));
    const spent = thrown.reduce((sum,x) => sum + x.value, 0);
    const remainingAfter = 2 - thrown.length;
    const reserve = s.allowMisses ? 0 : remainingAfter * minValue(s);
    const possible = cells.filter(c => {
      if (used.has(c.id) || spent + c.value + reserve > s.maxTotal) return false;
      if (c.kind === "center") {
        if (s.centerMode === "never") return false;
        if (s.centerMode === "afterTwoMisses")
          return thrown.length === 2 && thrown.every(x => x.kind === "miss");
      }
      return true;
    });
    if (s.allowMisses) possible.push({id:"miss",kind:"miss",value:0,color:"#a8a8a8"});
    return possible;
  }
  function chooseHit(s, cells, thrown, random) {
    const rand = typeof random === "function" ? random : Math.random;
    const possible = choices(s, cells, thrown);
    if (!possible.length) throw new Error("Keine zulässigen Treffer. Bitte Konfiguration prüfen.");
    const misses = possible.find(c => c.kind === "miss");
    const center = possible.find(c => c.kind === "center");
    const ordinary = possible.filter(c => c.kind === "field");
    if (misses) {
      const missesAlready = thrown.filter(x => x.kind === "miss").length;
      const rate = s.centerMode === "afterTwoMisses" && thrown.length < 2
        ? (missesAlready === thrown.length ? (thrown.length === 0 ? 0.27 : 0.4) : 0.15)
        : 0.17;
      if (rand() < rate) return misses;
    }
    // Nach genau zwei Nieten ist die Mitte möglich, nicht vorgeschrieben.
    if (center && rand() < (s.centerMode === "afterTwoMisses" ? 0.7 : 0.18)) return center;
    if (ordinary.length) return ordinary[Math.floor(rand() * ordinary.length)];
    return center || misses;
  }
  function makeAnswers(s, thrown, random) {
    const rand = typeof random === "function" ? random : Math.random;
    const correct = thrown.reduce((sum,h) => sum + h.value,0);
    const step = s.mode === "tens" ? 10 : Math.max(1,Math.min(10,Math.round(s.maxTotal / 20)));
    const answers = new Set([correct]);
    for (const d of [-1,1,-2,2,-3,3,-4,4]) {
      const proposal = correct + d * step;
      if (proposal >= 0 && proposal <= s.maxTotal) answers.add(proposal);
      if (answers.size >= 3) break;
    }
    for (let n = 0; answers.size < 3 && n <= s.maxTotal; n += (s.mode === "tens" ? 10 : 1))
      answers.add(n);
    const values = Array.from(answers).slice(0,3);
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
  }
  return {DEFAULTS, validate, settingsFrom, makeCells, choices, chooseHit, makeAnswers, maxOrdinary};
});
