var sponsor = require('../storage/sponsor.json') || false;
let coinContractService = require('./coinContractService');

let ShopKeeperService = function(web3) {
    var self = this;
    
    coinContractService.setWeb3(web3);
    let accountsService = new require('./accountsService')(web3);

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

    self.getShopKeeperState = function(public_key) {
        return new Promise(function(resolve, reject) {
            getContract().then(function(contract) {
                contract.shopKeeper(public_key, function(err, data) {
                    if (err)
                        reject(err);

                    resolve(data);
                });
            }, console.error);
        });
    };

    self.approveShopKeeper = function(public_key) {
        return new Promise(function(resolve, reject) {
            getContract().then(function(contract) {
                contract.approveShop(public_key, { from: sponsor.public }, function(err, transactionHash) {
                    if (err)
                        return reject(err);

                    self.checkTransaction(transactionHash, function(block) {
                        resolve(block);
                    });
                });
            }, console.error);
        });
    };

    self.disapproveShopKeeper = function(public_key) {
        return new Promise(function(resolve, reject) {
            getContract().then(function(contract) {
                contract.disapproveShop(public_key, { from: sponsor.public }, function(err, transactionHash) {
                    if (err)
                        return reject(err);

                    self.checkTransaction(transactionHash, function(block) {
                        resolve(block);
                    });
                });
            }, console.error);
        });
    };
    
    self.requestMoney = function(from_address, to_address, password, funds) {
        return new Promise(function(resolve, reject) {
            getContract().then(function(contract) {
                accountsService.unlockAccount(to_address, password).then(function() {
                    contract.recievePayment(from_address, funds, { from: to_address }, function(err, transactionHash) {
                        if (err)
                            return reject(err);

                        self.checkTransaction(transactionHash, function(block) {
                            resolve(block);
                        });
                    });
                }, reject);
            }, console.error);
        });
    };
    
    self.refundPayment = function(from_address, to_address, password, funds) {
        return new Promise(function(resolve, reject) {
            getContract().then(function(contract) {
                accountsService.unlockAccount(from_address, password).then(function() {
                    contract.refundPayment(to_address, funds, { from: from_address }, function(err, transactionHash) {
                        if (err)
                            return reject(err);

                        self.checkTransaction(transactionHash, function(block) {
                            resolve(block);
                        });
                    });
                }, reject);
            }, console.error);
        });
    };

    return self;
};

module.exports = ShopKeeperService;