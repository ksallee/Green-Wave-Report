<script>
  import NavBar from "$lib/components/NavBar.svelte";
  let y = 0;
  let newY = 0;
  let showNav = false;
  $:handleScroll(y);

  function handleScroll() {
    if (Math.abs(y - newY) < 10) {
      return;
    }
    if (y<= newY || y <=100){
      showNav = false
    }
    else showNav = false;
    newY = y;
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

<slot/>
<style>

  :global(body){
    background-color: #F9F9FC;
    margin: 0px;
    padding: 0px;
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