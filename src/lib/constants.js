export const colors = {
    grey: [192, 192, 192], // Grey
    red: [240, 128, 128], // Soft red
    orange: [240, 164, 100], // Soft orange
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