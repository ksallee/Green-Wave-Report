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

    function refresh(data) {
        labels = data.allData.map(entry => entry.Date);
        const everyX = 20;
        labels =  labels.filter((_, i) => i % everyX === 0 || i === data.allData.length - 1);
        cfsData = data.allData.map(entry => entry['CFS @ Head of Park']);
        cfsData = cfsData.filter((_, i) => i % everyX === 0 || i === data.allData.length - 1);
        skimboardsData = data.allData.map(entry => entry['Skimboards or short fins!']);
        skimboardsData = skimboardsData.filter((_, i) => i % everyX === 0 || i === data.allData.length - 1);
        awesomeWaveTimeData = data.allData.map(entry => entry['AWESOME Wave Time']);
        awesomeWaveTimeData = awesomeWaveTimeData.filter((_, i) => i % everyX === 0 || i === data.allData.length - 1);

        chartData = {
            labels,
            datasets: [
                {
                    label: 'CFS @ Head of Park',
                    data: cfsData,
                    borderColor: 'rgb(42,114,222)',
                    tension: 0.1
                },
                {
                    label: 'Skimboards or short fins!',
                    data: skimboardsData,
                    borderColor: 'rgb(255,145,86)',
                    tension: 0.1
                },
                {
                    label: 'AWESOME Wave Time',
                    data: awesomeWaveTimeData,
                    borderColor: 'rgb(115,229,58)',
                    tension: 0.1
                }
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
    <Line data={chartData} {options} width={400} height={200} />
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