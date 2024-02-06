<script>
    import { onMount } from 'svelte';
    import RangeSlider from "svelte-range-slider-pips";
    import { cfsData, waterTempData, chartsHiddenLabels, dateOffsets, cfsHistoricalData } from '$lib/stores';
    import {thresholdColors, temperatureThresholdColors} from "$lib/constants.js";
    import CfsChart  from "$lib/components/CfsChart.svelte";

    let cfsChart = {
        title: "GreenWave Cubic Feet Per Second (CFS) Bend, Oregon.",
        validLabels: ["below_Wickiup_Res", "BENO", "CENO", "ARNO", "HeadOfPark", "LAPO"],
        niceLabels: ["Below Wickiup Reservoir", "Benham Falls", "Central Oregon Canal", "Arnold Canal", "Head of Park", "Little Deschutes"],
        labelColors: [[194, 50, 50], [46, 82, 108], [194, 50, 144], [50, 194, 144],[25, 128, 97], [201, 52, 196]],
        displayLegend: true,
        startDate: undefined,
        endDate: undefined,
        minDate: undefined,
        maxDate: undefined,
        nbDays: 0,
    }
    let cfsChartData = [];
    let waterTempChart = {
        title: "Water Temperature 1 Mile Down River",
        validLabels: ["WATER_TEMP","Air-Temp"],
        niceLabels: ["Water Temperature", "Air Temperature"],
        labelColors: [[46, 82, 108], [194, 50, 50]],
        displayLegend: true,
        startDate: undefined,
        endDate: undefined,
        minDate: undefined,
        maxDate: undefined,
        nbDays: 0,
    }
    let waterTempChartData = [];

    let cfsHistoricalChart = {
        title: "Past Water Flows at Head of Park",
        //Date,2013,2014,2015,2017,2016,2018,2019,2020,2021,2022,2023,2024
        validLabels: ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"],
        niceLabels: ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"],
        labelColors: [[194, 50, 50], [46, 82, 108], [194, 50, 144], [50, 194, 144],[25, 128, 97], [201, 52, 196], [242, 251, 20], [50, 173, 162], [99, 7, 241], [67, 106, 143], [66, 198, 191], [1, 0, 185]],
        displayLegend: true,
        startDate: undefined,
        endDate: undefined,
        minDate: undefined,
        maxDate: undefined,
        nbDays: 0,
    }
    let cfsHistoricalChartData = [];

    function setMinMaxFromStore(chartKey, chart){
        if ( !chart.lastDate ) return;
        if ( !$dateOffsets[chartKey] ) {
            $dateOffsets[chartKey] = [-1, 0];
        }
        const  [minOffset, maxOffset] = $dateOffsets[chartKey];
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        chart.nbDays = Math.floor((chart.lastDate - chart.firstDate) / millisecondsPerDay);
        let min = 0;
        let max = chart.nbDays + 1;
        if (maxOffset > 0){
            // max offset is from the last date. Let's calculate the nb of days from the first date to the last date - maxOffset
            max = chart.nbDays - maxOffset;
        }
        if (minOffset > 0){
            min = chart.nbDays - minOffset + 1;
        }
        setMinMaxDates(chartKey, chart, min, max);
    }

    function setChartData(chart, data) {
        chart.firstDate = new Date(data[0].Date);
        chart.lastDate = new Date(data[data.length - 1].Date);
    }

    onMount(async () => {
        await cfsData.fetchCsvData();
        await waterTempData.fetchCsvData();
        await cfsHistoricalData.fetchCsvData();
        cfsChartData = [...$cfsData.allData];
        setChartData(cfsChart, $cfsData.allData);
        setMinMaxFromStore("cfs", cfsChart);
        waterTempChartData = [...$waterTempData.allData];
        setChartData(waterTempChart, $waterTempData.allData);
        setMinMaxFromStore("waterTemp", waterTempChart);
        cfsHistoricalChartData = [...$cfsHistoricalData.allData];
        // The historical data for the year 2024 should be ammended and all 0s should be removed
        cfsHistoricalChartData.forEach((row) => {
            if (row["2024"] === "0") {
                row["2024"] = null;
            }
        });
        setChartData(cfsHistoricalChart, $cfsHistoricalData.allData);
        setMinMaxFromStore("cfsHistorical", cfsHistoricalChart);

    });
    const formatter = (value) => {
        const date = new Date(cfsChart.firstDate);
        date.setDate(date.getDate() + value);
        return date.toDateString();
    }
    function dateRangeChanged(event, chartKey, chart) {
        const [min, max] = event.detail.values;
        setMinMaxDates(chartKey, chart, min, max + 1);
    }
    function setMinMaxDates(chartKey, chart, min, max) {
        // add min and max days to cfChart.firstDate to get the actual date
        chart.minDate = new Date(chart.firstDate);
        chart.maxDate = new Date(chart.firstDate);
        chart.minDate.setDate(chart.minDate.getDate() + min);
        chart.maxDate.setDate(chart.maxDate.getDate() + max);
        chart.daysRange = [min, max];

        let offsetMin = -1;
        if (min > 0) {
            offsetMin = Math.floor((chart.lastDate - chart.minDate) / (1000 * 60 * 60 * 24)) + 1
        }
        const offsetMax = Math.floor((chart.lastDate - chart.maxDate) / (1000 * 60 * 60 * 24))

        $dateOffsets[chartKey] = [
            offsetMin,
            offsetMax
        ]
    }

    function datapointsDivisor(days){
        let datapointsDivisor = 1;
        if (days <= 2) {
            datapointsDivisor = 1;
        }
        if (days <= 5) {
            datapointsDivisor = 20;
        } else if (days <= 10) {
            datapointsDivisor = 40;
        } else if (days <= 20) {
            datapointsDivisor = 60;
        } else {
            datapointsDivisor = 80;
        }
        return datapointsDivisor;
    }
    function waterTempDatapointsDivisor(days){
        let datapointsDivisor = 1;
        if (days <= 5) {
            datapointsDivisor = 2;
        } else if (days <= 10) {
            datapointsDivisor = 5;
        } else if (days <= 20) {
            datapointsDivisor = 10;
        } else if (days <= 30){
                datapointsDivisor = 17;
        }else if (days <= 40)
        {
            datapointsDivisor = 20;
        }
        else {
            datapointsDivisor = 30;
        }
        return datapointsDivisor;
    }
    function cfsHistoricalDatapointsDivisor(days){
        let datapointsDivisor;
        if (days <= 50) {
            datapointsDivisor = 1;
        } else if (days <= 100) {
            datapointsDivisor = 4;
        } else if (days <= 200){
                datapointsDivisor = 5;
        }else if (days <= 300)
        {
            datapointsDivisor = 7;
        }
        else {
            datapointsDivisor = 10;
        }
        return datapointsDivisor;
    }
    function yTickCallbackMonthDay(val, index) {
        if (index === 0) {
            return '';
        }
        var date = new Date(this.getLabelForValue(val));

        var month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        var day = date.getDate().toString().padStart(2, '0');

        // Combine month and day
        var formattedDate = month + "-" + day;
        return formattedDate;
    }



</script>

<div class="container">
    {#if cfsChartData && cfsChart.daysRange}

        <div class="chart">
            <CfsChart
                title={cfsChart.title}
                subtitle={cfsChart.subtitle}
                validLabels={cfsChart.validLabels}
                niceLabels={cfsChart.niceLabels}
                bind:hiddenLabels={$chartsHiddenLabels["cfs"]}
                labelColors={cfsChart.labelColors}
                data={cfsChartData}
                displayLegend={cfsChart.displayLegend}
                thresholdColors={thresholdColors}
                bind:minDate={cfsChart.minDate}
                bind:maxDate={cfsChart.maxDate}
                datapointsFunction={datapointsDivisor}
            />
        </div>
        <div class="range-slider">
            <RangeSlider
                {formatter}
                bind:values={cfsChart.daysRange}
                max={cfsChart.nbDays}
                range
                on:change={(e) => dateRangeChanged(e, "cfs", cfsChart)}
            />
        </div>
    {/if}
    {#if waterTempChartData && waterTempChart.daysRange}
        <div class="chart">
            <CfsChart
                title={waterTempChart.title}
                subtitle={waterTempChart.subtitle}
                validLabels={waterTempChart.validLabels}
                niceLabels={waterTempChart.niceLabels}
                bind:hiddenLabels={$chartsHiddenLabels["waterTemp"]}
                labelColors={waterTempChart.labelColors}
                data={waterTempChartData}
                displayLegend={waterTempChart.displayLegend}
                thresholdColors={temperatureThresholdColors}
                bind:minDate={waterTempChart.minDate}
                bind:maxDate={waterTempChart.maxDate}
                datapointsFunction={waterTempDatapointsDivisor}
            />
        </div>
        <div class="range-slider">
            <RangeSlider
                {formatter}
                bind:values={waterTempChart.daysRange}
                max={waterTempChart.nbDays}
                range
                on:change={(e) => dateRangeChanged(e, "waterTemp", waterTempChart)}
            />
        </div>
    {/if}
    {#if cfsHistoricalChartData && cfsHistoricalChart.daysRange}
        <div class="chart">
            <CfsChart
                title={cfsHistoricalChart.title}
                subtitle={cfsHistoricalChart.subtitle}
                validLabels={cfsHistoricalChart.validLabels}
                niceLabels={cfsHistoricalChart.niceLabels}
                bind:hiddenLabels={$chartsHiddenLabels["cfsHistorical"]}
                labelColors={cfsHistoricalChart.labelColors}
                data={cfsHistoricalChartData}
                displayLegend={cfsHistoricalChart.displayLegend}
                thresholdColors={thresholdColors}
                bind:minDate={cfsHistoricalChart.minDate}
                bind:maxDate={cfsHistoricalChart.maxDate}
                datapointsFunction={cfsHistoricalDatapointsDivisor}
                customYTickCallback={yTickCallbackMonthDay}
            />
        </div>
        <div class="range-slider">
            <RangeSlider
                {formatter}
                bind:values={cfsHistoricalChart.daysRange}
                max={cfsHistoricalChart.nbDays}
                range
                on:change={(e) => dateRangeChanged(e, "cfsHistorical", cfsHistoricalChart)}
            />
        </div>
    {/if}

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