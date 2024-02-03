<script>
    import { onMount } from 'svelte';
    import { cfsData } from '$lib/stores';
    import CfsChart  from "$lib/components/CfsChart.svelte";
    // Subscriber to the store to process data for the chart
    onMount(async () => {
        await cfsData.fetchCsvData();
    });

    let chart = {
        title: 'GreenWave Cubic Feet Per Second (CFS) Bend, Oregon',
        validLabels: ['CFS @ Head of Park'],
        labelColors: [[46, 82, 108]],
        data: undefined
    }
    $: chart.data = $cfsData.allData;

</script>

<main>
<!--    export let title = 'GreenWave Cubic Feet Per Second (CFS) Bend, Oregon';
    export let validLabels = [];
    export let labelColors = [];
    export let dateOffset = 0;
    export let endDate = new Date();
    export let datapointsDivisor = 1;
    export let data = [];-->
    {#if chart.data}
        <CfsChart
            title={chart.title}
            validLabels={chart.validLabels}
            labelColors={chart.labelColors}
            bind:data={chart.data}
        />
    {/if}
</main>