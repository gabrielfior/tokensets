require("@nomiclabs/hardhat-waffle");
require("./scripts/rebalance-polygon-tokenset");

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

  // Note: this may need to be adapted for Windows paths OR delete and copy
  // node_modules/@setprotocol/set-protocol-v2/artifacts into project root.
  paths: {
    artifacts: "./node_modules/@setprotocol/set-protocol-v2/artifacts"
  },
};
