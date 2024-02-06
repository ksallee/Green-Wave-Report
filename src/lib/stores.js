import { writable } from 'svelte/store';
import { persistent } from "@furudean/svelte-persistent-store"
import { colors } from '$lib/constants.js';
import { csvToJson, getCfsColor} from "$lib/utils.js";


export const chartsHiddenLabels = persistent({
	start_value: {"cfs": []},
	key: "chartsHiddenLabels", // key to save as in Storage
	storage_type: "localStorage" // Storage object to use
})

// for each chart, store the start and end date offsets
// We'll use them to calculate the start and end dates for the chart
// from the chart's end date
// -1 means no offset, 5 means 5 days before the end date
export const dateOffsets = persistent({
    start_value: {"cfs": [-1, 0]},
    key: "endDateOffsets",
    storage_type: "localStorage"
})

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
                console.log("lastEntry", lastEntry);
                const cfs = parseFloat(lastEntry["HeadOfPark"]);
                set({ lastEntry, allData: jsonData, color: colors[getCfsColor(cfs)]});
            })
            .catch(error => console.error('Error fetching CSV data:', error));
    }

    return {
        subscribe,
        fetchCsvData, // Expose the fetchCsvData method for external use
    };
}

export const cfsData = createCsvDataStore('WICO_BENO_CENO_ARNO_HEAD_LAPO.csv');

