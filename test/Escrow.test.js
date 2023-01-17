const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

let tokenURI =
  "https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS";

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Escrow", () => {
  // Local Variables
  let seller, inspector, buyer, lender;
  let realEstate, escrow;

  beforeEach(async () => {
    // const account = await ethers.getSigners();
    // account.map(async (item) => {
    //   const balance = await item.getBalance();
    //   console.log(item.address, balance.toString());
    // });

    // Setup accounts
    [seller, inspector, buyer, lender] = await ethers.getSigners();

    // Deploy Real Estate
    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();
    // console.log(`Deploy RealEstate contract on : ${realEstate.address}`);

    // Mint
    let transaction = await realEstate.connect(seller).mint(tokenURI);
    await transaction.wait();

    // Deploy Escrow
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(
      realEstate.address,
      seller.address,
      inspector.address,
      lender.address
    );
    // console.log(`Deploy Escrow contract on ${escrow.address}`);

    // Approve Property
    transaction = await realEstate.connect(seller).approve(escrow.address, 1);
    await transaction.wait();

    // List Property
    transaction = await escrow.connect(seller).list(1);
    await transaction.wait();
  });

  describe("Development", () => {
    it("Return Nft Address", async () => {
      const result = await escrow.nftAddress();
      // expect(result).to.be.equal(realEstate.address);
      assert(result, realEstate.address);
    });

    it("Return Seller Address", async () => {
      const result = await escrow.seller();
      assert(result, seller.address);
    });

    it("Return Inspector Address", async () => {
      const result = await escrow.inspector();
      // expect(result).to.be.equal(inspector.address);
      assert(result, inspector.address);
    });

    it("Return Lender Address", async () => {
      const reuslt = await escrow.lender();
      assert(reuslt, lender.address);
    });
  });

  describe("Listing", () => {
    it("Update as listed", async () => {
      const result = await escrow.isListed(1);
      assert(result);
    });

    it("Update Ownership", async () => {
      expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address);
    });
  });
});
