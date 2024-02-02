<script>
    import { Line  } from 'svelte-chartjs';
    import {fade} from 'svelte/transition';
    import { cfsData } from '$lib/stores'; // Adjust the import path as necessary
    import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';
    import {onMount} from "svelte";
    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);
    ChartJS.defaults.color = '#eae9e9'
    ChartJS.defaults.borderColor = '#eae9e9'

    let labels = []; // Dates for the X-axis
    let cfsChartData = []; // CFS for the Y-axis
    let chartData = {}
    let options = {}
    let maxYValue = 1200;
    let minYValue = 0;

    // Subscriber to the store to process data for the chart
    onMount(async () => {
        await cfsData.fetchCsvData('https://www.gwsr2024.xyz/surf/GREENWAVE_Year.csv');
    });

    $: refresh($cfsData);

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

            function bgColors(ymin, ymax, color) {
                // from should never be
                const from = y.getPixelForValue(Math.max(ymin, minYValue - 20));
                const to = y.getPixelForValue(Math.min(ymax, maxYValue + 5));
                ctx.save();
                ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
                ctx.fillRect(left, to, right - left, from - to);
                ctx.restore();
            }

            // Dynamically fill colors based on thresholds and maxYValue
            thresholds.reduce((prevY, currentY, index) => {
                if (prevY < maxYValue ) {
                    bgColors(prevY, currentY, colors[colorKeys[index]]);
                }
                return currentY;
            }, 0);
        }
    };

    function refresh(data) {
        // Remove the hour and minute from the date
        labels = data.allData.map(entry => entry.Date.split(' ')[0]);
        const everyX = 70;
        labels =  labels.filter((_, i) => i % everyX === 0 || i === data.allData.length - 1);
        cfsChartData = data.allData.map(entry => entry['CFS @ Head of Park']);
        cfsChartData = cfsChartData.filter((_, i) => i % everyX === 0 || i === data.allData.length - 1);
        // Get the max value for the Y-axis
        maxYValue = Math.max(...cfsChartData) + 100;
        minYValue = Math.min(...cfsChartData);
        chartData = {
            labels,
            datasets: [
                {
                    label: 'CFS @ Head of Park',
                    data: cfsChartData,
                    borderColor: 'rgb(46,82,108)',
                    backgroundColor: 'rgb(55,183,183)',
                    tension: 0.1,
                    borderWidth: 2
                },
            ]
        };
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
                    suggestedMax: maxYValue,

                }
            },
            plugins: {
                legend: {
                    display: false
                },
                // Plugin for the title
                title: {
                    display: true,
                    text: 'GreenWave Cubic Feet Per Second (CFS) Bend, Oregon',
                    color: "#f6f8f8",
                    font: {
                        size: 20,

                    },

                }
            },
            maintainAspectRatio: false
        };
    }



</script>

<div class="container" in:fade>
    <div class="chart-container">
        <Line data={chartData} {options} plugins={[canvasBackgroundPlugin]} width={400} height={200} />
    </div>
</div>

<style>
    .container{
        /*background-color: #f6f5f5;*/
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin: 30px auto;
        padding: 20px;
        flex-direction: column;
        width: 100%;
        height: 100%;
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