var sponsor = require('../storage/sponsor.json') || false;
let coinContractService = require('./coinContractService');
let logger = require('../core/logger.js');

let BalanceService = function(web3) {
    var self = this;

    coinContractService.setWeb3(web3);

    let getContract = function() {
        return new Promise(function(resolve, reject) {
            coinContractService.getContractInstance().then(resolve, reject);
        });
    };

    self.checkTransaction = function(hash, callback) {
        web3.eth.getTransaction(hash, function(err, block) {
            if (block.blockNumber == null)
                return setTimeout(function() {
                    self.checkTransaction(hash, callback);
                }, 500);

            callback(block);
        });
    };

    self.getBalance = function(public_key) {
        return new Promise(function(resolve, reject) {
            getContract().then(function(contract) {
                logger.log('public_key', public_key);
                contract.balanceOf(public_key, function(err, data) {
                    if (err)
                        reject(err);

                    resolve(data);
                });
            }, console.error);
        });
    };

    self.fundAccount = function(public_key, tokens) {
        return new Promise(function(resolve, reject) {
            getContract().then(function(contract) {
                logger.log('public_key, tokens', public_key, tokens);
                contract.fundWallet(public_key, tokens, { from: sponsor.public }, function(err, transactionHash) {
                    if (err)
                        return reject(err);

                    self.checkTransaction(transactionHash, function(block) {
                        resolve(block);
                    });
                });
            }, reject);
        });
    };

    return self;
};

module.exports = BalanceService;