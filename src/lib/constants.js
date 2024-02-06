export const colors = {
    grey: [192, 192, 192], // Grey
    red: [240, 128, 128], // Soft red
    orange: [240, 164, 100], // Soft orange
    yellow: [255, 255, 0], // Yellow
    green: [144, 238, 144], // Soft green
    blue: [173, 216, 230], // Light blue
    violet: [221, 160, 221], // Plum, softer violet
};
export const thresholds = [0, 450, 550, 650, 800, 1000, 1200];

export const thresholdColors = {
    grey: [thresholds[0], thresholds[1]],
    red: [thresholds[1], thresholds[2]],
    orange: [thresholds[2], thresholds[3]],
    green: [thresholds[3], thresholds[4]],
    blue: [thresholds[4], thresholds[5]],
    violet: [thresholds[5], thresholds[6]],
}

export const temperatureThresholds = [-50, 42, 43, 52, 58, 62, 100];
export const temperatureThresholdColors = {
    violet: [temperatureThresholds[0], temperatureThresholds[1]],
    blue: [temperatureThresholds[1], temperatureThresholds[2]],
    green: [temperatureThresholds[2], temperatureThresholds[3]],
    yellow: [temperatureThresholds[3], temperatureThresholds[4]],
    orange: [temperatureThresholds[4], temperatureThresholds[5]],
    red: [temperatureThresholds[5], temperatureThresholds[6]]
}