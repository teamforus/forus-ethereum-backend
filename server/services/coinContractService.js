var sponsor = require('../storage/sponsor.json') || false;
var coinContractDetails = require('../storage/deployed-contracts/KindpakketCoin.json') || false;

let CoinContractService = function(_web3) {
    let self = this;

    let web3 = _web3 || null;
    let contract = null;

    self.setWeb3 = function(_web3) {
        web3 = _web3;
    };

    self.getContractInstance = function() {
        return new Promise(function(resolve, reject) {
            if (!coinContractDetails)
                return reject("Error no contract details found!");

            if (!web3)
                return reject("You should provide web3 instance first!");
            
            if (contract && contract.address)
                return resolve(contract);
            
            let accountService = new require('./accountsService.js')(web3);
                
            accountService.unlockAccount(sponsor.public, sponsor.private, 0).then(function() {
                contract = web3.eth.contract(JSON.parse(coinContractDetails.interface)).at(coinContractDetails.address);
    
                return resolve(contract);
            });
        });
    };
};

module.exports = new CoinContractService();