/* eslint-disable */
<template>
  <div class="home-page">

    <div class="title">
      Defi Yield Multiplier
    </div>

    <img src="/static/osmo.gif" class="osmo"/>


    <div style="text-align: center">
      <md-button  id="pool-button" class="md-raised md-accent rounded-button" @click="$router.push({path: '/pool'})">
        Boost Aave Yield
      </md-button>
      <md-button id="trade-button" class="md-raised md-accent rounded-button" @click="$router.push({path: '/invest'})">
        Borrow & Invest
      </md-button>
    </div>

  </div>



  </div>
</template>

<script>
  export default {
    name: 'Home',
    data() {
      return {
        treasure: {}
      }
    },
    methods: {

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

  div.home-page {
    padding: 40px 20px 0 20px;
    width: 100%;
    height: 800px;
    text-align: center;
    margin-top:-30px
  }

  img.osmo {
    margin-top: 30px;
    height: 300px;
  }

  div.motto {
    font-family: 'Permanent Marker', cursive;
    /*font-family: 'Raleway', sans-serif;*/
    margin-top: 30px;
    margin-bottom: 15px;
    font-size: 36px;
    color: #F17843;

  }

  .rounded-button {
    border-radius: 30px;
    height: 50px;
    font-size: 16px;
    width: 200px;
    margin-right:80px;
    margin-left:80px;
  }

  .rounded-button .md-ripple {
    background-color: #E84341 !important;
  }

  div.title {
    margin: 30px 0 0px 0;
    font-size: 48px;
    color: #E84341;
  }


</style>
