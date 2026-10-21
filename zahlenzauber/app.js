/* Zahlenzauber – Darstellung und Bedienung des Affenwurfs */
(function () {
  "use strict";
  const L = window.ZahlenzauberLogic;
  const $ = id => document.getElementById(id);
  const svgNS = "http://www.w3.org/2000/svg";
  const board = $("playBoard"), target = $("target"), monkey = $("monkey"), monkeyFace = $("monkeyExpression");
  const storageKey = "zahlenzauber-settings-v1";
  let settings = Object.assign({}, L.DEFAULTS);
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (stored) settings = L.settingsFrom(stored);
  } catch (_) { /* Der Browser kann Speicherzugriffe blockieren. */ }
  let cells = [], throws = [], phase = "throw", busy = false;
  let chosenAnswer = null, answerOptions = [], roundVersion = 0, throwTimer = null;
  const rand = () => Math.random();
  const sum = () => throws.reduce((acc,item) => acc + item.value,0);

  function svg(tag, attrs, text) {
    const el = document.createElementNS(svgNS,tag);
    for (const [key,value] of Object.entries(attrs || {})) el.setAttribute(key,String(value));
    if (text !== undefined) el.textContent = String(text);
    return el;
  }
  function polar(r,angle) {
    const rad = angle * Math.PI / 180;
    return {x:250 + r * Math.cos(rad),y:250 + r * Math.sin(rad)};
  }
  function sector(outer,inner,start,end) {
    const a = polar(outer,start), b = polar(outer,end), c = polar(inner,end), d = polar(inner,start);
    return "M " + a.x + " " + a.y + " A " + outer + " " + outer + " 0 0 1 " +
      b.x + " " + b.y + " L " + c.x + " " + c.y + " A " + inner + " " + inner +
      " 0 0 0 " + d.x + " " + d.y + " Z";
  }
  function addBall(parent, x, y, latest) {
    const g = svg("g",{"class":"hit-marker" + (latest ? " new" : "")});
    g.appendChild(svg("circle",{cx:x,cy:y,r:17,fill:"#d91d2b",stroke:"#fff","stroke-width":2.7}));
    g.appendChild(svg("path",{d:"M " + (x-12) + " " + (y-12) + " Q " + (x+5) + " " + (y-5) + " " + (x+11) + " " + (y+13),fill:"none",stroke:"#fff","stroke-width":7}));
    g.appendChild(svg("path",{d:"M " + (x-10) + " " + (y-5) + " Q " + x + " " + (y+9) + " " + (x+12) + " " + (y+7),fill:"none",stroke:"#fff0dd","stroke-width":3}));
    parent.appendChild(g);
  }
  function renderTarget() {
    target.replaceChildren();
    target.appendChild(svg("rect",{x:219,y:448,width:60,height:44,rx:5,fill:"#915223",stroke:"#6c3517","stroke-width":5}));
    target.appendChild(svg("circle",{cx:250,cy:250,r:237,fill:"#39271f",stroke:"#211d1b","stroke-width":6}));
    target.appendChild(svg("circle",{cx:250,cy:250,r:230,fill:"#fff"}));
    const bounds = [[228,174],[174,113],[113,42]];
    for (const c of cells) {
      if (c.kind !== "field") continue;
      const ringBounds = bounds[c.ring], start = -90 + c.index * 45;
      target.appendChild(svg("path",{d:sector(ringBounds[0],ringBounds[1],start,start+45),
        fill:c.color,"class":"field"}));
    }
    target.appendChild(svg("circle",{cx:250,cy:250,r:41,fill:"#c20a63",stroke:"#fff","stroke-width":5}));
    for (const c of cells) {
      const n = String(c.value).length;
      const fill = c.color === "#ffd523" ? "#ae251e" : "#fff";
      target.appendChild(svg("text",{x:c.textX,y:c.textY,"font-size":c.kind === "center" ? 29 : (n >= 4 ? 15 : n === 3 ? 17 : 23),
        "class":"target-number",fill:fill},c.value));
    }
    throws.forEach((h,i) => {
      if (h.kind === "miss") {
        const missIndex = throws.slice(0,i).filter(x => x.kind === "miss").length;
        addBall(target,112 + missIndex * 56,494,i === throws.length - 1);
      } else addBall(target,h.ballX,h.ballY,i === throws.length - 1);
    });
    const descriptions = throws.map((h,i) => (i+1) + ". Wurf: " + (h.kind === "miss" ? "vorbei, 0 Punkte" : h.value + " Punkte"));
    target.setAttribute("aria-label","Zielscheibe; " + (descriptions.join("; ") || "noch kein Ball geworfen"));
  }
  function setMonkeyEmotion(type) {
    monkey.classList.remove("throwing","celebrating","sad");
    monkeyFace.hidden = true;
    if (type === "throw") monkey.classList.add("throwing");
    if (type === "happy") monkey.classList.add("celebrating");
    if (type === "sad") {
      monkey.classList.add("sad");
      monkeyFace.hidden = false;
      monkeyFace.textContent = "🙈";
    }
  }
  function equationHTML() {
    return throws.map((h) => {
      const value = Number(h.value), color = h.kind === "miss" ? "#83919a" : h.color;
      return '<span class="number-chip" style="background:' + color + ';color:white">' + value + '</span>';
    }).join('<span class="operator">+</span>') + '<span class="operator">= ?</span>';
  }
  function renderBoard() {
    if (phase === "throw") {
      const remaining = 3 - throws.length;
      const balls = Array.from({length:3},(_,i) =>
        '<span class="ball-slot ' + (i < remaining ? "available" : "used") +
        '" role="img" aria-label="' + (i < remaining ? "Ball verfügbar" : "Ball verbraucht") + '"></span>').join("");
      board.innerHTML = '<h2 class="board-heading">' + remaining + ' ' +
        (remaining === 1 ? "Ball hast du noch" : "Bälle hast du noch") +
        '</h2><div class="ball-slots">' + balls + '</div>';
      const latest = throws[throws.length - 1];
      const centerNow = settings.centerMode === "afterTwoMisses" && throws.length === 2 &&
        throws.every(x => x.kind === "miss") && settings.maxTotal >= 100;
      $("instruction").textContent = latest && latest.kind === "miss"
        ? (centerNow ? "Zwei Nieten! Jetzt kannst du die 100 treffen!" : "Daneben! Klick für den nächsten Ball.")
        : (throws.length === 0 ? "Klick auf den Affen zum Werfen!" : "Gut geworfen! Klick für den nächsten Ball.");
      $("monkeyMessage").innerHTML = "Klick mich<br>zum Werfen!";
      monkey.disabled = busy;
      monkey.setAttribute("aria-label","Affe anklicken, um Ball " + (throws.length+1) + " zu werfen");
      if (!busy) setMonkeyEmotion("");
      return;
    }
    monkey.disabled = true;
    if (phase === "answer") {
      $("instruction").textContent = "Rechne die drei Zahlen zusammen!";
      $("monkeyMessage").textContent = "Jetzt rechnen!";
      setMonkeyEmotion("");
      board.innerHTML = '<h2 class="board-heading">Was ist das Ergebnis?</h2><div class="equation">' +
        equationHTML() + '</div><div class="answers">' +
        answerOptions.map((v,i) => '<button class="answer-button" type="button" data-answer="' + v +
          '" aria-label="Antwort ' + String.fromCharCode(65+i) + ': ' + v + '">' + v + '</button>').join("") + '</div>';
      return;
    }
    const right = chosenAnswer === sum();
    $("instruction").textContent = right ? "Super gemacht!" : "Das üben wir einfach nochmal!";
    $("monkeyMessage").textContent = right ? "Juhu!" : "Nicht aufgeben!";
    setMonkeyEmotion(right ? "happy" : "sad");
    board.innerHTML = '<div class="feedback"><h2 class="' + (right ? "" : "wrong") + '">' +
      (right ? "Richtig! ⭐" : "Leider falsch! 🙈") + '</h2><p>' +
      (right ? "Super! Du hast richtig gerechnet!" : "Schau dir die richtige Summe an.") +
      '</p><div class="result-line">' + throws.map(h => h.value).join(" + ") + " = " + sum() +
      '</div><button type="button" class="again-button" id="again">Nochmal ▶</button></div>';
  }
  function startRound() {
    roundVersion++;
    if (throwTimer) clearTimeout(throwTimer);
    throws = []; busy = false; chosenAnswer = null; answerOptions = [];
    phase = "throw"; cells = L.makeCells(settings,rand);
    renderTarget(); renderBoard();
  }
  function throwBall() {
    if (phase !== "throw" || busy) return;
    const selected = L.chooseHit(settings,cells,throws,rand);
    const version = roundVersion;
    busy = true; monkey.disabled = true; setMonkeyEmotion("throw");
    $("instruction").textContent = "Der Ball fliegt …";
    throwTimer = setTimeout(() => {
      if (version !== roundVersion) return;
      throws.push(selected); busy = false; throwTimer = null;
      if (throws.length === 3) {
        phase = "answer";
        answerOptions = L.makeAnswers(settings,throws,rand);
      }
      renderTarget(); renderBoard();
    },420);
  }
  function settingsInForm() {
    return {
      mode:document.querySelector('input[name="mode"]:checked').value,
      maxField:Number($("maxField").value),
      maxTotal:Number($("maxTotal").value),
      centerMode:document.querySelector('input[name="centerMode"]:checked').value,
      allowMisses:$("allowMisses").checked
    };
  }
  function fillForm(s) {
    document.querySelector('input[name="mode"][value="' + s.mode + '"]').checked = true;
    document.querySelector('input[name="centerMode"][value="' + s.centerMode + '"]').checked = true;
    $("maxField").value = s.maxField;
    $("maxTotal").value = s.maxTotal;
    $("allowMisses").checked = s.allowMisses;
    updateHint();
  }
  function updateHint() {
    const s = settingsInForm();
    const error = L.validate(s);
    $("configError").hidden = !error;
    $("configError").textContent = error;
    $("maxField").step = s.mode === "tens" ? "10" : "1";
    $("maxField").min = s.mode === "tens" ? "10" : "1";
    $("maxTotal").step = s.mode === "tens" ? "10" : "1";
    $("maxTotal").min = s.mode === "tens" ? "30" : "3";
    if (error) {
      $("settingsHint").textContent = "Bitte passe die markierten Einstellungen an.";
    } else {
      const cap = L.maxOrdinary(s);
      const note = s.centerMode === "never"
        ? "Die Mitte (100) ist gesperrt."
        : s.centerMode === "afterTwoMisses"
          ? "Die 100 kann nur beim dritten Wurf nach zwei Nieten getroffen werden."
          : "Die 100 kann getroffen werden, wenn die verbleibende Summe reicht.";
      $("settingsHint").innerHTML = "<strong>Beispiel:</strong> normale Felder bis " + cap +
        " Punkte, maximal " + s.maxTotal + " Punkte insgesamt. " + note +
        (s.allowMisses ? " Ein Fehlwurf zählt 0." : " Jeder Wurf trifft die Scheibe.");
    }
  }
  function openConfig() {
    fillForm(settings);
    $("saveStatus").textContent = "Änderungen bleiben auf diesem Gerät gespeichert.";
    $("settingsDialog").showModal();
    $("closeConfig").focus();
  }
  function closeConfig() { $("settingsDialog").close(); $("openConfig").focus(); }
  function saveConfig(e) {
    e.preventDefault();
    const next = settingsInForm(), error = L.validate(next);
    if (error) { updateHint(); $("configError").focus(); return; }
    let persisted = true;
    try { localStorage.setItem(storageKey,JSON.stringify(next)); }
    catch (_) { persisted = false; }
    settings = next;
    closeConfig();
    startRound();
    if (!persisted) {
      $("instruction").textContent = "Einstellungen gelten jetzt. Dauerhaft speichern ist in diesem Browser nicht möglich.";
    }
  }
  $("monkey").addEventListener("click",throwBall);
  board.addEventListener("click",event => {
    const button = event.target.closest("[data-answer]");
    if (button && phase === "answer") {
      chosenAnswer = Number(button.dataset.answer);
      phase = "feedback";
      renderBoard();
    } else if (event.target.closest("#again")) startRound();
  });
  $("openConfig").addEventListener("click",openConfig);
  $("closeConfig").addEventListener("click",closeConfig);
  $("cancelConfig").addEventListener("click",closeConfig);
  $("resetConfig").addEventListener("click",() => fillForm(L.DEFAULTS));
  $("configForm").addEventListener("input",updateHint);
  $("configForm").addEventListener("submit",saveConfig);
  startRound();
})();