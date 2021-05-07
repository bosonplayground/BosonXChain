const ethers = require('ethers');
const { exit } = require('process');
const { SMART_CONTRACTS } = require("./configs");
const BOSON_ROUTER = require("./ABIs/BosonRouter.json");


//const polygonProvider = ethers.providers.getDefaultProvider('https://rpc-mumbai.maticvigil.com');
const polygonProvider = ethers.providers.getDefaultProvider('http://127.0.0.1:8545');
const bosonRouterContractPolygon = new ethers.Contract(SMART_CONTRACTS.BosonRouterContractAddressPolygon, BOSON_ROUTER.abi, polygonProvider);

//const arbitrumProvider = ethers.providers.getDefaultProvider('https://kovan4.arbitrum.io/rpc');
const arbitrumProvider = ethers.providers.getDefaultProvider('http://127.0.0.1:9545');
const bosonRouterContractAribtrum = new ethers.Contract(SMART_CONTRACTS.BosonRouterContractAddressArbitrum, BOSON_ROUTER.abi, arbitrumProvider);

const sellerPrivateKey = '0x6721aba63c0c5136863f26b63ece25944f1b163a44c5747d85bbf2e63adbfc75';
const sellerWallet = new ethers.Wallet(sellerPrivateKey, polygonProvider);
sellerWallet.connect(polygonProvider);

const sellerWalletArbitrum = new ethers.Wallet(sellerPrivateKey, arbitrumProvider);
sellerWalletArbitrum.connect(arbitrumProvider);


const buyerPrivateKey = '0xbf320154bb6e47e6369b75830e7d219918bdd4c735a88696f6320df4363687f9';
const buyerWallet = new ethers.Wallet(buyerPrivateKey, polygonProvider);
buyerWallet.connect(polygonProvider);

const buyerWalletArbitrum = new ethers.Wallet(sellerPrivateKey, arbitrumProvider);
buyerWalletArbitrum.connect(arbitrumProvider);

//TEST
const ganacheProvider = ethers.providers.getDefaultProvider('http://127.0.0.1:8545');
const bosonRouterContractGanache = new ethers.Contract(SMART_CONTRACTS.BosonRouterContractAddressGanache, BOSON_ROUTER.abi, ganacheProvider);
const sellerWalletGanache = new ethers.Wallet(sellerPrivateKey, ganacheProvider);
sellerWalletGanache.connect(ganacheProvider);


console.log("sellerWallet address ", sellerWallet.address);
console.log("buyerWallet address ", buyerWallet.address);
//console.log("seller wallet provider ", sellerWallet.provider);
//console.log("arbitrum contract provider ", bosonRouterContractAribtrum.provider);



const product_price = '30000000000000000'; // 0.03
const seller_deposit = '5000000000000000'; // 0.005
const buyer_deposit = '4000000000000000'; // 0.004
const quantity = 5;
let tokenIdSupplyPolygon;
let tokenIdSupplyArbitrum;




const main = async () => {

  const sellerBalance = await polygonProvider.getBalance(sellerWallet.address)
  console.log("sellerWallet address balance",sellerBalance.toString());

  const sellerArbitrumBalance = await arbitrumProvider.getBalance(sellerWalletArbitrum.address)
  console.log("sellerWalletArbitrum address balance", sellerArbitrumBalance.toString());

  try {
   
    //Seller creates Voucher Set on Polygon
    const createReceiptPolygon = await createOrderOnPolygon(sellerWallet);
 
    console.log("createReceiptPolygon tx hash in main ", createReceiptPolygon.transactionHash);
   // console.log("createReceiptPolygon in main ", createReceiptPolygon);
    console.log("tokenIdSupplyPolygon ", tokenIdSupplyPolygon.toString());

    const correlationId = await bosonRouterContractPolygon.correlationIds(sellerWallet.address);
    console.log("correlationId ", correlationId.toString());

    //Buyer commits to voucher on Polygon
    const commitReceiptPolygon = await requestVoucherOnPolygon(tokenIdSupplyPolygon, sellerWallet.address, buyerWallet);
    console.log("commitReceiptPolygon tx hash in main ", commitReceiptPolygon.transactionHash);
    //console.log("commitReceiptPolygon in main ", commitReceiptPolygon);

    
    //Seller creates Voucher Set on Arbitrum
    console.log("sellerWalletArbitrum address ", sellerWalletArbitrum.address);

    const createReceiptArbitrum = await createOrderOnArbitrum(sellerWalletArbitrum);
    console.log(" createReceiptArbitrumtx hash in main ", createReceiptArbitrum.transactionHash);
    console.log("tokenIdSupplyArbitrum ", tokenIdSupplyArbitrum.toString());

    const correlationIdArbitrum = await bosonRouterContractAribtrum.correlationIds(sellerWallet.address);
    console.log("correlationIdArbitrum ", correlationIdArbitrum.toString());

    //Buyer commits to voucher on Arbitrum
    const commitReceiptArbitrum = await requestVoucherOnArbitrum(tokenIdSupplyArbitrum, sellerWalletArbitrum.address, buyerWalletArbitrum);
    console.log("commitReceiptArbitrum in main ", commitReceiptArbitrum.transactionHash);


  } catch(err) {
    console.error(err);
  }
 
};

const createOrderOnPolygon = async (signer) => {
  console.log("inside createOrderOnPolygon");
  
  const latestBlock = await polygonProvider.getBlock('latest');
  const from = latestBlock.timestamp;
  const to = from + 2 * 24*3600; // 2 days

  //const newContractInstance = bosonRouterContractPolygon.connect(signer);
  const newContractInstance = bosonRouterContractAribtrum.connect(signer);
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
  //console.log("events ", events);
  console.log("events args ", events[0].args[0].toString());
  tokenIdSupplyPolygon = events[0].args[0];
  return receipt;
}

const requestVoucherOnPolygon  = async (tokenIdSupply, seller, signer) => {
  console.log("inside requestVoucherOnPolygon");

  const newContractInstance = bosonRouterContractPolygon.connect(signer);
  const txValue = ethers.BigNumber.from(product_price).add(buyer_deposit);
  const response = await newContractInstance.requestVoucherETHETH(tokenIdSupply, seller, { value: txValue});
  console.log('Tx sent', response.hash);
  const receipt = await response.wait();
  console.log('Tx validated', receipt.transactionHash);
  return receipt;
}

const createOrderOnArbitrum = async (signer) => {
  console.log("inside createOrderOnArbitrum ");
  
  const latestBlock = await arbitrumProvider.getBlock('latest');
  const from = latestBlock.timestamp;
  const to = from + 2 * 24*3600; // 2 days

  console.log("latestBlock Arbitrum", latestBlock);
  console.log("from ", from);
  console.log("to ", to);
 
  const newContractInstance = bosonRouterContractAribtrum.connect(signer);
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
  console.log("events ", events);
  console.log("events args ", events[0].args[0].toString());
  tokenIdSupplyArbitrum = events[0].args[0];
  return receipt;
 
  
}

const requestVoucherOnArbitrum  = async (tokenIdSupply, seller, signer) => {
  console.log("inside requestVoucherOnArbitrum");

  const newContractInstance = bosonRouterContractAribtrum.connect(signer);
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
  




