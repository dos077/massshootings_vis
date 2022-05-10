import { createStore } from 'vuex';
import db from '../helpers/db';

export default createStore({
  state: {
    entries: [...db],
    perMillion: false,
    minSample: 100000,
    zipSelected: null,
    byYear: true,
    selectedKey: null,
    minX: null,
    maxX: null,
    selectedYear: null,
    populationSummary: null,
    densitySummary: null,
    medianHouseValueSummary: null,
    medianAgeSummary: null,
    medianHouseholdSummary: null,
  },
  getters: {
  },
  mutations: {
    setYear(state, year) {
      console.log('setting year', year);
      if (!year) state.entries = [...db];
      else state.entries = db.filter((ev) => ev.date.getUTCFullYear() === year);
    },
    setZip(state, val) {
      console.log('changing zip select', val);
      state.zipSelected = val;
    },
    setByYear(state, val) {
      state.byYear = val;
    },
    selectKey(state, key) {
      state.selectedKey = key;
    },
    selectYear(state, year) {
      state.selectedYear = year;
    },
    setXrange(state, { minX, maxX }) {
      state.minX = minX;
      state.maxX = maxX;
    },
    setSummary(state, { chartKey, summary }) {
      state[`${chartKey}Summary`] = summary;
    },
    setPerMillion(state, val) {
      state.perMillion = val;
    },
    setMinSample(state, val) {
      state.minSample = val;
    },
  },
  actions: {
  },
  modules: {
  },
});
