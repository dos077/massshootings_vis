const puppeteer = require('puppeteer');
const fs = require('fs');

const url =
  'https://www.gunviolencearchive.org/query/0484b316-f676-44bc-97ed-ecefeabae077';
// const url2021 = 'https://www.gunviolencearchive.org/reports/mass-shooting?year=2021';
// const url2020 = 'https://www.gunviolencearchive.org/reports/mass-shooting?year=2020';
// const url2019 = 'https://www.gunviolencearchive.org/reports/mass-shooting?year=2019';

const scrap = async (page) => {
  const db = {};
  const tds = await page.$$('td');
  const arr = await page.$$('ul.links > li.last > a');
  for (let i = 0; i < tds.length; i += 8) {
    const id = await tds[i].evaluate((el) => el.textContent);
    const date = await tds[i + 1].evaluate((el) => el.textContent);
    const state = await tds[i + 2].evaluate((el) => el.textContent);
    const city = await tds[i + 3].evaluate((el) => el.textContent);
    const address = await tds[i + 4].evaluate((el) => el.textContent);
    const killed = parseInt(await tds[i + 5].evaluate((el) => el.textContent));
    const injured = parseInt(await tds[i + 6].evaluate((el) => el.textContent));
    const source = await arr[i / 8].evaluate((el) => el.getAttribute('href'));
    db[id] = { id, date, state, city, address, killed, injured, source };
  }
  return db;
};

const scrapZip = async ({ address, city, state }, page) => {
  const searchUrl = new URL('https://www.google.com/search');
  searchUrl.searchParams.append('q', `${address}, ${city}, ${state}`);
  console.log('zipcode lookup', searchUrl.toString());
  await page.goto(searchUrl.toString());
  const span = await page.$('span.desktop-title-subcontent');
  if (!span) return undefined;
  const aStr = await span.evaluate((el) => el.textContent);
  const zipStr = aStr.slice(aStr.length - 5);
  if (!zipStr.match(/\d{5}/)) return false;
  return zipStr;
}

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

const indexPath = './src/data/index.json';
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
  const indexDb = loadData(indexPath);
  const zipcodeDb = loadData(zipcodePath);
  let nextPage = url;
  while (nextPage) {
    console.log('\x1b[33m%s\x1b[0m', `scraping ${nextPage}`);
    await page.goto(nextPage);
    await new Promise((r) => setTimeout(r, 1000));
    nextPage = null;
    const nextA = await page.$('a[title="Go to next page"]');
    if (nextA) {
      const link = await nextA.evaluate((el) => el.getAttribute('href'));
      nextPage = 'https://www.gunviolencearchive.org' + link;
    }
    const newDps = await scrap(page);
    const ids = Object.keys(newDps);
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (indexDb[id]) continue;
      const zipcode = await scrapZip(newDps[id], page);
      await new Promise((r) => setTimeout(r, 1000));
      newDps[ids[i]].zipcode = zipcode;
      if (zipcode && !zipcodeDb[zipcode]) {
        const zipData =  await scrapLocation(zipcode, page);
        if (!zipData) newDps[ids[i]].zipcode = undefined;
        else zipcodeDb[zipcode] = zipData;
      }
      indexDb[id] = newDps[id]
    }
    saveData(indexDb, indexPath);
    saveData(zipcodeDb, zipcodePath);
  }

  // console.log(await scrapLocation(29921, page));

  await browser.close();
}

main();
