"use strict";
/* Silbenzauber: Geometrie vor/während/nach der Walzenanimation im Chromium vergleichen. */
const {chromium}=require("playwright");
const fs=require("node:fs/promises");
const path=require("node:path");
const http=require("node:http");
const assert=require("node:assert/strict");

const root=process.cwd();
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".webp":"image/webp",".ttf":"font/ttf"};
async function run(){
 const server=http.createServer(async(req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  const f=path.resolve(root,"."+ (pathname.endsWith("/")?pathname+"index.html":pathname));
  if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{
   const bytes=await fs.readFile(f);
   res.writeHead(200,{"Content-Type":mime[path.extname(f)]||"application/octet-stream"});res.end(bytes);
  }catch(_){res.writeHead(404).end();}
 });
 await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
 const browser=await chromium.launch({headless:true});
 const origin="http://127.0.0.1:"+server.address().port;
 const page=await browser.newPage({viewport:{width:1365,height:960},reducedMotion:"no-preference"});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 const bounds=async()=>page.evaluate(()=>{
  const x=document.querySelector(".machine-frame").getBoundingClientRect();
  return {x:x.x,y:x.y,width:x.width,height:x.height,scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth};
 });
 const equal=(before,after,info)=>{
  for(const field of ["x","y","width","height"]) assert.ok(Math.abs(before[field]-after[field])<=1,
   info+" changes "+field+" ("+before[field]+" -> "+after[field]+")");
  assert.ok(after.scroll<=after.client+1,info+" horizontal overflow");
 };
 try{
  await page.goto(origin+"/",{waitUntil:"load"});
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator(".machine-topline").count(),0);
  assert.equal(await page.getByText("DER SILBENZAUBER",{exact:true}).count(),0);
  for(const width of [320,375,768,1365]){
    await page.setViewportSize({width,height:960});
    for(const count of [1,3,5]){
      await page.evaluate(count=>{
        const L=window.SilbenzauberLogic;
        const settings=L.normalizeConfig({...L.DEFAULT_CONFIG,reelCount:count, soundEnabled:false,reducedMotion:false});
        localStorage.setItem(L.STORAGE_KEY,JSON.stringify(settings));
      },count);
      await page.reload({waitUntil:"load"});
      await page.evaluate(()=>document.fonts.ready);
      await page.locator(".reel").first().waitFor();
      assert.equal(await page.locator(".reel").count(),count);
      const initial=await bounds();
      await page.locator("#spinButton").click();
      await page.waitForTimeout(125);
      assert.equal(await page.locator(".reel-track").count(),count,"animation active");
      equal(initial,await bounds(),width+"px / "+count+" Walzen (Start)");
      await page.waitForTimeout(560);
      equal(initial,await bounds(),width+"px / "+count+" Walzen (Animation)");
      await page.locator("#spinButton").waitFor({state:"visible"});
      await page.waitForFunction(()=>!document.querySelector("#spinButton").disabled,{timeout:6500});
      equal(initial,await bounds(),width+"px / "+count+" Walzen (Ende)");
    }
  }
  assert.deepEqual(errors,[]);
  console.log("OK: 1, 3 und 5 Walzen / 320, 375, 768 und 1365 px, stabile Automatenmaße über vollständige Animationen");
 }finally{
  await browser.close();
  await new Promise(ok=>server.close(ok));
 }
}
run().catch(e=>{console.error(e);process.exitCode=1;});