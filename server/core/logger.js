var fs = require("fs");
var access = fs.createWriteStream(__dirname + '/../../logs/api.access.log');

var logger = {
    log: function() {
        arguments = Array.from(arguments).map(function(el) {
            if (typeof el == 'object')
                return JSON.stringify(el, null, '    ');
            
            return el;
        }).join('');
        
        console.log(arguments);
        access.write(arguments + "\n");
    }
};

module.exports = logger;