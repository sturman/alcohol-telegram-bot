const Telegraf = require('telegraf')
const rp = require('request-promise-native')
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)
const lcboApiKey = process.env.LCBO_API_KEY

bot.telegram.getMe().then((botInfo) => {
  bot.options.username = botInfo.username
})

bot.start(ctx => {
  console.log('started:', ctx.from)
  let firstName = ctx.from.first_name
  ctx.reply(`Hello ${firstName}! \n` +
    `I can try to find a short description and picture of any alcohol product\n` +
    `Just send me command /f <product_name>, e.g. /f heineken`)
})

bot.command('prod', ctx => {
  let options = {
    baseUrl: 'https://lcboapi.com',
    url: 'products',
    qs: {
      access_key: lcboApiKey,
      where_not: 'is_dead'
    },
    json: true
  }

  rp(options)
    .then(resp => {
      ctx.reply(`Output contains ${resp.pager.total_record_count} products`)
    })
})

bot.hears(/find (.+)/, (ctx) => {
  let options = {
    baseUrl: 'https://lcboapi.com',
    url: 'products',
    qs: {
      access_key: lcboApiKey,
      where_not: 'is_dead',
      q: ctx.match[1]
    },
    json: true
  }

  rp(options)
    .then(resp => {
      ctx.reply(`Output ${resp.pager.total_record_count} products for query ${ctx.match[1]}`)
    })
})

bot.startPolling()

// bot.onText(/\/find (.+)/, function (msg, match) {
//     var fromId = msg.chat.id;
//     var query  = match[1].replace(' ', '+');
//     getProduct(query).then(function (data) {
//         products = data;
//         if (data.length == 0) {
//             bot.sendMessage(fromId, "Sorry, no results found.");
//         } else {
//             var result = '';
//             for (var i = 0; i < data.length; i++) {
//                 result += '/' + (i + 1) + '. ' + data[i].name + ' - ' + parseInt(data[i].alcohol_content) / 100 + '%\n';
//             }
//             bot.sendMessage(fromId, result);
//         }
//     });
// });
//
// bot.onText(/\/\d+$/, function (msg, match) {
//     var id        = match[0].replace('/', '');
//     var fromId    = msg.chat.id;
//     var productId = products[id - 1].id;
//     if (productId != null) {
//         getProductDescription(productId).then(function (data) {
//             var info            = '';
//             var fromId          = msg.chat.id;
//             var origin          = data.origin;
//             var primaryCategory = data.primary_category;
//             var producerName    = data.producer_name;
//             var prodPackage     = data.package;
//             var packageUnitType = data.package_unit_type;
//
//             if (origin != undefined) {
//                 info += "Country of origin / manufacture - " + origin + "\n";
//             }
//             if (primaryCategory != undefined) {
//                 info += "Primary product category - " + primaryCategory + "\n";
//             }
//             if (producerName != undefined) {
//                 info += "Company that produces the product - " + producerName + "\n";
//             }
//             if (prodPackage != undefined) {
//                 info += "Full package description - " + prodPackage + "\n";
//             }
//             if (packageUnitType != undefined) {
//                 info += "Package unit type - " + packageUnitType;
//             }
//
//             bot.sendMessage(fromId, info);
//             var download = function (uri, filename, callback) {
//                 request.head(uri, function (err, res, body) {
//                     request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
//                 });
//             };
//
//             var imageUrl = data.image_url;
//             if (imageUrl != null) {
//                 download(imageUrl, './file.png', function () {
//                     console.log(new Date() + ' done');
//                     bot.sendPhoto(fromId, './file.png');
//                 });
//             } else {
//                 bot.sendMessage(fromId, "Unfortunately, we do not have an image for " + data.name);
//             }
//         });
//     } else {
//         bot.sendMessage(fromId, "Please use command /find first, e.g. /find Jose Cuervo");
//     }
// });
//
// function getProduct(query) {
//     var options = {
//         uri    : 'http://lcboapi.com/products',
//         qs     : {
//             per_page: 10,
//             q       : query
//         },
//         headers: {
//             'authorization': 'Token token="' + apiToken + '"',
//             'accept'       : 'application/vnd.api+json'
//         },
//         json   : true
//     };
//
//     return request(options)
//         .then(function (body) {
//             return body.data
//         });
// }
//
// function getProductDescription(id) {
//     var options = {
//         uri    : 'http://lcboapi.com/products/' + id,
//         qs     : {
//             per_page: 10
//         },
//         headers: {
//             'authorization': 'Token token="' + apiToken + '"',
//             'accept'       : 'application/vnd.api+json'
//         },
//         json   : true
//     };
//
//     return request(options)
//         .then(function (body) {
//             return body.data
//         });
// }