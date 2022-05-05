<template>
<v-row>
  <v-col>
    <v-card flat border>
      <v-card-title>Mass shooting incidents from areas similar to {{ zipSelected }}</v-card-title>
      <v-list>
        <v-list-item v-for="(summary, i) in summaries" :key="i">
          <v-list-item-header>
            <v-list-item-title>{{ summary[0] }}</v-list-item-title>
            <v-list-item-subtitle v-for="line in summary.slice(1)" :key="line"
              class="font-weight-medium" style="color: #b30000;">
              {{ line }}
            </v-list-item-subtitle>
          </v-list-item-header>
        </v-list-item>
      </v-list>
    </v-card>
  </v-col>
</v-row>
</template>

<script>
import { mapState } from 'vuex';
import { keys } from '../helpers/categoryKeys';

export default {
  name: 'ZipcodeSummary',
  computed: {
    ...mapState([
      ...keys.map(key => `${key}Summary`),
      'zipSelected',
    ]),
    summaries() {
      const arr = [];
      keys.forEach(key => {
        arr.push(this[`${key}Summary`]);
      });
      return arr;
    }
  }
}
</script>
