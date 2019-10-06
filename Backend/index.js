const express = require("express");

const app = express();

const Matic = require("maticjs").default;
const config = require("./config");

var token = config.MATIC_TEST_TOKEN; // test token address
var amount = "10000000000000000"; // amount in wei
var from = config.FROM_ADDRESS; // from address

var recipient = "0x6d5A23e0218f8c98F5C4f5f066cB59562Bde653c";

const matic = new Matic({
  maticProvider: config.MATIC_PROVIDER,
  parentProvider: config.PARENT_PROVIDER,
  rootChainAddress: config.ROOTCHAIN_ADDRESS,
  syncerUrl: config.SYNCER_URL,
  watcherUrl: config.WATCHER_URL,
  withdrawManagerAddress: config.WITHDRAWMANAGER_ADDRESS
});

matic.wallet = config.PRIVATE_KEY;

// Init Middleware

app.use(express.json({ extended: false }));

app.use(express.urlencoded({ extended: false }));
console.log(from);

// ____________________________________________________________________________________________________________

app.post("/ropstenToMatic", async (req, res) => {
  try {
    // save state
    var defaultAmount = amount;
    var oldFrom = from;
    var oldToken = token;

    from = req.body.from;
    amount = req.body.amount;
    token = config.ROPSTEN_TEST_TOKEN;

    await matic.approveERC20TokensForDeposit(token, amount, {
      from,
      onTransactionHash: hash => {
        // action on Transaction success
        console.log(hash); // eslint-disable-line
      }
    });

    // Deposit tokens
    await matic.depositERC20Tokens(token, from, amount, {
      from,
      onTransactionHash: hash => {
        // action on Transaction success
        console.log(hash, "Tokens deposited from Ropsten/Ethereum to Matic."); // eslint-disable-line
      }
    });
  } catch (error) {
    console.error(error.message);
    return res.send("-1");
  }

  // restore  state
  from = oldFrom;
  amount = defaultAmount;
  token = oldToken;

  return res.send("1");
});

// ____________________________________________________________________________________________________________

app.get("/maticToMatic", async (req, res) => {
  token = config.MATIC_TEST_TOKEN;
  try {
    // Send Tokens
    await matic.transferTokens(token, recipient, amount, {
      from,
      // parent: true, // For token transfer on Main network (false for Matic Network)
      onTransactionHash: hash => {
        // action on Transaction success
        console.log(hash); // eslint-disable-line
      }
    });
  } catch (error) {
    console.error(error.message);
    return res.send("-1");
  }
  return res.send("1");
});

// ____________________________________________________________________________________________________________

app.post("/maticToMatic", async (req, res) => {
  token = config.MATIC_TEST_TOKEN;

  // Save state
  var defaultAmount = amount;
  var oldFrom = from;
  var oldRecipient = recipient;
  var oldWallet = matic.wallet;

  const payIndex = req.body.payIndex;
  amount = req.body.amount;
  from = req.body.from;

  if (payIndex == 1) {
    from = config.COMP_ADDRESS;
    recipient = req.body.from;
    matic.wallet = config.COMP_PKEY;
  }

  try {
    // Send Tokens
    await matic.transferTokens(token, recipient, amount, {
      from,
      // parent: true, // For token transfer on Main network (false for Matic Network)
      onTransactionHash: hash => {
        // action on Transaction success
        console.log(hash); // eslint-disable-line
      }
    });
  } catch (error) {
    console.error(error.message);
    return res.send("-1");
  }

  // Restore state
  from = oldFrom;
  recipient = oldRecipient;
  matic.wallet = oldWallet;
  amount = defaultAmount;

  return res.send("1");
});

// ____________________________________________________________________________________________________________

app.get("/maticToRopsten", async (req, res) => {
  token = config.MATIC_TEST_TOKEN;
  var txHash = null;
  try {
    await matic.startWithdraw(token, amount, {
      from,
      onTransactionHash: hash => {
        //  console.log("Withdraw Initiated")
        txHash = hash;
        console.log(hash); // eslint-disable-line
      }
    });

    console.log("this is the hash", txHash);

    await matic.withdraw(txHash, {
      from,
      onTransactionHash: hash => {
        // action on Transaction success
        console.log(hash); // eslint-disable-line
        // Withdraw process is completed, funds will be transfer to your account after challege period is over.
      }
    });
    const rootTokenAddress = config.ROPSTEN_TEST_TOKEN;
    await matic.processExits(rootTokenAddress, {
      from,
      onTransactionHash: hash => {
        // action on Transaction success
        // DEVNOTE: on sucessfull processExits funds will be transfered to your mainchain account
        console.log(hash); // eslint-disable-line
      }
    });
  } catch (error) {
    console.error(error.message);
  }
  // console.log(txHash);
  return res.send("7 days");
});

// ____________________________________________________________________________________________________________

app.post("/checkBalance", async (req, res) => {
  token = config.MATIC_TEST_TOKEN;
  var oldFrom = from;
  from = req.body.from;
  var RtBalance;
  try {
    await matic.balanceOfERC721(from, token).then(address => {
      console.log("matic address", address / 1000000000000000000);
      RtBalance = address / 1000000000000000000;
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error");
  }

  //Restore state
  from = oldFrom;

  return res.send(RtBalance.toString());
});

// ____________________________________________________________________________________________________________

app.get("/checkFrom", (req, res) => {
  console.log(from);
  return res.json({ from: from });
});

app.get("/checkAmount", (req, res) => {
  return res.json({ amount: amount });
});

app.get("/checkToken", (req, res) => {
  return res.json({ token: token });
});

app.post("/", (req, res) => {
  console.log(req.body.name);

  res.send("Server got your message");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
