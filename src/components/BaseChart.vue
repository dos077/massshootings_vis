<template>
<v-card flat>
  <v-card-text>
    <canvas :id="chartId" />
  </v-card-text>
</v-card>
</template>

<script>
import { shallowRef } from 'vue';
import { mapState } from 'vuex';
import { useDisplay } from 'vuetify'
import Chart from 'chart.js/auto';
import { buildTable, getBreakPoints, buildChart, years } from '../helpers/buildSeries';
import db from '../helpers/db';
import { titles } from '../helpers/categoryKeys';

export default {
  name: 'BaseChart',
  props: ['chartId', 'chartKey'],
  data: () => ({
    chart: null,
    display: useDisplay(),
  }),
  computed: {
    ...mapState(['perMillion', 'zipSelected', 'entries', 'byYear', 'minSample']),
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
    isMobile() {
      return this.display.smAndDown;
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
    },
    perMillion() {
      const { rawData, zipSelected } = this;
      this.updateChart({ zipSelected, rawData })
    },
    minSample() {
      const { rawData, zipSelected } = this;
      this.updateChart({ zipSelected, rawData })
    },
    isMobile(to) {
      if (to) {
        this.chart.options.aspectRatio = 1;
      } else {
        this.chart.options.aspectRatio = 2;
      }
    },
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
          aspectRatio: this.isMobile ? 1 : undefined,
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
    updateChart({ zipSelected, rawData }) {
      if (!this.chart) this.newChart();
      const { chartKey, breakPoints, byYear, minSample, perMillion } = this;
      this.chart.data = buildChart({
        rawData, perMillion, zipSelected, chartKey, byYear, breakPoints, minSample
      });
      this.chart.update();
    },
  },
  mounted() {
    const { zipSelected, rawData } = this;
    this.updateChart({ zipSelected, rawData });
  },
};
</script>
