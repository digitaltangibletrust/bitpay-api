bitpay-api
=========

The bitpay api wrapped for NodeJS/JavaScript.

Why we created it?
=========
We created this API wrapper so you could access the equivalent REST API through simple asynchronous functions with all the power provided by Bitpay's direct API. This API uses simple method calls without all of the hassle of writing API request URLs, body and query strings.

Pull requests are welcomed!


## API documentation

### Instantiating a Client

```js
var Bitpay = require('bitpay-api');
var bitpay = new BitPay(options);
```

This generates a new API client. It accepts options arguments.

##### options:

-`apiKey` **string** Optional. Your Bitpay api key for write operations, like creating an invoice.

### Bitpay client

- [bitpay.createInvoice(order, callback)](#createInvoice)
- [bitpay.getInvoice(invoiceId, callback)](#getInvoice)
- [bitpay.getBTCBestBidRates, callback)](#getBTCBestBidRates)
- [bitpay.getBTCTxLedger(params, callback)](#getBTCTxLedger)
- [bitpay.invoiceListener()](#invoiceListener)

<a name="createInvoice"></a>
#### createInvoice

Create a Bitpay invoice from order.

##### Arguments

- `order` **object** Customer order information to generate the invoice:
  - `price` **string** Required. This is the amount that is required to be collected from the buyer. Note, if this is specified in a currency other than BTC, the price will be converted into BTC at market exchange rates to determine the amount collected from the buyer.
  - `currency` **string** Required. This is the currency code set for the price setting.  The pricing currencies currently supported are USD, EUR, BTC, and all of the codes listed on this page: https://bitpay.com/bitcoin­exchange­rates
  - `posData` **string** Optional. A passthru variable provided by the merchant and designed to be used by the merchant to correlate the invoice with an order or other object in their system. Maximum string length is 100 characters. This passthru variable can be a JSON­-encoded string, for example `posData: { "ref" : 711454, "affiliate" : "spring112" }`
  - `notificationURL` **string** Optional. A URL to send status update messages to your server (this must be an https URL, unencrypted http URLs or any other type of URL is not supported). Bitpay.com will send a POST request with a JSON encoding of the invoice to this URL when the invoice status changes.
  - `transactionSpeed` **string** Optional. default value: set in your https://bitpay.com/order­settings, the default value set in your merchant dashboard is "medium". NOTE: Orders are posted to your Account Summary after 6 block confirmations regardless of this setting.
    - "high": An invoice is considered to be "confirmed" immediately upon 
    receipt of payment.
    - "medium": An invoice is considered to be "confirmed" after 1 block 
    - "low": An invoice is considered to be "confirmed" after 6 block confirmations (~1 hour). 
  - `fullNotifications` **string** Optional. default value: false
    - true:   Notifications will be sent on every status change.
    - false:  Notifications are only sent when an invoice is confirmed (according to the "transactionSpeed" setting).
  - `notificationEmail` **string** Optional. Bitpay.com will send an email to this email address when the invoice status changes.
  - `redirectURL` **string** Optional. This is the URL for a return link that is displayed on the receipt, to return the shopper back to your website after a successful purchase. This could be a page specific to the order, or to their account.
  - `orderID` **string** Optional. Used to display your public order number to the buyer on the BitPay invoice. In the merchant Account Summary page, this value is used to identify the ledger entry. Maximum string length is 100 characters.
  - `itemDesc` **string** Optional. Used to display an item description to the buyer. Maximum string length is 100 characters.
  - `itemCode` **string** Optional. Used to display an item SKU code or part number to the buyer. Maximum string length is 100 characters.
  - `physical` **string** Optional. default value: false
    - true:  Indicates a physical item will be shipped (or picked up)
    - false:  Indicates that nothing is to be shipped for this order
 Maximum string length of each field is 100 characters.
  - `buyerAddress1` **string 100** Optional.
  - `buyerAddress2` **string 100** Optional.
  - `buyerCity` **string 100** Optional.
  - `buyerState` **string 100** Optional.
  - `buyerZip` **string 100** Optional.
  - `buyerCountry` **string 100** Optional.
  - `buyerEmail` **string 100** Optional.
  - `buyerPhone` **string 100** Optional.
- `callback` **function** Returns error or the `invoice` object:
  - `id` **string** The unique id of the invoice assigned by bitpay.com
  - `url` **string** An https URL where the invoice can be viewed.
  - `posData` **string** The passthru variable provided by the merchant on the original invoice creation.
  - `status` **string** The current invoice status.
    - "paid" As soon as full payment (or over payment) is received, an invoice goes into the paid status.
    - "confirmed" The transaction speed preference of an invoice determines when an invoice is confirmed.  For the high speed setting, it will be confirmed as soon as full payment is received on the bitcoin network (note, the invoice will go from a statusof new to confirmed, bypassing the paid status). For the medium speed setting, the invoice is confirmed after the payment transaction(s) have been confirmed by 1 block on the bitcoin network.  For the low speed setting, 6 blocks on the bitcoin network are required.  Invoices are considered complete after 6 blocks on the bitcoin network, therefore an invoice will go from a paid status directly to a complete status if the transaction speed is set to low.
    - "complete" When an invoice is complete, it means that BitPay.com has credited the merchant’s account for the invoice.  Currently, 6 confirmation blocks on the bitcoin network are required for an invoice to be complete.  Note, in the future (for qualified payers), invoices may move to a complete status immediately upon payment, in which case the invoice will move directly from a new status to a complete status.
    - "expired" An expired invoice is one where payment was not received and the 15 minute payment window has elapsed.
    - "invalid" An invoice is considered invalid when it was paid, but payment was not confirmed within 1 hour after receipt.It is possible that some transactions on the bitcoin network can take longer than 1 hour to be included in a block.  In such circumstances, once payment is confirmed, BitPay.com will make arrangements with the merchant regarding the funds (which can either be credited to the merchant account on another invoice, or returned to the buyer).
  - `price` **string** The price set by the merchant (in terms of the provided currency).
  - `currency` **string** The 3 letter currency code in which the invoice was priced.
  - `btcPrice` **string** The amount of bitcoins being requested for payment of this invoice (same as the price if the merchant set the price in BTC).
  - `invoiceTime` **string** The time the invoice was created in milliseconds since midnight January 1, 1970.  Time format is "2014­01­01T19:01:01.123Z".
  - `expirationTime` **string** The time at which the invoice expires and no further payment will be accepted (in milliseconds since midnight January 1, 1970). Currently, all invoices are valid for 15 minutes.  Time format is "2014­01­01T19:01:01.123Z".
  - `currentTime` **string** The current time on the BitPay.com system (by subtracting the current time from the expiration time, the amount of time remaining for payment can be determined).  Time format is "2014­01­01T19:01:01.123Z".
  
```js
bitpay.createInvoice(order, function(err, invoice) {
  // .. utilize invoice
});
```
<a name="getInvoice"></a>
#### getInvoice

Get the status of an invoice.

##### Arguments

- `invoiceId` **string** The Bitpay invoice ID.
- `callback` **function** Returns error or the `invoice` object (see above).

```js
bitpay.getInvoice(invoiceId, function(err, invoice) {
  // .. utilize invoice
});
```

<a name="getBTCBestBidRates"></a>
#### getBTCBestBidRates

Get Bitcoin best bid rates.

##### Arguments

- `callback` **function** Returns error or the `rates` object:
  - `name` **string** The full display name of the currency.
  - `code` **string** The three letter code for the currency, in all caps.
  - `rate` **number** The numeric exchange rate of this currency provided by the BitPay server.

```js
bitpay.getBTCBestBidRates(function(err, rates) {
  // .. utilize rates
});
```

<a name="getBTCTxLedger"></a>
#### getBTCTxLedger

Get the Bitcoin transaction ledger.

##### Arguments

- `params` **object** Ledger request object:
  - `c` **string** This is the three letter currency code set for the ledger.  The payout currencies currently supported are:
    - BTC ­ Bitcoin
    - AUD ­ Australian Dollar
    - CAD ­ Canadian Dollar
    - EUR ­ Eurozone Euro
    - GBP ­ Pound Sterling
    - MXN ­ Mexican Peso
    - NZD ­ New Zealand Dollar
    - USD ­ US Dollar
    - ZAR ­ South African Rand
  - `startDate` **string** The start date for the ledger query.  Ledger entries are retrieved from this date (inclusive) forward.  The format for this parameter is "yyyy­mm­dd"; example "2014­01­01".
  - `endDate` **string** The end date for the ledger query.  Ledger entries are retrieved up to and including this date.  The format for this parameter is "yyyy­mm­dd"; example "2014­01­31".
- `callback` **function** Returns error or the `ledger` object:
  - `code` **string** The transaction code in the BitPay ledger.  The code is associated with a transaction type, "txType".
    - 1000 = "sale"
    - 1001 = "fee"
    - 1002 = "payout"
    - 1003 = "ACH/other"
    - 1004 = "charity fee refund"
    - 1005 = "deposit"
    - 1006 = "exchange"
    - 1007 = "exchange fee"
    - 1008 = "plan charge"
    - 1009 = "plan change credit"
    - 1010 = "plan underuse credit"
    - 1011 = "plan charge transfer"
  - `amount` **string** The amount of the credit or debit from the account.  The amount is expressed in the currency unit specified in the request (see GET parameter "c").  The amount is a positive number for a ledger credit.  The amount is a negative number for ledger debit.
  - `timestamp` **string** The date and time the ledger entry was made.  Time format is "2014­01­01T19:01:01.123Z".
  - `description` **string** The item description specified when the invoice was created.  See invoice field "itemDesc".
  - `orderId` **string** The merchant order identifier specified when the invoice was created.  See invoice field "orderID". If the invoice did not specify an "orderID" then this field will
not be present in the result set.
  - `txType` **string** Identifies the type of transaction for the ledger entry.  One of the following:
    - "sale"
    - "fee"
    - "payout"
    - "ACH/other"
    - "charity fee refund"
    - "deposit"
    - "exchange"
    - "exchange fee"
    - "plan charge"
    - "plan change credit"
    - "plan underuse credit"
    - "plan charge transfer"
  - `exRates` **string** This is a JSON block containing the exchange rate used in the transaction.
    - currency code ­ the three letter currency code specifying the units of the associated exchange rate.
    - exchange rate ­ the exchange rate price expressed in the associated currency code.
  - `buyerFields` **string** This is a JSON block containing the buyer details for the transaction.  These values were provided when the invoice was created.  All values are strings. Maximum string length is 100 characters.  If no buyer information was specified when the invoice was created then this field will be present but the JSON block will be empty; e.g. {}.  If only several of the buyer information fields were specified when the invoice was created then those that were not specified will not be present in the result set.
  - `invoiceId` **string** The unique id of the invoice assigned by bitpay.com
  - `sourceType` **string** An identifier that specifies the type of source used to initiate the ledger entry. One of the following:
    - `<blank>`
    - "invoice"
    - "bitcoinTx"



```js
bitpay.getBTCTxLedger(params, function(err, ledger) {
  // .. utilize ledger
});
```

<a name="invoiceListener"></a>
#### invoiceListener (Middleware)

Create a Bitpay invoice from order. This is Express/Connect middleware. Place this on your POST receive invoice update route. Your request object will be populated with an `invoice` object (`req.invoice`). This is the same invoice type described earlier.

```js
// middleware
app.post('receive/invoice/:internalInvoiceId', bitpay.invoiceListener(), function(req, res) {
  // .. utilize req.invoice

  // ... send status 200 once you have successfully processed the invoice, all other responses will cause bitpay to retry until 200 is received
  res.json(200, {});
});
```

## Reference
https://github.com/bitpay/nodejs-client

https://bitpay.com/downloads/bitpayApi.pdf

## Test
```
npm test
```
Note: to test against the actual bitpay api do:
```
apiKey=<Your bitpay api key> npm test
```
