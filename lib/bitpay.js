var debug = require('debug')('bitpay')
  , request = require('request')
  , crypto = require('crypto')
  , _ = require('lodash')
  , validator = require('validator')
  , currencyCodes = require('./currencyCodes');


// Options:
// - url {String}: (optional) bitpay api url
// - apiKey {String}: API Key hooked up with bitpay
// - shortCircuitBitPay {Function}: (optional) For testing to mock out api responses from bitpay
function Client(config) {
  config = config || {};
  this.apiKey = config.apiKey;
  this.url = config.url || 'https://bitpay.com';

  if(config.shortCircuitBitPay) this._callBitPay = config.shortCircuitBitPay; // if you want to replace the live api calls with a mock fcn for testing
}

Client.version = require('../package').version;

// Public
Client.prototype.getInvoice = function(id, cb) {
  this._callBitPay({
    uri: '/api/invoice/' + id,
    method: 'GET'
  }, cb);
};

// Public
Client.prototype.getBTCBestBidRates = function(cb) {
  this._callBitPay({
    uri: '/api/rates',
    method: 'GET'
  }, cb);
};

// Public
// TODO: this api call does not appear to be working properly at bitpay
//        Try hitting it manually: https://bitpay.com/api/ledger?c=BTC&startDate=2014-%C2%AD01%C2%AD-01&endDate=2014%C2%AD-05%C2%AD-31
//        The return array is always of length zero
Client.prototype.getBTCTxLedger = function(params, cb) {
  // TODO: validate params
  this._callBitPay({
    uri: '/api/ledger',
    method: 'GET',
    qs: params
  }, cb);
};

// Public
Client.prototype.createInvoice = function(invoice, cb) {
  var self = this;
  validate(invoice, function(err) {
    if(err) cb(err);
    else self._callBitPay({
      uri: '/api/invoice',
      method: 'POST',
      body: invoice
    }, cb);
  });
};

// Public
// returns the invoice listener middleware
Client.prototype.invoiceListener = function() {
  return function(req, res, next) {
    var invoice = req.body;
    invoice = _.isString(invoice) ? JSON.parse(invoice) : invoice;
    req.invoice = invoice;
    next();
  };
};


// Private
// - method {String}: HTTP method to use
// - uri {Array[String]}: API Endpoint
// - body {Array|Object}: JSON request body (optional)
// - qs {Array|Object}: JSON request query string object (optional)
Client.prototype._callBitPay = function(params, cb) {
  debug(uri, method, body);

  var uri = params.uri
    , method = params.method
    , body = params.body
    , qs = params.qs;

  var options = {
    url: this.url + uri,
    method: method,
    strictSSL: true,
    json: true,
    body: body,
    qs: qs
  };

  if(this.apiKey) options.auth = {
    user: this.apiKey
  };

  request(options, function(err, response, body) {
    if (err) return cb(err)

    var code = response.statusCode;

    body = body || {message: 'No Body'};
    // assign error message if 400
    if (!err && code >= 400) {
      err = new Error(body.message)
    }

    cb(err, body);
  });
};

var string100s = ['posData', 'buyerName', 'buyerAddress1', 'buyerAddress2', 'buyerState', 'buyerCity', 'buyerZip', 'buyerCountry', 'buyerEmail', 'buyerPhone', 'orderID', 'itemDesc', 'itemCode']
  , validTransactionSpeeds = ['high', 'medium', 'low'];

// NOTE: Should we leave validation up to bitpay?
function validate(invoice, cb) {
  var price = invoice.price
    , currency = invoice.currency
    , notificationURL = invoice.notificationURL
    , transactionSpeed = invoice.transactionSpeed
    , fullNotifications = invoice.fullNotifications
    , notificationEmail = invoice.notificationEmail
    , redirectURL = invoice.redirectURL
    , orderID = invoice.orderID
    , itemDesc = invoice.itemDesc
    , itemCode = invoice.itemCode
    , physical = invoice.physical;
  
  // Begin Required fields
  if(!price) return cb(new Error('Field price is mandatory'));
  if(!currency) return cb(new Error('Field currency is mandatory'));
  if(!validator.isFloat(price)) return cb(new Error('Field price must be numeric'));
  if(_.indexOf(currencyCodes, currency) === -1) return cb(new Error('Invalid currency code: ' + currency + '. Must be one of ' + currencyCodes.join(',')));  // quicker look-ups with a hash of cc's at some poin)t

  // Begin Optional fields
  if(notificationURL && !validator.isURL(notificationURL)) return cb(new Error('Invalid notificationURL: ' + notificationURL));
  if(redirectURL && !validator.isURL(redirectURL)) return cb(new Error('Invalid redirectURL: ' + redirectURL));
  if(notificationEmail && !validator.isEmail(notificationEmail)) return cb(new Error('Invalid notificationEmail: ' + notificationEmail));
  if(transactionSpeed && _.indexOf(validTransactionSpeeds, transactionSpeed) === -1) return cb(new Error('Invalid transactionSpeed: ' + transactionSpeed + '. Must be one of ' + validTransactionSpeeds.join(',')));
  if(!_.isUndefined(fullNotifications) && !_.isBoolean(fullNotifications)) return cb(new Error('Invalid fullNotifications: ' + fullNotifications + '. Must be boolean'));
  if(!_.isUndefined(physical) && !_.isBoolean(physical)) return cb(new Error('Invalid physical: ' + physical + '. Must be boolean'));

  // these fields must be strings of length < 100 chars
  for(var i in string100s) {
    var field = string100s[i]
      , value = invoice[field];
  
    if(value && (!_.isString(value) || value.length > 100)) return cb(new Error('Field ' + field + ' invalid. String should be 100 characters or less'))
  }

  cb();
}

module.exports = Client;