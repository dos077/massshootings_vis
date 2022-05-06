<template>
<v-container>
  <setting-panel />
  <zipcode-summary v-if="zipSelected" />
  <v-row>
    <v-col>
      <v-chip v-for="chip in graphOptions" :key="chip.key" @click="toggleGraph(chip.key)"
        label class="mr-3 mb-3"
        :color="graphSelected.includes(chip.key) ? 'red' : undefined">
        {{ chip.title }}
      </v-chip>
    </v-col>
  </v-row>
  <v-row>
    <v-col v-for="chartKey in displayKeys" :key="chartKey" cols="12" lg="6">
      <v-slide-x-reverse-transition>
        <base-chart v-if="!(selectedKey === chartKey)" :chartId="`${chartKey}-chart`" :chartKey="chartKey" />
      </v-slide-x-reverse-transition>
      <v-slide-x-transition>
        <base-table v-if="selectedKey === chartKey" />
      </v-slide-x-transition>
    </v-col>
    <v-col v-if="graphSelected.includes('races') && !byYear" cols="12" lg="6">
      <v-slide-x-reverse-transition>
        <races-chart v-if="!['whitePercent', 'blackPercent', 'hispanicPercent'].includes(selectedKey)" />
      </v-slide-x-reverse-transition>
      <v-slide-x-transition>
        <base-table v-if="['whitePercent', 'blackPercent', 'hispanicPercent'].includes(selectedKey)" />
      </v-slide-x-transition>
    </v-col>
  </v-row>
</v-container>
</template>

<script>
import { mapState } from 'vuex';
import BaseChart from '../components/BaseChart.vue';
import BaseTable from '../components/BaseTable.vue';
import SettingPanel from '../components/SettingPanel.vue';
import ZipcodeSummary from '../components/ZipcodeSummary.vue';
import RacesChart from '../components/RacesChart.vue';
import { keys, titles } from '../helpers/categoryKeys';

export default {
  components: { BaseChart, BaseTable, SettingPanel, ZipcodeSummary, RacesChart },
  name: 'HomeView',
  data: () => ({
    graphSelected: [],
    multiGraph: false,
  }),
  computed: {
    ...mapState(['selectedKey', 'selectedYear', 'minX', 'maxX', 'byYear', 'zipSelected']),
    keys() {
      if (this.byYear) {
        return keys;
      } else {
        return keys
          .slice(0, 4)
      }
    },
    displayKeys() {
      return this.keys.filter((key) => this.graphSelected.includes(key));
    },
    graphOptions() {
      const arr = [
        ...this.keys.map(key => ({ key, title: titles[key] })),
      ];
      if (!this.byYear) arr.push({ key: 'races', title: 'races' });
      return arr;
    },
  },
  methods: {
    toggleGraph(key) {
      if (this.multiGraph) {
        if (this.graphSelected.includes(key))
          this.graphSelected = this.graphSelected.filter(g => g !== key);
        else this.graphSelected.push(key);
      } else {
        this.graphSelected = [key];
      }
    },
  },
  mounted() {
    this.graphSelected = [this.graphOptions.map(({ key }) => key)[0]];
  },
};
</script>
