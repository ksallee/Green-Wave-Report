<script>
    import { Line  } from 'svelte-chartjs';
    import {fade} from 'svelte/transition';
    import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';

    import { colors, thresholdColors } from "$lib/constants";
    import {adjustColor, getRgbColorStr} from "../../lib/utils";

    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);
    ChartJS.defaults.color = '#eae9e9'
    ChartJS.defaults.borderColor = '#eae9e9'


    export let title = '';
    export let subtitle = '';
    export let validLabels = [];
    export let niceLabels = [];
    export let labelColors = [];
    export let minDate = undefined;
    export let maxDate = undefined;
    export let datapointsDivisor = 50;
    export let data = [];
    export let displayLegend = false;
    export let hiddenLabels = [];

    $: refresh(data);
    $: refreshDateRange(minDate, maxDate);

    let labels = []; // Dates for the X-axis
    let datasets = []; // Data for the Y-axis
    let chartData = undefined
    let options = {}
    let chart = undefined;



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
function refreshDateRange(minDate, maxDate){
    let tmpDataSets = [...datasets]
    if(!minDate || !maxDate || !chart || !chart.data){
        return;
    }
    const minDateObj = new Date(minDate);
    const maxDateObj = new Date(maxDate);
    const minDateIndex = labels.findIndex(label => new Date(label) >= minDateObj);
    let maxDateIndex = labels.findIndex(label => new Date(label) > maxDateObj);

    // If maxDate is exactly on a label, adjust maxDateIndex to include it
    if (maxDateIndex === -1) {
        maxDateIndex = labels.length - 1; // Assume last date should be included if maxDate is beyond any label
    } else if (new Date(labels[maxDateIndex]) !== maxDateObj) {
        maxDateIndex -= 1; // Adjust because findIndex gives the first index that is greater
    }

    if (minDateIndex === -1 || maxDateIndex < minDateIndex) {
        // No valid range found
        return;
    }

    // Update labels
    chart.data.labels = [...labels.slice(minDateIndex, maxDateIndex + 1)];

    // Update datasets
    chart.data.datasets.forEach((dataset, index) => {
        const data = [...tmpDataSets[index].data]
        dataset.data = [...data.slice(minDateIndex, maxDateIndex + 1)];
    });

}


    function refresh(data){
        if (!data || data.length === 0){
            return;
        }
        // if minDate and maxDate are defined, filter the labels
        // Remove the hour and minute from the date
        labels = data.map(entry => entry.Date.split(' ')[0]);

        labels =  labels.filter((_, i) => i % datapointsDivisor === 0 || i === data.length - 1);
        // Find the data per valid label
        // Valid labels are an array of strings
        // data is an array of objects, each one with {Date: string, 'CFS @ Head of Park': number, 'other label': number}
        // Iterate over the labels but also over the filtered data (datapointsDivisor)
        // So that we can get a min and max value for the Y-axis
        // if (!chartData){
        let chartDataNew = {
            labels,
            datasets: []
        };
        datasets = []
        // }
        validLabels.forEach((label, index) => {
            const labelData = data.map(entry => entry[label]);
            const filteredLabelData = labelData.filter((_, i) => i % datapointsDivisor === 0 || i === data.length - 1);

            datasets.push({
            label: niceLabels[index],
            data: filteredLabelData,
            borderColor: getRgbColorStr(labelColors[index]),
            backgroundColor: getRgbColorStr(adjustColor(labelColors[index], 0.5)),
            tension: 0.1,
            borderWidth: 2,
            // hidden if label is in hiddenLabels
            hidden: hiddenLabels.includes(label) || filteredLabelData.every(x => x == 0),
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
        // console.log("options", options);
        chartDataNew.datasets = [];
        datasets.forEach(dataset => {
            chartDataNew.datasets.push({...dataset});
        });
        chartData = {...chartDataNew};
    }



</script>
{#if chartData && options}
    <h1 in:fade>{title}</h1>
    {#if subtitle}
        <h4 in:fade>{subtitle}</h4>
    {/if}
    <div class="container" in:fade>
        <Line bind:chart bind:data={chartData} {options} plugins={[canvasBackgroundPlugin]} />

    </div>
{/if}

<style>
    .container{
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-direction: column;
        width: 100%;
        height: 100%;
    }
    h1, h4{
        color: #f8f8f8;
        margin-bottom: 20px;
        text-align: center;
    }
    @media (max-width: 900px) {
        .container{
            margin: 2px auto;
            padding: 2px;
        }
    }
</style>