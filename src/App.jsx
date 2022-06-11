import React from "react";
import { useEffect, useState } from 'react'
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

export default function App() {

  /*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = useState("");
  const [mostWavesAddress, setMostWavesAddress] = useState("");
  const [mostWaves, setMostWaves] = useState("");

  const [onRinkeby, setOnRinkeby] = useState("");
  
  /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const contractAddress = "0x4f1F54139B793b7E48fd8085B2Af3EDeB3Fc08Ec";
  /**
   * Create a variable here that references the abi content!
   */
  const contractABI = abi.abi;

 const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      ethereum.on('chainChanged', (_chainId) => window.location.reload());
      ethereum.on('accountsChanged', (accounts) => {
      // If user has locked/logout from MetaMask, this resets the accounts array to empty
      if (!accounts.length) {
        window.location.reload();
      }
});

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
        setOnRinkeby(await ethereum.request({ method: 'eth_chainId' }) == "0x4");
        updateMostWaves();
      }
      
      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      updateMostWaves();

    } catch (error) {
      console.log(error)
    }
  }

const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        updateMostWaves();
        
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const switchToRinkeby = async () => {
      try {
      const { ethereum } = window;

      if (ethereum) {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: "0x4" }]
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const updateMostWaves = async() => {
    try {
      const { ethereum } = window;
      
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const [ address, waves ] = await wavePortalContract.getMostWaves();
        console.log(address.toString(), "has waved the most at", waves.toNumber(), "times!");
        setMostWavesAddress(address.toString());
        setMostWaves(waves.toNumber());
        }
    } catch (error) {
      console.log(error);
    }
  }

  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Wave at me!
        </div>

        <div className="bio">
        I am Alex and I am learning solidity. Connect your Rinkeby wallet and wave at me!
        </div>

        {currentAccount && onRinkeby && (
          <button className="waveButton" onClick={wave}>
          Wave at Me
          </button>
        )}

        {currentAccount && onRinkeby && (
          <div className="bio">
            { mostWavesAddress } has waved the most at { mostWaves } times!
          </div>
        )}

        {currentAccount && !onRinkeby && (
          <button className="waveButton" onClick={switchToRinkeby}>
          Switch to Rinkeby
          </button>
        )}

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
