<script>
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import { cfsData } from "$lib/stores";
    import {derived} from "svelte/store";
    import {fade} from "svelte/transition";

    let cfsValue = tweened(400, {
        duration: 300,
        easing: cubicOut
    });

    $: refresh($cfsData);

    const formattedDate = derived(cfsData, $cfsData => {
        if ($cfsData.lastEntry && $cfsData.lastEntry["Date"]) {
            const date = new Date($cfsData.lastEntry["Date"]);
            return date.toLocaleDateString('en-US', {
                weekday: 'long', // "Monday"
                year: 'numeric', // "2024"
                month: 'long', // "February"
                day: 'numeric', // "1"
                hour: 'numeric',
                minute: 'numeric',
            });
        }
        return '';
    });

    function refresh(data) {
        if ($cfsData.lastEntry && $cfsData.lastEntry["CFS @ Head of Park"]) {
            const cfs = parseFloat($cfsData.lastEntry["CFS @ Head of Park"]);
            cfsValue.set(cfs);
        }
    }

</script>

<svelte:head>
    <title>Green Wave CFS</title>
</svelte:head>

<div class="container" in:fade>
    <div class="card" >
        {#if $cfsData.lastEntry}
            <h1>CFS @ Head of Park</h1>
            <h2>{$cfsValue.toFixed(0)}</h2>

        {/if}
    </div>
    {#if $formattedDate}
        <p>
            <span class="label">Date:</span> <span class="value">{$formattedDate}</span>
        </p>
    {/if}
</div>


<style>

    .container{
        height: calc(100vh - 45px);
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        width:100%;
        flex-direction: column;
    }

    .card {
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
        margin: 0;
        font-weight: 400;
    }
    h2{
        font-weight: 700;
        font-size: 5rem!important;
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
        justify-self: flex-end;
    }
    @media (max-width: 1000px) {
        .card {
            width: 95vw;
        }
    }
</style>
