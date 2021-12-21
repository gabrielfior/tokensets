// polygon token set - https://www.tokensets.com/v2/set/polygon/0xe33b2d6b288c749431c9c955093bb0d50365f473

// rebalance - put everything in USDC
const rebalance_utils = require("@setprotocol/index-rebalance-utils/dist/index-rebalances/utils/rebalanceLib.js");


task("rebalance", "Rebalances set", async (taskArgs, hre) => {

  let setTokenAddress = "0xe33b2d6b288c749431c9c955093bb0d50365f473";

  let new_weights = { 'WETH': '0.1', 'WBTC': '0.0', 'USDC': '0.9' }
  let protocolViewerAddress = '0x8D5CF870354ffFaE0586B639da6D4E4F6C659c69';

  const protocolViwerContract = await hre.ethers.getContractAt("ProtocolViewer", protocolViewerAddress);
  const details = (await protocolViwerContract.getSetDetails(setTokenAddress, []))[5];
  console.log('SetDetails', details);

  // These addresses are returned from set check-summed (e.g. mixed case). Using same format
  // here for string comparison's sake.
  const wbtcAddress = '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6';
  const usdcAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
  const wethAddress = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619';

  let strategyInfo =
  {
    "WBTC": {
      address: wbtcAddress,
      input: hre.ethers.utils.parseUnits(new_weights.WBTC, "ether"),
      unit: details.find(detail => detail.component === wbtcAddress).unit
    },
    "USDC": {
      address: usdcAddress,
      input: hre.ethers.utils.parseUnits(new_weights.USDC, "ether"),
      unit: details.find(detail => detail.component === usdcAddress).unit
    },
    "WETH": {
      address: wethAddress,
      input: hre.ethers.utils.parseUnits(new_weights.WETH, "ether"),
      unit: details.find(detail => detail.component === wethAddress).unit
    },
  }

  // ToDo - Get prices from Coingecko
  assets = {
    'WETH': {
      address: strategyInfo['WETH'].address,
      price: hre.ethers.utils.parseUnits("4000.0", "ether"), // 18 decimal market price in USD, we source these from coingecko
      decimals: hre.ethers.BigNumber.from(10).pow(18), // exponentiated decimals
      maxTradeSize: hre.ethers.utils.parseUnits("10000.0", "ether") // you can set this to a large number, it won't matter in your case
    },
    'USDC': {
      address: strategyInfo['USDC'].address,
      price: hre.ethers.utils.parseUnits("47000.0", "ether"), // 18 decimal market price in USD, we source these from coingecko
      decimals: hre.ethers.BigNumber.from(10).pow(6),
      maxTradeSize: hre.ethers.utils.parseUnits("10000.0", "ether") // you can set this to a large number, it won't matter in your case
    },
    'WBTC': {
      address: strategyInfo['WBTC'].address,
      price: hre.ethers.BigNumber.from('12345678911121314'), // 18 decimal market price in USD, we source these from coingecko
      decimals: hre.ethers.BigNumber.from(10).pow(8),
      maxTradeSize: hre.ethers.utils.parseUnits("10000.0", "ether") // you can set this to a large number, it won't matter in your case
    },
  }

  // details[5];
  const setTokenInstance = await hre.ethers.getContractAt("SetToken", setTokenAddress);
  const totalSupply = await setTokenInstance.totalSupply();

  console.log('got here', totalSupply);

  console.log(strategyInfo);

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

module.exports = {}
// ToDo - Execute trades