<template>
<v-container>
  <v-row>
    <v-col>
      <v-card flat>
        <v-card-title>
          Mass Shooting in USA
          <v-spacer />
          <v-btn icon variant="text" @click="infoPanelOn = true; settingPanelOn = false;">
            <v-icon>mdi-information-outline</v-icon>
          </v-btn>
          <v-btn icon variant="text" @click="infoPanelOn = false; settingPanelOn = true;">
            <v-icon>mdi-cog-outline</v-icon>
          </v-btn>
          <v-expand-x-transition>
            <v-btn v-if="settingPanelOn || infoPanelOn"
              icon elevation="0" @click="infoPanelOn = false; settingPanelOn = false">
              <v-icon>mdi-chevron-up</v-icon>
            </v-btn>
          </v-expand-x-transition>
        </v-card-title>
        <v-divider />
        <v-expand-transition>
          <v-card-text v-show="infoPanelOn">
            <div>
              <p v-for="(paragraph, i) in introTxt" :key="i" class="mb-4 text-body-1">
                {{ paragraph }}
              </p>
              <p class="mb-4 text-body-1">
                Shooting incidents data from <a href="https://www.gunviolencearchive.org" target="new">
                  gunviolencearchive.org
                </a>
              </p>
              <p class="mb-4 text-body-1">
                Demographic data from <a href="https://www.city-data.com" target="new">
                  city-data.com
                </a>
              </p>
            </div>
          </v-card-text>
        </v-expand-transition>
        <v-expand-transition>
          <v-card-text v-show="settingPanelOn">
            <setting-panel />
          </v-card-text>
        </v-expand-transition>
      </v-card>
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      <v-card elevation="0">
        <v-card-text>
          <div class="text-overline">Incidents distribution vs.</div>
        </v-card-text>
        <v-tabs center-active fixed-tabs show-arrows>
          <v-tab v-for="chip in graphOptions" :key="chip.key" @click="toggleGraph(chip.key)">
            {{ chip.title }}
          </v-tab>
        </v-tabs>
      </v-card>
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
    <zipcode-summary v-if="zipSelected" />
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
    infoPanelOn: false,
    settingPanelOn: false,
    introTxt: [
      'Mass shootings have plagued America for decades and show no sign of slowing down. Gun Violence Archive is doing an excellent job of documenting these incidents and this personal project is a visualization of their data. Everyone in the US should pay more attention to this fact of life. Select a zipcode from a town/city of interest and see how many incidents have occurred in similar towns across the country.',
      'Please note correlation doesn\'t mean causation. History doesn\'t repeat itself, but it rhymes. The visualized data is meant for a presentation on the history of senseless violence, not a predictor for future tragedies.',
    ],
  }),
  computed: {
    ...mapState(['selectedKey', 'selectedYear', 'minX', 'maxX', 'byYear', 'zipSelected']),
    keys() {
      if (this.byYear) {
        return keys;
      } else {
        return keys
          .filter((key) => !['whitePercent', 'blackPercent', 'hispanicPercent', ].includes(key)
        )
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
    graphButton() {
      const { graphSelected, graphOptions } = this;
      const key = graphSelected[0];
      return graphOptions.findIndex((op) => op.key === key);
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
