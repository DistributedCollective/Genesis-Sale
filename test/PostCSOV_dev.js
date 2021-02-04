//const { expectRevert, increaseTime } = require('@openzeppelin/test-helpers');
const { expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const PostCSOV = artifacts.require('post/PostCSOV.sol');
const CSOVToken = artifacts.require('main/CSOVToken.sol');


contract('PostCSOV', (accounts) => {
  let postcsov;
  let token;
  let tokenAddr;
  let postcsovAddr;
  
  const owner = accounts[5]; 
  const csovAdmin = accounts[6]; 
  const amountUser = web3.utils.toWei('3');
  console.log("Owner: " + owner);
  
  const totalSupply = web3.utils.toWei('2000000')
  const pricsSats = '2500';

  beforeEach (async () => {
//deploy CSOVToken
  token = await CSOVToken.new(totalSupply, csovAdmin, {from: owner});
  tokenAddr = await token.address;

    await token.transfer(accounts[2], amountUser, { from: csovAdmin });
  
  let CSOVAmountWei = await token.balanceOf(accounts[2]);
  console.log("CSOVAmountWei: " + CSOVAmountWei);

//deploy PostCSOV
  postcsov = await PostCSOV.new(tokenAddr,pricsSats, {from: owner});      
  console.log(tokenAddr + "  " + pricsSats );
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
      
      let CSOVAmountWei = await token.balanceOf(accounts[2]);
      console.log("CSOVAmountWei: " + CSOVAmountWei);

      let tx = await postcsov.reImburse(accounts[2]);

      let rbtcAmount = (CSOVAmountWei * pricsSats)/(10 ** 10);
      console.log("rbtcAmount: " + rbtcAmount);

      expectEvent(tx, 'CSOVReImburse', {
        from: accounts[2],
        CSOVamount: '3000000000000000000',
        reImburseAmount: '750000000000'
      });
    });

    it('should NOT reImburse twice', async () => {
      const amount = web3.utils.toWei('3');
      let postBudget = await postcsov.budget();
      console.log("postBudget: " + postBudget);

      await postcsov.deposit({from: accounts[1], value: amount});
      
      postBudget = await postcsov.budget();
      console.log("postBudget: " + postBudget);
      
      let CSOVAmountWei = await token.balanceOf(accounts[2]);
      console.log("CSOVAmountWei: " + CSOVAmountWei);

      let tx = await postcsov.reImburse(accounts[2]);

      let rbtcAmount = (CSOVAmountWei * pricsSats)/(10 ** 10);
      console.log("rbtcAmount: " + rbtcAmount);

      await expectRevert(
        postcsov.reImburse(accounts[3]),
        "holder has no CSOV"
      );

      expectEvent(tx, 'CSOVReImburse', {
        from: accounts[2],
        CSOVamount: '3000000000000000000',
        reImburseAmount: '750000000000'
      });

      await expectRevert(
        postcsov.reImburse(accounts[2]),
        "Address cannot be processed twice"
      );
    });
    
    it('should not reImburse if user has no CSOV', async () => {
      let postBudget = await postcsov.budget();
      console.log("postBudget: " + postBudget);

      let CSOVAmountWei = token.balanceOf(accounts[3]);
      
      postBudget = await postcsov.budget();
      console.log("postBudget: " + postBudget);
      console.log("CSOVAmountWei: " + CSOVAmountWei);

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

  