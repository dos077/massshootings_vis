const indexDb = require('../data/index.json');
const zipDb = require('../data/zipcodes.json');

const db = [];

Object.keys(indexDb).forEach(id => {
  const { zipcode } = indexDb[id];
  if (!zipcode) return;
  db.push({ ...indexDb[id], ...zipDb[zipcode] });
});

export default db;

const { updated } = indexDb;

export { updated };
