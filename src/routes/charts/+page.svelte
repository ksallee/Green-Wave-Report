<script>
    import { onMount } from 'svelte';
    import { cfsData, cfsDataWhiteWater, cfsDataWicoBeno } from '$lib/stores';
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

    let thirdChart = {
        title: "GreenWave Cubic Feet Per Second (CFS) Bend, Oregon.",
        // subtitle: "BelowWickiupRes - BenhamFalls (BENO) - CentralOregonCanal (CENO) -ArnoldCanal (ARNO) - HeadOfPark - LittleDeschutes (LAPO)",
        validLabels: ["below_Wickiup_Res", "BENO", "CENO", "ARNO", "HeadOfPark", "LAPO"],
        niceLabels: ["Below Wickiup Reservoir", "Benham Falls", "Central Oregon Canal", "Arnold Canal", "Head of Park", "Little Deschutes"],
        hiddenLabels: [],
        labelColors: [[194, 50, 50], [25, 128, 97], [194, 50, 144], [50, 194, 144],[46, 82, 108] , [201, 52, 196]],
        displayLegend: true,
    }
    let chartData = [];
    let minDate = undefined;
    let maxDate = undefined;
    let nbDays = 0;


    // $: firsChart.data = $cfsData.allData;
    // $: secondChart.data = $cfsDataWhiteWater.allData;
    $: refresh($cfsDataWicoBeno.allData);

    function refresh(data) {
        if(!data|| data.length === 0) return;
        chartData = [...$cfsDataWicoBeno.allData];
        thirdChart.firstDate = data[0].Date;
        thirdChart.lastDate = data[data.length - 1].Date;
        nbDays = Math.floor((new Date(thirdChart.lastDate) - new Date(thirdChart.firstDate)) / (1000 * 60 * 60 * 24));
        thirdChart.daysRange = [0, nbDays];
    }

    onMount(async () => {
        await cfsDataWhiteWater.fetchCsvData();
        await cfsDataWicoBeno.fetchCsvData();

    });
  const currency = new Intl.NumberFormat( "de", { style: 'currency', currency: 'EUR' });
  const formatter = (value) => {
    // add value to thirdChart.firstDate
    const date = new Date(thirdChart.firstDate);

    date.setDate(date.getDate() + value);
    return date.toDateString();
  }
  function dateRangeChanged(event) {
    const [min, max] = event.detail.values;
    minDate = new Date(thirdChart.firstDate);
    maxDate = new Date(thirdChart.firstDate);
    minDate.setDate(minDate.getDate() + min);
    maxDate.setDate(maxDate.getDate() + max);
  }


</script>

<main>
    <div class="container">
        <!--{#each [firsChart, secondChart, thirdChart] as chart}-->
        <!--{#if firsChart.data}-->
        <!--    <div class="chart">-->
        <!--        <CfsChart-->
        <!--            title={firsChart.title}-->
        <!--            validLabels={firsChart.validLabels}-->
        <!--            hiddenLabels={firsChart.hiddenLabels}-->
        <!--            labelColors={firsChart.labelColors}-->
        <!--            data={firsChart.data}-->
        <!--            displayLegend={firsChart.displayLegend}-->
        <!--        />-->
        <!--    </div>-->
        <!--{/if}-->
        <!--{#if secondChart.data}-->
        <!--    <div class="chart">-->
        <!--        <CfsChart-->
        <!--            title={secondChart.title}-->
        <!--            validLabels={secondChart.validLabels}-->
        <!--            hiddenLabels={secondChart.hiddenLabels}-->
        <!--            labelColors={secondChart.labelColors}-->
        <!--            data={secondChart.data}-->
        <!--            displayLegend={secondChart.displayLegend}-->
        <!--        />-->
        <!--    </div>-->
        <!--{/if}-->
        {#if chartData && thirdChart.daysRange}

            <div class="chart">
                <CfsChart
                    title={thirdChart.title}
                    subtitle={thirdChart.subtitle}
                    validLabels={thirdChart.validLabels}
                    niceLabels={thirdChart.niceLabels}
                    hiddenLabels={thirdChart.hiddenLabels}
                    labelColors={thirdChart.labelColors}
                    data={chartData}
                    displayLegend={thirdChart.displayLegend}
                    bind:minDate
                    bind:maxDate
                />
                <RangeSlider {formatter} float pips bind:values={thirdChart.daysRange} max={nbDays} range on:change={dateRangeChanged} />
            </div>

        {/if}
        <!--{/each}-->
    </div>

</main>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 120px;
    }
    .chart {
        width: 100%;
        max-width: 1000px;
        height: 70vh;
    }

    </style>