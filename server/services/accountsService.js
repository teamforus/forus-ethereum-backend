var sponsor = require('../storage/sponsor.json') || false;
let coinContractService = require('./coinContractService');

let AccountsService = function(web3) {
    var self = this;
    let balanceService = new require('../services/balanceService.js')(web3);

    coinContractService.setWeb3(web3);

    let getContract = function() {
        return new Promise(function(resolve, reject) {
            coinContractService.getContractInstance().then(resolve, reject);
        });
    };

    self.checkTransaction = function(hash, callback) {
        web3.eth.getTransaction(hash, function(err, block) {
            if (!block || block.blockNumber == null)
                return setTimeout(function() {
                    self.checkTransaction(hash, callback);
                }, 500);

            callback(block);
        });
    };

    self.newAccount = function(private_key, funds) {
        return new Promise(function(resolve, reject) {
            web3.personal.newAccount(private_key, function(err, address) {
                if (err)
                    return reject(err);

                if (!funds || isNaN(parseInt(funds))) {
                    return self.transferEther(address, 10).then(function(block) {
                        return resolve(address);
                    }, reject);
                }

                balanceService.fundAccount(address, funds).then(function() {
                    resolve(address);
                }, reject);
            });
        });
    };

    self.transferEther = function(address, amount) {
        return new Promise(function(resolve, reject) {
            web3.personal.sendTransaction({
                from: sponsor.public,
                to: address,
                value: web3.toWei(amount, "ether")
            }, sponsor.private, function(err, transactionHash) {
                if (err)
                    return reject(err);

                self.checkTransaction(transactionHash, function(block) {
                    resolve(block);
                });
            });
        });
    };

    self.unlockAccount = function(public, private, duration) {
        return new Promise(function(resolve, reject) {
            web3.personal.unlockAccount(public, private, duration || 0, function(err) {
                if (err)
                    reject(err);

                resolve();
            });
        });
    }

    return self;
};

module.exports = AccountsService;