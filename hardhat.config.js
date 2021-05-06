require("@nomiclabs/hardhat-waffle");


const dotenvConfig = require('dotenv').config;
// import { config as dotenvConfig } from "dotenv";
const resolve = require('path').resolve;
// import { resolve } from "path";
dotenvConfig({ path: resolve(__dirname, "./.env") });

if (!process.env.MNEMONIC) {
    throw new Error("Please set your MNEMONIC in a .env file");
}

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.7.1",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10
      }
    }
  },
  networks: {
    ganache: {
      chainId: 1337,
      url: "http://127.0.0.1:8545",
      accounts: {
          count: 10,
          initialIndex: 0,
          mnemonic: process.env.MNEMONIC,
          path: "m/44'/60'/0'/0",
      },
    },
    mumbai: {
      chainId: 80001,
      url: `https://rpc-mumbai.matic.today`,
      accounts: {
          count: 10,
          initialIndex: 0,
          mnemonic: process.env.MNEMONIC,
          path: "m/44'/60'/0'/0",
      },
    },
    arbitrumTestnet: {
      url: 'https://kovan4.arbitrum.io/rpc',
      accounts: {
        count: 10,
        initialIndex: 0,
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/60'/0'/0",
    },
      gasPrice: 0,
    },
  },
  mocha: {
    timeout: 20000
  }
};

