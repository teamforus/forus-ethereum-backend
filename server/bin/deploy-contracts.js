var colors = require("colors");
var solc = require('solc');
var path = require('path');
var fs = require('fs');

var web3 = require('../core/web3.js');
var sponsor = require('../storage/sponsor.json') || {};

console.log("Web3 version: " + colors.green(web3.version.api) + "\n");

let contracts_path = __dirname + "/../contracts";
let contracts_compiled_path = __dirname + "/../storage/compiled-contracts/";
let contracts_deployed_path = __dirname + "/../storage/deployed-contracts/";


// unlock account
web3.personal.unlockAccount(sponsor.public, sponsor.private, 0, function(err) {
    if (err)
        return console.log("Error: ", colors.red(err));

    fs.readdir(contracts_path, function(err, contracts) {
        contracts = contracts.map(function(contract, index) {
            return new Promise(function(resolve, reject) {
                let contract_name = path.parse(contract).name;
                let contract_bytecode = fs.readFileSync(`${__dirname}/../storage/compiled-contracts/${contract_name}.bytecode`).toString();
                let contract_interface = fs.readFileSync(`${__dirname}/../storage/compiled-contracts/${contract_name}.interface.json`).toString();

                let contract_init = [{
                    data: "0x" + contract_bytecode,
                    from: sponsor.public,
                    gas: 1000000
                }, function(err, contract) {
                    if (err)
                        return console.log("Error: ", colors.red(err));

                    if (!contract.address)
                        return;

                    contract_address = contract.address;
                    contract_instance = contract;

                    console.log(
                        colors.green(contract_name),
                        'contract deployed, at address:',
                        colors.green(contract.address))

                    fs.writeFileSync(`${contracts_deployed_path}/${contract_name}.json`, JSON.stringify({
                        name: contract_name,
                        address: contract_address,
                        interface: contract_interface,
                        bytecode: contract_bytecode,
                    }, null, '    '));

                    resolve();
                }];

                // TODO: write contract parameters somewhere
                if (contract_name == 'KindpakketCoin')
                    contract_init.unshift(5000000);

                // initialize contract with 50.000 coins
                let _contract = web3.eth.contract(JSON.parse(contract_interface));

                _contract.new.apply(_contract, contract_init);
            });
        });

        Promise.all(contracts).then(function() {
            setTimeout(function() {
                console.log(colors.green('Done!'));

                if (!module.parent)
                    process.exit();
            }, 2000);
        });
    });
});