const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const package = require("./package.json");
const gameOfLife = require("./game-of-life");

const port = process.env.port || process.env.PORT || 5000;

const app = express();
const apiRoot = "/api";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: /http:\/\/localhost/ }));
app.options("*", cors);

// sample DB
const db = {
  chris: {
    user: "chris",
    currency: "EUR",
    balance: 100,
    description: "A sample account",
    transactions: [],
  }
};

const router = express.Router();

router.get("/", (req, res) => {
  res.send(`${package.description} - v${package.version}`);
});

router.get("/gameoflife/:type", (req, res) => {
  const { n, m, iterations } = req.query;
  const type = req.params.type;
  const states = gameOfLife.get(
    n,
    n,
    iterations,   
    type
  );
  return res.json(states);
});

router.get("/accounts/:user", (req, res) => {
  const user = req.params.user;
  const account = db[user];

  if (!account) {
    console.log("User does not exist");
    return res.status(404).json({ error: "User does not exist." });
  }
  return res.json(account);
});

router.post("/accounts", (req, res) => {
  const body = req.body;

  // validate required values
  if (!body.user || !body.currency) {
    return res.status(400).json({ error: "Account or Currency are required." });
  }

  // validate account does not exist
  if (db[body.user]) {
    return res
      .status(400)
      .json({ error: `Account ${body.user} already exists.` });
  }
  // validate balance
  let balance = body.balance;
  if (balance && typeof balance !== "number") {
    balance = parseFloat(balance);
    if (isNaN(balance)) {
      return res.status(400).json({ error: "Balance must be a number." });
    }
  }

  // now we can create the account
  const account = {
    user: body.user,
    balance: balance || 0,
    description: body.description || `${body.user}'s account`,
    currency: body.currency,
    transactions: [],
  };

  db[body.user] = account;

  return res.status(201).json(account);
});

router.put("/accounts/:user", (req, res) => {
  const body = req.body;
  const user = req.params.user;
  const account = db[user];

  if (!account) {
    res.status(404).json({ error: "User not found" });
  }

  // validate only certain fields editable
  if (body.user || body.transactions || body.balance) {
    return res
      .status(400)
      .json({ error: "Can only edit currency and description." });
  }

  if (body.currency) {
    account.currency = body.currency;
  }
  if (body.description) {
    account.description = body.description;
  }

  return res.status(201).json(account);
});

router.delete("/accounts/:user", (req, res) => {
  const user = req.params.user;
  const account = db[user];

  if (!account) {
    return res.status(404).json({ error: "User not found" });
  }
  delete db[user];
  return res.status(203);
  ``;
});

// register router`
app.use(apiRoot, router);

app.listen(port, () => {
  console.log("server is up!");
});
