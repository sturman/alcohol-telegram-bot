var TelegramBot = require('node-telegram-bot-api');
var request     = require('request-promise');
var fs          = require('fs');

var token    = '';
var apiToken = '';
// Setup polling way
var bot      = new TelegramBot(token, {polling: true});

var products;

bot.onText(/\/find (.+)/, function (msg, match) {
    var fromId = msg.chat.id;
    var query  = match[1].replace(' ', '+');
    getProduct(query).then(function (data) {
        products   = data;
        var result = '';
        for (var i = 0; i < data.length; i++) {
            result += '/' + (i + 1) + '. ' + data[i].name + ' - ' + parseInt(data[i].alcohol_content) / 100 + '%\n';
        }
        bot.sendMessage(fromId, result);
    });
});

bot.onText(/\/\d+$/, function (msg, match) {
    var id        = match[0].replace('/', '');
    var fromId    = msg.chat.id;
    var productId = products[id - 1].id;
    if (productId != null) {
        getProductDescription(productId).then(function (data) {

            var download = function (uri, filename, callback) {
                request.head(uri, function (err, res, body) {
                    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
                });
            };

            var imageUrl = data.image_url;
            if (imageUrl != null) {
                download(imageUrl, './file.png', function () {
                    console.log('done');
                    bot.sendPhoto(fromId, './file.png');
                });
            } else {
                bot.sendMessage(fromId, "Unfortunately, we do not have an image for " + data.name);
            }
        });
    } else {
        bot.sendMessage(fromId, "Please use command /find first, e.g. /find Jose Cuervo");
    }
});

function getProduct(query) {
    var options = {
        uri    : 'http://lcboapi.com/products',
        qs     : {
            per_page: 10,
            q       : query
        },
        headers: {
            'authorization': 'Token token="' + apiToken + '"',
            'accept'       : 'application/vnd.api+json'
        },
        json   : true
    };

    return request(options)
        .then(function (body) {
            return body.data
        });
}

function getProductDescription(id) {
    var options = {
        uri    : 'http://lcboapi.com/products/' + id,
        qs     : {
            per_page: 10
        },
        headers: {
            'authorization': 'Token token="' + apiToken + '"',
            'accept'       : 'application/vnd.api+json'
        },
        json   : true
    };

    return request(options)
        .then(function (body) {
            return body.data
        });
}