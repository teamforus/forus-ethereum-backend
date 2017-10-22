var env = require('../../.env.js');

let Web3 = require("web3");
let ipc_path = env.ipc_path;

module.exports = new Web3(new Web3.providers.IpcProvider(ipc_path, new require("net").Socket()));
