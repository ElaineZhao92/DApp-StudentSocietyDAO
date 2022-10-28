import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://localhost:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0x68c7699696dfa8e9cdc790c797f5f1866ad76c464029bbcb87eabd72b3533b88',
        '0xaa122c0f5f56229259489b96d7f29c39a0ba11ff07c025467ee35b410bd5b74d',
        '0xaf2312d0a526b6f91acfdd75a64083b9d7b524eb18c9a687bd42a2d9e3873285',
        '0x9be1c55ae0fc1323df56767fa5ed829c64b74dbe516f2bd0e11487f17159dc61',
        '0xa98f2624b14e20af9761a21b1c9c5394050f135710d43ee95e93952abb6b8072'
      ]
    },
  },
};

export default config;
