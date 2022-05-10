<template>
<v-row>
  <v-col>
    <v-card flat>
      <v-row>
        <v-col>
          <div class="text-overline">time frame</div>
          <v-chip-group v-model="yearOption" mandatory variant="outlined" color="red" column>
            <v-chip label>by year</v-chip>
            <v-chip label>2019</v-chip>
            <v-chip label>2020</v-chip>
            <v-chip label>2021</v-chip>
            <v-chip label>2022</v-chip>
            <v-chip label>all</v-chip>
          </v-chip-group>
        </v-col>
      </v-row>
      <v-row justify="start">
        <v-col cols="auto">
          <div class="text-overline">victims stats</div>
          <v-chip-group v-model="statOption" variant="outlined" color="red">
            <v-chip label>total</v-chip>
            <v-chip label>per million</v-chip>
          </v-chip-group>
        </v-col>
        <v-col cols="auto" v-if="perMillion">
          <div class="text-overline">Min Sample Population</div>
          <v-chip-group v-model="minSampleOption" variant="outlined" color="red">
            <v-chip label @click="$store.commit('setMinSample', 10000)">10,000</v-chip>
            <v-chip label @click="$store.commit('setMinSample', 100000)">100,000</v-chip>
            <v-chip label @click="$store.commit('setMinSample', 1000000)">1,000,000</v-chip>
          </v-chip-group>
        </v-col>
      </v-row>
      <v-row align="end">
        <v-col cols="auto">
          <div class="text-overline">highlight area</div>
          <v-menu v-model="stateMenu">
            <template v-slot:activator="{ props }">
              <v-chip v-bind="props" label variant="outlined" class="mr-2">
                {{ statePick || 'state' }}
              </v-chip>
            </template>
            <v-list>
              <v-list-item v-for="option in stateOptions" :key="option" @click="statePick = option; stateMenu = false">
                <v-list-item-title>{{ option }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-menu v-model="cityMenu">
            <template v-slot:activator="{ props }">
              <v-chip v-bind="props" label variant="outlined" class="mr-2">
                {{ cityPick || 'city' }}
              </v-chip>
            </template>
            <v-list v-if="statePick">
              <v-list-item v-for="option in cityOptions" :key="option" @click="cityPick = option; cityMenu = false">
                <v-list-item-title>{{ option }}</v-list-item-title>
              </v-list-item>
            </v-list>
            <v-list v-else>
              <v-list-item>
                <v-list-item-title>select state first</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-menu v-model="zipMenu">
            <template v-slot:activator="{ props }">
              <v-chip v-bind="props" label variant="outlined" class="mr-2" :color="zipPick ? 'red' : undefined">
                {{ zipPick || 'zipcode' }}
              </v-chip>
            </template>
            <v-list v-if="statePick && cityPick">
              <v-list-item v-for="option in zipOptions" :key="option" @click="zipPick = option; zipMenu = false">
                <v-list-item-title>{{ option }}</v-list-item-title>
              </v-list-item>
            </v-list>
            <v-list v-else>
              <v-list-item>
                <v-list-item-title>select city first</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
    </v-card>
  </v-col>
</v-row>
</template>

<script>
import { mapState } from 'vuex';
import { useDisplay } from 'vuetify';
import db from '../helpers/db';

const stateOptions = [];
db.forEach(({ state }) => {
  if (!stateOptions.includes(state)) stateOptions.push(state);
});
stateOptions.sort();

export default {
  name: 'SettingPanel',
  data: () => ({
    display: useDisplay(),
    yearOption: 0,
    statOption: 0,
    minSampleOption: 1,
    stateMenu: false,
    statePick: null,
    cityMenu: false,
    cityPick: null,
    stateOptions,
    zipMenu: false,
    zipPick: null,
  }),
  computed: {
    ...mapState(['zipSelected', 'perMillion', 'minSample']),
    minSampleSelected() {
      if (this.minSample === 10000) return 0;
      if (this.minSample === 100000) return 1;
      return 2;
    },
    cityOptions() {
      if (!this.statePick) return [];
      const { statePick }= this;
      const cities = [];
      db.filter(({ state }) => state === statePick).forEach(({ city }) => {
        if (!cities.includes(city)) cities.push(city);
      });
      return cities.sort();
    },
    zipOptions() {
      const { statePick, cityPick } = this;
      if (!statePick || !cityPick) return [];
      const zips  = db
        .filter(({ state, city }) => state === statePick && city === cityPick)
        .map(({ zipcode }) => zipcode);
      return zips.filter((val, i, self) => self.indexOf(val) === i).sort();
    },
    isMobile() {
      return this.display.smAndDown;
    },
  },
  watch: {
    yearOption(to) {
      if (to === 0) {
        this.$store.commit('setByYear', true);
      } else {
        this.$store.commit('setByYear', false);
        this.$store.commit('setYear', [null, 2019, 2020, 2021, 2022, null][to]);
      }
    },
    statOption(to) {
      this.$store.commit('setPerMillion', to === 1);
    },
    zipPick(to) {      
      this.$store.commit('setZip', to);
    }
  },
  methods: {
  },
}
</script>