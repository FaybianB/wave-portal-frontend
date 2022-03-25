import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

export default function App() {
    const [currentAccount, setCurrentAccount] = useState("");
    const [message, setMessage] = useState("");
    const [totalWaves, setTotalWaves] = useState(0);
    const [allWaves, setAllWaves] = useState([]);
    const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);
    const contractAddress = "0x225f20BC3ABe60A385C6577701F6F2B6f6953435";
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
                getAllWaves();
            } else {
                console.log("No authorized account found")
            }
        } catch (error) {
          console.log(error);
        }
	};
	
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
            getAllWaves();
        } catch (error) {
            console.log(error)
        }
    };
	
	const wave = async () => {
        event.preventDefault();

        setIsProcessingTransaction(true);

        try {
            const { ethereum } = window;

            if (ethereum) {
                const wavePortalContract = getContract(ethereum);

                // Execute the actual wave from smart contract
                const waveTxn = await wavePortalContract.wave(message, { gasLimit: 400000 });
                console.log("Mining...", waveTxn.hash);

                await waveTxn.wait();
                console.log("Mined -- ", waveTxn.hash);

                setMessage('');

                getTotalWaves();
                getAllWaves();
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error);
        }

        setIsProcessingTransaction(false);
	};

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
	};

    const getAllWaves = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const wavePortalContract = getContract(ethereum);
                const waves = await wavePortalContract.getAllWaves();
                // Get the address, timestamp, and message to displpay in the UI
                let wavesCleaned = waves.map(wave => {
                    return {
                        address: wave.waver,
                        timestamp: new Date(wave.timestamp * 1000),
                        message: wave.message,
                    };
                });
                // Flip the waves array so that the most recent message appears first
                wavesCleaned = wavesCleaned.reverse();

                setAllWaves(wavesCleaned);
            } else {
                console.log("Ethereum object doesn't exist!")
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getContract = (ethereum) => {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        return new ethers.Contract(contractAddress, contractABI, signer);
    };

    const handleAccountChange = async () => {
        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length === 0) {
            console.log('wallet disconnected');

            setCurrentAccount('');
            setAllWaves([]);
            setTotalWaves(0);
        } else {
            const account = accounts[0];

            console.log("Found an authorized account:", account);

            setCurrentAccount(account);
        }
    };
	
    const attachWalletListeners = () => {
        const { ethereum } = window;
        const wavePortalContract = getContract(ethereum);

        ethereum.on('accountsChanged', handleAccountChange);

        // Listen for new wave transactions by other users.
        const onNewWave = (from, timestamp, message) => {
            console.log("NewWave", from, timestamp, message);

            // Update wave state to include new wave
            setAllWaves(prevState => [
                ...prevState,
                {
                address: from,
                timestamp: new Date(timestamp * 1000),
                message: message,
                },
            ]);
        };

        wavePortalContract.on("NewWave", onNewWave);
    };
	
    // Check for wallet connection and attach listeners on page load
    useEffect(async () => {
        checkIfWalletIsConnected();

        attachWalletListeners();
    }, []);
	
    return (
        <div className="mainContainer">
            <div className="dataContainer">
                <div className="header">
                    👋 Hey there!
                </div>
                <div className="bio">
                    My name is Faybian and I've been a Full-Stack Software Engineer for 8+ years. My goal is to
                    transition into Web3 and become a Blockchain / Solidity Contract Developer. My skill set and
                    familiarity with Web3 tools, such as Javascript and React, allows me to easily transition into the
                    space and make impactful contributions. This simple website is just to demonstrate my usage of basic
                    Web3 functionality.
                </div>
                {
                    currentAccount ?
                        <>
                            <form onSubmit={wave}>
                                <label>
                                    Enter a message:
                                    <textarea
                                        value={message}
                                        onChange={(event) => setMessage(event.target.value)}
                                    />
                                </label>
                                <input
                                    disabled={isProcessingTransaction || !message}
                                    className={
                                        isProcessingTransaction
                                        ? "waveButtonProcessing"
                                        : "waveButton"
                                    }
                                    type="submit"
                                    value={
                                        isProcessingTransaction
                                        ? 'Processing transaction...'
                                        : 'Wave at Me'
                                    }
                                />
                            </form>
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
                {
                    currentAccount && allWaves.length > 0 &&
                    (
                        <table className="waveTable">
                            <thead>
                                <tr>
                                    <th>Address</th>
                                    <th>Time</th>
                                    <th>Message</th>
                                </tr>
                            </thead>
                            {
                                allWaves.map((wave, index) => {
                                    return (
                                        <tbody key={index}>
                                            <tr>
                                                <td>{wave.address}</td>
                                                <td>{wave.timestamp.toString()}</td>
                                                <td>{wave.message}</td>
                                            </tr>
                                        </tbody>
                                    )
                                })
                            }
                        </table>
                    )
                }
            </div>
        </div>
    );
}
