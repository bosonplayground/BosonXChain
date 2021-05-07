const ethers = require('ethers');
const { exit } = require('process');
const { SMART_CONTRACTS } = require("./configs");
const dotenvConfig = require('dotenv').config;
const resolve = require('path').resolve;
// import { resolve } from "path";
dotenvConfig({ path: resolve(__dirname, "../.env") });
const BOSON_ROUTER = require("./ABIs/BosonRouter.json");




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
let sellerWallet;
let sellerWalletGoerli;
let buyerPrivateKey;
let buyerWallet;
let buyerWalletGoerli;


const main = async () => {

  polygonProvider = ethers.providers.getDefaultProvider(process.env.POLYGON_URI);
  bosonRouterContractPolygon = new ethers.Contract(SMART_CONTRACTS.BosonRouterContractAddressPolygon, BOSON_ROUTER.abi, polygonProvider);

  goerliProvider = ethers.providers.getDefaultProvider(process.env.GOERLI_URI);
  bosonRouterContractGoerli = new ethers.Contract(SMART_CONTRACTS.BosonRouterContractAddressGoerli, BOSON_ROUTER.abi, goerliProvider);

  sellerPrivateKey = process.env.SELLER_PRIVATE_KEY;
  sellerWallet = new ethers.Wallet(sellerPrivateKey, polygonProvider);
  sellerWallet.connect(polygonProvider);

  sellerWalletGoerli = new ethers.Wallet(sellerPrivateKey, goerliProvider);
  sellerWalletGoerli.connect(goerliProvider);

  buyerPrivateKey = process.env.BUYER_PRIVATE_KEY;
  buyerWallet = new ethers.Wallet(buyerPrivateKey, polygonProvider);
  buyerWallet.connect(polygonProvider);

  buyerWalletGoerli = new ethers.Wallet(buyerPrivateKey, goerliProvider);
  buyerWalletGoerli.connect(goerliProvider);

  console.log("sellerWallet address ", sellerWallet.address);
  console.log("buyerWallet address ", buyerWallet.address);

  const sellerPolgonBalance = await polygonProvider.getBalance(sellerWallet.address)
  console.log("sellerPolgonBalance address balance",sellerPolgonBalance.toString());

  const buyerPolgonBalance = await polygonProvider.getBalance(buyerWallet.address)
  console.log("buyerPolgonBalance address balance",buyerPolgonBalance.toString());

  const sellerGoerliBalance = await goerliProvider.getBalance(sellerWalletGoerli.address)
  console.log("sellerGoerliBalance address balance", sellerGoerliBalance.toString());

  const buyerGoerliBalance = await goerliProvider.getBalance(buyerWalletGoerli.address)
  console.log("buyerGoerliBalance address balance", buyerGoerliBalance.toString());

  try {
   
    //Seller creates Voucher Set on Polygon
    const createReceiptPolygon = await createOrderOnPolygon(sellerWallet);
    console.log("createReceiptPolygon tx hash in main ", createReceiptPolygon.transactionHash);
    console.log("tokenIdSupplyPolygon ", tokenIdSupplyPolygon.toString());

    const correlationId = await bosonRouterContractPolygon.correlationIds(sellerWallet.address);
    console.log("correlationId ", correlationId.toString());

    //Buyer commits to voucher on Polygon
    const commitReceiptPolygon = await requestVoucherOnPolygon(tokenIdSupplyPolygon, sellerWallet.address, buyerWallet);
    console.log("commitReceiptPolygon tx hash in main ", commitReceiptPolygon.transactionHash);

    //Seller creates Voucher Set on Goerli
    const createReceiptGoerli = await createOrderOnGoerli(sellerWalletGoerli);
    console.log("createReceiptGoerli tx hash in main ", createReceiptGoerli.transactionHash);
    console.log("tokenIdSupplyGoerli ", tokenIdSupplyGoerli .toString());

    const correlationIdGoerli = await bosonRouterContractGoerli.correlationIds(sellerWalletGoerli.address);
    console.log("correlationIdGoerli ", correlationIdGoerli.toString());

    //Buyer commits to voucher on Goerli
    const commitReceiptGoerli = await requestVoucherOnGoerli(tokenIdSupplyGoerli, sellerWalletGoerli.address, buyerWalletGoerli);
    console.log("commitReceiptGoerli in main ", commitReceiptGoerli.transactionHash);


  } catch(err) {
    console.error(err);
  }

};

const createOrderOnPolygon = async (signer) => {
  console.log("createOrderOnPolygon");
  
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
  console.log('Tx sent', response.hash);
  const receipt = await response.wait();
  console.log('Tx validated', receipt.transactionHash);

  const events = await newContractInstance.queryFilter('LogOrderCreated', receipt.blockNumber, receipt.blockNumber);
  console.log("events args ", events[0].args[0].toString());
  tokenIdSupplyPolygon = events[0].args[0];
  return receipt;
}

const requestVoucherOnPolygon  = async (tokenIdSupply, seller, signer) => {
  console.log("requestVoucherOnPolygon");

  const newContractInstance = bosonRouterContractPolygon.connect(signer);
  const txValue = ethers.BigNumber.from(product_price).add(buyer_deposit);
  const response = await newContractInstance.requestVoucherETHETH(tokenIdSupply, seller, { value: txValue});
  console.log('Tx sent', response.hash);
  const receipt = await response.wait();
  console.log('Tx validated', receipt.transactionHash);
  return receipt;
}


const createOrderOnGoerli = async (signer) => {
  console.log("createOrderOnGoerli");
  
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
  console.log('Tx sent', response.hash);
  const receipt = await response.wait();
  console.log('Tx validated', receipt.transactionHash);

  const events = await newContractInstance.queryFilter('LogOrderCreated', receipt.blockNumber, receipt.blockNumber);
  tokenIdSupplyGoerli = events[0].args[0];
  return receipt;
 
  
}

const requestVoucherOnGoerli  = async (tokenIdSupply, seller, signer) => {
  console.log("requestVoucherOnGoerli");

  const newContractInstance = bosonRouterContractGoerli.connect(signer);
  const txValue = ethers.BigNumber.from(product_price).add(buyer_deposit);
  const response = await newContractInstance.requestVoucherETHETH(tokenIdSupply, seller, { value: txValue});
  console.log('Tx sent', response.hash);
  const receipt = await response.wait();
  console.log('Tx validated', receipt.transactionHash);
  return receipt;

}

main().then(() => {
  exit(0);
}).catch(e => {
  console.error(e);
  exit(1);
});
  




