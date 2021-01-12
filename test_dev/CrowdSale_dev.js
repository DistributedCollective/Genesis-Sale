const { expectRevert, time } = require('@openzeppelin/test-helpers');
const CrowdSale = artifacts.require('main/CrowdSale.sol');
const CSOVToken = artifacts.require('main/CSOVToken.sol');
const NFTMockSetup = artifacts.require('mock/NFTMockSetup.sol');

contract('CrowdSale', (accounts) => {
  let crowdsale;
  let saleAddress;
  let token;
  let tokenAddr;
  let maxpricelist = [];
  let CtotalSupply;
  const holder0 = accounts[0];
  const holder1 = accounts[1];
  const holder2 = accounts[2];
  const holder3 = accounts[3];
  const holder4 = accounts[4];
  const HOLDERS = 
    [holder0,holder1,holder2,holder3,holder4];
  console.log("Holders: " + HOLDERS);
  const owner = accounts[5]; 
  console.log("Owner: " + owner);
  const sovrynAddress = accounts[6];
  let NFAddr = []; 
  const totalSupply = web3.utils.toWei('300');
  let salebalance;
  let tokenbalance;
  
  

  beforeEach (async () => {

//deploy NFTMockSetup
  let NFTMockSetupInstance = await NFTMockSetup.new(HOLDERS, {from: owner});
  let i;
  for(i=0; i < 5; i++){
    await NFTMockSetupInstance.buildNFT(i, {from: owner});
    NFAddr[i] = await NFTMockSetupInstance.NFAdress(i);
  }
  await NFTMockSetupInstance.mintNFT({from: owner});
  console.log("NFT's addresses:" + NFAddr);
 
//deploy CSOVToken
  token = await CSOVToken.new(totalSupply, {from: owner});
  tokenAddr = await token.address;
  console.log("Total supply is: " + await token.totalSupply());
  console.log(" token addr: " + tokenAddr);
//deploy CrowdSale
  maxpricelist = [web3.utils.toWei('2'),
  web3.utils.toWei('1'),
  web3.utils.toWei('0.8'),
  web3.utils.toWei('0.6'),
  web3.utils.toWei('0.5')];
   
  crowdsale = await CrowdSale.new(
      tokenAddr,
      NFAddr,
      maxpricelist,
      sovrynAddress,
      {from: owner}); 
      CtotalSupply = await crowdsale.tokenTotalSupply();
      console.log("Total supply is: " + CtotalSupply);
      saleAddress = await crowdsale.address;
      console.log("Crowdsale Address: " + saleAddress);
      tokenbalance = await token.balanceOf(owner);
      salebalance = await token.balanceOf(saleAddress);
      console.log(" token owner balance before setsaleadmin: " + tokenbalance);
      console.log(" sale balance before setsaleadmin: " + salebalance);
    await token.setSaleAdmin(saleAddress, { from: owner });
      tokenbalance = await token.balanceOf(owner);
      salebalance = await token.balanceOf(saleAddress);
      console.log(" token owner balance after setsaleadmin: " + tokenbalance);
      console.log(" sale balance after setsaleadmin: " + salebalance);
});

it('should start the CrowdSale', async () => {
  const duration = 10;
  const rate = 2;
  const minpurchase = web3.utils.toWei('0.01'); 
  const crowdsalesupply = web3.utils.toWei('5');
  ///const start = parseInt((new Date()).getTime() / 1000);
  //time.increaseTo(start +5);
  await crowdsale.start(duration, rate, minpurchase, crowdsalesupply, {from: owner}); 

  //const expectedEnd = start + duration ;
  //const end = await crowdsale.end();
  //const actualPrice = await crowdsale.rate();
  let actualAvailableTokens = await crowdsale.availableTokens();
  const actualMinPurchase = await crowdsale.minPurchase();
  const actualRate = await crowdsale.rate();
  assert(actualAvailableTokens.eq(web3.utils.toBN(crowdsalesupply)));
  assert(actualMinPurchase.eq(web3.utils.toBN(minpurchase)));
  assert(actualRate.eq(web3.utils.toBN(rate)));
});
it('should NOT start the CrowdSale', async () => {
  const duration = 100;
  const rate = 2;
  let minpurchase = web3.utils.toWei('0.1'); 
  //let crowdsalesupply = web3.utils.toWei('0');
  //await expectRevert(
  //  crowdsale.start(duration, rate, minpurchase, crowdsalesupply), 
  //  'crowdSaleSupply should be > 0'
  //);
  let crowdsalesupply = web3.utils.toWei('301');
  await expectRevert(
    crowdsale.start(duration, rate, minpurchase, crowdsalesupply, {from: owner}), 
    'crowdSaleSupply should be <= totalSupply'
  );
  crowdsalesupply = web3.utils.toWei('50');
  await expectRevert(
    crowdsale.start(duration, rate, minpurchase, crowdsalesupply, {from: accounts[2]}),
    'Ownable: caller is not the owner'
  );
 //minpurchase = web3.utils.toWei('0');
 // await expectRevert(
 //   crowdsale.start(duration, rate, minpurchase, crowdsalesupply),
 //   '_minPurchase should be > 0'
 // );
  minpurchase = web3.utils.toWei('51');
  await expectRevert(
    crowdsale.start(duration, rate, minpurchase, crowdsalesupply, {from: owner}),
    '_minPurchase should be < crowdSaleSupply'
  );

});


  context('Sale started', () => {
   // let start;
   const duration = 10;
   const rate = 2;
   const minpurchase = web3.utils.toWei('0.1'); 
   const crowdsalesupply = web3.utils.toWei('5');
    beforeEach(async() => {
   //   start = parseInt((new Date()).getTime() / 1000);
   //   time.increaseTo(start);
      await crowdsale.start(
        duration, 
        rate, 
        minpurchase, 
        crowdsalesupply,
        {from: owner}
      ); 
    });

    it('should NOT let non-investors buy', async () => {
      await expectRevert(
        crowdsale.buy({from: accounts[6], value: web3.utils.toWei('0.2')}),
        'The User does NOT hold NFT'
      );
    });

    it('should buy and receive tokens', async () => {
      const investor2 = accounts[2];
      const amount2 = web3.utils.toBN(web3.utils.toWei('0.5'));
      const balance2Before = await web3.eth.getBalance(investor2);
      await crowdsale.buy({from: investor2, value: amount2});
      const balance2After = await web3.eth.getBalance(investor2);
      console.log("2 before: " + balance2Before);
      console.log("2 before: (diff 0.5) " + balance2After);
      const investor1 = accounts[1];
      const amount1 = web3.utils.toBN(web3.utils.toWei('1'));
      const balance1Before = await web3.eth.getBalance(investor1);
      await crowdsale.buy({ from: investor1, value: amount1 });
      const balance1After = await web3.eth.getBalance(investor1);
      console.log("1 before: " + balance1Before);
      console.log("1 after: (diff 1)" + balance1After);
      const balance1 = await token.balanceOf(investor1);
      const balance2 = await token.balanceOf(investor2);
      console.log("should be 1: " + balance2);
      console.log("should be 2: " + balance1);
      assert(balance1.eq(amount1.mul(web3.utils.toBN(rate))));
      assert(balance2.eq(amount2.mul(web3.utils.toBN(rate))));      
    });

    it('should buy and imburse (Sold all crowdsaleSupply)', async () => {
      const investor1 = accounts[1];
      const amount1 = web3.utils.toBN(web3.utils.toWei('2'));
      const balance1Before = await web3.eth.getBalance(investor1);
      await crowdsale.buy({ from: investor1, value: amount1 });
      const balance1After = await web3.eth.getBalance(investor1);
      console.log("1 before: " + balance1Before);
      console.log("1 after: (diff 2)" + balance1After);
      const investor2 = accounts[2];
      const amount2 = web3.utils.toBN(web3.utils.toWei('1'));
      const amountLeft = web3.utils.toBN(web3.utils.toWei('0.5'));
      const balance2Before = await web3.eth.getBalance(investor2);
      await crowdsale.buy({from: investor2, value: amount2});
      const balance2After = await web3.eth.getBalance(investor2);
      console.log("2 before: " + balance2Before);
      console.log("2 before: (diff 0.5) " + balance2After);
      const balance1 = await token.balanceOf(investor1);
      const balance2 = await token.balanceOf(investor2);
      console.log("investor 1: (4) " + balance1);
      console.log("investor 2: (1) " + balance2);
      assert(balance1.eq(amount1.mul(web3.utils.toBN(rate))));
      assert(balance2.eq(amountLeft.mul(web3.utils.toBN(rate))));      
    });
      
    it('should buy and imburse: Investor deposit more then maxPurchase', async () => {
      const investor2 = accounts[2];
      const amount2 = web3.utils.toBN(web3.utils.toWei('3'));
      const amountAllowed = web3.utils.toBN(web3.utils.toWei('2'));
      const balance2Before = await web3.eth.getBalance(investor2);
      await crowdsale.buy({from: investor2, value: amount2});
      const balance2After = await web3.eth.getBalance(investor2);
      console.log("2 before: " + balance2Before);
      console.log("2 before: (diff 2) " + balance2After);
      const balance2 = await token.balanceOf(investor2);
      assert(balance2.eq(amountAllowed.mul(web3.utils.toBN(rate))));      
    });

    it('should NOT buy if amount < minpurchase', async () => {
      let value = web3.utils.toBN(minpurchase).sub(web3.utils.toBN(1)); 
      await expectRevert(
        crowdsale.buy({from: accounts[3], value}),
        'must send more then minPurchase'
      );
    });

    it('should calculate satRaised', async () => {
       const investor1 = accounts[1];
       const amount1 = web3.utils.toBN(web3.utils.toWei('0.2'));      
       await crowdsale.buy({from: investor1, value: amount1});
       let satraised = await crowdsale.satRaised();
       assert(satraised.eq(amount1));
       await crowdsale.buy({from: investor1, value: amount1});
       satraised = await crowdsale.satRaised();
       const sumvalue = amount1.add(amount1); 
       console.log( "satraised: " + satraised);
       console.log( "amount1: " + amount1);
       console.log( "amount1+amount1: " + sumvalue);
       assert(satraised.eq(sumvalue));
    });
    it('Should NOT Withdraw Tokens if not admin', async () => {
        const investor1 = accounts[1];
        const amount1 = web3.utils.toBN(web3.utils.toWei('0.2'));
        await crowdsale.buy({ from: investor1, value: amount1 });
        await expectRevert(
          crowdsale.withdrawTokens({ from: investor1 }),
          'Ownable: caller is not the owner'
        );
    });
      
    it('Should NOT Withdraw Funds if not admin', async () => {
        const investor1 = accounts[1];
        const amount1 = web3.utils.toBN(web3.utils.toWei('0.2'));
        await crowdsale.buy({ from: investor1, value: amount1 });
        await expectRevert(
          crowdsale.withdrawFunds({ from: investor1 }),
          'Ownable: caller is not the owner'
        );
    
    });
 
 /*   
    it('Should Withdraw Tokens', async () => {
      const investor1 = accounts[1];
      const amount1 = web3.utils.toBN(web3.utils.toWei('2'));
      await crowdsale.buy({ from: investor1, value: amount1 });
      const investor2 = accounts[2];
      const amount2 = web3.utils.toBN(web3.utils.toWei('0.5'));
      await crowdsale.buy({ from: investor2, value: amount2 });
      await crowdsale.withdrawTokens({ from: owner });
      const balanceOut = await token.balanceOf(sovrynAddress);
      console.log(" Tokens witdhrawn to sovrynaddress: " + balanceOut);
     //console.log(" CrowdSale: " + balanceOut);
     // console.log(" Tokens witdhrawn to sovrynaddress: " + balanceOut);
     // consototali.sub(crowdsalesupply)
     // assert(balanceOut.eq(amount1.mul(web3.utils.toBN(rate))));
    });

    it('Should Withdraw Funds', async () => {
      const investor1 = accounts[1];
      const amount1 = web3.utils.toBN(web3.utils.toWei('2'));
      await crowdsale.buy({ from: investor1, value: amount1 });
      const investor2 = accounts[2];
      const amount2 = web3.utils.toBN(web3.utils.toWei('0.5'));
      await crowdsale.buy({ from: investor2, value: amount2 });
      const balanceSatOutBefore = await web3.eth.getBalance(accounts[6]);
      await crowdsale.withdrawFunds({ from: owner });
      const balanceSatOutAfter = await web3.eth.getBalance(accounts[6]);
      console.log(" balanceSatOutBefore sovrynaddress: " + balanceSatOutBefore);
      console.log(" balanceSatOutAfter sovrynaddress: " + balanceSatOutAfter);
      const amountAll = amount1 + amount2;
      const amountAllActual = balanceSatOutAfter.sub(balanceSatOutBefore);
      console.log( "amountAll: "  + amountAll);
      console.log( "amountAllActual: "  + amountAllActual);
      //assert(amountAll.eq(amountAllActual));
     //console.log(" CrowdSale: " + balanceOut);
     // console.log(" Tokens witdhrawn to sovrynaddress: " + balanceOut);
     // consototali.sub(crowdsalesupply)
     // assert(balanceOut.eq(amount1.mul(web3.utils.toBN(rate))));
    });
    */
  });

});
    