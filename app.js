var TelegramBot = require('node-telegram-bot-api');
var request     = require('request-promise');

var token    = '';
var apiToken = '';
// Setup polling way
var bot      = new TelegramBot(token, {polling: true});

bot.onText(/\/find (.+)/, function (msg, match) {
    var fromId = msg.from.id;
    var query  = match[1].replace(' ', '+');
    getProduct(query).then(function (result) {
        var but      = {text: '1'};
        var keyboard = {
            keyboard         : [[but, but],
                                [but]],
            one_time_keyboard: true
        };
        bot.sendMessage(fromId, result, {reply_markup: JSON.stringify(keyboard)});
    });
});

bot.onText(/^\d+$/, function (msg, match) {
    var fromId = msg.from.id;
    bot.sendMessage(fromId, msg.text, {reply_markup: JSON.stringify({hide_keyboard: true})});
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
                result += i + 1 + '. ' + data[i].name + ' - ' + parseInt(data[i].alcohol_content) / 100 + '%\n';
            }
            return result
        });
}