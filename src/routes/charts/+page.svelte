<script>
    import { onMount } from 'svelte';
    import { cfsData, cfsDataWhiteWater, cfsDataWicoBeno } from '$lib/stores';
    import CfsChart  from "$lib/components/CfsChart.svelte";
    // Subscriber to the store to process data for the chart
    onMount(async () => {
        await cfsData.fetchCsvData();
        await cfsDataWhiteWater.fetchCsvData();
        await cfsDataWicoBeno.fetchCsvData();
    });

    let cfsCharts = [
        {
            title: 'GreenWave Cubic Feet Per Second (CFS) Bend, Oregon',
            validLabels: ['CFS @ Head of Park'],
            labelColors: [[46, 82, 108]],
            displayLegend: false,
            data: undefined
        },
        {
            title: 'BelowWickiupRes-BenhamFalls-GreenWave CFS',
            validLabels: ["below_Wickiup_Res", "BENO", "HeadOfPark"],
            labelColors: [[46, 82, 108], [124, 50, 194], [194, 50, 144]],
            displayLegend: true,
            data: undefined
        },
        {
            title: "BelowWickiupRes-BenhamFalls-CentralOregonCanal-ArnoldCanal-HeadOfPark-LittleDeschutes CFS",
            validLabels: ["below_Wickiup_Res", "BENO", "CENO", "ARNO", "HeadOfPark", "LAPO"],
            labelColors: [[46, 82, 108], [124, 50, 194], [194, 50, 144], [50, 194, 144], [194, 50, 50], [50, 50, 194]],
            displayLegend: true,
            data: undefined
        }

    ];
    $: cfsCharts[0].data = $cfsData.allData;
    // $: cfsCharts[1].data = $cfsDataWhiteWater.allData;
    $: cfsCharts[1].data = $cfsDataWhiteWater.allData;
    $: cfsCharts[2].data = $cfsDataWicoBeno.allData;


</script>

<main>
    <div class="container">

        {#each cfsCharts as chart, i}
            {#if chart.data}
                <CfsChart
                    title={chart.title}
                    validLabels={chart.validLabels}
                    labelColors={chart.labelColors}
                    bind:data={chart.data}
                    displayLegend={chart.displayLegend}
                />
            {/if}
        {/each}
    </div>

</main>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 120px;
    }

    </style>