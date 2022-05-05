<template>
<v-container>
  <setting-panel />
  <zipcode-summary v-if="zipSelected" />
  <v-row>
    <v-col v-for="chartKey in keys" :key="chartKey" cols="12" lg="6">
      <v-slide-x-reverse-transition>
        <base-chart v-if="!(selectedKey === chartKey)" :chartId="`${chartKey}-chart`" :chartKey="chartKey" />
      </v-slide-x-reverse-transition>
      <v-slide-x-transition>
        <base-table v-if="selectedKey === chartKey" />
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
import { keys } from '../helpers/categoryKeys';

export default {
  components: { BaseChart, BaseTable, SettingPanel, ZipcodeSummary, },
  name: 'HomeView',
  data: () => ({
    keys,
  }),
  computed: {
    ...mapState(['selectedKey', 'selectedYear', 'minX', 'maxX', 'byYear', 'zipSelected']),
  },
};
</script>
