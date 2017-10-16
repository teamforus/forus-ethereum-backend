let colors = require("colors");
let solc = require('solc');
let path = require('path');
let fs = require('fs');

let contracts_path = __dirname + "/../contracts";
let contracts_compiled_path = __dirname + "/../storage/compiled-contracts/";

let sources = {};

let readContracts = function(dir) {
    return new Promise(function(resolve, reject) {
        fs.readdir(contracts_path, function(err, files) {
            if (err)
                reject(err);

            resolve(files.map(function(file) {
                return `${contracts_path}/${file}`;
            }));
        });
    });
};

let readContractsContent = function(files) {
    files = files.map(function(file) {
        return new Promise(function(resolve, reject) {
            fs.readFile(file, function(err, content) {
                if (err)
                    return reject(err);

                resolve({
                    file: path.parse(file).name,
                    content: content.toString()
                });
            });
        });
    });

    return Promise.all(files);
};

let CompileContracts = function(contracts) {
    return new Promise(function(resolve, reject) {
        contracts = contracts.reduce(function(obj, contract) {
            obj[path.parse(contract.file).name] = contract.content;
            return obj;
        }, {});

        contracts = solc.compile({ sources: contracts }, 1).contracts;

        resolve(contracts);
    });
};

let StoreCompiledContracts = function(contracts) {
    let promises = [];

    for (var prop in contracts) {
        let _contract = contracts[prop];
        let _path = contracts_compiled_path + prop.split(':')[1];

        promises.push(Promise.all([
            new Promise(function(resolve, reject) {
                fs.writeFile(_path + '.bytecode', _contract.bytecode, function(err) {
                    err ? reject() : resolve(_contract);
                });
            }),
            new Promise(function(resolve, reject) {
                fs.writeFile(_path + '.interface.json', _contract.interface, function(err) {
                    err ? reject() : resolve(_contract);
                });
            })
        ]));
    }

    return new Promise(function(resolve, reject) {
        Promise.all(promises).then(function(contracts) {
            resolve(contracts.map(function(contracts) {
                return contracts.pop();
            }));
        }, reject);
    });
};

let PrintProgress = function(contracts) {
    console.log(colors.green(contracts.length + " contract(s)") + " compiled!");
};

readContracts(contracts_path)
    .then(readContractsContent, console.log)
    .then(CompileContracts, console.log)
    .then(StoreCompiledContracts, console.log)
    .then(PrintProgress, console.log);