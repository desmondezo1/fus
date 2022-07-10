import WalletConnectProvider from '@walletconnect/web3-provider'
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers, providers  } from "ethers";
import Web3 from "web3";
import Web3Modal from "web3modal";
import { toast } from 'react-toastify';
import * as contractABI from './FusionStaking.json'
import * as tokenABI from './testToken.json'


//import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

// const INFURA_ID = '460f40a260564ac4a4f4b3fffb032dad'; //replace ID with yours
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;
const ENV =  process.env.NEXT_PUBLIC_ENV;
let rpcNode;



if(ENV !== 'production'){
  rpcNode = {
    97: 'https://data-seed-prebsc-1-s1.binance.org:8545'
  }
}else{
  rpcNode = {
    56: 'https://bsc-dataseed4.binance.org'
  }
}
const INFURA_ID = '460f40a260564ac4a4f4b3fffb032dad'; //replace ID with yours
let ethereum ;
// const provider = await detectEthereumProvider();

if (typeof window !== "undefined") {
   let { ethereum } = window;  
}

let currentAccount = null;

/// get provider 
// connect to wallet

export const getProvider = async () => {
  // const provider = new ethers.providers.Web3Provider(ethereum);
  // if(!provider){
    if (typeof window !== "undefined") {
      let { ethereum } = window; 
      if(ethereum){
        let provider = await detectEthereumProvider();
        return provider;
      }
   }
    
}

export const connectWithWalletConnect = async () => {
  

  try {
      console.log('started here');
      const provider = new WalletConnectProvider({
        infuraId: '460f40a260564ac4a4f4b3fffb032dad',
        rpc: {
          97: 'https://data-seed-prebsc-1-s1.binance.org:8545'
        },
      });

      await provider.enable();
      if(provider){
        
      const web3 = new Web3(provider);
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);
      return {account: accounts[0], prov: web3};
      // return accounts[0];
       //  Wrap with Web3Provider from ethers.js



      // const accounts = await web3Provider.eth.getAccounts().then((acc) =>{
      //   alert(JSON.stringify(acc));
      //   console.log(acc);
      //   return acc;
      // });
      // console.log(accounts);
      // return accounts[0];
      }
  } catch (error) {
      console.log({error})
  }
  
}

export async function checkNetwork(prov=null, istoast=true){
  if(!prov){
    // const { ethereum } = window;
    prov = await getProvider();
  }
  const web3 = new Web3(prov);
  const chainId = await web3.eth.getChainId();

    if (chainId !== +CHAIN_ID) {
      if (+CHAIN_ID == 56) {
        if(istoast){
          toast.info("Please switch network to BSC mainet ");
        }
      }

      if(+CHAIN_ID == 97){
        if (istoast) {
            toast.info("Please switch network to BSC Testnet ");
        }   
      }
      return false;
    }
    return true;
}

// export async function connectToMetaMask() {
//   let provider = await getProvider();
//   let acc = await provider.send("eth_requestAccounts", []);
//   return acc[0];
// }
export async function connectToMetaMask() {
  try {
    const { ethereum } = window;

    if (!ethereum) {
        alert("You need Metamask to use this Site, Please install MetaMask ☺️, Thank you!");
        return;
    }
    const prov = await getProvider();
    return prov.send("eth_requestAccounts", []).then((acc) => {
      return {account: acc.result[0], prov};
    });

  } catch (error) {
      console.log(error.message);
  }
}

// export function connectToMetaMask() {
//   if (typeof window !== "undefined") {
//   let { ethereum } = window;  

//   ethereum
//     .request({ method: 'eth_requestAccounts' })
//     .then(handleAccountsChanged)
//     .catch((error) => {
//       if (error.code === 4001) {
//         console.log('Please connect to MetaMask.');
//       } else {
//         console.error(error);
//       }
//     });
//    }
// }
// export const getProvider = async () => {
//   const provider = await web3Modal.connect();
//   return provider;
// }


export const removeCyclicRef = (object) =>{
  const visited = new WeakSet();

  const traverseData = (data) => {
    let result = Array.isArray(data) ? [] : {};
    if(visited.has(data)){
      return;
    }

    if(typeof data === "object"){
      visited.add(data);
      for(let key in data){
        const stageResult = traverseData(data[key]);
        if (stageResult) {
          result[key] = stageResult;
        }
      }
    } else{
      result = data;
    }
    return result;
  }
  return traverseData(object);
}

export function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    console.log('Please connect to MetaMask.');
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
    return accounts[0];
    // Do any other work!
  }
}


// export const connect = async () => {
//   await provider.send("eth_requestAccounts", []).then(()=>{

//   })
// }





// const providerOptions = {
//     binancechainwallet: {
//         package: true
//       },
//       walletconnect: {
//         package: WalletConnectProvider, // required
//         options: {
//           infuraId:  INFURA_ID // required
//         }
//       },
//     }
//   var web3Modal;
//   if (typeof window !== "undefined") {
//     web3Modal = new Web3Modal({
//     // network: "mainnet", // optional
//     cacheProvider: true, // optional
//     providerOptions // required
//   });

//   //web3Modal = newWeb3Modal;
//   }

export const disconnect = async (prov) => {

  
};




export const listenForChain = async () => {
  let provider = await getProvider();
  provider.on("chainChanged", (chainId) => {
    console.log(chainId);
    return chainId;
  });
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

// export const connectWallet = async () => {

//     try {
//         const provider = await web3Modal.connect();
//         // const provider = await web3Modal.toggleModal();
//         const library = new ethers.providers.Web3Provider(provider);
//         const accounts = await library.listAccounts();
//         const network = await library.getNetwork();  
//         return accounts;

//     } catch (error) {
//         console.log(error.message)  
//     }
 
// }
export const getContract = async (prov)=> {
  if(!prov){
    // const { ethereum } = window;
    prov = await getProvider();
  }
  const web3 = new Web3(prov);
  const staking = new web3.eth.Contract(contractABI.abi, CONTRACT_ADDRESS);
  // const provider = new ethers.providers.Web3Provider(prov);
  // const signer = provider.getSigner();
  // const provider = await getProvider();
  // const signer = provider.getSigner();
  // const staking = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
  return staking;
}


// export const getContract = async ()=> {
//   const instance = await web3Modal.connect();
//   const provider = new ethers.providers.Web3Provider(instance);
//   const signer = provider.getSigner();
//   const staking = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
//   return staking;
// }

// export const getTokenContract = async () => {
//   const instance = await web3Modal.connect();
//   const provider = new ethers.providers.Web3Provider(instance);

//   // Subscribe to chainId change
//   provider.on("chainChanged", (CHAIN_ID) => {
//     console.log(CHAIN_ID);
//   });

export const getTokenContract = async (prov) => {

  if(!prov){
    // const { ethereum } = window;
    prov = await getProvider();
  }
  const web3 = new Web3(prov);
  const tokencontract = new web3.eth.Contract(tokenABI.abi, "0x82282A97D0EF41e0631046273C187Eb7AE7742B9");

  // const provider = new ethers.providers.Web3Provider(prov);
  // const signer = provider.getSigner();
  // // const provider = await getProvider();
  // // Subscribe to chainId change
  // provider.on("chainChanged", (CHAIN_ID) => {
  //   console.log(CHAIN_ID);
  // });

  // const signer = provider.getSigner();
  // const tokencontract = new ethers.Contract("0x82282A97D0EF41e0631046273C187Eb7AE7742B9", tokenABI.abi, signer);
  return tokencontract;
}

export const convertToWei = async (val) => {
  let prov = await getProvider();
  const web3 = new Web3(prov);
  // return web3.utils.BN(val)
  // return web3.utils.fromWei(val, 'ether')
  return  Web3.utils.toWei(val, 'ether');
  // let res = await ethers.utils.parseEther(val);
  // return res;
}
export const convertToEther = async (val) => {
  let prov = await getProvider();
  const web3 = new Web3(prov);
  // return web3.utils.BN(val)
  return web3.utils.fromWei(val, 'ether')
  // let res = ethers.utils.formatEther(val);
  // return res;
}

export const getWalletBalance = async (address, prov=null) =>{
  // let acc = await connectWallet();
  let contract = await getTokenContract(prov);
  let val = await contract.methods.balanceOf(address).call();
  let balance = convertToEther(val);
  
  return balance;
}


export default {connectToMetaMask, checkNetwork, connectWithWalletConnect, switchNetwork, getProvider, listenForChain, disconnect, getContract, getTokenContract, convertToWei, getWalletBalance, convertToEther, CONTRACT_ADDRESS };