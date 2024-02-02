<script>
    import { Line  } from 'svelte-chartjs';
    import { csvDataStore } from '$lib/stores'; // Adjust the import path as necessary
    import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';
    import {onMount} from "svelte";
    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

    let labels = []; // Dates for the X-axis
    let cfsData = []; // CFS for the Y-axis
    let skimboardsData = []; // Skimboards data for the Y-axis
    let awesomeWaveTimeData = []; // AWESOME Wave Time data for the Y-axis
    let chartData = {}

    // Subscriber to the store to process data for the chart
    onMount(async () => {
        await csvDataStore.fetchCsvData('https://www.gwsr2024.xyz/surf/GREENWAVE_Year.csv');
    });

    $: refresh($csvDataStore);

    const canvasBackgroundPlugin = {
    id: 'canvasBackground',
    beforeDraw: function(chart) {
        const { ctx, chartArea: { left, top, right, bottom }, scales: { x, y } } = chart;
        const colors = {
            red: [240, 128, 128], // Soft red
            orange: [240, 164, 100], // Soft orange
            green: [144, 238, 144], // Soft green
            blue: [173, 216, 230], // Light blue
            violet: [221, 160, 221], // Plum, softer violet
        };

        const thresholds = [550, 650, 800, 1000, 1200]; // Define your thresholds
        const colorKeys = Object.keys(colors);
        const maxYValue = Math.max(...chart.config.data.datasets.flatMap(ds => ds.data));

        function bgColors(ymin, ymax, color) {
            const from = y.getPixelForValue(ymin);
            const to = y.getPixelForValue(Math.min(ymax, maxYValue));
            ctx.save();
            ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
            ctx.fillRect(left, to, right - left, from - to);
            ctx.restore();
        }

        // Dynamically fill colors based on thresholds and maxYValue
        thresholds.reduce((prevY, currentY, index) => {
            if (prevY < maxYValue) {
                bgColors(prevY, currentY, colors[colorKeys[index]]);
            }
            return currentY;
        }, 0);
    }
};

    function refresh(data) {
        labels = data.allData.map(entry => entry.Date);
        const everyX = 30;
        labels =  labels.filter((_, i) => i % everyX === 0 || i === data.allData.length - 1);
        cfsData = data.allData.map(entry => entry['CFS @ Head of Park']);
        cfsData = cfsData.filter((_, i) => i % everyX === 0 || i === data.allData.length - 1);
        chartData = {
            labels,
            datasets: [
                {
                    label: 'CFS @ Head of Park',
                    data: cfsData,
                    borderColor: 'rgb(46,82,108)',
                    backgroundColor: 'rgb(55,183,183)',
                    tension: 0.1,
                    borderWidth: 2
                },
            ]
        };
    }


    const options = {
        scales: {
            x: {
                display: false,
                ticks: {
                    maxTicksLimit: 1
                }
            }
        },
        // maintainAspectRatio: false
    };
</script>

<div class="container">
    <Line data={chartData} {options} plugins={[canvasBackgroundPlugin]} width={400} height={200} />
</div>

<style>
    .container{
        width: 80vw;
        height: 80vh;
        background-color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f5f5f5;
        margin: 30px auto;

    }
</style>