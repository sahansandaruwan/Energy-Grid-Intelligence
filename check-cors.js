const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('data:text/html,<html><body><script>fetch("https://api.energy-charts.info/public_power?country=de").then(r=>console.log("SUCCESS")).catch(e=>console.log("ERROR"))</script></body></html>');
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
