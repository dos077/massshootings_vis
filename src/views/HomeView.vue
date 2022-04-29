<template>
<v-container>
  <v-row>
    <v-col>
      <v-card>
        <v-table>
          <thead>
            <tr>
              <th class="text-left">
                density
              </th>
              <th class="text-left">
                Victims
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in tableData"
              :key="item.x"
            >
              <td>{{ item.x }}</td>
              <td>{{ item.victims }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-col>
  </v-row>
</v-container>
</template>

<script>
import { defineComponent } from 'vue';
import { buildTable } from '../helpers/buildSeries';

export default defineComponent({
  name: 'HomeView',
  data: () => ({
    tableData: buildTable(),
  }),
});
</script>
