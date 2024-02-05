<script>
    import { onMount } from 'svelte';
    import { cfsData, cfsDataWhiteWater, cfsDataWicoBeno, chartsHiddenLabels, dateOffsets } from '$lib/stores';
    import CfsChart  from "$lib/components/CfsChart.svelte";
    import RangeSlider from "svelte-range-slider-pips";


    // let firsChart = {
    //     title: 'GreenWave Cubic Feet Per Second (CFS) Bend, Oregon',
    //     validLabels: ['CFS @ Head of Park'],
    //     labelColors: [[46, 82, 108]],
    //     displayLegend: false,
    // }
    //
    // let secondChart = {
    //     title: 'BelowWickiupRes-BenhamFalls-GreenWave CFS',
    //     validLabels: ["below_Wickiup_Res", "BENO", "HeadOfPark"],
    //     labelColors: [[194, 50, 144], [124, 50, 194], [46, 82, 108]],
    //     displayLegend: true,
    // }

    let cfsChart = {
        title: "GreenWave Cubic Feet Per Second (CFS) Bend, Oregon.",
        validLabels: ["below_Wickiup_Res", "BENO", "CENO", "ARNO", "HeadOfPark", "LAPO"],
        niceLabels: ["Below Wickiup Reservoir", "Benham Falls", "Central Oregon Canal", "Arnold Canal", "Head of Park", "Little Deschutes"],
        labelColors: [[194, 50, 50], [46, 82, 108], [194, 50, 144], [50, 194, 144],[25, 128, 97], [201, 52, 196]],
        displayLegend: true,
    }
    let chartData = [];
    let minDate = undefined;
    let maxDate = undefined;
    let nbDays = 0;


    // $: firsChart.data = $cfsData.allData;
    // $: secondChart.data = $cfsDataWhiteWater.allData;
    $: refresh($cfsDataWicoBeno.allData);

    function setMinMaxFromStore(chartKey){
        if (chartKey !== "cfs" || !cfsChart.lastDate ) return;
        const  [minOffset, maxOffset] = $dateOffsets[chartKey];
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        nbDays = Math.floor((cfsChart.lastDate - cfsChart.firstDate) / millisecondsPerDay);
        let min = 0;
        let max = nbDays + 1;
        if (maxOffset > 0){
            // max offset is from the last date. Let's calculate the nb of days from the first date to the last date - maxOffset
            max = nbDays - maxOffset;
        }
        if (minOffset > 0){
            min = nbDays - minOffset + 1;
        }
        setMinMaxDates(min, max);
    }

    function refresh(data) {
        if(!data|| data.length === 0) return;
        chartData = [...$cfsDataWicoBeno.allData];
        cfsChart.firstDate = new Date(data[0].Date);
        cfsChart.lastDate = new Date(data[data.length - 1].Date);
        minDate = new Date(cfsChart.firstDate);
        maxDate = new Date(cfsChart.lastDate);
        setMinMaxFromStore("cfs");
    }

    onMount(async () => {
        await cfsDataWhiteWater.fetchCsvData();
        await cfsDataWicoBeno.fetchCsvData();

    });
    const formatter = (value) => {
        const date = new Date(cfsChart.firstDate);
        date.setDate(date.getDate() + value);
        return date.toDateString();
    }
    function dateRangeChanged(event) {
        const [min, max] = event.detail.values;
        setMinMaxDates(min, max + 1);
    }
    function setMinMaxDates(min, max) {
        // add min and max days to cfChart.firstDate to get the actual date
        minDate = new Date(cfsChart.firstDate);
        maxDate = new Date(cfsChart.firstDate);
        minDate.setDate(minDate.getDate() + min);
        maxDate.setDate(maxDate.getDate() + max);
        cfsChart.daysRange = [min, max];

        let offsetMin = -1;
        if (min > 0) {
            offsetMin = Math.floor((cfsChart.lastDate - minDate) / (1000 * 60 * 60 * 24)) + 1
        }
        const offsetMax = Math.floor((cfsChart.lastDate - maxDate) / (1000 * 60 * 60 * 24))

        $dateOffsets["cfs"] = [
            offsetMin,
            offsetMax
        ]
    }


</script>

<div class="container">
    {#if chartData && cfsChart.daysRange}

        <div class="chart">
            <CfsChart
                title={cfsChart.title}
                subtitle={cfsChart.subtitle}
                validLabels={cfsChart.validLabels}
                niceLabels={cfsChart.niceLabels}
                bind:hiddenLabels={$chartsHiddenLabels["cfs"]}
                labelColors={cfsChart.labelColors}
                data={chartData}
                displayLegend={cfsChart.displayLegend}
                bind:minDate
                bind:maxDate
            />
        </div>
        <div class="range-slider">
            <RangeSlider {formatter} bind:values={cfsChart.daysRange} max={nbDays} range on:change={dateRangeChanged} />
        </div>

    {/if}
    <!--{/each}-->
</div>


<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-items: center;
        max-width: 100vw;
        box-sizing: border-box;
        /*overflow-x: hidden;*/
        height: 100%;
    }
    .range-slider {
        width: 100%;
        padding: 0 0 0 25px;
        margin: 0;
        max-width: 980px;
        font-size: 13px;
    }
    .chart {
        width: 100%;
        max-width: 1000px;
        height: 70vh;
        /*background-color: blue;*/
    }
    @media (max-width: 600px) {
        .range-slider{
            width: 95%;
        }

    }
    :root {
        --range-slider:            hsl(180, 3.9%, 84.9%);
        --range-handle-inactive:   hsl(180, 33%, 41%);
        --range-handle:            hsl(195, 67.6%, 71%);
        --range-handle-focus:      hsl(190.1, 63.2%, 54.1%);
        --range-handle-border:     hsl(189.6, 67.6%, 71%);
        --range-range-inactive:    hsl(180, 56.2%, 65.1%);
        --range-range:             hsl(195, 63.2%, 54.1%);
        --range-float-inactive:    hsl(180, 4.6%, 61.8%);
        --range-float:             hsl(211.2, 63.2%, 54.1%);
        --range-float-text:        hsl(0, 0%, 100%);

        --range-pip:               hsl(210, 14.3%, 53.3%);
        --range-pip-text:          hsl(210, 14.3%, 53.3%);
        --range-pip-active:        hsl(180, 25.4%, 24.7%);
        --range-pip-active-text:   hsl(180, 25.4%, 24.7%);
        --range-pip-hover:         hsl(180, 25.4%, 24.7%);
        --range-pip-hover-text:    hsl(180, 25.4%, 24.7%);
        --range-pip-in-range:      hsl(180, 25.4%, 24.7%);
        --range-pip-in-range-text: hsl(180, 25.4%, 24.7%);
    }

</style>