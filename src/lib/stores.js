import { writable } from 'svelte/store';
import { colors } from '$lib/constants.js';
import { csvToJson, getCfsColor} from "$lib/utils.js";

// Enhanced store with integrated fetch functionality
function createCsvDataStore(url) {
    const { subscribe, set } = writable({ lastEntry: {}, allData: [], color: colors.red });

    // Fetch and update the store's value
    function fetchCsvData() {
        // Assuming the static directory is served from the root in SvelteKit
        fetch(url)
            .then(response => response.text())
            .then(csvText => {
                const jsonData = csvToJson(csvText);
                const lastEntry = jsonData[jsonData.length - 1];
                const cfs = parseFloat(lastEntry["CFS @ Head of Park"]);
                set({ lastEntry, allData: jsonData, color: colors[getCfsColor(cfs)]});
            })
            .catch(error => console.error('Error fetching CSV data:', error));
    }

    return {
        subscribe,
        fetchCsvData, // Expose the fetchCsvData method for external use
    };
}

export const cfsData = createCsvDataStore('GREENWAVE_Year.csv');
export const cfsDataWhiteWater = createCsvDataStore('WICO-BENO-Whitewater.csv');
export const cfsDataWicoBeno = createCsvDataStore("WICO_BENO_CENO_ARNO_HEAD_LAPO.csv");

