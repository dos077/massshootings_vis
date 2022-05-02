<template>
<v-container>
  <setting-panel />
  <v-row>
    <v-col v-for="chartKey in keys" :key="chartKey" cols="12" lg="6">
      <v-scroll-y-reverse-transition>
        <base-chart v-if="!(selectedKey === chartKey)" :chartId="`${chartKey}-chart`" :chartKey="chartKey" />
      </v-scroll-y-reverse-transition>
      <v-scroll-y-transition>
        <base-table v-if="selectedKey === chartKey" />
      </v-scroll-y-transition>
    </v-col>
  </v-row>
</v-container>
</template>

<script>
import { mapState } from 'vuex';
import BaseChart from '../components/BaseChart.vue';
import BaseTable from '../components/BaseTable.vue';
import SettingPanel from '../components/SettingPanel.vue';

export default {
  components: { BaseChart, SettingPanel, BaseTable },
  name: 'HomeView',
  data: () => ({
    keys: [
      'population',
      'density',
      'medianHouseValue',
      'medianAge',
      'medianHousehold',
    ],
  }),
  computed: {
    ...mapState(['selectedKey', 'selectedYear', 'minX', 'maxX', 'byYear']),
  },
  methods: {
    test(year) {
      this.$store.commit('setYear', year);
    },
  },
};
</script>
