var colors = require("colors");
var solc = require('solc');
var path = require('path');
var fs = require('fs');

let web3 = require('./web3.js');

let shopKeeperService = new require('../services/shopKeeperService.js')(web3);
let balanceService = new require('../services/balanceService.js')(web3);
let accountsService = new require('../services/accountsService.js')(web3);

let logger = require('./logger.js');

let checkShopStatus = function(targetShoper) {
    return new Promise(function(resolve, reject) {
        shopKeeperService.getShopKeeperState(targetShoper).then(function(state) {
            logger.log("\tShopKeeper state: " + targetShoper + ' ', state ? colors.green('approved') : colors.red('not approved'));
            resolve(state);
        }, reject);
    });
};

let changeShoperStatus = function(targetShoper, status) {
    return new Promise(function(resolve, reject) {
        method = status ? "approveShopKeeper" : "disapproveShopKeeper";

        shopKeeperService[method](targetShoper).then(function(block) {
            logger.log("\tThe transaction block number: ", colors.green(block.blockNumber));
            resolve(block);
        }, reject);
    });
};

let requestMoney = function(fromAddress, toAddress, password, funds) {
    return new Promise(function(resolve, reject) {
        shopKeeperService.requestMoney(fromAddress, toAddress, password, funds).then(function(block) {
            logger.log("\tThe transaction block number: ", colors.green(block.blockNumber));
            resolve(block);
        }, reject);
    });
};

let refundPayment = function(fromAddress, toAddress, password, funds) {
    return new Promise(function(resolve, reject) {
        shopKeeperService.refundPayment(fromAddress, toAddress, password, funds).then(function(block) {
            logger.log("\tThe transaction block number: ", colors.green(block.blockNumber));
            resolve(block);
        }, reject);
    });
};

let getBalance = function(targetAddress) {
    return new Promise(function(resolve, reject) {
        balanceService.getBalance(targetAddress).then(function(balance) {
            logger.log("\tAccount's balance: " + colors.green(balance + " coin(s)"));
            resolve(balance);
        }, reject);
    });
};

let fundAccount = function(targetAddress, funds) {
    return new Promise(function(resolve, reject) {
        balanceService.fundAccount(targetAddress, funds).then(function(block) {
            logger.log("\tThe transaction block number: ", colors.green(block.blockNumber));
            resolve(block);
        }, reject);
    });
};

let newAccount = function(password, funds) {
    return new Promise(function(resolve, reject) {
        accountsService.newAccount(password, funds).then(function(address) {
            logger.log(
                "\tNew account created:",
                "\n\t\tpublic: " + colors.green(address) +
                "\n\t\tprivate: " + colors.green(password));
            resolve(address);
        }, reject);
    });
};

module.exports = {
    checkShopStatus: checkShopStatus,
    changeShoperStatus: changeShoperStatus,
    requestMoney: requestMoney,
    refundPayment: refundPayment,
    getBalance: getBalance,
    fundAccount: fundAccount,
    newAccount: newAccount,
    web3: web3,
    services: {
        shopKeeperService: shopKeeperService,
        balanceService: balanceService,
        accountsService: accountsService
    }
};