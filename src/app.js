const ethers = require('ethers');
const { exit } = require('process');
const { SMART_CONTRACTS } = require("./configs");
const dotenvConfig = require('dotenv').config;
const resolve = require('path').resolve;
// import { resolve } from "path";
dotenvConfig({ path: resolve(__dirname, "../.env") });
const prompt = require('prompt-sync')({sigint: true});
const BOSON_ROUTER = require("./ABIs/BosonRouter.json");
const TOKEN_CONTRACT = require("./ABIs/ERC1155ERC721.json");




const product_price = '30000000000000000'; // 0.03
const seller_deposit = '5000000000000000'; // 0.005
const buyer_deposit = '4000000000000000'; // 0.004
const quantity = 5;
let tokenIdSupplyPolygon;
let tokenIdSupplyGoerli;
let polygonProvider;
let bosonRouterContractPolygon;
let goerliProvider;
let bosonRouterContractGoerli;
let sellerPrivateKey;
let sellerWalletPolygon;
let sellerWalletGoerli;
let buyerPrivateKey;
let buyerWalletPolygon;
let buyerWalletGoerli;


const main = async () => {

  polygonProvider = ethers.providers.getDefaultProvider(process.env.POLYGON_URI);
  //polygonProvider = ethers.providers.getDefaultProvider('http://127.0.0.1:8545');
  bosonRouterContractPolygon = new ethers.Contract(SMART_CONTRACTS.BosonRouterContractAddressPolygon, BOSON_ROUTER.abi, polygonProvider);
  tokenContractPolygon = new ethers.Contract(SMART_CONTRACTS.ERC1155721ContractAddressPolygon, TOKEN_CONTRACT.abi, polygonProvider);

  goerliProvider = ethers.providers.getDefaultProvider(process.env.GOERLI_URI);
  //goerliProvider = ethers.providers.getDefaultProvider('http://127.0.0.1:9545');
  bosonRouterContractGoerli = new ethers.Contract(SMART_CONTRACTS.BosonRouterContractAddressGoerli, BOSON_ROUTER.abi, goerliProvider);
  tokenContractGoerli = new ethers.Contract(SMART_CONTRACTS.ERC1155721ContractAddressGoerli, TOKEN_CONTRACT.abi, goerliProvider);

  sellerPrivateKey = process.env.SELLER_PRIVATE_KEY;
  sellerWalletPolygon = new ethers.Wallet(sellerPrivateKey, polygonProvider);
  sellerWalletPolygon.connect(polygonProvider);

  sellerWalletGoerli = new ethers.Wallet(sellerPrivateKey, goerliProvider);
  sellerWalletGoerli.connect(goerliProvider);

  buyerPrivateKey = process.env.BUYER_PRIVATE_KEY;
  buyerWalletPolygon = new ethers.Wallet(buyerPrivateKey, polygonProvider);
  buyerWalletPolygon.connect(polygonProvider);

  buyerWalletGoerli = new ethers.Wallet(buyerPrivateKey, goerliProvider);
  buyerWalletGoerli.connect(goerliProvider);

  console.log("sellerWalletPolygon address ", sellerWalletPolygon.address);
  console.log("buyerWalletPolygon address ", buyerWalletPolygon.address);

  const sellerPolgonBalance = await polygonProvider.getBalance(sellerWalletPolygon.address)
  console.log("sellerPolgonBalance address balance",sellerPolgonBalance.toString());

  const buyerPolgonBalance = await polygonProvider.getBalance(buyerWalletPolygon.address)
  console.log("buyerPolgonBalance address balance",buyerPolgonBalance.toString());

  const sellerGoerliBalance = await goerliProvider.getBalance(sellerWalletGoerli.address)
  console.log("sellerGoerliBalance address balance", sellerGoerliBalance.toString());

  const buyerGoerliBalance = await goerliProvider.getBalance(buyerWalletGoerli.address)
  console.log("buyerGoerliBalance address balance", buyerGoerliBalance.toString());

  try {

    /* Scenario
      •	create an order,
      •	display the ERC1155 balances for that supply on both network
      •	buy 3 times on Mumbai
      •	display the ERC1155 balances for that supply on both network
      •	wait for a input from the script launcher (prompt)
      •	buy 1 time again on Mumbai
      •	display the ERC1155 balances for that supply on both network
      •	wait for a input from the script launcher (prompt)
      •	display the ERC1155 balances for that supply on both network
    */
   
    //Seller creates Voucher Set with quanitity 5 on Polygon
    const createReceiptPolygon = await createOrderOnPolygon(sellerWalletPolygon);
    console.log("createReceiptPolygon tx hash in main ", createReceiptPolygon.transactionHash);
    console.log("********* POLYGON VOUCHER SET ID ******** ", tokenIdSupplyPolygon.toString());

    const correlationId = await bosonRouterContractPolygon.correlationIds(sellerWalletPolygon.address);
    console.log("Polygon correlationId ", correlationId.toString());

    
    //Seller creates Voucher Set with quanitity 5 on Goerli
    const createReceiptGoerli = await createOrderOnGoerli(sellerWalletGoerli);
    console.log("createReceiptGoerli tx hash in main ", createReceiptGoerli.transactionHash);
    console.log("********* GOERLI VOUCHER SET ID ******** ", tokenIdSupplyGoerli.toString());

    const correlationIdGoerli = await bosonRouterContractGoerli.correlationIds(sellerWalletGoerli.address);
    console.log("Goerli correlationId ", correlationIdGoerli.toString());

    //Display Balances
    await displayBalances(sellerWalletPolygon, sellerWalletGoerli);

    //Buyer commits to voucher on Polygon - 3 times
    const commitReceiptPolygon1 = await requestVoucherOnPolygon(tokenIdSupplyPolygon, sellerWalletPolygon.address, buyerWalletPolygon);
    console.log("commitReceiptPolygon1 tx hash in main ", commitReceiptPolygon1.transactionHash);

    const commitReceiptPolygon2 = await requestVoucherOnPolygon(tokenIdSupplyPolygon, sellerWalletPolygon.address, buyerWalletPolygon);
    console.log("commitReceiptPolygon2 tx hash in main ", commitReceiptPolygon2.transactionHash);

    const commitReceiptPolygon3 = await requestVoucherOnPolygon(tokenIdSupplyPolygon, sellerWalletPolygon.address, buyerWalletPolygon);
    console.log("commitReceiptPolygon3 tx hash in main ", commitReceiptPolygon3.transactionHash);

    //Display Balances
    await displayBalances(sellerWalletPolygon, sellerWalletGoerli);

    //Wait for user to trigger 4th commit
    const userResponseCommit = prompt('Commit to buy another voucher on Polygon? [Y/N]');

    if(userResponseCommit.toUpperCase() == 'Y') {
      const commitReceiptPolygon4 = await requestVoucherOnPolygon(tokenIdSupplyPolygon, sellerWalletPolygon.address, buyerWalletPolygon);
      console.log("commitReceiptPolygon4 tx hash in main ", commitReceiptPolygon4.transactionHash);
    }
   
    //Display Balances
    await displayBalances(sellerWalletPolygon, sellerWalletGoerli);

    //Wait for user to trigger display of balances again
    const userResponseBalances = prompt('Display balances again? [Y/N]');

    if(userResponseBalances.toUpperCase() == 'Y') {
      await displayBalances(sellerWalletPolygon, sellerWalletGoerli);
    }

    //Buyer commits to voucher on Goerli
    //const commitReceiptGoerli = await requestVoucherOnGoerli(tokenIdSupplyGoerli, sellerWalletGoerli.address, buyerWalletGoerli);
    //console.log("commitReceiptGoerli in main ", commitReceiptGoerli.transactionHash);


  } catch(err) {
    console.error(err);
  }

};

const createOrderOnPolygon = async (signer) => {
  console.log("**createOrderOnPolygon**");
  
  const latestBlock = await polygonProvider.getBlock('latest');
  const from = latestBlock.timestamp;
  const to = from + 2 * 24*3600; // 2 days

  const newContractInstance = bosonRouterContractPolygon.connect(signer);
  const txValue = ethers.BigNumber.from(seller_deposit).mul(quantity);
  const response = await newContractInstance.requestCreateOrderETHETH([
      from, to, product_price, seller_deposit, buyer_deposit, quantity
  ], 
    { 
      value: txValue
    });
  //console.log('Tx sent', response.hash);
  const receipt = await response.wait();
  //console.log('Tx validated', receipt.transactionHash);

  const events = await newContractInstance.queryFilter('LogOrderCreated', receipt.blockNumber, receipt.blockNumber);
  tokenIdSupplyPolygon = events[0].args[0];
  return receipt;
}

const requestVoucherOnPolygon  = async (tokenIdSupply, seller, signer) => {
  console.log("**requestVoucherOnPolygon**");

  const newContractInstance = bosonRouterContractPolygon.connect(signer);
  const txValue = ethers.BigNumber.from(product_price).add(buyer_deposit);
  const response = await newContractInstance.requestVoucherETHETH(tokenIdSupply, seller, { value: txValue});
  //console.log('Tx sent', response.hash);
  const receipt = await response.wait();
  //console.log('Tx validated', receipt.transactionHash);
  return receipt;
}


const createOrderOnGoerli = async (signer) => {
  console.log("**createOrderOnGoerli**");
  
  const latestBlock = await goerliProvider.getBlock('latest');
  const from = latestBlock.timestamp;
  const to = from + 2 * 24*3600; // 2 days
 
  const newContractInstance = bosonRouterContractGoerli.connect(signer);
  const txValue = ethers.BigNumber.from(seller_deposit).mul(quantity);
 
  const response = await newContractInstance.requestCreateOrderETHETH([
      from, to, product_price, seller_deposit, buyer_deposit, quantity
  ], 
    { 
      value: txValue
    });
  //console.log('Tx sent', response.hash);
  const receipt = await response.wait();
  //console.log('Tx validated', receipt.transactionHash);

  const events = await newContractInstance.queryFilter('LogOrderCreated', receipt.blockNumber, receipt.blockNumber);
  tokenIdSupplyGoerli = events[0].args[0];
  return receipt;
 
  
}

const requestVoucherOnGoerli  = async (tokenIdSupply, seller, signer) => {
  console.log("**requestVoucherOnGoerli**");

  const newContractInstance = bosonRouterContractGoerli.connect(signer);
  const txValue = ethers.BigNumber.from(product_price).add(buyer_deposit);
  const response = await newContractInstance.requestVoucherETHETH(tokenIdSupply, seller, { value: txValue});
  //console.log('Tx sent', response.hash);
  const receipt = await response.wait();
  //console.log('Tx validated', receipt.transactionHash);
  return receipt;

}

const displayBalances = async (sellerWalletPolygon, sellerWalletGoerli) => {
  console.log("**displayBalances**");
 
  const balancePolygon = await tokenContractPolygon.balances(tokenIdSupplyPolygon, sellerWalletPolygon.address);
  const balanceGoerli = await tokenContractGoerli.balances(tokenIdSupplyGoerli, sellerWalletGoerli.address);
  console.log("********* POLYGON VOUCHER SET QUANTITY ******** ", balancePolygon.toString());
  console.log("********* GOERLI  VOUCHER SET  QUANTITY ******** ", balanceGoerli.toString());
}

main().then(() => {
  exit(0);
}).catch(e => {
  console.error(e);
  exit(1);
});
  




