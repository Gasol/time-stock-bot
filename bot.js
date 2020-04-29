//TimeStockBot
var TelegramBot = require('node-telegram-bot-api');
var URL = require('url');

var smartNotifier = require('./smartNotifier');
var finvizScraper = require('./finvizScraper');

var token = process.env.BOT_API;
var options = {
  webHook: {
    port: 8443,
    key: __dirname+'/key.pem',
    cert: __dirname+'/crt.pem',
  },
};

var bot = new TelegramBot(token, options);
bot.setWebHook('stock.shubapp.com:443/bot'+token, __dirname+'/crt.pem');
// var schedules={};

function init() {
  bot.onText(/^\/info ([^ ]+)$/, infoHandler);
  bot.onText(/^\/recomended$/, recomendedHandler);
}


function recomendedHandler(msg){
  var fromId = msg.chat.id;
  finvizScraper.recomended().then(urls=>{
    urls.forEach((url)=>{
      const stockName = URL.parse(url,true).query.t;
      sendMessage(fromId, `[${stockName}](${url})`,
        {disable_web_page_preview:false}
      );
    });
  }).catch(e=>{
    console.error(e);
    sendMessage(fromId, 'Sorry, can\'t get recomended stocks, try again later');
  });
}

function stocksAlreadyAlerted(stock){
  if ((stock.lastAlerted===undefined) ||
    (stock.lastAlerted!==undefined &&
      ((new Date()).toDateString() !== stock.lastAlerted.toDateString()))
    ){
    return true;
  }
  return false;
}

function sendMessage(id, message, extraOps){
  bot.sendMessage(id, message, Object.assign({},extraOps));
}

init();
