<template>
<v-row>
  <v-col>
    <v-card flat>
      <v-row>
        <v-col>
          <v-btn-toggle v-model="yearOption" mandatory>
            <v-btn>by year</v-btn>
            <v-btn>2019</v-btn>
            <v-btn>2020</v-btn>
            <v-btn>2021</v-btn>
            <v-btn>2022</v-btn>
            <v-btn>all</v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-autocomplete :items="stateOptions" v-model="statePick" label="State" />
        </v-col>
        <v-col>
          <v-autocomplete :items="cityOptions" v-model="cityPick" label="City" />
        </v-col>
        <v-col>
          <v-autocomplete :items="zipOptions" v-model="zipPick" label="Zipcode" />
        </v-col>
      </v-row>
    </v-card>
  </v-col>
</v-row>
</template>

<script>
import { mapState } from 'vuex';
import db from '../helpers/db';

const stateOptions = [];
db.forEach(({ state }) => {
  if (!stateOptions.includes(state)) stateOptions.push(state);
});
stateOptions.sort();

export default {
  name: 'SettingPanel',
  data: () => ({
    yearOption: 0,
    statePick: null,
    cityPick: null,
    stateOptions,
    zipPick: null,
  }),
  computed: {
    ...mapState(['zipSelected']),
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
    }
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