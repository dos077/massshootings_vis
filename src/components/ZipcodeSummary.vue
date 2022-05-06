<template>
<v-row>
  <v-col>
    <v-card flat border>
      <v-card-title>Mass shooting incidents from areas similar to {{ zipSelected }}</v-card-title>
      <v-list>
        <v-list-item v-for="(summary, i) in summaries" :key="i">
          <v-list-item-header>
            <v-list-item-title>{{ summary[0] }}</v-list-item-title>
            <v-list-item-subtitle v-for="line in summary.slice(1)" :key="line"
              class="font-weight-medium" style="color: #b30000;">
              {{ line }}
            </v-list-item-subtitle>
          </v-list-item-header>
        </v-list-item>
      </v-list>
    </v-card>
  </v-col>
</v-row>
</template>

<script>
import { mapState } from 'vuex';
import { keys, titles } from '../helpers/categoryKeys';
import { zipDb } from '../helpers/db';
import db from '../helpers/db';
import { nToTxt, buildTable, getBreakPoints, years } from '../helpers/buildSeries';

const buildSummary = ({ key, rawData, zipSelected }) => {
  let summary = [`No data for zipcodes with ${titles[key]} similar to ${zipSelected}`];
  const comp = zipDb[zipSelected];
  const mIndex = rawData.findIndex(({ x }) => comp[key] <= x);
  if (mIndex > -1) {
    const matchedData = rawData[mIndex];
    const lastX = mIndex > 0 ? rawData[mIndex - 1].x : 0;
    const incidents = matchedData.yrr ? matchedData.yrr.length : 0;
    if (incidents > 0) {
    let victims = 0;
      matchedData.yrr.forEach((dp) => {
        victims += dp.killed + dp.injured;
      });
      summary = [`Areas with ${nToTxt(lastX)} - ${nToTxt(matchedData.x)} ${titles[key]}`];
      summary.push(`${incidents} incidents of mass shooting with ${victims} victims`);
    }
  }
  return summary;
};

const buildByYearSummary = ({ key, rawData, zipSelected }) => {
  let summary = [`No data for zipcodes with ${titles[key]} similar to ${zipSelected}`];
  const comp = zipDb[zipSelected];
  const mIndex = rawData[0].findIndex(({ x }) => comp[key] < x);
  if (mIndex > -1) {
    const matchedArr = rawData.map(drr => drr[mIndex]);
    const lastX = mIndex > 0 ? rawData[0][mIndex - 1].x : 0;
    const incidents = [];
    const victims = [];
    matchedArr.forEach((yearData) => {
      if (yearData.yrr && yearData.yrr.length > 0) {
        incidents.push(yearData.yrr.length);
        const total = yearData.yrr.map(({ killed, injured }) => killed + injured).reduce((a, b) => a + b);
        victims.push(total);
      } else {
        incidents.push(0);
        victims.push(0);
      }
    });
    summary = [`Areas with ${nToTxt(lastX)} - ${nToTxt(matchedArr[0].x)} ${titles[key]}`];
    summary.push(...years.map((year, i) =>
      `${year}: ${incidents[i]} incidents ${victims[i]} victims`
    ));
  }
  return summary;
}

export default {
  name: 'ZipcodeSummary',
  computed: {
    ...mapState([
      ...keys.map(key => `${key}Summary`),
      'zipSelected',
      'byYear',
      'entries',
    ]),
    summaries() {
      const { byYear, entries, zipSelected } = this;
      const arr = [];
      keys.forEach(key => {
        const breakPoints = byYear ?
          getBreakPoints(db.map(e => e[key]), 10, key) :
          getBreakPoints(entries.map(e => e[key]), 10, key);
        const rawData = byYear ?
          years.map(yr => buildTable(
            key, breakPoints, 10, db.filter(ev => ev.date.getUTCFullYear() === yr)
            )) :
          buildTable(key, breakPoints, 10, entries);
        const summaryParams = { key, rawData, zipSelected };
        arr.push(
          byYear ? buildByYearSummary(summaryParams) : buildSummary(summaryParams)
        );
      });
      return arr;
    }
  }
}
</script>
