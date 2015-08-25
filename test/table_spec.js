var assert = require("assert");
var helpers = require("./helpers");
var _ = require("underscore")._;
var db;

describe('Tables -Add/Edit/Delete', function () {
  before(function(done){
    helpers.resetDb(function(err,res){
      db = res;
      done();
    });
  });

  describe("Executing inline SQL", function () {
    it('with run and no args returns 4 products', function (done) {
      db.run("select * from products", function(err,res){
        assert.equal(4, res.length);
        done();
      });
    });
    it('with run and id returns Product 1', function (done) {
      db.run("select * from products where id=$1",[1], function(err,res){
        assert.equal(1, res[0].id);
        done();
      });
    });
  });

  describe('Add/Update/Delete records:', function() {
    it('adds a product ', function (done) {
      db.products.save({name : "Gibson Les Paul", description : "Lester's brain child", price : 3500}, function(err, res){
        assert.equal(res.id, 5);
        done();
      });
    });
    it('updates a product', function (done) {
      var product = {id : 4, name : "Fender Stratocaster", description : "Leo Fender's baby", price : 1200, tags: ['1', '2']};
      db.products.save(product, function(err, res){
        assert.equal(product.id, 4);  // should not clobber the original object
        assert.equal(res.id, 4);
        assert.equal(res.name, "Fender Stratocaster");
        done();
      });
    });
    it('updates multiple products', function (done) {
      db.products.update({in_stock: true}, {in_stock: false}, function(err, res) {
        assert.equal(res.length, 2);
        assert.equal(res[0].id, 1);
        assert.equal(res[0].in_stock, false);
        assert.equal(res[1].id, 2);
        assert.equal(res[1].in_stock, false);
        done();
      });
    });
    it('updates all products', function (done) {
      db.products.update({}, {price: 1.23}, function(err, res) {
        assert.equal(res.length, 5);
        assert.equal(res[0].price, 1.23);
        assert.equal(res[1].price, 1.23);
        assert.equal(res[2].price, 1.23);
        assert.equal(res[3].price, 1.23);
        assert.equal(res[4].price, 1.23);
        done();
      });
    });
    it('updates multiple products with an IN list', function (done) {
      db.products.update({id: [1, 2]}, {price: 123.45}, function(err, res) {
        assert.equal(res.length, 2);
        assert.equal(res[0].id, 1);
        assert.equal(res[0].price, 123.45);
        assert.equal(res[1].id, 2);
        assert.equal(res[1].price, 123.45);
        done();
      });
    });
    it('updates multiple products with a NOT IN list', function (done) {
      db.products.update({'id !=': [1, 2]}, {price: 543.21}, function(err, res) {
        assert.equal(res.length, 3);
        assert.equal(res[0].id, 3);
        assert.equal(res[0].price, 543.21);
        assert.equal(res[1].id, 5);
        assert.equal(res[1].price, 543.21);
        assert.equal(res[2].id, 4);
        assert.equal(res[2].price, 543.21);
        done();
      });
    });
    it('deletes a product ', function (done) {
      db.products.destroy({id : 4}, function(err, deleted){
        var remaining = db.products.find(4, function(err, found) { 
          //Deleted returns an array...
          assert(found === undefined && deleted[0].id === 4);
          done();
        });
      });
    });
    it('deletes all products', function (done) {
      db.products.destroy({}, function(err, deleted){
        var remaining = db.products.find({}, function(err, found) { 
          assert.equal(deleted.length, 4);
          assert.equal(found.length, 0);
          done();
        });
      });
    });
  });

  describe('Add/Update/Delete records with nonstandard casing:', function() {
    it('adds a User ', function (done) {
      db.Users.save({Email : "foo@bar.com", Name: "Another test user"}, function(err, res){
        assert.equal(res.Id, 2);
        assert.equal(res.Email, "foo@bar.com");
        done();
      });
    });
    it('updates a User ', function (done) {
      db.Users.save({Id : 2, Email : "bar@foo.com"}, function(err, res){
        assert.equal(res.Id, 2);
        assert.equal(res.Email, "bar@foo.com");
        done();
      });
    });
    it('deletes a User ', function (done) {
      db.Users.destroy({Id : 2}, function(err, deleted){
        var remaining = db.Users.find(2, function(err, found) { 
          //Deleted returns an array...
          assert(found === undefined && deleted[0].Id == 2);
          done();
        });
      });
    });
  });

  describe('Add/Update/Delete records with UUID keys:', function() {
    it('adds an order', function (done) {
      db.orders.save({product_id: 1, user_id: 1, notes: 'hi'}, function(err, res) {
        assert.ok(res.id !== null);
        assert.equal(res.product_id, 1);
        assert.equal(res.user_id, 1);
        assert.equal(res.notes, 'hi');
        done();
      });
    });

    it('updates an order', function (done) {
      db.orders.findOne({}, function(err, found) { 
        if (err) { throw err; }
        
        found.notes = 'hello';

        db.orders.save(found, function(err, res) {
          assert.equal(res.id, found.id);
          assert.equal(res.notes, 'hello');
          done();
        });
      });
    });

    it('deletes an order', function (done) {
      db.orders.findOne({}, function(err, found) { 
        if (err) { throw err; }

        db.orders.destroy({id : found.id}, function(err, deleted) {
          db.orders.findOne({id : found.id}, function(err, remaining) { 
            assert.equal(deleted[0].id, found.id);
            assert.ok(remaining === undefined);
            done();
          });
        });
      });
    });
  });

  describe('Extra insert tests', function () {
    it('inserts a product', function (done) {
      db.products.insert({name: "A Product"}, function (err, res) {
        assert.equal(res.name, "A Product");

        done();
      });
    });

    it('inserts multiple products', function (done) {
      db.products.insert([{name: "A Product"}, {name: "Another Product"}], function (err, res, res2) {
        assert.equal(res.length, 2);
        assert.equal(res[0].name, "A Product");
        assert.equal(res[1].name, "Another Product");

        done();
      });
    });

    it('inserts array fields', function (done) {
      db.products.insert({name: "A Product", tags: ['one', 'two']}, function (err, res) {
        assert.equal(res.name, "A Product");
        assert.deepEqual(res.tags, ['one', 'two']);

        done();
      });
    });
  });
});