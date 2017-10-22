var env = require('../../.env.js');

let fs = require('fs');
Tail = require('tail').Tail;

let log_path = env.ethereum_log;
let print_history = (process.argv[3] && (process.argv[3] == '--history'));

if (!fs.existsSync(log_path))
    return console.log(`Error, file "${log_path}" not exists.`);

if (print_history)
    console.log(fs.readFileSync(log_path).toString());

(new Tail(log_path)).on("line", function(data) {
    console.log(data);
});
