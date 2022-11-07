import Head from "next/head";
import styles from "../styles/Home.module.css";
import { BigNumber, Contract, providers, utils } from "ethers";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, CONTRACT_ADDRESS } from "../constants";

export default function Home() {
  // Create a BigNumber `0`
  const zero = BigNumber.from(0);
  // walletConnected keeps track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // tokensMinted is the total number of tokens that have been minted till now out of 70000(max total supply)
  const [tokensMinted, setTokensMinted] = useState(zero);
  //Track balance of STE owned by an address
  const [balanceOfSTE, setBalanceOfSTE] = useState(zero);
  // checks if the currently connected MetaMask wallet claimed the airdrop
  const [claimed, setClaim] = useState(false);

  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  const getBalanceOfSTE = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // Create an instace of token contract
      const tokenContract = new Contract(CONTRACT_ADDRESS, abi, provider);
      // We will get the signer now to extract the address of the currently connected MetaMask account
      const signer = await getProviderOrSigner(true);
      // Get the address associated to the signer which is connected to  MetaMask
      const address = await signer.getAddress();
      // call the balanceOf from the token contract to get the number of tokens held by the user
      const balance = await tokenContract.balanceOf(address);
      // balance is already a big number, so we dont need to convert it before setting it
      setBalanceOfSTE(balance);
    } catch (err) {
      console.error(err);
      setBalanceOfSTE(zero);
    }
  };

  const getTotalTokensMinted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // Create an instance of token contract
      const tokenContract = new Contract(CONTRACT_ADDRESS, abi, provider);
      // Get all the tokens that have been minted
      const _tokensMinted = await tokenContract.totalSupply();
      setTokensMinted(_tokensMinted);
    } catch (err) {
      console.error(err);
    }
  };

  // Claiming the 10 STE airdrop
  const claim = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const tokenContract = new Contract(CONTRACT_ADDRESS, abi, signer);

      const tx = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      window.alert("You just got airdroped 10 STE");
      await getBalanceOfSTE();
      await getTotalTokensMinted();
      setLoading(false);
      setClaim(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "Goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getTotalTokensMinted();
      getBalanceOfSTE();
    }
  }, [walletConnected]);

  const renderButton = () => {
    // If we are currently waiting for something, return a loading button

    if (loading) {
      return (
        <div>
          <button className={styles.card}>Loading... 🐘 </button>
        </div>
      );
    }

    // once the user claimed the airdrop show this message because they can't claim twice
    if (claimed) {
      return (
        <div className={styles.card}>
          {" "}
          Thank you 🤗 You now owned 10 STE and saved some elephants 🐘
        </div>
      );
    } else {
      // If user doesn't have any tokens to claim, show the claim button
      return (
        <div style={{ display: "flex-col" }}>
          <button className={styles.card} onClick={() => claim()}>
            Claim STE &rarr;
          </button>
        </div>
      );
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Save the elephants</title>
        <meta name="description" content="Genp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Save the elephants 🐘</h1>
        <p className={styles.description}>
          STE hepls elephants orphanages in African and India. Join the cause
          and receive 10 STE 🚀{" "}
        </p>{" "}
        <div>
          {" "}
          Enter your name to join 👉 <input className={styles.card}></input>
        </div>
        {walletConnected ? (
          <div>{renderButton()}</div>
        ) : (
          <button onClick={connectWallet}> Connect wallet </button>
        )}
      </main>

      <footer className={styles.footer}> Made by Alexis </footer>
    </div>
  );
}
