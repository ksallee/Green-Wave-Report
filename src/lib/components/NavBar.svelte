<script>
  import { fly } from "svelte/transition";

  let navItems = [
      { label: "Home", href: "/", selected: true },
      { label: "Charts", href: "/charts", selected: false },
  ];

  function handleSelected(item){
    navItems.forEach(item => item.selected = false);
    if (item){
      item.selected = true;
    }
    navItems = navItems;
  }


</script>
<nav
  out:fly="{{ y: -100, duration: 1000, opacity: .4}}"
  in:fly="{{ y: -100, duration: 300, opacity: 1}}"
>
  <div class="internalNav">
      {#each navItems as item, index}
        <div class="link">
          <a
            href={item.href}
            class:selected={item.selected}
            class:margin_right={index === navItems.length - 1}
            on:click={() => handleSelected(item)}
            title={item.label}
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
    color: #5B628A;
  }
  .link:hover{
    color: #4791a8;
  }

  .margin_right {
      margin-right: auto;
  }
  .selected {
    color: #313965;
    font-weight: 600;
  }
  nav{
    font-size: 15px;
    font-weight: 400;
    width: 100%;
    height: 20px;
    position: fixed;
    top: 0;
    background-color: #F9F9FC;
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