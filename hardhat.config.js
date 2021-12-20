require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("rebalance", "Rebalances set", async (taskArgs, hre) => {

  let setTokenAddress = "0xe33b2d6b288c749431c9c955093bb0d50365f473";

  let new_weights = { 'WETH': 0.1, 'WBTC': 0.0, 'USDC': 0.9 }
  let protocolViewerAddress = '0x8D5CF870354ffFaE0586B639da6D4E4F6C659c69';

  const protocolViwerContract = await hre.ethers.getContractAt("ProtocolViewer", protocolViewerAddress);
  const details = await protocolViwerContract.getSetDetails(setTokenAddress, []);
  console.log('SetDetails', details);

  let strategyInfo =
  {
    "WBTC": {
      address: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
      input: 0.,
      unit: 1 // retrieve from ProtocolViewer.getSetDetails
    },
    "USDC": {
      address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      input: 1 * 10 ^ 18, // will describe below
      unit: 1 // retrieve from ProtocolViewer
    },
    "WETH": {
      address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
      input: 0.,
      unit: 1 // retrieve from ProtocolViewer
    },
  }

  // ToDo - Get prices from Coingecko
  assets = {
    'WETH': {
      address: strategyInfo['WETH'].address,
      price: hre.ethers.BigNumber.from('012345678911121314'), // 18 decimal market price in USD, we source these from coingecko
      decimals: 18, // ex: 6
      maxTradeSize: hre.ethers.BigNumber.from('12345') // you can set this to a large number, it won't matter in your case
    },
    'USDC': {
      address: strategyInfo['USDC'].address,
      price: hre.ethers.BigNumber.from('100000'), // 18 decimal market price in USD, we source these from coingecko
      decimals: 6, // ex: 6
      maxTradeSize: hre.ethers.BigNumber.from('12345') // you can set this to a large number, it won't matter in your case
    },
    'WBTC': {
      address: strategyInfo['WBTC'].address,
      price: hre.ethers.BigNumber.from('012345678911121314'), // 18 decimal market price in USD, we source these from coingecko
      decimals: 8, // ex: 6
      maxTradeSize: hre.ethers.BigNumber.from('12345') // you can set this to a large number, it won't matter in your case
    },
  }

  // details[5];
  const setTokenInstance = await hre.ethers.getContractAt("SetToken", setTokenAddress);
  const totalSupply = await setTokenInstance.totalSupply();

  console.log('got here', totalSupply);

  const {
    strategyConstants,
    setTokenValue
  } = rebalance_utils.getRebalanceInputs(details, strategyInfo, assets);

  const allocations = await rebalance_utils.calculateNewMVIAllocations(
    totalSupply,
    strategyConstants,
    setTokenValue
  )
  console.log('allocations', allocations);



});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "polygon_main",
  networks: {
    polygon_main: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  solidity: "0.8.4",
  paths: {
    artifacts: ".\\node_modules\\@setprotocol\\set-protocol-v2\\artifacts"
  },
};
