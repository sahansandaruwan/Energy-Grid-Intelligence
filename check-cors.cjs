const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  await page.goto('data:text/html,<html><body><script>fetch("https://api.energy-charts.info/public_power?country=de").then(r=>console.log("SUCCESS:"+r.status)).catch(e=>console.log("ERROR:"+e.message))</script></body></html>');
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
