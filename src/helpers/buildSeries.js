import db from './db';

const getBreakPoints = (arr, div) => {
  let max = 0;
  let min = Infinity;
  arr.forEach((n) => {
    if (n > max) max = n;
    if (n < min) min = n;
  });
  max *= 1.01;
  min *= 0.99;
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
  const breakPoints = breakProps || getBreakPoints(entries.map((entry) => entry[key]), div);
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

export { buildKeyIncrement, buildTable, getBreakPoints };
