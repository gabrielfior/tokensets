// polygon token set - https://www.tokensets.com/v2/set/polygon/0xe33b2d6b288c749431c9c955093bb0d50365f473

// rebalance - put everything in USDC
const hre = require("hardhat");
//const rebalance_utils = require("@setprotocol/index-rebalance-utils/dist/index-rebalances/utils/rebalanceLib.js");



async function main() {
  
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


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


// ToDo - Execute trades