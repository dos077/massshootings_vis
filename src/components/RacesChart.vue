<template>
<v-card flat border>
  <v-card-title>Incidents distribution vs. Races Distribution</v-card-title>
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
import { buildTable, nToTxt, buildDataset, colors } from '../helpers/buildSeries';
import { titles } from '../helpers/categoryKeys';

export default {
  name: 'RacesChart',  
  data: () => ({
    chart: null,
    chartId: 'RaceBreakdownChart',
    breakPoints: [10,20,30,40,50,60,70,80,90,100],
    chartKeys: ['whitePercent', 'blackPercent', 'hispanicPercent'],
  }),
  computed: {
    ...mapState(['perMillion', 'zipSelected', 'entries', 'byYear']),
    rawData() {
    const { breakPoints, entries, chartKeys } = this;
      const data = [];
      chartKeys.forEach((chartKey) => {
        data.push(buildTable(chartKey, breakPoints, 10, entries));
      });
      return data;
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
    }
  },
  methods: {
    graphClick(index, datasetIndex) {
      console.log('clicked on', index, datasetIndex);
      const minX = index > 0 ? this.breakPoints[index - 1] : 0;
      const maxX = this.breakPoints[index];
      this.$store.commit('setXrange', { minX, maxX });
      this.$store.commit('selectKey', this.chartKeys[datasetIndex]);
    },
    newChart({ datasets, labels }) {
        const ctx = document.getElementById(this.chartId);
        const chart = new Chart(ctx, {
          type: 'bar',
          data: { datasets, labels },
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
    updateChart({
        zipSelected, rawData,
      }) {
      const { chartKeys, perMillion, breakPoints } = this;
      const datasets = rawData.map((data, i) => buildDataset({
        rawData: data, perMillion, zipSelected, chartKey: chartKeys[i], label: titles[chartKeys[i]],
      }, colors[i]));
      const labels = breakPoints.map((x) => nToTxt(x));
      if (this.chart) {
        this.chart.data = { datasets, labels };
        this.chart.update();
      } else {
        this.newChart({ datasets, labels });
      }
    },
  },
  mounted() {
    const { rawData, zipSelected } = this;
    this.updateChart({ zipSelected, rawData });
  }
}
</script>