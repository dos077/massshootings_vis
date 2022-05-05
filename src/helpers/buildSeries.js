import db from './db';

const zipDb = require('../data/zipcodes.json');

const getBreakPoints = (arr, div, chartKey) => {
  if (chartKey && chartKey.includes('Percent'))
    return [10, 20, 30, 40, 50, 60, 70, 80, 90];
  let max = 0;
  let min = Infinity;
  arr.forEach((n) => {
    if (n > max) max = n;
    if (n < min) min = n;
  });
  max *= 1.001;
  min *= 0.999;
  if (min === 0) min = max / div;
  if ((max - min) / div < min) {
    const pts = [];
    const increment = (max - min) / div;
    for (let i = 1; i <= div; i += 1) {
      pts.push(min + increment * i);
    }
    return pts;
  }
  let pts = [];
  let exp = 1.1;
  while (pts.length === 0 || pts.length > div) {
    pts = [min * exp];
    while (pts[pts.length - 1] < max) {
      pts.push(pts[pts.length - 1] * exp);
    }
    exp *= 1.1;
  }
  return pts;
};

const buildKeyIncrement = (key, div, entries, breakPoints) => {
  const yrr = [entries.filter((entry) => entry[key] <= breakPoints[0])];
  for (let i = 1; i < breakPoints.length; i += 1) {
    yrr.push(
      entries.filter((ev) => ev[key] > breakPoints[i - 1] && ev[key] <= breakPoints[i]),
    );
  }
  return yrr;
};

const buildTable = (key, breakProps, div = 10, entries = db) => {
  const breakPoints = breakProps || getBreakPoints(entries.map((entry) => entry[key]), div, key);
  const yrr = buildKeyIncrement(key, div, entries, breakPoints);
  const data = [];
  breakPoints.forEach((point, i) => {
    data.push({
      x: point,
      yrr: yrr[i],
    });
  });
  return data;
};


const buildDataset = ({
  rawData, perMillion, zipSelected, chartKey, label,
}, color = '#666666') => {
  const data = [];
  const backgroundColor = [];
  const borderColor = [];
  let comp = zipSelected ? zipDb[zipSelected] : null;
  rawData.forEach(({ yrr, x }) => {
    if (comp && comp[chartKey] < x) {
      backgroundColor.push('#b30000');
      borderColor.push('#fff');
      comp = null;
    } else {
      backgroundColor.push(color);
      borderColor.push('rgba(0, 0, 0, 0)');
    }
    if (!yrr || yrr.length === 0) data.push(0);
    else {
      const victims = yrr.map((dp) => dp.killed + dp.injured).reduce((a, b) => a + b);
      if (perMillion) {
        const zips = [];
        let totalPop = 0;
        yrr.forEach(({ population, zipcode }) => {
          if (!zips.includes(zipcode)) {
            zips.push(zipcode);
            totalPop += population;
          }
        });
        data.push(Math.round((victims * 100 * 1000000) / totalPop) / 100);
      } else {
        data.push(victims);
      }
    }
  });
  return {
    label: label || 'total victims',
    data,
    backgroundColor,
    borderColor,
    borderWidth: 1,
    fill: true,
    type: 'bar',
    yAxisID: 'y',
  };
};

const nToTxt = (x) => {
  let txt = '';
  if (x > 1000000) txt = `${Math.round(x / 10000) / 100}m`;
  else if (x > 1000) txt = `${Math.round(x / 100) / 10}k`;
  else if (x > 10) txt = Math.round(x);
  else txt = Math.round(x * 100) / 100;
  return `   ${txt}`;
};

const buildLabels = (rawData) => rawData.map(nToTxt);

const years = [2019, 2020, 2021, 2022];
const colors = ['#333333', '#666666', '#999999', '#cccccc'];

const buildChart = ({
  rawData, perMillion, zipSelected, chartKey, byYear,
}) => {
  let datasets = null;
  let labels = null;
  let xrr = [];
  if (byYear) {
    xrr = getBreakPoints(db.map((ev) => ev[chartKey]), 10, chartKey);
    labels = buildLabels(xrr);
    datasets = rawData.map((data, i) => buildDataset({
      rawData: data, perMillion, zipSelected, chartKey, label: years[i],
    }, colors[i]));
  } else {
    datasets = [buildDataset({
      rawData, perMillion, zipSelected, chartKey,
    })];
    xrr = rawData.map(({ x }) => x);
    labels = buildLabels(xrr);
  }
  return { datasets, labels, xrr };
};

export { buildKeyIncrement, buildTable, getBreakPoints, buildChart, nToTxt, years, colors };
