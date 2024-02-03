<script>
    import { Line  } from 'svelte-chartjs';
    import {fade} from 'svelte/transition';
    import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';

    import { colors, thresholdColors } from "$lib/constants";
    import {adjustColor, getRgbColorStr} from "../../lib/utils";

    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);
    ChartJS.defaults.color = '#eae9e9'
    ChartJS.defaults.borderColor = '#eae9e9'

    export let title = 'GreenWave Cubic Feet Per Second (CFS) Bend, Oregon';
    export let validLabels = [];
    export let labelColors = [];
    export let dateOffset = 0;
    export let endDate = new Date();
    export let datapointsDivisor = 70;
    export let data = [];
    export let displayLegend = false;

    $: refresh(title, validLabels, dateOffset, endDate, datapointsDivisor, data);

    let labels = []; // Dates for the X-axis
    let chartData = undefined
    let options = {}



    const canvasBackgroundPlugin = {
        id: 'canvasBackground',
        beforeDraw: function(chart) {
            const { ctx, chartArea: { left, right, }, scales: { y } } = chart;

            function bgColors(ymin, ymax, color) {
                // from should never be
                const from = y.getPixelForValue(ymin);
                const to = y.getPixelForValue(ymax);
                ctx.save();
                ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
                ctx.fillRect(left, to, right - left, from - to);
                ctx.restore();
            }

            // Dynamically fill colors based on thresholdColors, which is a object with the
            // color name as the key and the minY and maxY as the value
            Object.entries(thresholdColors).forEach(([colorName, [ymin, ymax]], index) => {
                let adjustedMinY = 0;
                if (index === 0){
                    adjustedMinY = y.min;
                }
                else{
                    adjustedMinY = ymin;
                }
                const adjustedMaxY = Math.min(ymax, y.max);
                const color = colors[colorName]; // Assuming 'colors' is an object mapping color names to RGB values
                if (adjustedMinY < adjustedMaxY){
                    bgColors(adjustedMinY, adjustedMaxY, color);
                }

            });
        }
    };

    function refresh(title, validLabels, dateOffset, endDate, datapointsDivisor, data){
        console.log('refreshing chart', data);
        // Remove the hour and minute from the date
        labels = data.map(entry => entry.Date.split(' ')[0]);
        labels =  labels.filter((_, i) => i % datapointsDivisor === 0 || i === data.length - 1);
        // Find the data per valid label
        // Valid labels are an array of strings
        // data is an array of objects, each one with {Date: string, 'CFS @ Head of Park': number, 'other label': number}
        // Iterate over the labels but also over the filtered data (datapointsDivisor)
        // So that we can get a min and max value for the Y-axis
        // if (!chartData){
        chartData = {
            labels,
            datasets: []
        };
        // }
        validLabels.forEach((label, index) => {
            const labelData = data.map(entry => entry[label]);
            const filteredLabelData = labelData.filter((_, i) => i % datapointsDivisor === 0 || i === data.length - 1);
            chartData.datasets.push({
                label,
                data: filteredLabelData,
                borderColor: getRgbColorStr(labelColors[index]),
                backgroundColor: getRgbColorStr(adjustColor(labelColors[index], 0.5)),
                tension: 0.1,
                borderWidth: 2
            });

        });

        options = {
            scales: {
                x: {
                    display: true,
                    beginAtZero: false,
                    ticks: {
                        maxTicksLimit: 6,
                        callback: function(val, index) {
                            return index !== 0 ? this.getLabelForValue(val) : '';
                        },
                    },
                    grid: {
                        display: false
                    },
                },
                y: {
                    beginAtZero: false,
                }
            },
            plugins: {
                legend: {
                    display: displayLegend,
                },

            },
            maintainAspectRatio: false
        };
        console.log("chartData", chartData);
        console.log("options", options);
        chartData = {...chartData};
        options = {...options};
    }



</script>

<div class="container" in:fade>
    <div class="chart-container">
        <h1>{title}</h1>
        <Line bind:data={chartData} {options} plugins={[canvasBackgroundPlugin]} width={400} height={200} />
    </div>
</div>

<style>
    .container{
        /*background-color: #f6f5f5;*/
        display: flex;
        justify-content: flex-start;
        align-items: center;
        /*margin: 30px auto;*/
        /*padding: 0 20px;*/
        flex-direction: column;
        width: 100%;
        height: 100%;
    }
    h1{
        color: #f8f8f8;
        margin-bottom: 20px;
    }
    .chart-container{
        width: 50%;
        height: 60vh;
    }
    @media (max-width: 900px) {
        .chart-container{
            width: 95%;
            height: 40vh;
        }
        .container{
            margin: 2px auto;
            padding: 2px;
        }
    }
</style>