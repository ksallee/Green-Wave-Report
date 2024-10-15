<script>
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import { cfsData } from "$lib/stores";
    import { derived } from "svelte/store";
    import { fade } from "svelte/transition";

    let cfsValue = tweened(400, {
        duration: 300,
        easing: cubicOut
    });

    $: refresh($cfsData);

    const formattedDate = derived(cfsData, $cfsData => {
        if ($cfsData.lastEntry && $cfsData.lastEntry["Date"]) {
            const date = new Date($cfsData.lastEntry["Date"]);
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
            });
        }
        return '';
    });

    function refresh(data) {
        if ($cfsData.lastEntry && $cfsData.lastEntry["HeadOfPark"]) {
            const cfs = parseFloat($cfsData.lastEntry["HeadOfPark"]);
            cfsValue.set(cfs);
        }
    }
</script>

<svelte:head>
    <title>Green Wave CFS</title>
</svelte:head>

<div class="main-container">
    <div class="top-container" in:fade>
        <div class="card">
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
    <div class="bottom-container">
        <div class="video-wrapper">
            <iframe src="https://www.youtube.com/embed/Pcs-YqL9FyU?si=aKO8KMAjSyVEPIUU" title="Green Wave live feed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>
    </div>
</div>

<style>
    .main-container {
        height: calc(100svh - 45px);
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .top-container {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding: 1rem;
        box-sizing: border-box;
    }

    .bottom-container {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1rem;
        box-sizing: border-box;
    }

    .video-wrapper {
        width: 100%;
        max-width: 800px;
        aspect-ratio: 16 / 9;
        position: relative;
    }

    .video-wrapper iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .card {
        text-align: center;
        box-sizing: border-box;
        width: 100%;
        max-width: 600px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }

    h1, h2, p {
        color: #ffffff;
        margin: 0;
        font-weight: 400;
    }

    h1 {
        font-size: clamp(1.5rem, 4vw, 2rem);
        margin-bottom: 0.5rem;
    }

    h2 {
        font-weight: 700;
        font-size: clamp(2.5rem, 8vw, 4rem) !important;
    }

    .value, .label {
        font-size: clamp(12px, 3vw, 14px);
    }

    .label {
        font-weight: 700;
    }

    p {
        margin-top: 1rem;
    }

    @media (max-width: 768px) {
        .main-container {
            flex-direction: column;
        }

        .top-container, .bottom-container {
            width: 100%;
        }
    }
</style>