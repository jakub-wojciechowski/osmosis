/* eslint-disable */
<template>
  <div class="page" style="padding-top: 20px;">

    <md-dialog :md-active.sync="processing" :md-click-outside-to-close="false">
      <md-dialog-title>Processing transaction</md-dialog-title>

      <md-dialog-content style="text-align: center">


        <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>

        <div>
          Please wait....
        </div>

      </md-dialog-content>
    </md-dialog>

    <div class="md-layout" style="width: 80%; margin: 0 10% 0 10%" v-show="account.isCreated">

      <div class="md-layout-item md-medium-size-40 md-size-40 widget">
        <div class="md-card md-card-stats md-theme-default">
          <div class="md-card-header md-card-header-icon md-card-header-blue" style="height: 90px;">
            <div class="card-icon">
              <div class="card-icon">
                <img class="card-image" src="/static/loan.png">
              </div>
            </div>
            <div class="category">
              Total borrowed
              <div class="cat-value">{{ account.totalBorrowed | usd}}</div>
            </div>
          </div>

          <md-card-content>
            <div class="actions-card solvency-warning" style="padding-top:10px;">
              Total value of your loans
            </div>
          </md-card-content>
        </div>
      </div>

      <div class="md-layout-item md-medium-size-20 md-size-20 widget">
        <div class="md-card md-card-stats md-theme-default">
          <div class="md-card-header md-card-header-icon md-card-header-blue" style="height: 90px;">
            <div class="card-icon">
              <div class="card-icon">
                <img class="card-image" src="/static/solvency.png">
              </div>
            </div>
            <div class="category">
              Solvency
              <div class="cat-value">{{account.solvency | solvency}}</div>
            </div>
          </div>

          <md-card-content>
            <div class="actions-card solvency-warning" style="padding-top:10px;">
              Health ratio
            </div>
          </md-card-content>

        </div>
      </div>

      <div class="md-layout-item md-medium-size-40 md-size-40 widget">
        <div class="md-card md-card-stats md-theme-default">
          <div class="md-card-header md-card-header-icon md-card-header-blue" style="height: 90px;">
            <div class="card-icon">
              <div class="card-icon">
                <img class="card-image" src="/static/deposit.png">
              </div>
            </div>
            <div class="category">
              Total account value
              <div class="cat-value">{{account.totalValue | usd}}</div>
            </div>
          </div>

          <md-card-content>
            <div class="actions-card solvency-warning" style="padding-top:10px;">
              Your assets and investments
            </div>
          </md-card-content>

        </div>
      </div>

      <md-card style="width: 100%; padding-bottom: 6px; margin-bottom: 20px;">
        <md-card-content style="padding-bottom: 0; padding-top: 0px;">

          <md-table class="assets">
            <md-table-row>
              <md-table-head>Asset</md-table-head>
              <md-table-head>Price</md-table-head>
              <md-table-head>Borrowing rate</md-table-head>
              <md-table-head>Borrowed value</md-table-head>
              <md-table-head>Held Amount</md-table-head>
              <md-table-head>Held value</md-table-head>
              <md-table-head></md-table-head>
            </md-table-row>

            <md-table-row v-for="a in account.assets" v-bind:key="a.symbol">
              <md-table-cell>{{a.name}}</md-table-cell>
              <md-table-cell>{{a.price | usd}}</md-table-cell>
              <md-table-cell>{{a.rate | percent}}</md-table-cell>
              <md-table-cell>{{a.borrowed | usd}}</md-table-cell>
              <md-table-cell>{{a.balance | units}}</md-table-cell>
              <md-table-cell><b>{{a.total | usd}}</b></md-table-cell>
              <md-table-cell >
                <md-button v-if="a.name == 'UsdT'" id="borrowButton" class="md-raised md-accent md-small" @click="showBorrowingPanel = true">Borrow</md-button>
                <md-button v-if="a.name == 'UsdT'" id="repayButton" class="md-raised md-primary md-small" @click="showRepaymentPanel = true">Repay</md-button>
              </md-table-cell>
            </md-table-row>
          </md-table>


        </md-card-content>
      </md-card>

      <div class="md-layout-item md-medium-size-40 md-size-40 widget">
        <div class="md-card md-card-stats md-theme-default">
          <div class="md-card-header md-card-header-icon md-card-header-blue" style="height: 90px;">
            <div class="card-icon">
              <div class="card-icon">
                <img class="card-image" src="/static/loan.png">
              </div>
            </div>
            <div class="category">
              Borrowing rate
              <div class="cat-value">{{ account.borrowingRate | percent}}</div>
            </div>
          </div>

          <md-card-content>
            <div class="actions-card solvency-warning" style="padding-top:10px;">
              Cost of Aave and Osmo based on total account value
            </div>
          </md-card-content>
        </div>
      </div>

      <div class="md-layout-item md-medium-size-20 md-size-20 widget">
        <div class="md-card md-card-stats md-theme-default">
          <div class="md-card-header md-card-header-icon md-card-header-blue" style="height: 90px; padding-left: 8px; padding-right: 8px;">
            <div class="card-icon">
              <div class="card-icon">
                <img class="card-image" src="/static/interests.png">
              </div>
            </div>
            <div class="category">
              Net APY
              <div class="cat-value">{{account.netRate | percent}}</div>
            </div>
          </div>

          <md-card-content>
            <div class="actions-card solvency-warning" style="padding-top:10px;">
              Based on margin
            </div>
          </md-card-content>

        </div>
      </div>

      <div class="md-layout-item md-medium-size-40 md-size-40 widget">
        <div class="md-card md-card-stats md-theme-default">
          <div class="md-card-header md-card-header-icon md-card-header-blue" style="height: 90px;">
            <div class="card-icon">
              <div class="card-icon">
                <img class="card-image" src="/static/yield.png">
              </div>
            </div>
            <div class="category">
              Investment yield
              <div class="cat-value">{{account.investmentRate | percent}}</div>
            </div>
          </div>

          <md-card-content>
            <div class="actions-card solvency-warning" style="padding-top:10px;">
              Yield from all investments based on total account value
            </div>
          </md-card-content>

        </div>
      </div>

      <md-card style="width: 100%; padding-bottom: 6px; margin-bottom: 20px;">
        <md-card-content style="padding-bottom: 0; padding-top: 0px;">

          <md-table class="assets">
            <md-table-row>
              <md-table-head>Investment</md-table-head>
              <md-table-head>APY</md-table-head>
              <md-table-head>Amount</md-table-head>
              <md-table-head>Total value</md-table-head>
              <md-table-head></md-table-head>
            </md-table-row>

            <md-table-row v-for="a in account.investments" v-bind:key="a.symbol">
              <md-table-cell>{{a.name}}</md-table-cell>
              <md-table-cell>{{a.apy | percent}}</md-table-cell>
              <md-table-cell>{{a.balance | units}}</md-table-cell>
              <md-table-cell><b>{{a.total | usd}}</b></md-table-cell>
              <md-table-cell >
                <md-button id="investButton" class="md-raised md-primary md-small" @click="a.name == 'Balancer' ? showInvestmentPanelBalancer = true : showInvestmentPanelMeta = true">Invest</md-button>
                <md-button id="redeemButton" class="md-raised md-accent md-small" @click="a.name == 'Balancer' ? showRedemptionPanelBalancer = true : showRedemptionPanelMeta = true">Redeem</md-button>
              </md-table-cell>
            </md-table-row>
          </md-table>


        </md-card-content>
      </md-card>

    </div>

    <md-drawer class="md-drawer md-right" :md-active.sync="showCreationPanel" md-swipeable>
      <md-toolbar class="md-primary">
        <span class="md-title">New brokerage account</span>
      </md-toolbar>

      <div class="text">
        Create a smart-contract proxy to start investing
      </div>

      <form novalidate>
        <div class="form-container">
          <md-field>
            <label for="marginAmount">Initial margin (in eth)</label>
            <md-input name="marginAmount" id="marginAmount" v-model="marginAmount"
                      :disabled="processing"/>
          </md-field>
        </div>

        <md-button class="md-primary md-raised pool-button" @click="createAccount()">Create</md-button>

      </form>
    </md-drawer>

    <md-drawer class="md-drawer md-right" :md-active.sync="showBorrowingPanel" md-swipeable>
      <md-toolbar class="md-primary">
        <span class="md-title">Borrow funds</span>
      </md-toolbar>

      <div class="text">
        Use delegated credit to borrow funds
      </div>

      <form novalidate>
        <div class="form-container">
          <md-field>
            <label for="borrowingAmount">Amount to borrow (in usdT)</label>
            <md-input name="borrowingAmount" id="borrowingAmount" v-model="borrowingAmount"
                      :disabled="processing"/>
          </md-field>
        </div>

        <md-button class="md-primary md-raised pool-button" @click="borrow()">Borrow</md-button>

      </form>
    </md-drawer>

    <md-drawer class="md-drawer md-right" :md-active.sync="showInvestmentPanelBalancer" md-swipeable>
      <md-toolbar class="md-primary">
        <span class="md-title">Invest in Balancer</span>
      </md-toolbar>

      <div class="text">
        Provide liquidity to earn fees and rewards
      </div>

      <form novalidate>
        <div class="form-container">
          <md-field>
            <label for="investmentBalancerAmount">Amount of BPT (WETH 50% / USDT 50%)</label>
            <md-input name="borrowingAmount" id="investmentBalancerAmount" v-model="investmentBalancerAmount"
                      :disabled="processing"/>
          </md-field>
        </div>

        <md-button class="md-primary md-raised pool-button" @click="investBalancer()">Invest</md-button>

      </form>
    </md-drawer>

    <md-drawer class="md-drawer md-right" :md-active.sync="showInvestmentPanelMeta" md-swipeable>
      <md-toolbar class="md-primary">
        <span class="md-title">Invest in Meta Savings</span>
      </md-toolbar>

      <div class="text">
        Mint mUSD and invest into mSavings
      </div>

      <form novalidate>
        <div class="form-container">
          <md-field>
            <label for="investmentMetaAmount">Amount of mUSD to mint</label>
            <md-input name="investmentMetaAmount" id="investmentMetaAmount" v-model="investmentMetaAmount"
                      :disabled="processing"/>
          </md-field>
        </div>

        <md-button class="md-primary md-raised pool-button" @click="investMeta()">Invest</md-button>

      </form>
    </md-drawer>

    <md-drawer class="md-drawer md-right" :md-active.sync="showRepaymentPanel" md-swipeable>
      <md-toolbar class="md-primary">
        <span class="md-title">Repay funds</span>
      </md-toolbar>

      <div class="text">
        Repay debt to improve your solvency
      </div>

      <form novalidate>
        <div class="form-container">
          <md-field>
            <label for="repaymentAmount">Amount of UsdT to repay</label>
            <md-input name="repaymentAmount" id="repaymentAmount" v-model="repaymentAmount"
                      :disabled="processing"/>
          </md-field>
        </div>

        <md-button class="md-primary md-raised pool-button" @click="repay()">Repay</md-button>

      </form>
    </md-drawer>
  </div>


</template>

<script>
  import {getBrokerageAccount, createAccount, borrow, repay, investBalancer, investMeta} from '@/blockchain/brokerage'
  import State from '@/state'
  import RangeSlider from 'vue-range-slider'
  import 'vue-range-slider/dist/vue-range-slider.css'
  import 'vue-select/dist/vue-select.css';
  import vSelect from 'vue-select'
  import DepositPanel from "./DepositPanel";
  import BorrowPanel from "./BorrowPanel";

  export default {
    name: 'Pool',
    components: {
      RangeSlider, vSelect, DepositPanel, BorrowPanel
    },
    data() {
      return {
        account: State.account,
        showCreationPanel: false,
        showInvestmentPanelBalancer: false,
        showInvestmentPanelMeta: false,
        showRedemptionPanelBalancer: false,
        showRedemptionPanelMeta: false,
        showBorrowingPanel: false,
        showRepaymentPanel: false,
        currencies: State.currencies,
        marginAmount: 0,
        borrowingAmount: 0,
        repaymentAmount: 0,
        withdrawAmount: 0,
        investmentBalancerAmount: 0,
        investmentMetaAmount: 0,
        processing: false,
      }
    },
    beforeCreate: async function () {
      await getBrokerageAccount();
      if (!this.account.isCreated) {
        this.showCreationPanel = true;
      }
    },
    methods: {
      createAccount: async function () {
        this.processing = true;
        try {
          await createAccount(this.marginAmount);

          let toast = this.$toasted.show("You have created a new account!", {
            theme: "bubble",
            position: "top-center",
            duration: 5000,
            icon: 'sentiment_satisfied_alt'
          });
        } finally {
          this.processing = false;
          this.showCreationPanel = false;
        }
      },
      borrow: async function () {
        this.processing = true;
        try {
          await borrow(this.borrowingAmount);

          let toast = this.$toasted.show("You have borrowed funds!", {
            theme: "bubble",
            position: "top-center",
            duration: 5000,
            icon: 'sentiment_satisfied_alt'
          });
        } finally {
          this.processing = false;
          this.showBorrowPanel = false;
        }
      },
      repay: async function () {
        this.processing = true;
        try {
          await repay(this.repaymentAmount);

          let toast = this.$toasted.show("You have repaid funds!", {
            theme: "bubble",
            position: "top-center",
            duration: 5000,
            icon: 'sentiment_satisfied_alt'
          });
        } finally {
          this.processing = false;
          this.showRepaymentPanel = false;
        }
      },
      investBalancer: async function () {
        this.processing = true;
        try {
          await investBalancer(this.investmentBalancerAmount);

          this.$toasted.show("You have invested in a Balancer pool!", {
            theme: "bubble",
            position: "top-center",
            duration: 5000,
            icon: 'sentiment_satisfied_alt'
          });
        } finally {
          this.processing = false;
          this.showInvestmentPanelBalancer = false;
        }
      },
      investMeta: async function () {
        this.processing = true;
        try {
          await investMeta(this.investmentMetaAmount);

          this.$toasted.show("You have invested in a Meta Savings pool!", {
            theme: "bubble",
            position: "top-center",
            duration: 5000,
            icon: 'sentiment_satisfied_alt'
          });
        } finally {
          this.processing = false;
          this.showInvestmentPanelMeta = false;
        }
      }

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

  div.page {
    padding: 40px 20px 0 20px;
    width: 100%;
    height: 800px;
    text-align: center;
    background-color: #F5F5F5;
  }


  .text {
    font-size: 36px;
    padding: 30px 0 30px 0;
  }

  .dinput {
    width: 50px;
    border-bottom: 1px solid gray;
  }

  .slider {
    /* overwrite slider styles */
    width: 500px;
  }

  .v-select {
    min-width: 150px;
    display: inline-block;
  }

  .pool-button {
    border-radius: 30px;
    height: 50px;
    font-size: 14px;
    width: 120px;
    margin-left:20px;
    margin-right:20px;
  }

  .md-dialog {
    max-height: none;
    width: 550px;
    height: 550px;
  }

  .container {
    position: relative;
    text-align: center;
    color: white;
  }

  .image-overlay {
    position: absolute;
    top: 30px;
    left: 40px;
    font-size: 24px;
  }

  .range-slider-fill {
    background-color: #E84F89;
  }

  .vs__clear {
    display: none !important;
  }

  .v-select {
    min-width: 110px;
  }

  .text {
    font-size: 14px;
    height: auto;
    font-style: italic;
    color: gray;
    padding: 16px 16px 16px 16px;
  }

  .md-drawer form {
    padding: 20px;
  }

  .md-dialog.md-theme-default {
    max-width: 768px;
    height: 250px;
    background-color: #f5f5f5;
  }
  .md-dialog-content {
    padding: 20px;
  }

  .collateral-info {
    font-size: 14px;
    color: gray;
    text-align: left;
    margin-top:-20px;
    margin-bottom:20px;
  }

  div.widget {
    margin-bottom: 20px;
    border-radius: 20px;
  }

  .md-card {
    border-radius: 5px;
  }

  div.card-icon {
    float: left;
  }

  .category {
    float:right;
    font-size: 14px;
    color: #999;
    text-align: right;
  }

  .cat-value {
    font-size:28px;
    color: black;
    margin-top: 10px;
    text-align: right;
  }

  .actions-card {
    border-top: 1px solid lightgray;
    height: 25px;
  }

  .solvency-warning {
    color: #999;
    font-style: italic;
  }

  #depositButton .md-ripple {
    background-color: green;
  }

  .md-card-content:last-of-type {
    padding-bottom: 6px;
    line-height: 10px;
  }

  img.card-image {
    height: 64px;
  }

  .assets .md-table-cell {
    text-align: left;
  }



</style>
