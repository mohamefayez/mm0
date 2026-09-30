import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const origin=process.env.PLAYWRIGHT_BASE_URL||"http://127.0.0.1:3000";
await mkdir("docs/screenshots",{recursive:true});
const browser=await chromium.launch({channel:"chrome",headless:true});
try{
 const page=await browser.newPage();page.on("pageerror",error=>console.error(error.message));
 for(const [name,route,width,theme] of [["catalog-desktop","/ar/perfumes",1440,"light"],["product-desktop","/ar/perfumes/libre",1440,"light"],["product-mobile-dark","/ar/perfumes/libre",390,"dark"]]){
  await page.context().addCookies([{name:"asel-theme",value:theme,url:origin}]);
  await page.setViewportSize({width,height:1000});await page.goto(origin+route);
  await page.locator(".product-image").first().waitFor();
  await page.locator("img").evaluateAll(images=>images.forEach(img=>{img.loading="eager";}));
  await page.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0));
  await page.screenshot({path:`docs/screenshots/${name}.png`});
  console.log(`${name}: overflow=${await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)}`);
 }
}finally{await browser.close();}
