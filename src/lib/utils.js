import { thresholdColors } from '$lib/constants.js';
import {colors} from "./constants.js";

export function adjustColor(rgbArray, factor) {
    return rgbArray.map(value => {
        // Ensure the result is within the 0-255 range
        return Math.min(255, Math.max(0, factor > 1 ? (value * factor) : (value + (255 - value) * (1 - factor))));
    });
}

export function getRgbColorStr(rgbArray) {
    return `rgb(${Math.round(rgbArray[0])}, ${Math.round(rgbArray[1])}, ${Math.round(rgbArray[2])})`
}

export function getCfsColor(value) {
    // thresholdColors is a map of color names to their respective ranges
    // we must return the color name that corresponds to the range in which the value falls
    for (const color in thresholdColors) {
        const [ymin, ymax] = thresholdColors[color];
        if (value >= ymin && value < ymax) {
            return color;
        }
    }
    return colors.red;
}


// Utility function to convert CSV to JSON
export function csvToJson(csv) {
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

