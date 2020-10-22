const {expect} = require('chai');
const {BN, time} = require('@openzeppelin/test-helpers');

const CompoundingIndex = artifacts.require('CompoundingIndex');

contract('Pool with interests rates', function ([owner]) {

  describe('Simple progress', function () {

    var comp;

    before("deploy the Compounding index", async function () {
      comp = await CompoundingIndex.new();
      await comp.setRate(web3.utils.toWei("0.05"));
    });

    it("should set initial index 1", async function () {
      let start = parseFloat(web3.utils.fromWei(await comp.getIndex()));
      expect(start).to.be.closeTo(1, 0.000001);
    });


    it("should increase index 1 year", async function () {
      await time.increase(time.duration.years(1));
      let oneYear = parseFloat(web3.utils.fromWei(await comp.getIndex()));
      expect(oneYear).to.be.closeTo(1.051271, 0.000001);
    });

    it("should increase index 2 years", async function () {
      await time.increase(time.duration.years(1));
      let twoYears = parseFloat(web3.utils.fromWei(await comp.getIndex()));
      expect(twoYears).to.be.closeTo(1.105171, 0.000001);
    });

    it("should increase index 3 years", async function () {
      await time.increase(time.duration.years(1));
      let threeYears = parseFloat(web3.utils.fromWei(await comp.getIndex()));
      expect(threeYears).to.be.closeTo(1.161834, 0.000001);
    });

    it("should increase index 4 years", async function () {
      await time.increase(time.duration.years(1));
      let threeYears = parseFloat(web3.utils.fromWei(await comp.getIndex()));
      expect(threeYears).to.be.closeTo(1.221402, 0.000001);
    });
  });

  describe('Progress with rates change', function () {

    var comp;

    before("deploy the Compounding index", async function () {
      comp = await CompoundingIndex.new();
      await comp.setRate(web3.utils.toWei("0.05"));
    });

    it("should set initial index 1", async function () {
      let start = parseFloat(web3.utils.fromWei(await comp.getIndex()));
      expect(start).to.be.closeTo(1, 0.000001);
    });

    it("should increase index 1 year on 5%", async function () {
      await time.increase(time.duration.years(1));
      let oneYear = parseFloat(web3.utils.fromWei(await comp.getIndex()));
      expect(oneYear).to.be.closeTo(1.051271, 0.000001);
    });

    it("should increase index 2 years on 10%", async function () {
      await comp.setRate(web3.utils.toWei("0.10"));
      await time.increase(time.duration.years(1));
      let twoYears = parseFloat(web3.utils.fromWei(await comp.getIndex()));
      expect(twoYears).to.be.closeTo(1.161834, 0.000001);
    });

    it("should increase index 3 years", async function () {
      await comp.setRate(web3.utils.toWei("0.05"));
      await time.increase(time.duration.years(1));
      let threeYears = parseFloat(web3.utils.fromWei(await comp.getIndex()));
      expect(threeYears).to.be.closeTo(1.221402, 0.000001);
    });
  });

});

