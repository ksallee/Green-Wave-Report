<script>
    import NavBar from "$lib/components/NavBar.svelte";
    import { Body } from 'svelte-body';
    import { cfsData } from "$lib/stores";
    import {getRgbColorStr} from "$lib/utils";
    import {tweened} from "svelte/motion";
    import {cubicOut} from "svelte/easing";
    import {onMount} from "svelte";
    import {colors} from "$lib/constants";
    import {navigating, page} from '$app/stores';
    import {adjustColor} from "$lib/utils.js";
    // Initialize siteColor with a default color
    let siteColor = tweened($cfsData.color?$cfsData.color:colors.red, {
        duration: 300,
        easing: cubicOut
    });
    let textColor = tweened([10, 10, 10], {
        duration: 300,
        easing: cubicOut
    });
    let y = 0;
    let newY = 0;
    let showNav = true;
    $:handleScroll(y);
    $:refreshSiteColor($cfsData, $navigating);

    onMount(async () => {
        await cfsData.fetchCsvData();
    });

    function handleScroll() {
        if (Math.abs(y - newY) < 10) {
            return;
        }
        if (y<= newY || y <=100){
            showNav = true
        }
        else showNav = false;
        newY = y;
    }

    function refreshSiteColor(data) {
        let path = $page.url.pathname;
        if (path === "/") {
            siteColor.set($cfsData.color);
            const tc = adjustColor($cfsData.color, 0.3);
            textColor.set(tc);
        }
        else{
            siteColor.set([250, 250, 250]);
            textColor.set([10, 10, 10]);
        }
    }
</script>

<svelte:window bind:scrollY="{y}" />
<svelte:head>
    <style>
        /*@font-face {*/
        /*  font-family: 'Inter';*/
        /*  font-style: normal;*/
        /*  font-weight: 400 700;*/
        /*  font-display: swap;*/
        /*  src: url('fonts/Inter-VariableFont_slnt,wght.ttf') format('truetype');*/
        /*}*/
        body {
            font-family: 'Inter', sans-serif;
            font-size: 16px;
        }
    </style>
</svelte:head>

<Body style="--site-color: {getRgbColorStr($siteColor)};" />
<NavBar showNav={showNav} color={$textColor}/>
<slot/>

<style>
    :global(body){
        margin: 0px;
        padding: 0px;
        background-color: var(--site-color, #f08080); /* Default to soft red */;
        transition: background-color 0.4s ease-out; /* Smooth transition for background color change */
    }
    :global(a) {
        all: unset;
        cursor: pointer;
    }
    :global(p){
        text-align: left;
        line-height: 1.8;
        color: #5B628A;
        margin-bottom: 20px;
    }
    :global(h1){
        text-align: center;
        color: #1A1C2D;
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 20px;
    }
    :global(h2){
        text-align: center;
        color: #1A1C2D;
        font-size: 22px;
        font-weight: 600;
        margin-bottom: 20px;
    }
    :global(h3){
        text-align: center;
        color: #5B628A;
        font-size: 16px;
        font-weight: 500;
    }

</style>