/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-shadow */
"use client";

import { useEffect, useState } from "react";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { CHAIN_NAMESPACES, IProvider, WALLET_ADAPTERS } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import Web3 from "web3";

const clientId =
  "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ"; // get from https://dashboard.web3auth.io

// const chainConfig = {
//   chainNamespace: CHAIN_NAMESPACES.EIP155,
//   chainId: "0x1", // Please use 0x1 for Mainnet
//   rpcTarget: "https://rpc.ankr.com/eth",
//   displayName: "Ethereum Mainnet",
//   blockExplorer: "https://etherscan.io/",
//   ticker: "ETH",
//   tickerName: "Ethereum",
// };

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x13881", // Use the correct chainId for Mumbai Testnet
  rpcTarget: "https://rpc-mumbai.maticvigil.com/", // Mumbai Testnet RPC endpoint
  displayName: "Polygon Mumbai Testnet",
  blockExplorer: "https://explorer-mumbai.maticvigil.com/",
  ticker: "MATIC",
  tickerName: "Polygon",
};

const web3auth = new Web3AuthNoModal({
  clientId,
  chainConfig,
  web3AuthNetwork: "sapphire_mainnet",
});

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});
const openloginAdapter = new OpenloginAdapter({
  privateKeyProvider: privateKeyProvider,
});
web3auth.configureAdapter(openloginAdapter);

function App() {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isSendTransactionView, setIsSendTransactionView] = useState(false);
  const [to, setTo] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.init();
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const login = async () => {
    const web3authProvider = await web3auth.connectTo(
      WALLET_ADAPTERS.OPENLOGIN,
      {
        loginProvider: "google",
      }
    );
    setProvider(web3authProvider);
    if (web3auth.connected) {
      setLoggedIn(true);
    }
  };

  const getUserInfo = async () => {
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const logout = async () => {
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
    uiConsole("logged out");
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const web3 = new Web3(provider as any);

    // Get user's Ethereum public address
    const address = await web3.eth.getAccounts();
    const chainId = await web3.eth.getChainId();
    const pk = await provider.request({ method: "eth_private_key" });
    uiConsole("address", address, "chainId", Number(chainId), "pk", pk);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const web3 = new Web3(provider as any);

    // Get user's Ethereum public address
    const address = (await web3.eth.getAccounts())[0];

    // Get user's balance in ether
    const balance = web3.utils.fromWei(
      await web3.eth.getBalance(address), // Balance is in wei
      "ether"
    );
    uiConsole(balance);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const web3 = new Web3(provider as any);

    // Get user's Ethereum public address
    const fromAddress = (await web3.eth.getAccounts())[0];

    const originalMessage = "YOUR_MESSAGE";

    // Sign the message
    const signedMessage = await web3.eth.personal.sign(
      originalMessage,
      fromAddress,
      "test password!" // configure your own password here.
    );
    uiConsole(signedMessage);
  };

  const sendTransaction = async () => {
    try {
      if (!provider) {
        uiConsole("provider not initialized yet");
        return;
      }
      const web3 = new Web3(provider as any);
      const address = (await web3.eth.getAccounts())[0];
      const weiValue = Number(web3.utils.toWei(Number(value), "ether"));
      const hexValue = "0x" + weiValue.toString(16);
      console.log(Number(value), weiValue, hexValue);
      const tx = {
        from: address,
        to: to,
        gas: 21000,
        value: hexValue,
      };
      const sendTx = await web3.eth.sendTransaction(tx);
      console.log("sendTx", sendTx);
      setIsSendTransactionView(false);
      uiConsole("send Tx Hash", sendTx.transactionHash);
    } catch (err) {
      setIsSendTransactionView(false);
      uiConsole("err", err);
    }
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log(...args);
    }
  }

  const showSendTransactionView = () => {
    setIsSendTransactionView(true);
  };

  const unShowSendTransactionView = () => {
    setIsSendTransactionView(false);
  };

  const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={getUserInfo} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="card">
            Get Accounts
          </button>
        </div>
        <div>
          <button onClick={getBalance} className="card">
            Get Balance
          </button>
        </div>
        <div>
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={showSendTransactionView} className="card">
            Send Transaction
          </button>
        </div>
        <div>
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
      </div>
    </>
  );

  const sendTransactionView = (
    <div className="flex-container">
      <div>
        <input
          type="text"
          placeholder="To"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <div>
        <button onClick={sendTransaction} className="card">
          Send
        </button>
      </div>
      <div>
        <button onClick={unShowSendTransactionView} className="card">
          Cancel
        </button>
      </div>
    </div>
  );

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a
          target="_blank"
          href="https://web3auth.io/docs/sdk/pnp/web/no-modal"
          rel="noreferrer"
        >
          Web3Auth{" "}
        </a>
        & NextJS Quick Start
      </h1>
      {/* <div className="grid">{loggedIn ? loggedInView : unloggedInView}</div> */}
      <div className="grid">
        {loggedIn
          ? isSendTransactionView
            ? sendTransactionView
            : loggedInView
          : unloggedInView}
      </div>
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>

      <footer className="footer">
        <a
          href="https://github.com/Web3Auth/web3auth-pnp-examples/tree/main/web-no-modal-sdk/quick-starts/nextjs-no-modal-quick-start"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code
        </a>
      </footer>
    </div>
  );
}

export default App;
