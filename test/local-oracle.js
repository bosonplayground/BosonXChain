// import "@nomiclabs/hardhat-waffle";
const { expect } = require("chai");
const { utils } = require("ethers");
const hre = require("hardhat")
const ethers = hre.ethers;
// import { expect } from "chai";

describe("LocalOracle", async() => {


    let erc1155;
    let localOracle;
    let account0;
    let account1;

    beforeEach(async() => {
        const addresses = await ethers.getSigners();
        [account0, account1] = addresses;
        const LocalOracle = await ethers.getContractFactory("LocalOracle");
        const ERC1155 = await ethers.getContractFactory("ERC1155ERC721")
        erc1155 = await (await ERC1155.deploy()).deployed()
        localOracle = await (await LocalOracle.deploy()).deployed();
        await localOracle.setERC1155(erc1155.address);
        await erc1155.setLocalOracleAddress(localOracle.address)

        // mint token
        await erc1155.tmint(account1.address, "213", "4", []);

    })


    it("should call helpme and check emitted event", async() => {
        await expect(localOracle.helpMe("1", account1.address, "123456"))
            .to.be.emit(localOracle, "HelpMe").withArgs("123456", account1.address)
    });

    it("should call provideHelp", async() => {
        await expect(localOracle.provideHelp("213", account1.address)).to.be.emit(localOracle, "ProvideHelp").withArgs("213", account1.address, "2")
    })

    it("should call helpReceived", async() => {
        await expect(localOracle.helpReceived("213", account1.address, "2")).to.be.emit(localOracle, "HelpReceived").withArgs("213", account1.address, "2")
    })

    it("should call help me when supply is low", async() => {
        await expect(erc1155.tburn(account1.address, "213", "3")).to.be.emit(localOracle, "HelpMe").withArgs("213", account1.address)
    })

    it("should provide help when help can be provided", async() => {
        // burn supply
        await expect(erc1155.tburn(account1.address, "213", "3")).to.be.emit(localOracle, "HelpMe").withArgs("213", account1.address)
            // mint 4 more to help
        await erc1155.tmint(account1.address, "213", "4", []);
        // initiate provide help
        await expect(localOracle.provideHelp("213", account1.address)).to.be.emit(localOracle, "ProvideHelp").withArgs("213", account1.address, "3")
            // help received on other chain
        await expect(localOracle.helpReceived("213", account1.address, "3")).to.be.emit(localOracle, "HelpReceived").withArgs("213", account1.address, "3")

    })



});