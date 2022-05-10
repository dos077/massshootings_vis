const puppeteer = require('puppeteer');
const fs = require('fs');

const scrapLocation = async (zip, page) => {
  console.log('scraping location: ', `https://www.city-data.com/zips/${zip}.html`);
  await page.goto(`https://www.city-data.com/zips/${zip}.html`);
  const res = {};
  const bodyHtml = await (await page.$('#body')).evaluate((el) => el.innerHTML);
  if (!bodyHtml.match(/(> \d+,*\d+[\s|<])/gm)) return false;
  const numbers = bodyHtml
    .match(/(> \d+,*\d+[\s|<])/gm)
    .map(n => n.replace(',', '')
    .replace(/[>|<]/g, '').trim());
  res.population = parseInt(numbers[0]);
  res.density = parseInt(numbers[5]);
  const raceNames = await page.$$eval(
    'ul.list-group > li.list-group-item > ul.list-group > li > b',
    (els) => els.map((el) => el.textContent)
  )
  const raceInfos = await page.$$eval(
    'ul.list-group > li.list-group-item > ul.list-group > li > span.badge',
    (els) => els.map((el) => el.textContent.replace(',', ''))
  )
  res.races = [];
  raceNames.forEach((name, i) => {
    res.races.push({ name, n: parseInt(raceInfos[i * 2]) });
  });
  const hgs = await page.$$('.hgraph');
  for (let i = 0; i < hgs.length; i++) {
    const text = await hgs[i].evaluate(el => el.textContent);
    const value = await (await hgs[i].$$('td'))[1]
      .evaluate(el => el.textContent.replace(/[$|,]/g, '').replace('%', ''));
    if (text.match('house/condo value')) res.medianHouseValue = parseInt(value);
    else if (text.match('resident age')) res.medianAge = parseFloat(value.split(' ')[0]);
    else if (text.match('Average household size')) res.medianHousehold = parseFloat(value.split(' ')[0]);
  }
  const liArr = await page.$$('li');
  for (let i = 0; i < liArr.length; i++) {
    const text = await liArr[i].evaluate(el => el.textContent);
    const trr = text.split(' ');
    const per = parseFloat(trr[trr.length - 1].replace('%', ''));
    if (text.match('High school or higher')) res.highschool = per;
    if (text.match('Bachelor\'s degree or higher')) res.college = per;
    if (text.match('Now married')) res.married = per;
  }
  return res;
};

const zipcodePath = './src/data/zipcodes.json';

const saveData = (db, path) => {
  const updated = new Date();
  fs.writeFileSync(path, JSON.stringify({ ...db, updated }));
};

const loadData = (path) => (fs.existsSync(path)
  ? JSON.parse(fs.readFileSync(path))
  : {});


const main = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
  );
  const zipcodeDb = loadData(zipcodePath);
  const zipcodes = Object.keys(zipcodeDb);
  for (let i = 0; i < zipcodes.length; i++) {
    const zip = zipcodes[i];
    if (!zipcodeDb[zip].highschool) {
      const res = await scrapLocation(zip, page);
      await new Promise((r) => setTimeout(r, 3500));
      if (res) {
        zipcodeDb[zip] = res;
        saveData(zipcodeDb, zipcodePath);
      }
    }
  }

  await browser.close();
};

main();
// exports.scrapLocation = scrapLocation;
