const { expectRevert, time } = require('@openzeppelin/test-helpers');
const CrowdSale = artifacts.require('main/CrowdSale.sol');
const Token = artifacts.require('main/CSOVToken.sol');

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

  beforeEach(async () => {
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

/*
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
*/
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

    it('should calculate satRaised', async () => {
       const investor1 = accounts[1];
       const amount1 = web3.utils.toBN(web3.utils.toWei('0.2'));      
       await crowdsale.buy({from: investor1, value: amount1});
       let satraised = await crowdsale.satRaised();
       assert(satraised.eq(amount1));
       await crowdsale.buy({from: investor1, value: amount1});
       satraised = await crowdsale.satRaised();
       const sumvalue = amount1.add(amount1); 
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
      const balanceSatOutBefore = await web3.eth.getBalance(accounts[8]);
      await crowdsale.withdrawFunds({ from: accounts[9] });
      const balanceSatOutAfter = await web3.eth.getBalance(accounts[8]);
      console.log(" balanceSatOutBefore sovrynaddress: " + balanceSatOutBefore);
      console.log(" balanceSatOutAfter sovrynaddress: " + balanceSatOutAfter);
      const amountAll = amount1.add(amount2);
      const amountAllActual = balanceSatOutAfter.sub(balanceSatOutBefore);
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
/*
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
