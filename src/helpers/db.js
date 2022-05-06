const indexDb = require('../data/index.json');
const zipDb = require('../data/zipcodes.json')

Object.keys(zipDb).forEach(zip => {
  const data = zipDb[zip];
  if (!data.races) return;
  const { races } = data;
  let total = 0;
  races.forEach(({ n }) => total += n);
  const whites = races.find(({ name }) => name === 'White');
  data.whitePercent = whites ? whites.n / total * 100 : 0;
  const blacks = races.find(({ name }) => name === 'Black');
  data.blackPercent = blacks ? blacks.n / total * 100 : 0;
  const hispanic = races.find(({ name }) => name === 'Hispanic or Latino');
  data.hispanicPercent = hispanic ? hispanic.n / total * 100 : 0;
});

const db = [];

Object.keys(indexDb).forEach(id => {
  const { zipcode } = indexDb[id];
  if (!zipcode) return;
  const date = new Date(indexDb[id].date);  
  db.push({ ...indexDb[id], ...zipDb[zipcode], date });
});

export default db;

const updated = new Date(indexDb.updated);

export { updated, zipDb };
