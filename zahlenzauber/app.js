/* Zahlenzauber – Darstellung und Bedienung des Affenwurfs */
(function () {
  "use strict";
  const L = window.ZahlenzauberLogic;
  const $ = id => document.getElementById(id);
  const svgNS = "http://www.w3.org/2000/svg";
  const board = $("playBoard"), target = $("target"), monkey = $("monkey"), monkeyFace = $("monkeyExpression");
  const storageKey = "zahlenzauber-settings-v1";
  const soundKey = "zahlenzauber-sound-v1";
  let soundEnabled = false, audioContext = null, toastTimer = null;
  try { soundEnabled = localStorage.getItem(soundKey) === "1"; } catch (_) {}

  // Alle Klänge werden vor Ort mit Web Audio erzeugt – keine Audiodateien/Downloads.
  function playSound(kind) {
    if (!soundEnabled) return;
    const AudioClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioClass) return;
    try {
      if (!audioContext) audioContext = new AudioClass();
      const ctx = audioContext;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const start = ctx.currentTime + 0.015;
      function chirp(from, to, duration, delay, loudness, shape) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = start + delay;
        osc.type = shape || "sine";
        osc.frequency.setValueAtTime(from,t);
        osc.frequency.exponentialRampToValueAtTime(Math.max(to,30),t+duration);
        gain.gain.setValueAtTime(0.0001,t);
        gain.gain.exponentialRampToValueAtTime(loudness,t+0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001,t+duration);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(t);osc.stop(t+duration+0.02);
      }
      if (kind === "throw") {
        const length = Math.floor(ctx.sampleRate * .24);
        const buffer = ctx.createBuffer(1,length,ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i=0;i<length;i++) data[i]=(Math.random()*2-1)*(1-i/length);
        const source = ctx.createBufferSource(), lowpass=ctx.createBiquadFilter(), gain=ctx.createGain();
        source.buffer=buffer;lowpass.type="lowpass";
        lowpass.frequency.setValueAtTime(2900,start);
        lowpass.frequency.exponentialRampToValueAtTime(450,start+.24);
        gain.gain.setValueAtTime(.0001,start);
        gain.gain.linearRampToValueAtTime(.12,start+.035);
        gain.gain.exponentialRampToValueAtTime(.0001,start+.24);
        source.connect(lowpass);lowpass.connect(gain);gain.connect(ctx.destination);
        source.start(start);
      } else if (kind === "hit") {
        chirp(250,130,.17,0,.14,"triangle");
        chirp(430,260,.09,.04,.055,"sine");
      } else if (kind === "miss") {
        chirp(310,170,.28,0,.09,"triangle");
      } else if (kind === "correct") {
        chirp(523,523,.13,0,.11);
        chirp(659,659,.14,.13,.11);
        chirp(784,850,.27,.28,.12);
      } else if (kind === "wrong") {
        chirp(320,245,.23,0,.085,"sine");
      } else if (kind === "toggle") {
        chirp(540,710,.14,0,.09);
      }
    } catch (_) { /* Ungeeignete Audio-Hardware darf das Spiel nie blockieren. */ }
  }
  function updateSoundButton() {
    $("soundButton").setAttribute("aria-pressed",String(soundEnabled));
    $("soundButton").setAttribute("aria-label",soundEnabled ? "Geräusche ausschalten" : "Geräusche einschalten");
    $("soundButton").firstChild.textContent = soundEnabled ? "🔊 " : "🔇 ";
    $("soundLabel").textContent = soundEnabled ? "Ton an" : "Ton aus";
  }
  function describeSettings(s) {
    return (s.mode === "tens" ? "Zehnerzahlen" : "Gemischte Zahlen") +
      " · Felder bis " + s.maxField + " · Rechnen bis " + s.maxTotal;
  }
  function updateActiveSettings() { $("activeSettings").textContent = "✏️ " + describeSettings(settings); }
  function showSaveToast(persisted) {
    const el = $("saveToast");
    el.textContent = persisted
      ? "✓ Einstellungen gespeichert! " + describeSettings(settings)
      : "⚠️ Einstellungen übernommen, aber dein Browser verhindert das dauerhafte Speichern.";
    el.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 7000);
  }

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
  function addBall(parent, x, y, latest, points) {
    // Der Zahlenwert bleibt auch dann lesbar, wenn der Ball das Zahlenfeld verdeckt.
    const g = svg("g",{"class":"hit-marker" + (latest ? " new" : ""), "aria-hidden":"true"});
    g.appendChild(svg("ellipse",{cx:x+3,cy:y+16,rx:20,ry:7,fill:"#171716","fill-opacity":".35"}));
    g.appendChild(svg("circle",{cx:x,cy:y,r:20,fill:"url(#zz-ball-shine)",stroke:"#fff8eb","stroke-width":2.4}));
    g.appendChild(svg("path",{d:"M " + (x-16) + " " + (y-10) + " Q " + (x-3) + " " + (y-6) +
      " " + (x+12) + " " + (y+15),fill:"none",stroke:"#fffdf6","stroke-width":9,"stroke-linecap":"round"}));
    g.appendChild(svg("path",{d:"M " + (x-10) + " " + (y-16) + " Q " + (x+5) + " " + (y-4) +
      " " + (x+17) + " " + (y+5),fill:"none",stroke:"#ffeee5","stroke-width":4,"stroke-linecap":"round"}));
    g.appendChild(svg("ellipse",{cx:x-7,cy:y-10,rx:6,ry:3,fill:"#fff","fill-opacity":".75",transform:"rotate(-30 "+(x-7)+" "+(y-10)+")"}));
    // Kleine Punktetafel gehört zum Ball, nicht zur Zielscheibe; sie ist gut erkennbar.
    const labelX = x + (x > 395 ? -35 : 18), labelY = y + (y > 425 ? -33 : 17);
    const text = String(points), width = Math.max(30, 15 + text.length * 9);
    g.appendChild(svg("rect",{x:labelX-width/2,y:labelY-13,width,height:25,rx:12,
      fill:"#fff2c7",stroke:"#62421e","stroke-width":2}));
    g.appendChild(svg("text",{x:labelX,y:labelY+1,"class":"score-tag",fill:"#543016","font-size":15,
      "font-weight":900,"text-anchor":"middle","dominant-baseline":"central"},text));
    parent.appendChild(g);
  }
  function renderTarget() {
    target.replaceChildren();
    const defs = svg("defs");
    const gradient = svg("radialGradient",{id:"zz-ball-shine",cx:"23%",cy:"18%",r:"82%"});
    for (const [stop,color] of [["0%","#ffe0c7"],["28%","#ff6760"],["62%","#ec2635"],["100%","#841225"]])
      gradient.appendChild(svg("stop",{offset:stop,"stop-color":color}));
    defs.appendChild(gradient);
    const wood = svg("linearGradient",{id:"zz-wood-rim",x1:"0",x2:"1",y1:"0",y2:"1"});
    for (const [stop,color] of [["0%","#f0b35e"],["45%","#915024"],["100%","#472513"]])
      wood.appendChild(svg("stop",{offset:stop,"stop-color":color}));
    defs.appendChild(wood);
    target.appendChild(defs);
    target.appendChild(svg("rect",{x:219,y:448,width:60,height:44,rx:5,fill:"#915223",stroke:"#6c3517","stroke-width":5}));
    target.appendChild(svg("circle",{cx:250,cy:250,r:240,fill:"url(#zz-wood-rim)",stroke:"#3b2213","stroke-width":6}));
    target.appendChild(svg("circle",{cx:250,cy:250,r:234,fill:"#39271f",stroke:"#211d1b","stroke-width":4}));
    target.appendChild(svg("circle",{cx:250,cy:250,r:230,fill:"#fff"}));
    // Bevel und eingeritzte Linien machen den Ring erkennbar dreidimensional.
    target.appendChild(svg("circle",{cx:250,cy:250,r:232,fill:"none",stroke:"#fbe2a0","stroke-width":3,"stroke-opacity":".85"}));
    target.appendChild(svg("circle",{cx:250,cy:250,r:225,fill:"none",stroke:"#fff8d5","stroke-width":2,"stroke-opacity":".7"}));
    for (const deg of [-90,0,90,180]) {
      const p = polar(237,deg);
      target.appendChild(svg("circle",{cx:p.x,cy:p.y,r:3.6,fill:"#efc780",stroke:"#4a2b18","stroke-width":1.7}));
      target.appendChild(svg("circle",{cx:p.x-1,cy:p.y-1,r:1,fill:"#fffcdb"}));
    }
    const bounds = [[228,174],[174,113],[113,42]];
    for (const c of cells) {
      if (c.kind !== "field") continue;
      const ringBounds = bounds[c.ring], start = -90 + c.index * 45;
      target.appendChild(svg("path",{d:sector(ringBounds[0],ringBounds[1],start,start+45),
        fill:c.color,"class":"field"}));
    }
    target.appendChild(svg("circle",{cx:250,cy:250,r:41,fill:"#c20a63",stroke:"#fff","stroke-width":5}));
    target.appendChild(svg("circle",{cx:250,cy:250,r:36,fill:"none",stroke:"#ffbed9","stroke-opacity":".55","stroke-width":3}));
    target.appendChild(svg("circle",{cx:237,cy:234,r:7,fill:"#fff","fill-opacity":".11"}));
    target.appendChild(svg("path",{d:"M 91 104 A 212 212 0 0 1 189 46",fill:"none",stroke:"#ffffff","stroke-opacity":".22","stroke-width":"8","stroke-linecap":"round"}));
    for (const c of cells) {
      const n = String(c.value).length;
      const fill = c.color === "#ffd523" ? "#ae251e" : "#fff";
      target.appendChild(svg("text",{x:c.textX,y:c.textY,"font-size":c.kind === "center" ? 29 : (n >= 4 ? 15 : n === 3 ? 17 : 23),
        "class":"target-number",fill:fill},c.value));
    }
    throws.forEach((h,i) => {
      if (h.kind === "miss") {
        const missIndex = throws.slice(0,i).filter(x => x.kind === "miss").length;
        addBall(target,112 + missIndex * 56,494,i === throws.length - 1,0);
      } else addBall(target,h.ballX,h.ballY,i === throws.length - 1,h.value);
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
      board.className = "game-board board-throws";
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
      board.className = "game-board board-math";
      $("instruction").textContent = "Rechne die drei Zahlen zusammen!";
      $("monkeyMessage").textContent = "Jetzt rechnen!";
      setMonkeyEmotion("");
      board.innerHTML = '<h2 class="board-heading">Was ist das Ergebnis?</h2><div class="equation">' +
        equationHTML() + '</div><div class="answers">' +
        answerOptions.map((v,i) => '<button class="answer-button" type="button" data-answer="' + v +
          '" aria-label="Antwort ' + String.fromCharCode(65+i) + ': ' + v + '">' + v + '</button>').join("") + '</div>';
      return;
    }
    board.className = "game-board board-feedback";
    const right = chosenAnswer === sum();
    $("instruction").textContent = right ? "Super gemacht!" : "Das probieren wir nochmal!";
    $("monkeyMessage").textContent = right ? "Juhu!" : "Nicht aufgeben!";
    setMonkeyEmotion(right ? "happy" : "sad");
    board.innerHTML = '<div class="feedback ' + (right ? "success" : "retry") + '">' +
      '<span class="feedback-stars" aria-hidden="true">' + (right ? "✦ ★ ✦" : "✿ · ✿") + '</span>' +
      '<h2 class="' + (right ? "" : "wrong") + '">' +
      (right ? "Richtig! ⭐" : "Noch nicht richtig! 🙈") + '</h2><p>' +
      (right ? "Super! Du hast richtig gerechnet!" : "Schau dir die drei Zahlen noch einmal an.") +
      '</p><div class="result-line">' + throws.map(h => h.value).join(" + ") + " = " + sum() +
      '</div><button type="button" class="again-button" id="again">Nochmal</button></div>';
  }
  function startRound() {
    roundVersion++;
    document.body.classList.remove("round-success","round-retry");
    if (throwTimer) clearTimeout(throwTimer);
    throws = []; busy = false; chosenAnswer = null; answerOptions = [];
    phase = "throw"; cells = L.makeCells(settings,rand);
    renderTarget(); renderBoard();
  }
  function throwBall() {
    if (phase !== "throw" || busy) return;
    const selected = L.chooseHit(settings,cells,throws,rand);
    playSound("throw");
    const version = roundVersion;
    busy = true; monkey.disabled = true; setMonkeyEmotion("throw");
    $("instruction").textContent = "Der Ball fliegt …";
    throwTimer = setTimeout(() => {
      if (version !== roundVersion) return;
      throws.push(selected); busy = false; throwTimer = null;
      playSound(selected.kind === "miss" ? "miss" : "hit");
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
  function updateHint(event) {
    let s = settingsInForm();
    const notice = $("ruleNotice");
    notice.textContent = "";
    // Keine versteckte Blockade: unvereinbare Optionen werden direkt sinnvoll abgeglichen.
    if (s.centerMode === "afterTwoMisses" && !s.allowMisses) {
      if (event && event.target && event.target.name === "centerMode") {
        $("allowMisses").checked = true;
        notice.textContent = "✓ Nieten wurden aktiviert, damit die 100 nach zwei Nieten möglich bleibt.";
      } else {
        document.querySelector('input[name="centerMode"][value="never"]').checked = true;
        notice.textContent = "✓ Ohne Nieten ist die Sonderregel nicht möglich. Die Mitte wurde deshalb gesperrt.";
      }
      s = settingsInForm();
    }
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
    if (error) {
      updateHint();
      $("configError").setAttribute("tabindex","-1");
      $("configError").focus();
      $("configError").scrollIntoView({block:"nearest",behavior:"smooth"});
      return;
    }
    let persisted = true;
    try { localStorage.setItem(storageKey,JSON.stringify(next)); }
    catch (_) { persisted = false; }
    settings = next;
    closeConfig();
    startRound();
    updateActiveSettings();
    showSaveToast(persisted);
  }
  $("monkey").addEventListener("click",throwBall);
  $("soundButton").addEventListener("click",() => {
    soundEnabled = !soundEnabled;
    try { localStorage.setItem(soundKey,soundEnabled ? "1" : "0"); } catch (_) {}
    updateSoundButton();
    if (soundEnabled) playSound("toggle");
  });
  board.addEventListener("click",event => {
    const button = event.target.closest("[data-answer]");
    if (button && phase === "answer") {
      chosenAnswer = Number(button.dataset.answer);
      playSound(chosenAnswer === sum() ? "correct" : "wrong");
      phase = "feedback";
      document.body.classList.add(chosenAnswer === sum() ? "round-success" : "round-retry");
      renderBoard();
      // Tastatur- und Screenreader-Nutzung: Nach dem Prüfen ist „Nochmal“ erreichbar.
      $("again").focus({preventScroll:true});
    } else if (event.target.closest("#again")) {
      startRound();
      monkey.focus({preventScroll:true});
    }
  });
  $("openConfig").addEventListener("click",openConfig);
  $("closeConfig").addEventListener("click",closeConfig);
  $("cancelConfig").addEventListener("click",closeConfig);
  $("resetConfig").addEventListener("click",() => fillForm(L.DEFAULTS));
  $("configForm").addEventListener("input",updateHint);
  $("configForm").addEventListener("submit",saveConfig);
  updateSoundButton();
  updateActiveSettings();
  startRound();
})();
