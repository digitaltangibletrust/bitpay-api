bitpay-api
=========

The bitpay api wrapped for NodeJS/JavaScript.

Why we created it?
=========
We created this API wrapper so you could access the equivalent rest api through simple asynchronous functions with all the power provided by Bitpay's direct API. This API uses simple method calls without all of the hassle of writing API request urls, body and query strings.

Pull requests are welcomed!


Usage
==
```javascript
var Bitpay = require('bitpay-api');

var bitpay = new BitPay(options);

bitpay.createInvoice(order, function(err, invoice) {
  // .. utilize invoice
});

bitpay.getInvoice(invoiceId, function(err, invoice) {
  // .. utilize invoice
});

bitpay.getBTCBestBidRates(function(err, rates) {
  // .. utilize rates
});

bitpay.getBTCTxLedger(params, function(err, ledger) {
  // .. utilize ledger
});

// middleware
app.post('receive/invoice/path', bitpay.invoiceListener(), function(req, res) {
  // .. utilize req.invoice

  // ... send status 200 once you have successfully processed the invoice, all other responses will cause bitpay to retry until 200 is received
  res.json(200, {});
});
```

Reference
==
https://github.com/bitpay/nodejs-client

https://bitpay.com/downloads/bitpayApi.pdf

Test
==
```
npm test
```
Note: to test against the actual bitpay api do:
```
apiKey=<Your bitpay api key> npm test
```
