//const { expectRevert, increaseTime } = require('@openzeppelin/test-helpers');
const { expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const PostCSOV = artifacts.require('post/PostCSOV.sol');
const CSOVToken = artifacts.require('main/CSOVToken.sol');


contract('PostCSOV', (accounts) => {
  let postcsov;
  let token1;
  let token2;
  let tokenAddr;
  let postcsovAddr;
  
  const owner = accounts[5]; 
  const csovAdmin = accounts[6]; 
  const amountUser = web3.utils.toWei('3');
  console.log("Owner: " + owner);
  
  const totalSupply = web3.utils.toWei('2000000')
  const pricsSats = '2500';

  beforeEach (async () => {
//deploy CSOVToken1
  token1 = await CSOVToken.new(totalSupply, csovAdmin, {from: owner});
  tokenAddr1 = await token1.address;

    await token1.transfer(accounts[2], amountUser, { from: csovAdmin });
  
  let CSOVAmountWei = await token1.balanceOf(accounts[2]);
  console.log("CSOVAmountWei: " + CSOVAmountWei);

//deploy CSOVToken2
  token2 = await CSOVToken.new(totalSupply, csovAdmin, {from: owner});
  tokenAddr2 = await token2.address;

    await token2.transfer(accounts[2], amountUser, { from: csovAdmin });

   CSOVAmountWei = await token2.balanceOf(accounts[2]);
  console.log("CSOVAmountWei: " + CSOVAmountWei);  

//deploy PostCSOV
  postcsov = await PostCSOV.new([tokenAddr1, tokenAddr2],pricsSats, {from: owner});      
  console.log(tokenAddr1 + "  " + tokenAddr2 + "  " + pricsSats );
  postcsovAddr = await postcsov.address;
});

  describe("deposit funds", () => {
    it('should deposit', async () => {
      const amount = web3.utils.toWei('3');
      let postBudget = await postcsov.budget();
      console.log("postBudget: " + postBudget);

      await postcsov.deposit({from: accounts[1], value: amount});
      
      postBudget = await postcsov.budget();
      console.log("postBudget: " + postBudget);
    });
  });
  
  describe("reImburse", () => {
    it('should reImburse', async () => {
      const amount = web3.utils.toWei('3');
      let postBudget = await postcsov.budget();
      console.log("postBudget: " + postBudget);

      await postcsov.deposit({from: accounts[1], value: amount});
      
      postBudget = await postcsov.budget();
      console.log("postBudget: " + postBudget);
      
      let CSOVAmountWei1 = await token1.balanceOf(accounts[2]);
      console.log("CSOVAmountWei1: " + CSOVAmountWei1);

      let CSOVAmountWei2 = await token2.balanceOf(accounts[2]);
      console.log("CSOVAmountWei2: " + CSOVAmountWei2);


      let tx = await postcsov.reImburse(accounts[2]);

      let rbtcAmount = ((CSOVAmountWei1+CSOVAmountWei2) * pricsSats)/(10 ** 10);
      console.log("rbtcAmount: " + rbtcAmount);

      expectEvent(tx, 'CSOVReImburse', {
        from: accounts[2],
        CSOVamount: '6000000000000000000',
        reImburseAmount: '1500000000000'
      });
    });

    it('should NOT reImburse twice', async () => {
      const amount = web3.utils.toWei('3');
      let postBudget = await postcsov.budget();
      console.log("postBudget: " + postBudget);

      await postcsov.deposit({from: accounts[1], value: amount});
      
      postBudget = await postcsov.budget();
      console.log("postBudget: " + postBudget);
      
      let CSOVAmountWei1 = await token1.balanceOf(accounts[2]);
      console.log("CSOVAmountWei1: " + CSOVAmountWei1);

      let CSOVAmountWei2 = await token2.balanceOf(accounts[2]);
      console.log("CSOVAmountWei2: " + CSOVAmountWei2);

      let tx = await postcsov.reImburse(accounts[2]);

      let rbtcAmount = ((CSOVAmountWei1+CSOVAmountWei2) * pricsSats)/(10 ** 10);
      console.log("rbtcAmount: " + rbtcAmount);

      await expectRevert(
        postcsov.reImburse(accounts[3]),
        "holder has no CSOV"
      );

      expectEvent(tx, 'CSOVReImburse', {
        from: accounts[2],
        CSOVamount: '6000000000000000000',
        reImburseAmount: '1500000000000'
      });

      await expectRevert(
        postcsov.reImburse(accounts[2]),
        "Address cannot be processed twice"
      );
    });
    
    it('should not reImburse if user has no CSOV', async () => {
      let postBudget = await postcsov.budget();
      console.log("postBudget: " + postBudget);

      let CSOVAmountWei1 = await token1.balanceOf(accounts[3]);
      console.log("CSOVAmountWei1: " + CSOVAmountWei1);

      let CSOVAmountWei2 = await token2.balanceOf(accounts[3]);
      console.log("CSOVAmountWei2: " + CSOVAmountWei2);
      
      postBudget = await postcsov.budget();
      console.log("postBudget: " + postBudget);
      console.log("CSOVAmountWei1: " + CSOVAmountWei1);
      console.log("CSOVAmountWei2: " + CSOVAmountWei2);

      await expectRevert(
        postcsov.reImburse(accounts[3]),
        "holder has no CSOV"
      );
    });
  });

  describe("withdraw funds", () => {
    it('should withdraw', async () => {
      await expectRevert(
        postcsov.withdrawAll(accounts[4], {from: accounts[4]}),
        "Ownable: caller is not the owner."
      );
      
      let postBudget = await postcsov.budget();
      console.log("postBudget: " + postBudget);
        
      await postcsov.withdrawAll(accounts[4], {from: owner});
            
      postBudget = await postcsov.budget();
      console.log("postBudget: " + postBudget);

    });
  });
});

  