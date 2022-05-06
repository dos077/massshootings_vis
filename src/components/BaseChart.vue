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
import { buildTable, getBreakPoints, buildChart, years } from '../helpers/buildSeries';
import db from '../helpers/db';
import { titles } from '../helpers/categoryKeys';

export default {
  name: 'BaseChart',
  props: ['chartId', 'chartKey'],
  data: () => ({
    chart: null,
  }),
  computed: {
    ...mapState(['perMillion', 'zipSelected', 'entries', 'byYear']),
    breakPoints() {
      const { byYear, chartKey, entries } = this;
      if (byYear) return getBreakPoints(db.map((ev) => ev[chartKey]), 10, chartKey);
      return getBreakPoints(entries.map((ev) => ev[chartKey]), 10, chartKey);
    },
    rawData() {
      const { byYear, chartKey, breakPoints } = this;
      if (byYear) {
        const data = [];
        years.forEach((yr) => {
          const entries = db.filter((ev) => ev.date.getUTCFullYear() === yr);
          data.push(buildTable(chartKey, breakPoints, 10, entries));
        });
        return data;
      }
      return buildTable(chartKey, breakPoints, 10, this.entries);
    },
    chartTitle() {
      return titles[this.chartKey];
    },
  },
  watch: {
    rawData(rawData) {
      const { zipSelected } = this;
      this.updateChart({ zipSelected, rawData });
    },
    zipSelected(zipSelected) {
      const { rawData } = this;
      this.updateChart({ zipSelected, rawData });
    }
  },
  methods: {
    graphClick(index, datasetIndex) {
      console.log('clicked on', index, datasetIndex);
      const minX = index > 0 ? this.breakPoints[index - 1] : 0;
      const maxX = this.breakPoints[index];
      this.$store.commit('setXrange', { minX, maxX });
      this.$store.commit('selectYear', years[datasetIndex]);
      this.$store.commit('selectKey', this.chartKey);
    },
    newChart() {
      const ctx = document.getElementById(this.chartId);
      const data = { datasets: [], labels: [] }
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
          plugins: {
            indexSelected: null,
            legend: {
              labels: {
                generateLabels(chart) {
                  const labels = [];
                  chart.data.datasets.forEach(({ label, legendColor }) => {
                    labels.push({ text: label, fillStyle: legendColor })
                  });
                  return labels;
                },
              },
            },
          },
        },
      });
      this.chart = shallowRef(chart);
    },
    updateChart({
        zipSelected, rawData,
      }) {
      if (!this.chart) this.newChart();
      const { chartKey, perMillion, breakPoints, byYear } = this;
      this.chart.data = buildChart({
        rawData, perMillion, zipSelected, chartKey, byYear, breakPoints,
      });
      /* 
      if (zipSelected) {
        const comp = zipDb[zipSelected];
        const mIndex = breakPoints.findIndex(x => comp[this.chartKey] <= x);
        this.chart.options.plugins.indexSelected = mIndex;
      } else {
        this.chart.options.plugins.indexSelected = null;
      } */
      this.chart.update();
    },
  },
  mounted() {
    const { zipSelected, rawData } = this;
    this.updateChart({ zipSelected, rawData });
  },
};
</script>
