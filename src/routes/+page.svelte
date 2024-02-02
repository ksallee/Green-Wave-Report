<script>
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import { csvDataStore } from "$lib/stores";
    import { onMount } from 'svelte';
    import {derived} from "svelte/store";

    const colors = {
        red: [240, 128, 128], // Soft red
        orange: [240, 164, 100], // Soft orange
        green: [144, 238, 144], // Soft green
        blue: [173, 216, 230], // Light blue
        violet: [221, 160, 221], // Plum, softer violet
    };

    let cfsValue = tweened(400, {
        duration: 300,
        easing: cubicOut
    });

    // Initialize cardColor with a default color
    let cardColor = tweened(colors.red, {
        duration: 300,
        easing: cubicOut
    });
    const cardColorCSS = derived(cardColor, $cardColor => `rgb(${Math.round($cardColor[0])}, ${Math.round($cardColor[1])}, ${Math.round($cardColor[2])})`);

    function getCfsColor(cfs) {
        if (cfs <= 550) return colors.red;
        if (cfs <= 650) return colors.orange;
        if (cfs <= 800) return colors.green;
        if (cfs <= 1000) return colors.blue;
        return colors.violet;
    }

    onMount(async () => {
        await csvDataStore.fetchCsvData('https://www.gwsr2024.xyz/surf/GREENWAVE_Year.csv');
    });

    $: refresh($csvDataStore);

    const formattedDate = derived(csvDataStore, $csvDataStore => {
        if ($csvDataStore.lastEntry && $csvDataStore.lastEntry["Date"]) {
            const date = new Date($csvDataStore.lastEntry["Date"]);
            return date.toLocaleDateString('en-US', {
                weekday: 'long', // "Monday"
                year: 'numeric', // "2024"
                month: 'long', // "February"
                day: 'numeric' // "1"
            });
        }
        return '';
    });

    function refresh(data) {
        if ($csvDataStore.lastEntry && $csvDataStore.lastEntry["CFS @ Head of Park"]) {
            const cfs = parseFloat($csvDataStore.lastEntry["CFS @ Head of Park"]);
            cfsValue.set(cfs);
            cardColor.set(getCfsColor(cfs)); // Update the card color based on CFS
        }
    }

</script>

<svelte:head>
    <title>Green Wave CFS</title>
</svelte:head>

<div class="container" style="--card-color: {$cardColorCSS};">
    <div class="card" >
        {#if $csvDataStore.lastEntry}
            <h1>CFS @ Head of Park</h1>
            <h2>{$cfsValue.toFixed(0)}</h2>
            <p><span class="label">Date:</span> <span class="value">{$formattedDate}</span></p>
        {/if}
    </div>
</div>


<style>
    /* Centering the card with Flexbox */
    body, html {
        margin: 0;
        padding: 0;
        height: 100vh; /* Adjust to ensure full height utilization */
        display: flex;
        justify-content: center;
        align-items: center;

    }
    .container{
        width: 100vw;
        height: 100vh;
        transition: background-color 0.4s ease-out; /* Smooth transition for background color change */
        background-color:  var(--card-color, #f08080); /* Default to soft red */
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .card {
        padding: 2rem;
        text-align: center;
        box-sizing: border-box;
        width: 33vw;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }

    h1, h2, p {
        color: #ffffff; /* White text for contrast */
        margin: 0.5rem 0;
        font-weight: 400;
    }
    h2{
        font-weight: 700;
    }
    .value {
        font-size: 14px
    }
    .label {
        font-weight: 700;
        font-size: 14px;
    }


    h2 {
        font-size: clamp(3rem, 8vw, 6rem); /* Responsive font size, adjusted for readability */
        font-weight: bold;
        margin: 1rem 0; /* More space around the big, bold number */
    }

    p {
        font-size: 1.25rem; /* Slightly larger paragraph text for clarity */
        margin-bottom: 1rem; /* Extra space at the bottom */
    }
    @media (max-width: 1000px) {
        .card {
            width: 80vw;
        }
    }
</style>
