let Web3 = require("web3");
let ipc_path = __dirname + '/../../data/geth.ipc';

module.exports = new Web3(new Web3.providers.IpcProvider(ipc_path, new require("net").Socket()));