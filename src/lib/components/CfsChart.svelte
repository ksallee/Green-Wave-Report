<script>
    import { Line  } from 'svelte-chartjs';
    import {fade} from 'svelte/transition';
    import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';

    import { colors } from "$lib/constants";
    import {adjustColor, getRgbColorStr} from "../../lib/utils";

    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);
    ChartJS.defaults.color = '#111'
    ChartJS.defaults.borderColor = '#ffffff'


    export let title = '';
    export let subtitle = '';
    export let validLabels = [];
    export let niceLabels = [];
    export let labelColors = [];
    export let minDate = undefined;
    export let maxDate = undefined;
    export let datapointsDivisor = 80;
    export let data = [];
    export let displayLegend = false;
    export let hiddenLabels = [];
    export let thresholdColors = {};
    export let datapointsFunction = undefined;

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
                if (ymin <= y.min){
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

    function legendItemClicked(event, legendItem, legend){
        const index = legendItem.datasetIndex;
        const ci = legend.chart;
        if (ci.isDatasetVisible(index)) {
            ci.hide(index);
            legendItem.hidden = true;
            if (hiddenLabels.indexOf(legendItem.text) === -1){
                hiddenLabels = [...hiddenLabels, legendItem.text];
            }
        } else {
            ci.show(index);
            legendItem.hidden = false;
            hiddenLabels = [...hiddenLabels.filter(label => label !== legendItem.text)];

        }
    }

    function refreshDateRange(minDate, maxDate) {
        let tmpDataSets = [...datasets]
        if (!minDate || !maxDate || !chart || !chart.data) {
            return;
        }
        const minDateIndex = labels.findIndex(label => new Date(label) >= minDate);
        let maxDateIndex = labels.findIndex(label => new Date(label) >= maxDate);

        // If maxDate is exactly on a label, adjust maxDateIndex to include it
        if (maxDateIndex === -1) {
            maxDateIndex = labels.length - 1; // Assume last date should be included if maxDate is beyond any label
        } else if (new Date(labels[maxDateIndex]) !== maxDate) {
            maxDateIndex -= 1; // Adjust because findIndex gives the first index that is greater
        }
        if (minDateIndex === -1 || maxDateIndex < minDateIndex) {
            // No valid range found
            return;
        }
        const days = (maxDate - minDate) / (1000 * 60 * 60 * 24);
        if (datapointsFunction){
            datapointsDivisor = datapointsFunction(days);
        }
        // Update labels
        let chartLabels = [...labels];

        // Calculate the new last index after slicing to ensure we include the last point
        const lastIndex = maxDateIndex - minDateIndex;

        chartData.labels = chartLabels.slice(minDateIndex, maxDateIndex + 1)
            .filter((_, i, arr) => i % datapointsDivisor === 0 || i === lastIndex);

        // Update datasets
        chartData.datasets.forEach((dataset, index) => {
            const data = [...tmpDataSets[index].data];
            // Ensure to include the last point by checking against the new lastIndex
            dataset.data = data.slice(minDateIndex, maxDateIndex + 1)
                .filter((_, i, arr) => i % datapointsDivisor === 0 || i === lastIndex);
        });

        chartData = {...chartData}
        chart.update();
    }

    function refresh(data){
        console.log("Refreshing chart data", data);
        if (!data || data.length === 0){
            return;
        }
        labels = data.map(entry => entry.Date);
        let chartDataNew = {
            labels: labels,
            datasets: []
        };
        datasets = []
        validLabels.forEach((label, index) => {
            const labelData = data.map(entry => entry[label]);
            // const filteredLabelData = labelData.filter((_, i) => i % datapointsDivisor === 0 );
            const niceLabel = niceLabels[index];
            datasets.push({
                label: niceLabel,
                data: labelData,
                borderColor: getRgbColorStr(labelColors[index]),
                backgroundColor: getRgbColorStr(adjustColor(labelColors[index], 0.5)),
                tension: 0.1,
                borderWidth: 2,
                // hidden if label is in hiddenLabels
                hidden: hiddenLabels.includes(niceLabel) || labelData.every(x => x == 0),
            });

        });

        options = {
            scales: {
                x: {
                    display: true,
                    beginAtZero: false,
                    ticks: {
                        align: "end",
                        maxTicksLimit: 5,
                        callback: function(val, index) {
                            return index !== 0 ? this.getLabelForValue(val).split(' ')[0] : '';
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
                    onClick: legendItemClicked,
                },

            },
            maintainAspectRatio: false
        };
        chartDataNew.datasets = [];
        datasets.forEach(dataset => {
            let filteredDataSet = {...dataset};
            filteredDataSet.data = [...dataset.data];
            chartDataNew.datasets.push({...filteredDataSet});
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
        box-sizing: border-box;

        height: 85%;
    }
    h1, h4{
        color: #111;
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