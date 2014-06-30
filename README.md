bitpay-api
=========

The bitpay api wrapped for NodeJS/JavaScript.

Usage
==
```javascript
var Bitpay = require('bitpay-api');

var bitpay = new BitPay(options);

bitpay.createInvoice(order, function(err, response, invoice) {
  // this callback follows the request (https://github.com/mikeal/request) api callback protocol
  // response.statusCode should equal 200
  // .. utilize invoice
});

bitpay.getInvoice(invoiceId, function(err, response, invoice) {
  // this callback follows the request (https://github.com/mikeal/request) api callback protocol
  // response.statusCode should equal 200
  // .. utilize invoice
});

bitpay.getBTCBestBidRates(function(err, response, rates) {
  // this callback follows the request (https://github.com/mikeal/request) api callback protocol
  // response.statusCode should equal 200
  // .. utilize rates
});

bitpay.getBTCTxLedger(params, function(err, response, ledger) {
  // this callback follows the request (https://github.com/mikeal/request) api callback protocol
  // response.statusCode should equal 200
  // .. utilize ledger
});

// middleware
app.post('receive/invoice/path', bitpay.invoiceListener(), function(req, res) {
  // .. utilize req.invoice
});
```

Reference
==
https://github.com/bitpay/nodejs-client

Test
==
```
npm test
```
Note: to test against the actual bitpay api do:
```
apiKey=<Your bitpay api key> npm test
```
