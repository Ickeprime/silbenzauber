/* Browser-E2E: echter Chromium statt nur Logiksimulation */
"use strict";
const assert = require("node:assert/strict");
const {chromium} = require("playwright");
const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const root = process.cwd();
async function main() {
  const server = http.createServer(async (req,res) => {
    let pathname = decodeURIComponent(new URL(req.url,"http://localhost").pathname);
    if (pathname.endsWith("/")) pathname += "index.html";
    const full = path.resolve(root,"."+pathname);
    if (!full.startsWith(root + path.sep)) {res.writeHead(403).end();return;}
    try {
      const data = await fs.readFile(full);
      const ext=path.extname(full);
      const contentType={".js":"text/javascript",".css":"text/css",".html":"text/html; charset=utf-8",".webp":"image/webp",".png":"image/png"}[ext] || "application/octet-stream";
      res.writeHead(200,{"Content-Type":contentType});
      res.end(data);
    } catch (_) {res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  const origin="http://127.0.0.1:"+server.address().port;
  let browser;
  const failures=[];
  try {
    const launchOptions = {headless:true};
    if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE) {
      launchOptions.executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
    }
    browser = await chromium.launch(launchOptions);
    const ctx=await browser.newContext({viewport:{width:390,height:844}});
    const page=await ctx.newPage();
    const capture=async screenshotPath=>{
      await page.evaluate(()=>{
        document.documentElement.style.scrollBehavior="auto";
        document.documentElement.scrollTop=0;
        document.body.scrollTop=0;
        window.scrollTo(0,0);
      });
      await page.waitForFunction(()=>window.scrollY===0);
      await page.waitForTimeout(100);
      await page.screenshot({path:screenshotPath,fullPage:true});
    };
    const waitForTitle=()=>page.waitForFunction(()=>
      [...document.querySelectorAll(".wood-title h1 .title-word > span")]
        .every(letter=>getComputedStyle(letter).opacity==="1"));
    page.on("pageerror",err=>failures.push(err.message));
    await page.goto(origin+"/zahlenzauber/");
    await page.locator("#monkey").waitFor();
    await waitForTitle();
    assert.equal(await page.locator(".wood-title h1").getAttribute("aria-label"),"Zahlenzauber");
    assert.equal(await page.locator(".wood-title h1 .title-word > span").count(),12);
    assert.match(await page.locator("#monkeyDrawing").getAttribute("src"),/monkey-mascot\.webp$/);
    assert.equal(await page.locator("#monkeyDrawing").evaluate(img=>img.complete && img.naturalWidth>0),true);
    assert.equal(await page.locator(".ball-slot.available").count(),3);
    assert.equal(await page.locator(".board-throws").count(),1);
    assert.equal(await page.locator("#target .score-tag").count(),0);
    await fs.mkdir(path.resolve(root,"zahlenzauber/tests/screenshots"),{recursive:true});
    await capture("zahlenzauber/tests/screenshots/mobile-start.png");

    // Das vom Nutzer gemeldete Problem: Speichern inkl. Seiten-Reload.
    await page.locator("#openConfig").click();
    await page.locator('input[name="mode"][value="mixed"]').check();
    await page.locator("#maxField").fill("85");
    await page.locator("#maxTotal").fill("200");
    await page.locator("#allowMisses").uncheck(); // 100 nach zwei Nieten muss automatisch zu "nie" wechseln.
    assert.equal(await page.locator('input[name="centerMode"][value="never"]').isChecked(),true);
    await capture("zahlenzauber/tests/screenshots/mobile-settings.png");
    await page.locator(".save-button").click();
    assert.equal(await page.locator("#settingsDialog").evaluate(el=>el.open),false);
    assert.match(await page.locator("#saveToast").textContent(),/Einstellungen gespeichert/);
    assert.match(await page.locator("#activeSettings").textContent(),/Gemischte Zahlen/);
    await page.reload();
    await page.locator("#openConfig").click();
    assert.equal(await page.locator("#maxTotal").inputValue(),"200");
    assert.equal(await page.locator("#maxField").inputValue(),"85");
    assert.equal(await page.locator('input[name="mode"][value="mixed"]').isChecked(),true);
    assert.equal(await page.locator("#allowMisses").isChecked(),false);
    assert.equal(await page.locator('input[name="centerMode"][value="never"]').isChecked(),true);

    // Erneut ändern und wirklich mit den neuen Einstellungen werfen.
    await page.locator('input[name="mode"][value="tens"]').check();
    await page.locator("#maxField").fill("100");
    await page.locator("#maxTotal").fill("100");
    await page.locator(".save-button").click();
    await page.locator("#soundButton").click();
    assert.equal(await page.locator("#soundButton").getAttribute("aria-pressed"),"true");
    await page.reload();
    assert.equal(await page.locator("#soundButton").getAttribute("aria-pressed"),"true");
    for(let index=1;index<=3;index++) {
      await page.locator("#monkey").click();
      assert.equal(await page.locator("#monkey.throwing").count(),1);
      assert.match(await page.locator("#monkeyDrawing").getAttribute("src"),/monkey-mascot\.webp$/);
      await page.waitForFunction(count => document.querySelectorAll(".hit-marker").length === count,index);
      assert.equal(await page.locator("#target .score-tag").count(),index);
      if (index<3) assert.equal(await page.locator(".ball-slot.available").count(),3-index);
    }
    await page.locator(".answer-button").first().waitFor();
    assert.equal(await page.locator(".board-math").count(),1);
    assert.equal(await page.locator(".answer-button").count(),3);
    const score=(await page.locator(".equation .number-chip").allTextContents()).map(Number).reduce((a,b)=>a+b,0);
    assert.ok(score<=100);
    const values=(await page.locator(".answer-button").allTextContents()).map(Number);
    assert.equal(new Set(values).size,3);
    assert.ok(values.includes(score));
    await page.locator('.answer-button[data-answer="'+score+'"]').click();
    assert.match(await page.locator(".feedback h2").textContent(),/Richtig/);
    assert.equal((await page.locator("#again").textContent()).trim(),"Nochmal");
    assert.equal(await page.locator("#monkey.celebrating").count(),1);
    assert.match(await page.locator("#monkeyDrawing").getAttribute("src"),/monkey-celebrating\.webp$/);
    assert.equal(await page.locator("#monkeyDrawing").evaluate(img=>img.complete && img.naturalWidth>0),true);
    assert.equal(await page.locator(".board-feedback").count(),1);
    assert.equal(await page.locator("#again").evaluate(el => document.activeElement === el),true);
    await page.waitForTimeout(400); // Feedback-Einblendung vor dem Screenshot vollständig anzeigen.
    await capture("zahlenzauber/tests/screenshots/mobile-correct.png");
    await page.locator("#again").click();
    assert.equal(await page.locator(".ball-slot.available").count(),3);
    assert.match(await page.locator("#monkeyDrawing").getAttribute("src"),/monkey-mascot\.webp$/);
    assert.equal(await page.locator("#monkey").evaluate(el => document.activeElement === el),true);

    // Typische Gerätebreiten plus schmale Telefonansicht:
    // keine horizontal abgeschnittenen Antwortknöpfe oder Einstellungsbuttons.
    for (const width of [320,360,390,768,1024,1280]) {
      await page.setViewportSize({width,height:840});
      const metrics = await page.evaluate(() => ({
        width:document.documentElement.clientWidth,
        scroll:document.documentElement.scrollWidth,
        board:document.querySelector("#playBoard").getBoundingClientRect(),
        firstAnswer:document.querySelector(".answer-button")
      }));
      assert.ok(metrics.scroll <= metrics.width + 2,
        "Horizontales Scrollen bei " + width + "px: " + metrics.scroll + "/" + metrics.width);
      assert.ok(metrics.board.width > 0);
    }

    // Eigene Ansichten der Rechenfrage und der falschen Antwort.
    await page.setViewportSize({width:390,height:844});
    for(let index=1;index<=3;index++) {
      await page.locator("#monkey").click();
      await page.waitForFunction(count => document.querySelectorAll(".hit-marker").length === count,index);
    }
    assert.equal(await page.locator(".answer-button").count(),3);
    await capture("zahlenzauber/tests/screenshots/mobile-question.png");
    const secondScore=(await page.locator(".equation .number-chip").allTextContents()).map(Number).reduce((a,b)=>a+b,0);
    const wrongAnswer=await page.locator(".answer-button").evaluateAll((buttons,correct)=>buttons.find(button=>Number(button.dataset.answer)!==correct).dataset.answer,secondScore);
    await page.locator('.answer-button[data-answer="'+wrongAnswer+'"]').click();
    assert.match(await page.locator(".feedback h2").textContent(),/Noch nicht richtig|Leider falsch/);
    assert.equal(await page.locator("#monkey.encouraging").count(),1);
    assert.match(await page.locator("#monkeyDrawing").getAttribute("src"),/monkey-encouraging\.webp$/);
    assert.equal(await page.locator("#monkeyDrawing").evaluate(img=>img.complete && img.naturalWidth>0),true);
    assert.equal(await page.locator("#monkey img").count(),1);
    assert.equal(await page.locator("#monkeyExpression").count(),0);
    await page.waitForTimeout(400);
    await capture("zahlenzauber/tests/screenshots/mobile-wrong.png");
    await page.locator("#again").click();
    assert.match(await page.locator("#monkeyDrawing").getAttribute("src"),/monkey-mascot\.webp$/);

    // Tablet/Desktop: Dialog erreichbar und beide Lernspiele verlinkt.
    await page.reload();
    await page.setViewportSize({width:1280,height:800});
    await waitForTitle();
    await capture("zahlenzauber/tests/screenshots/desktop-start.png");
    await page.locator("#openConfig").click();
    await capture("zahlenzauber/tests/screenshots/desktop-settings.png");
    await page.locator("#closeConfig").click();
    assert.equal(await page.locator('a[href="../"]').count(),1);
    assert.deepEqual(failures,[]);
    console.log("Browsercheck OK: Speicherung über Reload, Konfliktauflösung, Audio, 3 Würfe, Rechnen, Feedback, responsive Darstellung");
    await ctx.close();
  } finally {
    if(browser)await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
}
main().catch(err=>{console.error(err);process.exitCode=1;});
