import { writable, get } from 'svelte/store';
import {tweened} from "svelte/motion";
import {cubicOut} from "svelte/easing";

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
function createCsvDataStore(url) {
    const colors = {
        red: [240, 128, 128], // Soft red
        orange: [240, 164, 100], // Soft orange
        green: [144, 238, 144], // Soft green
        blue: [173, 216, 230], // Light blue
        violet: [221, 160, 221], // Plum, softer violet
    };
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
                set({ lastEntry, allData: jsonData, color: getCfsColor(cfs)});
            })
            .catch(error => console.error('Error fetching CSV data:', error));
    }
    function getCfsColor(cfs) {
        if (cfs <= 550) return colors.red;
        if (cfs <= 650) return colors.orange;
        if (cfs <= 800) return colors.green;
        if (cfs <= 1000) return colors.blue;
        return colors.violet;
    }
    function adjustColor(rgbArray, factor) {
        return rgbArray.map(value => {
            // Ensure the result is within the 0-255 range
            return Math.min(255, Math.max(0, factor > 1 ? (value * factor) : (value + (255 - value) * (1 - factor))));
        });
    }

    function getRgbColorStr(rgbArray) {
        return `rgb(${Math.round(rgbArray[0])}, ${Math.round(rgbArray[1])}, ${Math.round(rgbArray[2])})`
    }

    return {
        subscribe,
        fetchCsvData, // Expose the fetchCsvData method for external use
        colors,
        getCfsColor,
        adjustColor,
        getRgbColorStr,
    };
}

export const cfsData = createCsvDataStore('GREENWAVE_Year.csv');
