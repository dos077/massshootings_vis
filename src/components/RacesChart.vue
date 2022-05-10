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
import { useDisplay } from 'vuetify';
import Chart from 'chart.js/auto';
import { buildTable, nToTxt, buildDataset, colors } from '../helpers/buildSeries';
import { titles } from '../helpers/categoryKeys';
import { zipDb } from '../helpers/db';

export default {
  name: 'RacesChart',  
  data: () => ({
    chart: null,
    display: useDisplay(),
    chartId: 'RaceBreakdownChart',
    breakPoints: [10,20,30,40,50,60,70,80,90,100],
    chartKeys: ['blackPercent', 'hispanicPercent', 'whitePercent'],
  }),
  computed: {
    ...mapState(['perMillion', 'zipSelected', 'entries', 'byYear', 'minSample']),
    rawData() {
    const { breakPoints, entries, chartKeys } = this;
      const data = [];
      chartKeys.forEach((chartKey) => {
        data.push(buildTable(chartKey, breakPoints, 10, entries));
      });
      return data;
    },
    isMobile() {
      return this.display.smAndDown;
    },
  },
  watch: {
    rawData(rawData) {
      const { zipSelected }  = this;
      this.updateChart({ zipSelected, rawData });
    },
    zipSelected(zipSelected) {
      const { rawData }  = this;
      this.updateChart({ zipSelected, rawData });
    },
    perMillion() {
      const { zipSelected, rawData }  = this;
      this.updateChart({ zipSelected, rawData });
    },
    minSample() {
      const { zipSelected, rawData }  = this;
      this.updateChart({ zipSelected, rawData });
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
      this.$store.commit('selectKey', this.chartKeys[datasetIndex]);
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
    updateChart({
        zipSelected, rawData,
      }) {
      if (!this.chart) this.newChart();
      const { chartKeys, perMillion, breakPoints, minSample } = this;
      const datasets = rawData.map((data, i) => {
        const chartKey = chartKeys[i];
        const mIndex = zipSelected ?
          breakPoints.findIndex(x => zipDb[zipSelected][chartKey] <= x) :
          null;
        return buildDataset({
          rawData: data, perMillion, mIndex, chartKey, label: titles[chartKey], minSample,
        }, colors[i]);
      });
      const labels = breakPoints.map((x) => nToTxt(x));
      this.chart.data = { datasets, labels };
      if (zipSelected) {
        const comp = zipDb[zipSelected];
        const mIndex = breakPoints.findIndex(x => comp[this.chartKey] <= x);
        this.chart.options.plugins.indexSelected = mIndex;
      } else {
        this.chart.options.plugins.indexSelected = null;
      }
      this.chart.update();
    },
  },
  mounted() {
    const { rawData, zipSelected } = this;
    this.updateChart({ zipSelected, rawData });
  }
}
</script>