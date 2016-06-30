var TelegramBot = require('node-telegram-bot-api');
var request     = require('request-promise');

var token    = '';
var apiToken = '';
// Setup polling way
var bot      = new TelegramBot(token, {polling: true});

bot.onText(/\/find (.+)/, function (msg, match) {
    var fromId = msg.from.id;
    var query  = match[1];
    getProduct(query).then(function (result) {
        bot.sendMessage(fromId, result);
    });
});

function getProduct(query) {
    var options = {
        uri    : 'http://lcboapi.com/products',
        qs     : {
            per_page: 100,
            q       : query
        },
        headers: {
            'authorization': 'Token token="' + apiToken + '"',
            'accept'       : 'application/vnd.api+json'
        },
        json   : true
    };

    var result = '';

    return request(options)
        .then(function (body) {
            var data = body.data;
            for (var i = 0; i < data.length; i++) {
                result += data[i].name + '\n';
            }
            return result
        });
}