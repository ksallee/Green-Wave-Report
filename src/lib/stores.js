import { writable } from 'svelte/store';

// Utility function to convert CSV to JSON
function csvToJson(csv) {
    const lines = csv.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const data = line.split(',');
        return headers.reduce((obj, nextKey, index) => {
            obj[nextKey.trim()] = data[index].trim();
            return obj;
        }, {});
    });
}

// Enhanced store with integrated fetch functionality
function createCsvDataStore() {
    const { subscribe, set } = writable({ lastEntry: {}, allData: [] });

    // Fetch and update the store's value
    function fetchCsvData() {
    // Assuming the static directory is served from the root in SvelteKit
    const url = 'GREENWAVE_Year.csv'; // Update the path according to your static directory structure
    fetch(url)
        .then(response => response.text())
        .then(csvText => {
            const jsonData = csvToJson(csvText);
            const lastEntry = jsonData[jsonData.length - 1];
            set({ lastEntry, allData: jsonData });
        })
        .catch(error => console.error('Error fetching CSV data:', error));
    }


    return {
        subscribe,
        fetchCsvData, // Expose the fetchCsvData method for external use
    };
}

export const csvDataStore = createCsvDataStore();
