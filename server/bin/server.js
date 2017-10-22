var bodyParser = require('body-parser')
var express = require('express')
var colors = require("colors");
var fs = require("fs");
var app = express()

let logger = require('../core/logger.js');

var core = require('../core/core.js');
var sponsor = require('../storage/sponsor.json') || {};

var env = require('../../.env.js');

var host = env.host || 'localhost'
var port = env.port || 8500;

let apiKey = env.api_key;
let allowedIp = env.allowed_ip;

if (typeof allowedIp == 'string')
    allowedIp = [allowedIp];

// to support JSON-encoded bodies
app.use(bodyParser.json());

// to support URL-encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}));

let logEndpoint = function(req, res, next) {
    logger.log("Endpoint reached:", colors.green(req.route.path));
    next();
};
app.use(function(req, res, next) {
    if (req.get('Api-Key') != apiKey) {
        return res.status(401).send({
            "error": "access-forbiden",
            "message": "Access forbiden!",
        });
    }

    if (allowedIp.indexOf("*") == -1) {
        if (allowedIp.indexOf(req.ip) == -1) {
            return res.status(401).send({
                "error": "access-forbiden",
                "message": "Access forbiden!",
            });
        }
    }
    
    next();
});

// respond with "hello world" when a GET request is made to the homepage
app.get('/', logEndpoint, function(req, res) {
    res.send({
        status: 'Up and Running.'
    });
})

// Depricated
/*app.post('/api/account', logEndpoint, function(req, res) {
    let _private = req.body.private;
    let _funds = parseInt(req.body.funds);

    account = core.newAccount(_private, isNaN(_funds) ? false : (_funds * 100));

    account.then(function(address) {
        res.send({
            address: address
        });
    }, logger.log);
});*/

app.post('/api/import-wallet', logEndpoint, function(req, res) {
    let wallet = req.body.wallet;

    logger.log('Import wallet ' + wallet.address + '.');
    core.importWallet(wallet.private_key, wallet.passphrase).then(function(block) {
        res.send({
            block: block
        });
    }, logger.log);
});

app.post('/api/fund-ether', logEndpoint, function(req, res) {
    let wallet = req.body.wallet;
    let amount = parseInt(req.body.amount);

    logger.log('Fund ether for ' + wallet.address + ' (' + amount + 'eth.)');
    account = core.transferEther(wallet.address, amount);
    account.then(function(block) {
        res.send({
            block: block
        });
    }, logger.log);
});

app.post('/api/fund-tokens', logEndpoint, function(req, res) {
    let wallet = req.body.wallet;
    let amount = parseInt(req.body.amount) * 100;

    logger.log(req.body.amount);

    logger.log('Fund tokens for ' + wallet.address + ' (' + amount + 'tokens)');
    account = core.fundAccount(wallet.address, amount);
    account.then(function(block) {
        res.send({
            block: block
        });
    }, logger.log);
});

app.get('/api/shop-keeper/:address/state', logEndpoint, function(req, res) {
    let address = req.params.address;

    core.checkShopStatus(address).then(function(state) {
        res.send({
            state: state
        });
    });
});

app.post('/api/shop-keeper/:address/state', logEndpoint, function(req, res) {
    let address = req.params.address;
    let state = !!req.body.state;

    logger.log('change-status', state, state ? 'y' : 'n');

    core.changeShoperStatus(address, state).then(function(block) {
        res.send({
            state: state
        });
    });
});

app.post('/api/transaction/request-funds', logEndpoint, function(req, res) {
    let from_public = req.body.from_public;

    let to_public = req.body.to_public;
    let to_private = req.body.to_private;

    let amount = req.body.amount * 100;

    logger.log(
        "ShopKeeper " + colors.green(to_public) +
        " is requesting " + colors.green(amount + " coin(s)") +
        " from " + colors.green(from_public));

    core.checkShopStatus(to_public).then(function(state) {
        if (!state)
            return res.status(403).send({
                error: "Shopkeeper is not approved!"
            });

        core.getBalance(from_public).then(function(balance) {
            if (balance < amount)
                return res.status(403).send({
                    error: "Not enough funds!"
                });

            core.requestMoney(from_public, to_public, to_private, amount).then(function(block) {
                res.send({
                    blockId: block.blockNumber
                });
            });
        });
    });
});

app.post('/api/transaction/refund', logEndpoint, function(req, res) {
    let from_public = req.body.from_public;
    let from_private = req.body.from_private;

    let to_public = req.body.to_public;

    let amount = req.body.amount * 100;

    logger.log(
        "ShopKeeper " + colors.green(from_public) +
        " is refunding " + colors.green(amount + " coin(s)") +
        " to " + colors.green(to_public));

    core.checkShopStatus(from_public).then(function(state) {
        if (!state)
            return res.status(403).send({
                error: "Shopkeeper is not approved!"
            });

        core.getBalance(from_public).then(function(balance) {
            if (balance < amount)
                return res.status(403).send({
                    error: "Not enough funds!"
                });

            core.refundPayment(from_public, to_public, from_private, amount).then(function(block) {
                res.send({
                    blockId: block.blockNumber
                });
            });
        });
    });
});

app.get('/api/account/:address/balance', logEndpoint, function(req, res) {
    let address = req.params.address;

    core.getBalance(address).then(function(balance) {
        res.send({
            balance: balance / 100
        });
    });
});

app.listen(port, host, function() {
    logger.log('Node server started at port: ', port)
}).on('connection', function(socket) {
    logger.log("- " + colors.green("A new connection was made by a client."));
    // 3000 second timeout.
    socket.setTimeout(3000 * 1000);
});
111
