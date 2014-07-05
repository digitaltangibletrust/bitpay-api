
/**
 * Module dependencies.
 */

var BitPay = require('../')
  , should = require('should')
  , apiKey = process.env.apiKey
  , _ = require('lodash')
  , testInvoice = require('./testInvoice');

BitPay.version.should.match(/^\d+\.\d+\.\d+$/);

describe('bitpay', function() {
  var testApiKey = 'test key';

  describe('#constructor', function() {
    it('should create an API instance with sufficient params', function() {
      var bitpay = new BitPay({apiKey: testApiKey});

      bitpay.should.be.ok;
    });
  });

  describe('#invoiceListener', function() {
    var bitpay = new BitPay({apiKey: testApiKey})
      , middleware = bitpay.invoiceListener();

    it('should inject an invoice to the request object', function(done) {
      var req = {
            body: {
              id: 'some invoice id'
            }
          }
        , next = function() {
            req.invoice.id.should.equal(req.body.id);
            done();
          };

      middleware(req, null, next);
    });

    it('should be able to handle a string encoded invoice object', function(done) {
      var body = {
            id: 'some invoice id'
          }
        , req = {
            body: JSON.stringify(body)
          }
        , next = function() {
            req.invoice.id.should.equal(body.id);
            done();
          };

      middleware(req, null, next);
    });
  });

  describe('Hit api live', function() {
    it('should tell you if you didn\'t set an apiKey for live testing', function() {
      if(!apiKey) console.warn('NOTE: No api key provided. Hit api live tests will not be exercised. If you want to test an actual api hit. Do `apiKey=<Your bitpay api key> npm test`');
      else console.warn('You are hitting bitpay\'s API live!')
    });

    describe('#createInvoice #getInvoice', function() {
      it('should create and get an invoice', function(done) {
        if(!apiKey) return done();
        
        var bitpay = new BitPay({apiKey: apiKey});

        bitpay.createInvoice(testInvoice, function(err, invoice) {
          should.not.exist(err);
          invoice.id.should.be.ok;
          bitpay.getInvoice(invoice.id, function(err, _invoice) {
            should.not.exist(err);
            _invoice.id.should.be.equal(invoice.id);
            done();
          });
        });
      });
    });

    describe('#getBTCBestBidRates', function() {
      it('should get the best bid rates', function(done) {
        if(!apiKey) return done();
        
        var bitpay = new BitPay({apiKey: apiKey});

        bitpay.getBTCBestBidRates(function(err, rates) {
          should.not.exist(err);
          _.isArray(rates).should.be.ok;
          done();
        });
      });
    });

    // TODO: this api call does not appear to be working properly at bitpay
    //        Try hitting it manually: https://bitpay.com/api/ledger?c=BTC&startDate=2014-%C2%AD01%C2%AD-01&endDate=2014%C2%AD-05%C2%AD-31
    //        The return array is always of length zero
    describe.skip('#getBTCTxLedger', function() {
      it('should get the transaction ledger', function(done) {
        if(!apiKey) return done();

        var bitpay = new BitPay({apiKey: apiKey});

        bitpay.getBTCTxLedger({
          c: 'BTC',
          startDate: '2014-01-01',
          endDate: '2014-01-31'
        }, function(err, ledger) {
          should.not.exist(err);
          _.isArray(ledger).should.be.ok;
          ledger.length.should.be.above(0);
          done();
        });
      });
    });
  });

  describe('#validate' , function() {
    var bitpay = new BitPay({
      apiKey: testApiKey,
      shortCircuitBitPay: function(params, cb) {
        cb();
      }
    })

    it('should recognize a valid invoice', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC'
      }, done);
    });

    it('should recognize a valid price as string', function(done) {
      bitpay.createInvoice({
        price: '12.3',
        currency: 'BTC'
      }, done);
    });

    it('should catch an invalid currency', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'THISDNE'
      }, function(err) {
        should.exist(err);
        done();
      });
    });

    it('should catch missing currency', function(done) {
      bitpay.createInvoice({
        price: 12.3
      }, function(err) {
        should.exist(err);
        done();
      });
    });

    it('should catch an invalid price', function(done) {
      bitpay.createInvoice({
        price: 'x12.3',
        currency: 'BTC'
      }, function(err) {
        should.exist(err);
        done();
      });
    });

    it('should catch missing price', function(done) {
      bitpay.createInvoice({
        currency: 'BTC'
      }, function(err) {
        should.exist(err);
        done();
      });
    });

    it('should catch a string/100 length field that is not a string', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC',
        posData: 12.3
      }, function(err) {
        should.exist(err);
        done();
      });
    });

    it('should catch a string/100 length field that is too long', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC',
        posData: (_.times(101, function(){return '1'})).join('')
      }, function(err) {
        should.exist(err);
        done();
      });
    });

    it('should permit a string/100 length field that is just right', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC',
        posData: (_.times(100, function(){return '1'})).join('')
      }, done);
    });

    it('should permit a valid notificationURL field', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC',
        notificationURL: 'http://notify.me/here'
      }, done);
    });

    it('should not permit an invalid notificationURL field', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC',
        notificationURL: 'http:notify.me/here'
      }, function(err) {
        should.exist(err);
        done();
      });
    });

    it('should permit a valid redirectURL field', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC',
        redirectURL: 'http://redirect.me/here'
      }, done);
    });

    it('should not permit an invalid redirectURL field', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC',
        redirectURL: 'http:redirect.me/here'
      }, function(err) {
        should.exist(err);
        done();
      });
    });

    it('should permit a valid notificationEmail field', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC',
        notificationEmail: 'porkchop@notify.me'
      }, done);
    });

    it('should not permit an invalid notificationEmail field', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC',
        notificationEmail: 'porkchop.wtf'
      }, function(err) {
        should.exist(err);
        done();
      });
    });

    it('should permit a valid fullNotifications field (===false)', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC',
        fullNotifications: false
      }, done);
    });

    it('should permit a valid fullNotifications field (===true)', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC',
        fullNotifications: true
      }, done);
    });

    it('should not permit an invalid fullNotifications field', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC',
        fullNotifications: 'wtf'
      }, function(err) {
        should.exist(err);
        done();
      });
    });

    it('should permit a valid physical field (===false)', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC',
        physical: false
      }, done);
    });

    it('should permit a valid physical field (===true)', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC',
        physical: true
      }, done);
    });

    it('should not permit an invalid physical field', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC',
        physical: 'wtf'
      }, function(err) {
        should.exist(err);
        done();
      });
    });

    it('should permit a valid transactionSpeed field (==="high")', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC',
        transactionSpeed: 'high'
      }, done);
    });

    it('should permit a valid transactionSpeed field (==="medium")', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC',
        transactionSpeed: 'medium'
      }, done);
    });

    it('should permit a valid transactionSpeed field (==="low")', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC',
        transactionSpeed: 'low'
      }, done);
    });

    it('should not permit an invalid transactionSpeed field', function(done) {
      bitpay.createInvoice({
        price: 12.3,
        currency: 'BTC',
        transactionSpeed: 'wtf'
      }, function(err) {
        should.exist(err);
        done();
      });
    });
  });
});