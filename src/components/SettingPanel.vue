<template>
<v-row>
  <v-col>
    <v-card flat>
      <v-row>
        <v-col>
          <div class="text-overline">time frame</div>
          <v-btn-toggle v-model="yearOption" mandatory variant="outlined" color="red">
            <v-btn>by year</v-btn>
            <v-btn>2019</v-btn>
            <v-btn>2020</v-btn>
            <v-btn>2021</v-btn>
            <v-btn>2022</v-btn>
            <v-btn>all</v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
      <v-row justify="start">
        <v-col cols="auto">
          <div class="text-overline">victims stats</div>
          <v-btn-toggle :model-value="perMillion ? 1 :0" variant="outlined" color="red">
            <v-btn @click="$store.commit('setPerMillion', false)">total</v-btn>
            <v-btn @click="$store.commit('setPerMillion', true)">per million</v-btn>
          </v-btn-toggle>
        </v-col>
        <v-col cols="auto" v-if="perMillion">
          <div class="text-overline">Min Sample Population</div>
          <v-btn-toggle :model-value="minSampleSelected" variant="outlined" color="red">
            <v-btn @click="$store.commit('setMinSample', 10000)">10,000</v-btn>
            <v-btn @click="$store.commit('setMinSample', 100000)">100,000</v-btn>
            <v-btn @click="$store.commit('setMinSample', 1000000)">1,000,000</v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
      <v-row align="end">
        <v-col cols="auto">
          <div class="text-overline">highlight area</div>
          <v-autocomplete :items="stateOptions" v-model="statePick" label="State"
            style="min-width: 11rem;" class="mb-0" />
        </v-col>
        <v-col cols="auto">
          <v-autocomplete :items="cityOptions" v-model="cityPick" label="City" no-data-text="select state"
            style="min-width: 11rem;" />
        </v-col>
        <v-col cols="auto">
          <v-autocomplete :items="zipOptions" v-model="zipPick" label="Zipcode" no-data-text="select city"
            style="min-width: 11rem;" />
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
    statePick: null,
    cityPick: null,
    stateOptions,
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
    zipPick(to) {      
      this.$store.commit('setZip', to);
    }
  },
  methods: {
  },
}
</script>