// context/Web3Modal.tsx

"use client";

import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";

// Your WalletConnect Cloud project ID
export const projectId = "ce3ca2a447ad88be348005e3db266d46";

// 2. Set chains
const mainnet = {
  chainId: 11155111,
  name: "Sepolia Testnet",
  currency: "ETH",
  explorerUrl: "https://sepolia.etherscan.io/",
  rpcUrl: "https://1rpc.io/sepolia",
};

// 3. Create a metadata object
const metadata = {
  name: "SecuredWal",
  description: "SecuredWal",
  url: "https://sec-wal.vercel.app/", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,
  auth: {
    email: true, // default to true
    socials: [
      "google",
      "x",
      "github",
      "discord",
      "apple",
      "facebook",
      "farcaster",
    ],
    showWallets: true, // default to true
    walletFeatures: true, // default to true
  },
  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: "...", // used for the Coinbase SDK
  defaultChainId: 1, // used for the Coinbase SDK
});

// 5. Create a Web3Modal instance
createWeb3Modal({
  ethersConfig,
  chains: [mainnet],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true, // Optional - false as default
});

export function Web3Modal({ children }: any) {
  return children;
}
