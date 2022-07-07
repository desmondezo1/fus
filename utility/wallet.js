import WalletConnectProvider from '@walletconnect/web3-provider'
import { ethers, providers  } from "ethers";
import Web3Modal from "web3modal";
import * as contractABI from './FusionStaking.json'
import * as tokenABI from './testToken.json'


//import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

//const INFURA_ID = '460f40a260564ac4a4f4b3fffb032dad'; //replace ID with yours
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;
const INFURA_ID = '460f40a260564ac4a4f4b3fffb032dad'; //replace ID with yours

const providerOptions = {
    binancechainwallet: {
        package: true
      },
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          infuraId:  INFURA_ID // required
        }
      },
    }
  var web3Modal;
  if (typeof window !== "undefined") {
    web3Modal = new Web3Modal({
    // network: "mainnet", // optional
    cacheProvider: true, // optional
    providerOptions // required
  });

  //web3Modal = newWeb3Modal;
  }

export const disconnect = async () => {
    await web3Modal.clearCachedProvider();
  };

export const listenForChain = async () => {
  let provider = await getProvider();
  provider.on("chainChanged", (chainId) => {
    console.log(chainId);
    return chainId;
  });
}
  

export const getProvider = async () => {
  const provider = await web3Modal.connect();
  return provider;
}

export const switchNetwork = async () =>{
  if (typeof window !== "undefined") {
    console.log('it entersheretoo')
    if (window.ethereum.networkVersion !== CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.utils.hexlify(CHAIN_ID) }]
        });
      } catch (err) {
          // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
          console.log(err.message)
          // await window.ethereum.request({
          //   method: 'wallet_addEthereumChain',
          //   params: [
          //     {
          //       chainName: 'Polygon Mainnet',
          //       chainId: ethers.utils.hexlify(CHAIN_ID),
          //       nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
          //       rpcUrls: ['https://polygon-rpc.com/']
          //     }
          //   ]
          // });
        }
      }
    }
  }
}

export const connectWallet = async () => {

    try {
        const provider = await web3Modal.connect();
        // const provider = await web3Modal.toggleModal();
        const library = new ethers.providers.Web3Provider(provider);
        const accounts = await library.listAccounts();
        const network = await library.getNetwork();  
        return accounts;

    } catch (error) {
        console.log(error.message)  
    }
 
}


export const getContract = async ()=> {
  const instance = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(instance);
  const signer = provider.getSigner();
  const staking = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
  return staking;
}

export const getTokenContract = async () => {
  const instance = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(instance);

  // Subscribe to chainId change
  provider.on("chainChanged", (CHAIN_ID) => {
    console.log(CHAIN_ID);
  });

  const signer = provider.getSigner();
  const tokencontract = new ethers.Contract("0x82282A97D0EF41e0631046273C187Eb7AE7742B9", tokenABI.abi, signer);
  return tokencontract;
}

export const convertToWei = async (val) => {
  let res = await ethers.utils.parseEther(val);
  return res;
}
export const convertToEther = (val) => {
  let res = ethers.utils.formatEther(val);
  return res;
}

export const getWalletBalance = async (address) =>{
  let acc = await connectWallet();
  let contract = await getTokenContract();
  let val = await contract.balanceOf(acc[0]);
  let balance = ethers.utils.formatEther(val);
  return balance;
}


export default {switchNetwork, getProvider, listenForChain, connectWallet, disconnect, getContract, getTokenContract, convertToWei, getWalletBalance, convertToEther, CONTRACT_ADDRESS };