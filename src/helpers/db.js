const indexDb = require('../data/index.json');
const zipDb = require('../data/zipcodes.json');

const db = [];

Object.keys(indexDb).forEach(id => {
  const { zipcode } = indexDb[id];
  if (!zipcode) return;
  const date = new Date(indexDb[id].date)
  db.push({ ...indexDb[id], ...zipDb[zipcode], date });
});

export default db;

const updated = new Date(indexDb.updated);

export { updated };
