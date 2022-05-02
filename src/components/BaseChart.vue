<template>
<v-card flat border>
  <v-card-title>{{ chartKey }} distribution</v-card-title>
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
import { buildTable, getBreakPoints } from '../helpers/buildSeries';
import db from '../helpers/db';

const zipDb = require('../data/zipcodes.json');

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

const buildLabels = (rawData) => rawData.map((x) => {
  let txt = '';
  if (x > 1000000) txt = `${Math.round(x / 10000) / 100}m`;
  else if (x > 1000) txt = `${Math.round(x / 100) / 10}k`;
  else if (x > 10) txt = Math.round(x);
  else txt = Math.round(x * 100) / 100;
  return `   ${txt}`;
});

const years = [2019, 2020, 2021, 2022];
const colors = ['#333333', '#666666', '#999999', '#cccccc'];

const buildChart = ({
  rawData, perMillion, zipSelected, chartKey, byYear,
}) => {
  let datasets = null;
  let labels = null;
  let xrr = [];
  if (byYear) {
    xrr = getBreakPoints(db.map((ev) => ev[chartKey]), 10);
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
        const breakPoints = getBreakPoints(db.map((ev) => ev[this.chartKey]), 10);
        const data = [];
        [2019, 2020, 2021, 2022].forEach((yr) => {
          const entries = db.filter((ev) => ev.date.getUTCFullYear() === yr);
          data.push(buildTable(this.chartKey, breakPoints, 10, entries));
        });
        return data;
      }
      return buildTable(this.chartKey, undefined, 10, this.entries);
    },
    overlayOn() {
      return !!this.tableData;
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
    },
    zipSelected(zipSelected) {
      const {
        perMillion, rawData, chartKey, byYear,
      } = this;
      this.chart.data = buildChart({
        rawData, perMillion, zipSelected, chartKey, byYear,
      });
      this.chart.update();
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
