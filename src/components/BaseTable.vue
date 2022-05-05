<template>
  <v-card border flat v-if="tableData">
    <v-card-title>
      {{ tableTitle }}
      <v-spacer />
      <v-btn icon flat @click="$store.commit('selectKey', null)">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-divider />
    <v-table style="max-height: 35rem; overflow-y: scroll;">
      <thead>
        <tr>
          <th v-for="header in headers" :key="header">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in tableData" :key="item.id">
          <td>{{ item.date.toISOString().slice(0, 10) }}</td>
          <td>{{ item.city }}, {{ item.state }}</td>
          <td>
            w{{ Math.round(item.whitePercent) }}|
            b{{ Math.round(item.blackPercent) }}|
            h{{ Math.round(item.hispanicPercent) }}
          </td>
          <td>
            <a :href="`https://www.city-data.com/zips/${item.zipcode}.html`">
              {{ item.zipcode }}
            </a>    
          </td>
          <td>{{ item.killed }}</td>
          <td>{{ item.injured }}</td>
          <td>
            <a :href="item.source" target="new" style="text-decoration: none;">
              <v-icon>mdi-link</v-icon>
            </a>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script>
import { mapState } from 'vuex';
import db from '../helpers/db';
import { keys, titles } from '../helpers/categoryKeys';

const nToTxt = (x) => {
  let txt = '';
  if (x > 1000000) txt = `${Math.round(x / 10000) / 100}m`;
  else if (x > 1000) txt = `${Math.round(x / 100) / 10}k`;
  else if (x > 10) txt = Math.round(x);
  else txt = Math.round(x * 100) / 100;
  return `   ${txt}`;
}

export default {
  name: 'BaseTable',
  data: () => ({
    headers: [
      'date', 'location', 'races', 'zipcode', 'killed', 'injured', 'source',
    ],
    keys
  }),
  computed: {
    ...mapState(['selectedKey', 'selectedYear', 'minX', 'maxX', 'byYear']),
    tableData() {
      if (!this.selectedKey) return false;
      const {
        selectedKey, selectedYear, minX, maxX, byYear,
      } = this;
      let entries = [...db];
      if (byYear) entries = entries.filter(({ date }) => date.getUTCFullYear() === selectedYear);
      entries = entries.filter((dp) => dp[selectedKey] > minX && dp[selectedKey] <= maxX);
      return entries;
    },
    tableTitle() {
      if (!this.tableData) return false;
      const {
        selectedKey, minX, maxX,
      } = this;
      return `Areas w. ${titles[selectedKey]} ${nToTxt(minX)}-${nToTxt(maxX)}`;
    },
  },
}
</script>