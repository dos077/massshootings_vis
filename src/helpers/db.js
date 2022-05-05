const indexDb = require('../data/index.json');
const zipDb = require('../data/zipcodes.json');

const db = [];

Object.keys(indexDb).forEach(id => {
  const { zipcode } = indexDb[id];
  if (!zipcode) return;
  const date = new Date(indexDb[id].date);
  const { races } = zipDb[zipcode];
  let total = 0;
  races.forEach(({ n }) => total += n);
  const whites = races.find(({ name }) => name === 'White');
  const whitePercent = whites ? whites.n / total * 100 : 0;
  const blacks = races.find(({ name }) => name === 'Black');
  const blackPercent = blacks ? blacks.n / total * 100 : 0;
  const hispanic = races.find(({ name }) => name === 'Hispanic or Latino');
  const hispanicPercent = hispanic ? hispanic.n / total * 100 : 0;
  db.push({ ...indexDb[id], ...zipDb[zipcode], whitePercent, blackPercent, hispanicPercent, date });
});

export default db;

const updated = new Date(indexDb.updated);

export { updated };
