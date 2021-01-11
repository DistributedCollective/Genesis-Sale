//const { expectRevert, time } = require('@openzeppelin/test-helpers');
//const NFTMockSetup = artifacts.require("NFTMockSetup");
const CSOVToken = artifacts.require("CSOVToken");
const CrowdSale = artifacts.require("CrowdSale");
let tokenAddr = "0x71987d48a5577fB11E222d3DC421E04Ed54DeB9B";
let crowdsaleAddr = "0x355089c48692C27dC6fE94afd75cBa2a3cAD1176";
let token;
let crowd;
let rate;
/**************
 * Testnet deploy setup:
 * maxDepositlist = [1500000000000000, 1000000000000000, 700000000000000, 600000000000000, 500000000000000] 
 * = [0.0015,0.001,0.0007,0.0006,0.0005]
 * account - max deposit allowed
 * * account0 - 0.0015 X rate(50000) = 75
 * * account1 - 0.0015 X rate(50000) = 75
 * * account2 - 0.0015 X rate(50000) = 75
 * * account3 - 0.001  X rate(50000) = 50
 * * account4 - 0.0005 X rate(50000) = 25
 * 
 * * account5 is the owner (deployer of all smartcontracts)
 * 
 */

let account0 = Object.keys(web3.currentProvider.wallets)[0]
console.log("account0 is: " + account0);
let account1 = Object.keys(web3.currentProvider.wallets)[1]
console.log("account1 is: " + account1);
let account2 = Object.keys(web3.currentProvider.wallets)[2]
console.log("account2 is: " + account2);
let account3 = Object.keys(web3.currentProvider.wallets)[3]
console.log("account3 is: " + account3);
let account4 = Object.keys(web3.currentProvider.wallets)[4]
console.log("account4 is: " + account4);
let account5 = Object.keys(web3.currentProvider.wallets)[5]
console.log("account5 is: " + account5);
let account6 = Object.keys(web3.currentProvider.wallets)[6]
console.log("account6 is: " + account6);

it('should setup var', async () => {
  token = await CSOVToken.at(tokenAddr);
  crowd = await CrowdSale.at(crowdsaleAddr);
  let totalsupply = await crowd.tokenTotalSupply();
  console.log("crowd.tokenTotalSupply(): " + totalsupply);
  let bal = await token.balanceOf(account1);
  console.log("bal of account1 should be 0: " + bal);
  bal = await token.balanceOf(account5);
  console.log("bal of owner read from CSOVToken (account5) is : " + bal);
  let bal1 = await crowd.balanceOf(account5);
  console.log("bal of owner read from crowdsale (account5) is : " + bal1); 
});
/*
it('should fail - Ownable: caller is not the owner', async () => {
    await crowd.withdrawTokens({ from: account1 });
});
it('should fail - Sale has NOT ended', async () => {
    await  crowd.withdrawTokens({from: account5});
});
it('should fail - Ownable: caller is not the owner', async () => {
  await crowd.withdrawFunds({ from: account1 });
});
it('should fail - Sale has NOT ended', async () => {
  await  crowd.withdrawFunds({from: account5});
});
*/

it('should start the CrowdSale', async () => {
  token = await CSOVToken.at(tokenAddr);
  crowd = await CrowdSale.at(crowdsaleAddr);
  //7.5 hours, till 10AM
 /* const duration = 604800;
  rate = 50000;
  const minpurchase = web3.utils.toWei('0.0002'); 
  const crowdsalesupply = web3.utils.toWei('250');
  console.log("end time (before start) is: " + await crowd.end() );
  await crowd.start(duration, rate, minpurchase, crowdsalesupply, {from: account5}); 
  let actualAvailableTokens = await crowd.availableTokens();
  const actualMinPurchase = await crowd.minPurchase();
  const actualRate = await crowd.rate();
  console.log("end time (after start) is: " + await crowd.end() );
  console.log(" crowd supply is: " + crowdsalesupply);
  console.log(" available supply is: " + actualAvailableTokens);
  console.log(" rate is: " + actualRate);
  console.log(" minpurchase is: " + actualMinPurchase);            
*/
});
/*
it('should buy and receive tokens', async () => {
  const amount1 = web3.utils.toBN(web3.utils.toWei('0.001'));
  const amount2 = web3.utils.toBN(web3.utils.toWei('0.0015'));
  await crowd.buy({from: account1, value: amount1});
  await crowd.buy({from: account2, value: amount2});
  const balance1 = await token.balanceOf(account1);
  const balance2 = await token.balanceOf(account2);
  console.log("account1 amount=0.001*50000 = 50 = " + amount1.mul(web3.utils.toBN(rate)));
  console.log("account1 balance is: " + balance1);
  console.log("account2 amount= 0.0015*50000 = 75 = " + amount2.mul(web3.utils.toBN(rate)));
  console.log("account2 balance is: " + balance2);
  const totalwei = await crowd.weiRaised();
  console.log("total wei deposit is 0.001+0.0015 = 0.0025 = " + totalwei);
});

it('should buy and imburse: Investor deposit more then maxPurchase', async () => {
  const amount1 = web3.utils.toBN(web3.utils.toWei('0.001'));
  const amountAllowed = web3.utils.toBN(web3.utils.toWei('0.0005'));
  const RBTCbalance1Before = await web3.eth.getBalance(account1);
  const Tokenbalance1Before = await token.balanceOf(account1);
  await crowd.buy({from: account1, value: amount1});
  const RBTCbalance1After = await web3.eth.getBalance(account1);
  const Tokenbalance1After = await token.balanceOf(account1);
  console.log("account1 RBTC balance before: " + RBTCbalance1Before);
  console.log("account1 RBTC balance after, should be 0.0005 less: " + RBTCbalance1After);
  console.log("account1 Token balance before: " + Tokenbalance1Before);
  console.log("account1 Token balance after, should be 25 more: " + Tokenbalance1After);
  const totalwei = await crowd.weiRaised();
  console.log("total wei deposit is 0.001+0.0015 +0.0005 = 0.003 = " + totalwei);    
      //assert(balance2.eq(amountAllowed.mul(web3.utils.toBN(rate))));      
});
*/
/*
it('should fail to buy for account0: amount0 < maxPurchase/2 0.00074 < 0.00075', async () => {
  const amount0 = web3.utils.toBN(web3.utils.toWei('0.00074'));
  //const amount0 = await crowd.getMaxPurchase(account0).sub(web3.utils.toBN(1));
  console.log("should be 0.0015 " + await crowd.getMaxPurchase(account0));
  console.log( "should be < 0.00075  wei " + amount0);
  await crowd.buy({from: account0, value: amount0});
});
*/
it('getmaxpurchase', async () =>{
  console.log("maxpurchase should be 0.001 " + await crowd.getMaxPurchase(account3));
  console.log("account3 deposit done = " + await crowd.InvestorTotalDeposits(account3));
});

it('should buy and receive tokens account3 amount3 > maxPurchase/2 0.0007 > 0.0005 ', async () => {
  /*let amount3 = web3.utils.toBN(web3.utils.toWei('0.0007'));
  let balance3 = await token.balanceOf(account3);
  console.log( "balance tokens before" + balance3);
  await crowd.buy({from: account3, value: amount3});
  balance3 = await token.balanceOf(account3);
  console.log( "balance tokens should be + 35" + balance3);
  console.log("account3 deposit done = " + await crowd.InvestorTotalDeposits(account3));
  amount3 = web3.utils.toBN(web3.utils.toWei('0.00021'));
  await crowd.buy({from: account3, value: amount3});
  balance3 = await token.balanceOf(account3);
  console.log( "balance tokens should be + 35 + 10.5 " + balance3);
  */
  const RBTCbalance3Before = await web3.eth.getBalance(account3);
  amount3 = web3.utils.toBN(web3.utils.toWei('0.0021'));
  await crowd.buy({from: account3, value: amount3});
  const RBTCbalance3After = await web3.eth.getBalance(account3);
  balance3 = await token.balanceOf(account3);
  console.log( "balance tokens should be + 35 + 10.5 + 4.5" + balance3);
  console.log("account3 RBTC balance before: " + RBTCbalance3Before);
  console.log("account3 RBTC balance after, should be 0.0001 less: " + RBTCbalance3After);
});

/*
it('Should stop Sale', async () => {
  //let saleStop = await crowd.isStopSale();
  console.log("isStopSale before stop = "+ await crowd.isStopSale());
  await crowd.stopSale(true, { from: account5 });
  //saleStop = await crowd.isStopSale();
  console.log("isStopSale after stop = "+ await crowd.isStopSale());
});

it('Should Withdraw Funds', async () => {
  const totalwei = await crowd.weiRaised();
  console.log( "totalwei raised: "  + totalwei);
  const balanceweiOutBefore = await web3.eth.getBalance(account6);
  await crowd.withdrawFunds({ from: account5 });
  const balanceweiOutAfter = await web3.eth.getBalance(account6);
  const weiRaised = await crowd.weiRaised();
  console.log(" balanceweiOutBefore account6: " + balanceweiOutBefore);
  console.log(" balanceweiOutAfter account6: " + balanceweiOutAfter);
  console.log(" weiRaised: " + weiRaised);
});

it('Should Withdraw Tokens', async () => {
  const tokenSc = await token.balanceOf(crowdsaleAddr);
  const balanceOut = await token.balanceOf(account6);
  console.log("balance token before sc: "+ tokenSc);
  console.log("balance token before sovryn: "+ balanceOut);
  await crowd.withdrawTokens({ from: account5 });
  tokenSc = await token.balanceOf(crowdsaleAddr);
  balanceOut = await token.balanceOf(account6);
  console.log("balance token after sc: "+ tokenSc);
  console.log("balance token after sovryn: "+ balanceOut);
});
*/
/*
it('Should close Sale', async () => {
  let saleEnd = await token.isSaleEnded();
  console.log("isSaleEnded before closure= "+ isSaleEnded);
  await crowd.saleClosure(true, { from: account5 });
  saleEnd = await token.isSaleEnded();
  console.log("isSaleEnded after closure= "+ isSaleEnded);
});
*/
/*
it('should fail - Sale has NOT ended', async () => {
  await  crowd.withdrawFunds({from: account5});
});
it('should fail - buy amount < minPurchase', async () => {
  const amount3 = web3.utils.toBN(web3.utils.toWei('0.0001'));
  await crowd.buy({from: account3, value: amount3});
});
*/
/*it('should fail - Investor does NOT hold NFT', async () => {
  const amount6 = web3.utils.toBN(web3.utils.toWei('0.0003'));
  await crowd.buy({from: account6, value: amount6});
});
*/

/*
const maxpricelist = [
  1500000000000000,
  1000000000000000,
  700000000000000,
  600000000000000,
  500000000000000];
const totalSupply = web3.utils.toWei('300');
  let CtotalSupply;

    //deploy NFTMockSetup
    beforeEach(async () => {
      let NFTMockSetupInstance = await NFTMockSetup.new(HOLDERS, {from: accounts[0]});
      let i;
      for(i=0; i < 5; i++){
        await NFTMockSetupInstance.buildNFT(i);
        NFAddr[i] = await NFTMockSetupInstance.NFAdress(i);
      }
      await NFTMockSetupInstance.mintNFT();
     // console.log("DeployNFTMockSetup");
     // console.log("NFT's addresses:");
     // console.log(NFAddr);
    //deploy CSOVToken
      token = await CSOVToken.new(totalSupply, {from: accounts[0]});
      tokenAddr = await token.address;
     // console.log("Total supply is: " + await token.totalSupply());
     // console.log(" token addr: " + tokenAddr);
    //deploy CrowdSale
      // maxpricelist = [1500,1000,700,600,500];
      crowdsale = await CrowdSale.new(
        tokenAddr,
        NFAddr,
        maxpricelist,
        SOVRYNAddr,
        {from: accounts[0]}
      );
      //console.log("Total supply is: " + await crowdsale.tokenTotalSupply());
      CtotalSupply = await crowdsale.tokenTotalSupply();
       // console.log("Total supply is: " + CtotalSupply);
      saleAddress = await crowdsale.address;
        tokenbalance = await token.balanceOf(accounts[0]);
        salebalance = await token.balanceOf(saleAddress);
       // console.log(" tokeni owner balance before setsaleadmin: " + tokenbalance);
       // console.log(" sale balance before setsaleadmin: " + salebalance);
        await token.setSaleAdmin(saleAddress, {from: accounts[0]});
        tokenbalance = await token.balanceOf(accounts[0]);
        salebalance = await token.balanceOf(saleAddress);
        //console.log(" tokeni owner balance after setsaleadmin: " + tokenbalance);
        //console.log(" sale balance after setsaleadmin: " + salebalance);
    });
/*
    beforeEach(async () => {
      console.log(" token addr: " + tokenAddr);  
      crowdsale = await CrowdSale.new(
          tokenAddr,
          NFAddr,
          maxpricelist,
          SOVRYNAddr,
          {from: accounts[0]}
        );
        CtotalSupply = await crowdsale.tokenTotalSupply();
        console.log("Total supply is: " + CtotalSupply);
      saleAddress = await crowdsale.address;
        let tokenbalance = await token.balanceOf(accounts[0]);
        let salebalance = await token.balanceOf(saleAddress);
        //console.log(" tokeni owner balance before setsaleadmin: " + tokenibalance);
        //console.log(" sale balance before setsaleadmin: " + salebalance);
        await token.setSaleAdmin(saleAddress, {from: accounts[0]});
        tokenbalance = await token.balanceOf(accounts[0]);
        salebalance = await token.balanceOf(saleAddress);
      });
  
 */ 
/*    //Time increase problem
    it('should start the CrowdSale', async () => {
      assert(CtotalSupply.eq(web3.utils.toBN(salebalance)));
      const duration = 100;
      const rate = 50000;
      const minpurchase = web3.utils.toWei('0.0002'); 
      const crowdsalesupply = web3.utils.toWei('250');
      //const totalsupplyi = await crowdsale.tokenTotalSupply();
      //console.log( "total is: " + totalsupply);
      ///const start = parseInt((new Date()).getTime() / 1000);
      //time.increaseTo(start +5);
      await crowdsale.start(duration, rate, minpurchase, crowdsalesupply, {from: accounts[0]}); 

      //const expectedEnd = start + duration ;
      //const end = await crowdsale.end();
      //const actualPrice = await crowdsale.rate();
      let actualAvailableTokens = await crowdsale.availableTokens();
      const actualMinPurchase = await crowdsale.minPurchase();
      const actualRate = await crowdsale.rate();
      //const actualMaxPurchase = await crowdsale.maxPurchase();
      //console.log(" total is " + totalsupplyi);
      console.log(" crowd is " + crowdsalesupply);
      //assert(totalsupplyi.eq(web3.utils.toBN(crowdsalesupply)));
      
      //assert(end.eq(web3.utils.toBN(expectedEnd)));
      //assert(actualAvailableTokens.eq(web3.utils.toBN(crowdsalesupply)));
  //assert(actualMinPurchase.eq(web3.utils.toBN(minpurchase)));
  //assert(actualRate.eq(web3.utils.toBN(rate)));
      //assert(actualMaxPurchase.eq(web3.utils.toBN(maxPurchase)));               
  });

  context('Sale started', () => {
    const duration = 100;
      const rate = 50000;
      const minpurchase = web3.utils.toWei('0.0002'); 
      const crowdsalesupply = web3.utils.toWei('250');
     beforeEach(async() => {
    //   start = parseInt((new Date()).getTime() / 1000);
    //   time.increaseTo(start);
    await crowdsale.start(
      duration,
      rate,
      minpurchase,
      crowdsalesupply,
      {from: accounts[0]}); 
     });

     it('should NOT let non-investors buy', async () => {
      //console.log("account 1 NFT0 balance: " + await crowdsale.MaxDepositPerNFT[NFAddr[0]]);
      await expectRevert(
        crowdsale.buy({from: accounts[7], value: web3.utils.toWei('0.001')}),
        'The User does NOT hold NFT'
      );
      
    });

    it('should buy and receive tokens', async () => {
      const investor2 = accounts[2];
      const amount2 = web3.utils.toBN(web3.utils.toWei('0.0015'));
      await crowdsale.buy({from: investor2, value: amount2});
      const investor1 = accounts[1];
      const amount1 = web3.utils.toBN(web3.utils.toWei('0.001'));
      await crowdsale.buy({ from: investor1, value: amount1 });
      const balance1 = await token.balanceOf(investor1);
      const balance2 = await token.balanceOf(investor2);
      console.log("investor1 amount= 0.0015*50000: " + amount1.mul(web3.utils.toBN(rate)));
      console.log("investor1 balance is: " + balance1);
      console.log("investor2 amount= 0.001*50000: " + amount2.mul(web3.utils.toBN(rate)));
      console.log("investor2 balance is: " + balance2);
      assert(balance1.eq(amount1.mul(web3.utils.toBN(rate))));
      assert(balance2.eq(amount2.mul(web3.utils.toBN(rate))));      
    });
/*
    it('should buy and imburse (Sold all crowdsaleSupply)', async () => {
      const investor1 = accounts[1];
      const amount1 = web3.utils.toBN(web3.utils.toWei('0.002'));
      const balance1Before = await web3.eth.getBalance(investor1);
      await crowdsale.buy({ from: investor1, value: amount1 });
      const balance1After = await web3.eth.getBalance(investor1);
      console.log("1 before: " + balance1Before);
      console.log("1 after: " + balance1After);
      const investor2 = accounts[2];
      const amount2 = web3.utils.toBN(web3.utils.toWei('0.001'));
      const amountLeft = web3.utils.toBN(web3.utils.toWei('0.5'));
      const balance2Before = await web3.eth.getBalance(investor2);
      await crowdsale.buy({from: investor2, value: amount2});
      const balance2After = await web3.eth.getBalance(investor2);
      console.log("2 before: " + balance2Before);
      console.log("2 before: " + balance2After);
      const balance1 = await tokeni.balanceOf(investor1);
      const balance2 = await tokeni.balanceOf(investor2);
      assert(balance1.eq(amount1.mul(web3.utils.toBN(rate))));
      assert(balance2.eq(amountLeft.mul(web3.utils.toBN(rate))));      
    });
    
    it('should buy and imburse: Investor deposit more then maxPurchase', async () => {
      const investor2 = accounts[2];
      const amount2 = web3.utils.toBN(web3.utils.toWei('0.003'));
      const amountAllowed = web3.utils.toBN(web3.utils.toWei('0.002'));
      const balance2Before = await web3.eth.getBalance(investor2);
      await crowdsale.buy({from: investor2, value: amount2});
      const balance2After = await web3.eth.getBalance(investor2);
      console.log(balance2Before);
      console.log(balance2After);
      const balance2 = await tokeni.balanceOf(investor2);
      assert(balance2.eq(amountAllowed.mul(web3.utils.toBN(rate))));      
    });
*/
    
   /* it('should NOT buy if amount < minpurchase', async () => {
      let value = web3.utils.toBN(minpurchase).sub(web3.utils.toBN(1)); 
      await expectRevert(
        crowdsale.buy({from: accounts[3], value}),
        'must send more then minPurchase'
      );
    });

    it('should calculate weiRaised', async () => {
       const investor1 = accounts[1];
       const amount1 = web3.utils.toBN(web3.utils.toWei('0.002'));      
       await crowdsale.buy({from: investor1, value: amount1});
       let weiRaised = await crowdsale.weiRaised();
       assert(weiRaised.eq(amount1));
       await crowdsale.buy({from: investor1, value: amount1});
       weiRaised = await crowdsale.weiRaised();
       const sumvalue = amount1.add(amount1); 
       assert(weiRaised.eq(sumvalue));
    });
    it('Should NOT Withdraw Tokens if not admin', async () => {
        const investor1 = accounts[1];
        const amount1 = web3.utils.toBN(web3.utils.toWei('0.002'));
        await crowdsale.buy({ from: investor1, value: amount1 });
        await expectRevert(
          crowdsale.withdrawTokens({ from: investor1 }),
          'Ownable: caller is not the owner'
        );
    });
      
    it('Should NOT Withdraw Funds if not admin', async () => {
        const investor1 = accounts[1];
        const amount1 = web3.utils.toBN(web3.utils.toWei('0.002'));
        await crowdsale.buy({ from: investor1, value: amount1 });
        await expectRevert(
          crowdsale.withdrawFunds({ from: investor1 }),
          'Ownable: caller is not the owner'
        );
    
    });
    
    it('Should Withdraw Tokens', async () => {
      const investor1 = accounts[1];
      const amount1 = web3.utils.toBN(web3.utils.toWei('0.002'));
      await crowdsale.buy({ from: investor1, value: amount1 });
      const investor2 = accounts[2];
      const amount2 = web3.utils.toBN(web3.utils.toWei('0.005'));
      await crowdsale.buy({ from: investor2, value: amount2 });
      await crowdsale.withdrawTokens({ from: accounts[9] });
      const balanceOut = await tokeni.balanceOf(sovrynAddress);
      console.log(" Tokens witdhrawn to sovrynaddress: " + balanceOut);
     //console.log(" CrowdSale: " + balanceOut);
     // console.log(" Tokens witdhrawn to sovrynaddress: " + balanceOut);
     // consototali.sub(crowdsalesupply)
     // assert(balanceOut.eq(amount1.mul(web3.utils.toBN(rate))));
    });

    it('Should Withdraw Funds', async () => {
      const investor1 = accounts[1];
      const amount1 = web3.utils.toBN(web3.utils.toWei('0.002'));
      await crowdsale.buy({ from: investor1, value: amount1 });
      const investor2 = accounts[2];
      const amount2 = web3.utils.toBN(web3.utils.toWei('0.005'));
      await crowdsale.buy({ from: investor2, value: amount2 });
      const balanceweiOutBefore = await web3.eth.getBalance(accounts[8]);
      await crowdsale.withdrawFunds({ from: accounts[9] });
      const balanceweiOutAfter = await web3.eth.getBalance(accounts[8]);
      console.log(" balanceweiOutBefore sovrynaddress: " + balanceweiOutBefore);
      console.log(" balanceweiOutAfter sovrynaddress: " + balanceweiOutAfter);
      const amountAll = amount1.add(amount2);
      const amountAllActual = balanceweiOutAfter.sub(balanceweiOutBefore);
      console.log( "amountAll: "  + amountAll);
      console.log( "amountAllActual: "  + amountAllActual);
      assert(amountAll.eq(amountAllActual));
     //console.log(" CrowdSale: " + balanceOut);
     // console.log(" Tokens witdhrawn to sovrynaddress: " + balanceOut);
     // consototali.sub(crowdsalesupply)
     // assert(balanceOut.eq(amount1.mul(web3.utils.toBN(rate))));
    });
 
*/
/*////////////////////////
});
});
*//////////////
       /* tokeni = await Token.new(totalsupply, saleend, {from: accounts[0]});
        tokenAddress = await tokeni.address;
        itotalsupply = await tokeni.totalSupply();
        //console.log("token address: " + tokenAddress);// "XXX" tokenAddress "XXX"   itotalsupply);
            
        crowdsale = await CrowdSale.new(
          tokenAddress,
          [NFTMAX0, NFTMAX1, NFTMAX2, NFTMAX3, NFTMAX4],
          [holder1, holder2, holder3],
          [NFT0, NFT1, NFT2, NFT3, NFT4],
          [NFT0Holder0, NFT0Holder1],
          [NFT1Holder0, NFT1Holder1],
          [NFT2Holder0],
          [NFT3Holder0],
          [NFT4Holder0, NFT4Holder1],
          sovrynAddress,
          {from: accounts[9]}); 
        saleAddress = await crowdsale.address;
        //console.log("sale address: " + saleAddress);
        tokenibalance = await tokeni.balanceOf(accounts[0]);
        salebalance = await tokeni.balanceOf(saleAddress);
        //console.log(" tokeni owner balance before setsaleadmin: " + tokenibalance);
        //console.log(" sale balance before setsaleadmin: " + salebalance);
        await tokeni.setSaleAdmin(saleAddress, {from: accounts[0]});
        tokenibalance = await tokeni.balanceOf(accounts[0]);
        salebalance = await tokeni.balanceOf(saleAddress);
        //console.log(" tokeni owner balance after setsaleadmin: " + tokenibalance);
        //console.log(" sale balance after setsaleadmin: " + salebalance);
        
      });
       //Time increase problem
  it('should start the CrowdSale', async () => {
    assert(itotalsupply.eq(web3.utils.toBN(salebalance)));
    const duration = 100;
    const rate = 2;
    const minpurchase = web3.utils.toWei('0.01'); 
    const crowdsalesupply = web3.utils.toWei('5');
    const totalsupplyi = await crowdsale.tokenTotalSupply();
    console.log( "total is: " + totalsupply);
    ///const start = parseInt((new Date()).getTime() / 1000);
    //time.increaseTo(start +5);
    await crowdsale.start(duration, rate, minpurchase, crowdsalesupply, {from: accounts[9]}); 

    //const expectedEnd = start + duration ;
    //const end = await crowdsale.end();
    //const actualPrice = await crowdsale.rate();
    let actualAvailableTokens = await crowdsale.availableTokens();
    const actualMinPurchase = await crowdsale.minPurchase();
    const actualRate = await crowdsale.rate();
    //const actualMaxPurchase = await crowdsale.maxPurchase();
    console.log(" total is " + totalsupplyi);
    console.log(" crowd is " + crowdsalesupply);
    //assert(totalsupplyi.eq(web3.utils.toBN(crowdsalesupply)));
    
    //assert(end.eq(web3.utils.toBN(expectedEnd)));
    //assert(actualAvailableTokens.eq(web3.utils.toBN(crowdsalesupply)));
//assert(actualMinPurchase.eq(web3.utils.toBN(minpurchase)));
//assert(actualRate.eq(web3.utils.toBN(rate)));
    //assert(actualMaxPurchase.eq(web3.utils.toBN(maxPurchase)));
  });


    });











/*
    
    tokenAddress = await tokeni.address;
      itotalsupply = await tokeni.totalSupply();
      console.log("token address: " + tokenAddress);// "XXX" tokenAddress "XXX"   itotalsupply);
          
      crowdsale = await CrowdSale.new(
        tokenAddress,
        [NFTMAX0, NFTMAX1, NFTMAX2, NFTMAX3, NFTMAX4],
        [holder1, holder2, holder3],
        [NFT0, NFT1, NFT2, NFT3, NFT4],
        [NFT0Holder0, NFT0Holder1],
        [NFT1Holder0, NFT1Holder1],
        [NFT2Holder0],
        [NFT3Holder0],
        [NFT4Holder0, NFT4Holder1],
        sovrynAddress,
        {from: accounts[9]}); 
      //const tokenAddress = await crowdsale.token();
      //token = await Token.at(tokenAddress); 
      //const itotalsupply = await token.totalSupply();
      saleAddress = await crowdsale.address;
      console.log("sale address: " + saleAddress);
      tokenibalance = await tokeni.balanceOf(accounts[0]);
      salebalance = await tokeni.balanceOf(saleAddress);
      console.log(" tokeni owner balance before setsaleadmin: " + tokenibalance);
      console.log(" sale balance before setsaleadmin: " + salebalance);
      await tokeni.setSaleAdmin(saleAddress, {from: accounts[0]});
      tokenibalance = await tokeni.balanceOf(accounts[0]);
      salebalance = await tokeni.balanceOf(saleAddress);
      console.log(" tokeni owner balance after setsaleadmin: " + tokenibalance);
      console.log(" sale balance after setsaleadmin: " + salebalance);
      
    };












contract('CrowdSale', (accounts) => {
  let crowdsale;
  let token;
  let saleend = "false" ; 
  const [NFTMAX0, NFTMAX1, NFTMAX2, NFTMAX3, NFTMAX4] = [web3.utils.toWei('2'),web3.utils.toWei('0.5'),web3.utils.toWei('0.4'),web3.utils.toWei('0.2'),web3.utils.toWei('0.05')];
  const [holder1, holder2, holder3] = [accounts[1],accounts[2],accounts[3]];
  const [NFT0, NFT1, NFT2, NFT3, NFT4] = [accounts[4],accounts[5],accounts[6],accounts[7],accounts[8]];
  const [NFT0Holder0, NFT0Holder1] = [accounts[1], accounts[2]];
  const [NFT1Holder0, NFT1Holder1] = [accounts[1], accounts[2]];
  const [NFT2Holder0] = [accounts[2]];
  const [NFT3Holder0] = [accounts[2]];
  const [NFT4Holder0, NFT4Holder1] = [accounts[1], accounts[3]];
  const sovrynAddress = accounts[8];
  const totalsupply = web3.utils.toWei('10');
  let tokeni;
  let tokenAddress;
  let saleAddress;
  let salebalance;
  let tokenibalance;
  let itotalsupply;

  async () => {
    tokeni = await Token.new(totalsupply, saleend, {from: accounts[0]});
    tokenAddress = await tokeni.address;
    itotalsupply = await tokeni.totalSupply();
    console.log("token address: " + tokenAddress);// "XXX" tokenAddress "XXX"   itotalsupply);
        
    crowdsale = await CrowdSale.new(
      tokenAddress,
      [NFTMAX0, NFTMAX1, NFTMAX2, NFTMAX3, NFTMAX4],
      [holder1, holder2, holder3],
      [NFT0, NFT1, NFT2, NFT3, NFT4],
      [NFT0Holder0, NFT0Holder1],
      [NFT1Holder0, NFT1Holder1],
      [NFT2Holder0],
      [NFT3Holder0],
      [NFT4Holder0, NFT4Holder1],
      sovrynAddress,
      {from: accounts[9]}); 
    //const tokenAddress = await crowdsale.token();
    //token = await Token.at(tokenAddress); 
    //const itotalsupply = await token.totalSupply();
    saleAddress = await crowdsale.address;
    console.log("sale address: " + saleAddress);
    tokenibalance = await tokeni.balanceOf(accounts[0]);
    salebalance = await tokeni.balanceOf(saleAddress);
    console.log(" tokeni owner balance before setsaleadmin: " + tokenibalance);
    console.log(" sale balance before setsaleadmin: " + salebalance);
    await tokeni.setSaleAdmin(saleAddress, {from: accounts[0]});
    tokenibalance = await tokeni.balanceOf(accounts[0]);
    salebalance = await tokeni.balanceOf(saleAddress);
    console.log(" tokeni owner balance after setsaleadmin: " + tokenibalance);
    console.log(" sale balance after setsaleadmin: " + salebalance);
    
  };
*/
/*  beforeEach(async () => {
    tokeni = await Token.new(totalsupply, saleend, {from: accounts[0]});
    tokenAddress = await tokeni.address;
    itotalsupply = await tokeni.totalSupply();
    //console.log("token address: " + tokenAddress);// "XXX" tokenAddress "XXX"   itotalsupply);
        
    crowdsale = await CrowdSale.new(
      tokenAddress,
      [NFTMAX0, NFTMAX1, NFTMAX2, NFTMAX3, NFTMAX4],
      [holder1, holder2, holder3],
      [NFT0, NFT1, NFT2, NFT3, NFT4],
      [NFT0Holder0, NFT0Holder1],
      [NFT1Holder0, NFT1Holder1],
      [NFT2Holder0],
      [NFT3Holder0],
      [NFT4Holder0, NFT4Holder1],
      sovrynAddress,
      {from: accounts[9]}); 
    saleAddress = await crowdsale.address;
    //console.log("sale address: " + saleAddress);
    tokenibalance = await tokeni.balanceOf(accounts[0]);
    salebalance = await tokeni.balanceOf(saleAddress);
    //console.log(" tokeni owner balance before setsaleadmin: " + tokenibalance);
    //console.log(" sale balance before setsaleadmin: " + salebalance);
    await tokeni.setSaleAdmin(saleAddress, {from: accounts[0]});
    tokenibalance = await tokeni.balanceOf(accounts[0]);
    salebalance = await tokeni.balanceOf(saleAddress);
    //console.log(" tokeni owner balance after setsaleadmin: " + tokenibalance);
    //console.log(" sale balance after setsaleadmin: " + salebalance);
    
  });

   //Time increase problem
  it('should start the CrowdSale', async () => {
    assert(itotalsupply.eq(web3.utils.toBN(salebalance)));
    const duration = 100;
    const rate = 2;
    const minpurchase = web3.utils.toWei('0.01'); 
    const crowdsalesupply = web3.utils.toWei('5');
    const totalsupplyi = await crowdsale.tokenTotalSupply();
    console.log( "total is: " + totalsupply);
    ///const start = parseInt((new Date()).getTime() / 1000);
    //time.increaseTo(start +5);
    await crowdsale.start(duration, rate, minpurchase, crowdsalesupply, {from: accounts[9]}); 

    //const expectedEnd = start + duration ;
    //const end = await crowdsale.end();
    //const actualPrice = await crowdsale.rate();
    let actualAvailableTokens = await crowdsale.availableTokens();
    const actualMinPurchase = await crowdsale.minPurchase();
    const actualRate = await crowdsale.rate();
    //const actualMaxPurchase = await crowdsale.maxPurchase();
    console.log(" total is " + totalsupplyi);
    console.log(" crowd is " + crowdsalesupply);
    //assert(totalsupplyi.eq(web3.utils.toBN(crowdsalesupply)));
    
    //assert(end.eq(web3.utils.toBN(expectedEnd)));
    //assert(actualAvailableTokens.eq(web3.utils.toBN(crowdsalesupply)));
//assert(actualMinPurchase.eq(web3.utils.toBN(minpurchase)));
//assert(actualRate.eq(web3.utils.toBN(rate)));
    //assert(actualMaxPurchase.eq(web3.utils.toBN(maxPurchase)));
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
    let crowdsalesupply = web3.utils.toWei('101');
    await expectRevert(
      crowdsale.start(duration, rate, minpurchase, crowdsalesupply), 
      'crowdSaleSupply should be <= totalSupply'
    );
    crowdsalesupply = web3.utils.toWei('50');
    await expectRevert(
      crowdsale.start(duration, rate, minpurchase, crowdsalesupply, {from: accounts[5]}),
      'Ownable: caller is not the owner'
    );
   //minpurchase = web3.utils.toWei('0');
   // await expectRevert(
   //   crowdsale.start(duration, rate, minpurchase, crowdsalesupply),
   //   '_minPurchase should be > 0'
   // );
    minpurchase = web3.utils.toWei('51');
    await expectRevert(
      crowdsale.start(duration, rate, minpurchase, crowdsalesupply),
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
        {from: accounts[9]}
      ); 
    });

    it('should NOT let non-investors buy', async () => {
      await expectRevert(
        crowdsale.buy({from: accounts[4], value: web3.utils.toWei('0.2')}),
        'Deposit is not allowed'
      );
    });

    it('should buy and receive tokens', async () => {
      const investor2 = accounts[2];
      const amount2 = web3.utils.toBN(web3.utils.toWei('0.5'));
      await crowdsale.buy({from: investor2, value: amount2});
      const investor1 = accounts[1];
      const amount1 = web3.utils.toBN(web3.utils.toWei('1'));
      await crowdsale.buy({ from: investor1, value: amount1 });
      const balance1 = await tokeni.balanceOf(investor1);
      const balance2 = await tokeni.balanceOf(investor2);
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
      console.log("1 after: " + balance1After);
      const investor2 = accounts[2];
      const amount2 = web3.utils.toBN(web3.utils.toWei('1'));
      const amountLeft = web3.utils.toBN(web3.utils.toWei('0.5'));
      const balance2Before = await web3.eth.getBalance(investor2);
      await crowdsale.buy({from: investor2, value: amount2});
      const balance2After = await web3.eth.getBalance(investor2);
      console.log("2 before: " + balance2Before);
      console.log("2 before: " + balance2After);
      const balance1 = await tokeni.balanceOf(investor1);
      const balance2 = await tokeni.balanceOf(investor2);
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
      console.log(balance2Before);
      console.log(balance2After);
      const balance2 = await tokeni.balanceOf(investor2);
      assert(balance2.eq(amountAllowed.mul(web3.utils.toBN(rate))));      
    });

    it('should NOT buy if amount < minpurchase', async () => {
      let value = web3.utils.toBN(minpurchase).sub(web3.utils.toBN(1)); 
      await expectRevert(
        crowdsale.buy({from: accounts[3], value}),
        'must send more then minPurchase'
      );
    });

    it('should calculate weiRaised', async () => {
       const investor1 = accounts[1];
       const amount1 = web3.utils.toBN(web3.utils.toWei('0.2'));      
       await crowdsale.buy({from: investor1, value: amount1});
       let weiRaised = await crowdsale.weiRaised();
       assert(weiRaised.eq(amount1));
       await crowdsale.buy({from: investor1, value: amount1});
       weiRaised = await crowdsale.weiRaised();
       const sumvalue = amount1.add(amount1); 
       assert(weiRaised.eq(sumvalue));
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
    
    it('Should Withdraw Tokens', async () => {
      const investor1 = accounts[1];
      const amount1 = web3.utils.toBN(web3.utils.toWei('2'));
      await crowdsale.buy({ from: investor1, value: amount1 });
      const investor2 = accounts[2];
      const amount2 = web3.utils.toBN(web3.utils.toWei('0.5'));
      await crowdsale.buy({ from: investor2, value: amount2 });
      await crowdsale.withdrawTokens({ from: accounts[9] });
      const balanceOut = await tokeni.balanceOf(sovrynAddress);
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
      const balanceweiOutBefore = await web3.eth.getBalance(accounts[8]);
      await crowdsale.withdrawFunds({ from: accounts[9] });
      const balanceweiOutAfter = await web3.eth.getBalance(accounts[8]);
      console.log(" balanceweiOutBefore sovrynaddress: " + balanceweiOutBefore);
      console.log(" balanceweiOutAfter sovrynaddress: " + balanceweiOutAfter);
      const amountAll = amount1.add(amount2);
      const amountAllActual = balanceweiOutAfter.sub(balanceweiOutBefore);
      console.log( "amountAll: "  + amountAll);
      console.log( "amountAllActual: "  + amountAllActual);
      assert(amountAll.eq(amountAllActual));
     //console.log(" CrowdSale: " + balanceOut);
     // console.log(" Tokens witdhrawn to sovrynaddress: " + balanceOut);
     // consototali.sub(crowdsalesupply)
     // assert(balanceOut.eq(amount1.mul(web3.utils.toBN(rate))));
    });
    
  });

});
       //const actualMinPurchase = await crowdsale.minPurchase();
    //const actualMaxPurchase = await crowdsale.maxPurchase();
    //assert(end.eq(web3.utils.toBN(expectedEnd)));
   // assert(actualAvailableTokens.eq(web3.utils.toBN(crowdsalesupply)));
   // assert(actualMinPurchase.eq(web3.utils.toBN(minPurchase)));
   //});

    it.only(
      'full CrowdSale process: investors buy, admin release and withdraw', 
      async () => {
      const [investor1, investor2] = [accounts[1], accounts[2]];
      const [amount1, amount2] = [
        web3.utils.toBN(web3.utils.toWei('1')),
        web3.utils.toBN(web3.utils.toWei('10')),
      ];
      await crowdsale.whitelist(investor1);
      await crowdsale.whitelist(investor2);
      await crowdsale.buy({from: investor1, value: amount1}); 
      await crowdsale.buy({from: investor2, value: amount2}); 

      await expectRevert(
        crowdsale.release({from: investor1}),
        'only admin'
      );

      await expectRevert(
        crowdsale.release(),
        'CrowdSale must have ended'
      );

      await expectRevert(
        crowdsale.withdraw(accounts[9], 10),
        'CrowdSale must have ended'
      );

      // Admin release tokens to investors
      time.increaseTo(start + duration + 10);
      await crowdsale.release();
      const balance1 = await token.balanceOf(investor1);
      const balance2 = await token.balanceOf(investor2);
      assert(balance1.eq(amount1.mul(web3.utils.toBN(rate))));
      assert(balance2.eq(amount2.mul(web3.utils.toBN(rate))));

      await expectRevert(
        crowdsale.withdraw(accounts[9], 10, {from: investor1}),
        'only admin'
      );

      // Admin withdraw ether that was sent to the CrowdSale
      const balanceContract = web3.utils.toBN(
        await web3.eth.getBalance(token.address)
      );
      const balanceBefore = web3.utils.toBN(
        await web3.eth.getBalance(accounts[9])
      );
      await CrowdSale.withdraw(accounts[9], balanceContract);
      const balanceAfter = web3.utils.toBN(
        await web3.eth.getBalance(accounts[9])
      );
      assert(balanceAfter.sub(balanceBefore).eq(balanceContract));
    });
  });
*/
