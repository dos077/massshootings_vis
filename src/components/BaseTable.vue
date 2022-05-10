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
          <td>
            {{ printN(item) }}
          </td>
          <td>{{ item.city }}, {{ item.state }}</td>
          <td>
            <a :href="`https://www.city-data.com/zips/${item.zipcode}.html`" target="new" style="text-decoration: none;">
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
import { nToTxt } from '../helpers/buildSeries';

export default {
  name: 'BaseTable',
  data: () => ({
    keys
  }),
  computed: {
    ...mapState(['selectedKey', 'selectedYear', 'minX', 'maxX', 'byYear', 'entries']),
    headers() {
      return[
        'date', titles[this.selectedKey], 'location', 'zipcode', 'killed', 'injured', 'source',
      ];
    },
    tableData() {
      if (!this.selectedKey) return false;
      const {
        selectedKey, selectedYear, minX, maxX, byYear,
      } = this;
      let entries = [];
      if (byYear) entries = db.filter(({ date }) => date.getUTCFullYear() === selectedYear);
      else entries = [...this.entries];
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
  methods: {
    printN(item) {
      return nToTxt(item[this.selectedKey]);
    },
  },
}
</script>