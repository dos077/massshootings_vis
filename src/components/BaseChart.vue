<template>
<v-card flat border>
  <v-card-title>Incidents distribution vs. {{ chartTitle }}</v-card-title>
  <v-divider />
  <v-card-text>
    <canvas :id="chartId" />
  </v-card-text>
</v-card>
</template>

<script>
import { shallowRef } from 'vue';
import { mapState } from 'vuex';
import Chart from 'chart.js/auto';
import { buildTable, getBreakPoints, buildChart, nToTxt, years } from '../helpers/buildSeries';
import db from '../helpers/db';
import { titles } from '../helpers/categoryKeys';

const zipDb = require('../data/zipcodes.json');

export default {
  name: 'BaseChart',
  props: ['chartId', 'chartKey'],
  data: () => ({
    chart: null,
    xrr: null,
  }),
  computed: {
    ...mapState(['perMillion', 'zipSelected', 'entries', 'byYear']),
    rawData() {
      if (this.byYear) {
        const breakPoints = getBreakPoints(db.map((ev) => ev[this.chartKey]), 10, this.chartKey);
        const data = [];
        [2019, 2020, 2021, 2022].forEach((yr) => {
          const entries = db.filter((ev) => ev.date.getUTCFullYear() === yr);
          data.push(buildTable(this.chartKey, breakPoints, 10, entries));
        });
        return data;
      }
      return buildTable(this.chartKey, undefined, 10, this.entries);
    },
    chartTitle() {
      return titles[this.chartKey];
    },
  },
  watch: {
    rawData(rawData) {
      const {
        perMillion, zipSelected, chartKey, byYear,
      } = this;
      this.chart.data = buildChart({
        rawData, perMillion, zipSelected, chartKey, byYear,
      });
      this.chart.update();
      this.updateSummary();
    },
    zipSelected(zipSelected) {
      const {
        perMillion, rawData, chartKey, byYear,
      } = this;
      this.chart.data = buildChart({
        rawData, perMillion, zipSelected, chartKey, byYear,
      });
      this.chart.update();
      this.updateSummary();
    }
  },
  methods: {
    graphClick(index, datasetIndex) {
      console.log('clicked on', index, datasetIndex);
      const minX = index > 0 ? this.xrr[index - 1] : 0;
      const maxX = this.xrr[index];
      this.$store.commit('setXrange', { minX, maxX });
      this.$store.commit('selectYear', years[datasetIndex]);
      this.$store.commit('selectKey', this.chartKey);
    },
    updateSummary() {
      const {
        rawData, chartKey, byYear, zipSelected,
      } = this;
      if (zipSelected) {
        let summary = [`No data for zipcodes with ${titles[chartKey]} similar to ${zipSelected}`];
        const comp = zipDb[zipSelected];
        const mIndex = (byYear ? rawData[0] : rawData).findIndex(({ x }) => comp[chartKey] < x);
        if (mIndex > -1) {
          if (byYear) {
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
            summary = [`Areas with ${titles[chartKey]} ${nToTxt(lastX)} - ${nToTxt(matchedArr[0].x)}`];
            summary.push(...[2019, 2020, 2021, 2022].map((year, i) =>
              `${year}: ${incidents[i]} incidents ${victims[i]} victims`
            ));
          } else {
            const matchedData = rawData[mIndex];
            const lastX = mIndex > 0 ? rawData[mIndex - 1].x : 0;
            const incidents = matchedData.yrr ? matchedData.yrr.length : 0;
            if (incidents > 0) {
            let victims = 0;
              matchedData.yrr.forEach((dp) => {
                victims += dp.killed + dp.injured;
              });
              summary = [`Areas with ${titles[chartKey]} ${nToTxt(lastX)} - ${nToTxt(matchedData.x)}`];
              summary.push(`${incidents} incidents of mass shooting with ${victims} victims`);
            }
          }
        } 
        this.$store.commit('setSummary', { chartKey, summary });
      }
    }
  },
  mounted() {
    const {
      rawData, perMillion, zipSelected, chartKey, byYear,
    } = this;
    const ctx = document.getElementById(this.chartId);
    const data = buildChart({
      rawData, perMillion, zipSelected, chartKey, byYear,
    });
    this.xrr = data.xrr;
    const chart = new Chart(ctx, {
      type: 'bar',
      data,
      options: {
        scales: {
          x: {
            ticks: {
              align: 'start',
            },
          },
        },
        onClick: (event) => {
          const activePoints = chart.getElementsAtEventForMode(event, 'nearest', {
            intersect: true,
          }, false);
          const { index, datasetIndex } = activePoints[0];
          this.graphClick(index, datasetIndex);
        },
      },
    });
    this.chart = shallowRef(chart);
  },
};
</script>
