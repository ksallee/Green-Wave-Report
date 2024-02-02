<script>
  import { fly } from "svelte/transition";
  import { cfsData } from "$lib/stores";
  import {onMount} from "svelte";

  export let color = "white";
  $: selectedColor = cfsData.getRgbColorStr(cfsData.adjustColor(color, 0.1));
  $: normalColor = cfsData.getRgbColorStr(cfsData.adjustColor(color, 0.3));

  let navItems = [
      { label: "Home", href: "/", selected: false },
      { label: "Charts", href: "/charts", selected: false },
  ];

  function handleSelected(item){
    navItems.forEach(item => item.selected = false);
    if (item){
      item.selected = true;
    }
    navItems = navItems;
  }
  onMount(() => {
    let path = window.location.pathname;
    navItems.forEach(item => item.selected = false);
    let item = navItems.find(item => item.href === path);
    if (item){
      item.selected = true;
    }
    navItems = navItems;
  });


</script>
<nav
  out:fly="{{ y: -100, duration: 1000, opacity: .4}}"
  in:fly="{{ y: -100, duration: 300, opacity: 1}}"
>
  <div class="internalNav">
      {#each navItems as item, index}
        <div class="link" style="--norm-color: {normalColor};">
          <a
            href={item.href}
            class:selected={item.selected}
            class:margin_right={index === navItems.length - 1}
            on:click={() => handleSelected(item)}
            title={item.label}
            style="--sel-color: {selectedColor};"
          >
            {item.label}
          </a>
        </div>
      {/each}
</nav>



<style>
  .internalNav{
    width: 100%;
    max-width: 1200px;
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: auto;
      padding: 0rem 1rem;
  }
  .link{
    /*color: #f2f2f3;*/
      color: var(--norm-color);
  }
  .link:hover{
    color: #e2e3e3;
  }

  .margin_right {
      margin-right: auto;
  }
  .selected {
    font-weight: 600;
    color: var(--sel-color);
  }
  nav{
    font-size: 15px;
    font-weight: 400;
    width: 100%;
    height: 20px;
    margin-bottom: 0.5rem;
    padding: .5rem 0rem;
    z-index: 1000;
  }
  @media (max-width:700px)  {
    .internalNav{
      /*justify-content: space-between;*/
      /*width: 90%;*/
    }

  }


</style>