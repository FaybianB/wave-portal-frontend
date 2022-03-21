import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
	const [totalWaves, setTotalWaves] = useState(0);
	const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);
  const contractAddress = "0x586C3019ab61c8D8fFE2f3E9db991B99BfB7022f";
  const contractABI = abi.abi;
	
	const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
				
        return;
      }
      
			console.log("We have the ethereum object", ethereum);

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        
				console.log("Found an authorized account:", account);
   
				setCurrentAccount(account);

				getTotalWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
	}

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
			
			getTotalWaves();
    } catch (error) {
      console.log(error)
    }
  }
	
	const wave = async () => {
		setIsProcessingTransaction(true);
		
    try {
      const { ethereum } = window;

      if (ethereum) {
				const wavePortalContract = getContract(ethereum);

				/*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
				
				getTotalWaves();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
		
		setIsProcessingTransaction(false);
	}

	const getTotalWaves = async () => {
		try {
      const { ethereum } = window;

      if (ethereum) {
				const wavePortalContract = getContract(ethereum);
		    const count = await wavePortalContract.getTotalWaves();
						
				console.log("Retrieved total wave count...", count.toNumber());
						
				setTotalWaves(count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
	}

	const getContract = (ethereum) => {
		const provider = new ethers.providers.Web3Provider(ethereum);
		const signer = provider.getSigner();
		const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

		return wavePortalContract;
 	}
	
  /*
  * This runs our function when the page loads.
  */
  useEffect(async () => {
  	checkIfWalletIsConnected();
  }, []);
	
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>
        <div className="bio">
        My name is Faybian and I've been a Full-Stack Software Engineer for 8+ years. My goal is to transition into Web3 and become a Blockchain / Solidity Contract Developer. My skill set and familiarity with Web3 tools, such as Javascript and React, allows me to easily transition into the space and make impactful contributions. This simple website is just to demonstrate my usage of basic Web3 functionality.
        </div>
				{
					currentAccount ? 
						<>
			        <button
								disabled={isProcessingTransaction}
								className={isProcessingTransaction ? "waveButtonProcessing" : "waveButton"}
								onClick={wave}
							>
								{isProcessingTransaction ? 'Processing transaction...' : 'Wave at Me'}
			        </button>
							<span className="waveCounter">Total Number of Waves: {totalWaves}</span>
						</>
					:
					<>
						<div className="connectMessage">
							Connect your Etheruem wallet and wave at me!
						</div>
	          <button className="waveButton" onClick={connectWallet}>
	            Connect Wallet
	          </button>
					</>
				}
      </div>
    </div>
  );
}
