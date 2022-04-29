import db from './db';

const getBreakPoints = (arr) => {
  let max = 0;
  let min = Infinity;
  arr.forEach(n => {
    if (n > max) max = n;
    if (n < min) min = n;
  });
  const pts = [min * 1.5];
  while (pts[pts.length - 1] < max) {
    pts.push(pts[pts.length - 1] * 1.5);
  }
  return pts;
}

const buildKeyIncrement = (key, entries) => {
  const breakPoints = getBreakPoints(entries.map(entry => entry[key]));
  const yrr = [entries.filter(entry => entry[key] <= breakPoints[0])];
  for (let i = 1; i < breakPoints.length; i++) {
    yrr.push(
      entries.filter((ev) => ev[key] > breakPoints[i - 1] && ev[key] <= breakPoints[i])
    );
  }
  return { breakPoints, yrr }
}

const buildTable = (key, entries = db) => {
  const { breakPoints, yrr } = buildKeyIncrement(key, entries);
  const data = [];
  breakPoints.forEach((point, i) => {
    data.push({
      x: `under ${Math.round(point)}`,
      victims: yrr[i].map(dp => dp.killed + dp.injured).reduce((a, b) => a + b),
    })
  });
  return data;
}

export { buildKeyIncrement, buildTable };
