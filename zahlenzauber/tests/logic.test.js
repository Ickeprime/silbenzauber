const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../logic.js");

test("Voreinstellungen sind gültig", () => {
  assert.equal(L.validate(L.DEFAULTS),"");
  assert.equal(L.makeCells(L.DEFAULTS,()=>0.5).length,25);
});
test("Bei Zehnerzahlen ohne Fehlwurf kann die Dreiersumme 100 nie überschreiten", () => {
  const s = {mode:"tens",maxField:100,maxTotal:100,centerMode:"never",allowMisses:false};
  for(let round=0;round<500;round++) {
    const cells=L.makeCells(s),hit=[];
    while(hit.length<3) hit.push(L.chooseHit(s,cells,hit));
    assert.ok(hit.every(h=>h.value%10===0 && h.value>0));
    assert.ok(hit.reduce((sum,h)=>sum+h.value,0)<=100);
    assert.equal(new Set(hit.map(h=>h.id)).size,3);
  }
});
test("Konfiguration 200 erlaubt höhere Summen, aber nie über 200", () => {
  const s={mode:"tens",maxField:100,maxTotal:200,centerMode:"normal",allowMisses:true};
  let highSeen=false;
  for(let round=0;round<500;round++) {
    const cells=L.makeCells(s),hit=[];
    while(hit.length<3) hit.push(L.chooseHit(s,cells,hit));
    const value=hit.reduce((sum,h)=>sum+h.value,0);
    assert.ok(value<=200);
    if(value>100)highSeen=true;
  }
  assert.equal(highSeen,true);
});
test("Gesperrte Mitte darf nie getroffen werden", () => {
  const s={...L.DEFAULTS,centerMode:"never"};
  const cells=L.makeCells(s);
  for(let round=0;round<1000;round++) {
    const thrown=[L.chooseHit(s,cells,[])];
    thrown.push(L.chooseHit(s,cells,thrown));
    thrown.push(L.chooseHit(s,cells,thrown));
    assert.ok(thrown.every(h=>h.kind!=="center"));
  }
});
test("Nach genau zwei Nieten darf die 100 getroffen werden", () => {
  const s={...L.DEFAULTS,centerMode:"afterTwoMisses",allowMisses:true,maxTotal:100};
  const cells=L.makeCells(s);
  const miss={kind:"miss",id:"miss",value:0};
  assert.ok(!L.choices(s,cells,[]).some(c=>c.kind==="center"));
  assert.ok(!L.choices(s,cells,[miss]).some(c=>c.kind==="center"));
  assert.ok(L.choices(s,cells,[miss,miss]).some(c=>c.kind==="center"));
  assert.ok(!L.choices(s,cells,[miss,cells[0]]).some(c=>c.kind==="center"));
  assert.ok(!L.choices({...s,maxTotal:90},cells,[miss,miss]).some(c=>c.kind==="center"));
});
test("Ungültige Einstellungen sind abgewiesen", () => {
  assert.ok(L.validate({...L.DEFAULTS,allowMisses:false,centerMode:"afterTwoMisses"}));
  assert.ok(L.validate({...L.DEFAULTS,maxTotal:20}));
  assert.ok(L.validate({...L.DEFAULTS,maxField:55}));
});
test("Jede Runde hat drei unterschiedliche Antworten mit genau einer Lösung", () => {
  for (const s of [
    {mode:"mixed",maxField:70,maxTotal:100,centerMode:"never",allowMisses:true},
    {mode:"tens",maxField:100,maxTotal:100,centerMode:"afterTwoMisses",allowMisses:true},
    {mode:"tens",maxField:100,maxTotal:200,centerMode:"normal",allowMisses:false}
  ]) {
    for(let round=0;round<120;round++) {
      const cells=L.makeCells(s),hit=[];
      while(hit.length<3)hit.push(L.chooseHit(s,cells,hit));
      const opts=L.makeAnswers(s,hit);
      assert.equal(opts.length,3);
      assert.equal(new Set(opts).size,3);
      assert.ok(opts.includes(hit.reduce((acc,h)=>acc+h.value,0)));
    }
  }
});