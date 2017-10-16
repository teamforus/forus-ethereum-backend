let fs = require('fs');
Tail = require('tail').Tail;

let log_file = process.argv[2] || 'api.access';
let log_path = `${__dirname}/../../logs/${log_file}.log`;
let print_history = (process.argv[3] && (process.argv[3] == '--history'));

if (!fs.existsSync(log_path))
    return console.log(`Error, file "${log_path}" not exists.`);

if (print_history)
    console.log(fs.readFileSync(log_path).toString());

(new Tail(log_path)).on("line", function(data) {
    console.log(data);
});