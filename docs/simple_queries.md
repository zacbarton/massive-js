## The Simplest Query: Inline SQL

If you have a simple query to run and you want to do it inline, you can do so:

```js
db.run("select * from products", function(err,res){
  //all products returned in array
});
```

You can parameterize the query using placeholders. Note that the values need to be specified as an array:

```js
db.run("select * from products where name LIKE $1",["%fruity%"], function(err,res){
  //all matching products returned in array
});
```

For additional parameters, use `$2`, `$3`, etc.

## Using `where()`

You can save yourself from repeated `select * from` typing by accessing the loaded tables on your DB instance and then using `where()`. Our `find` syntax is quite helpful, but we've added this method so you can find what you need if your WHERE statement is complex:

```js
db.products.where("id=$1 OR id=$2", [10,21], function(err,products){
  //products 10 and 21
});
```

## Using `find()`

You don't need to `select *` your way through your data, Massive supports simple `find` syntax:

```js
//find by id
db.products.find(1, function(err,res){
  //res.id == 1
});

//another way to do the above
db.users.findOne(1, function(err,user){
  //returns user with id (or whatever your PK is) of 1
});

//find first match
db.users.findOne({email : "test@test.com"}, function(err,user){
  //returns the first match
});

//all active users
db.users.find({active: true}, function(err,users){
  //all users who are active
});

//Send in an ORDER clause and a LIMIT with OFFSET
var options = {
  limit : 10,
  order : "id",
  offset: 20
}
db.products.find({}, options, function(err,products){
  //products ordered in descending fashion
});

//You only want the sku and name back
var options = {
  limit : 10,
  columns : ["sku", "name"]
}
db.products.find({}, options, function(err,products){
  // an array of sku and name
});

//an IN query
db.products.find({id : [10,21]}, function(err,products){
  //products 10 and 21
});

//a NOT IN query
db.products.find({"id <>": [10,21]}, function(err,products){
  //products other than 10 and 21
});

db.products.find({"id < " : 2}, function(err,res){
  //id less than 2
});

db.products.find({"id < " : 2}, function(err,res){
  //id greater than 2
});

//Send in an ORDER clause by passing in a second argument
db.products.find({},{order: "price desc"} function(err,products){
  //products ordered in descending fashion
});
```

Massive also supports JSON specification if you have a `json` or `jsonb` column you want to use:

```js
//match a JSON field
db.products.find({"specs->>weight": 30}, function(err, products) {
  //products where the 'specs' field is a JSON document containing {weight: 30}
  //note that the corresponding SQL query would be phrased specs->>'weight'; Massive adds the quotes for you
});

//match a JSON field with an IN list (note NOT IN is not supported for JSON fields at this time)
db.products.find({"specs->>weight": [30, 35]}, function(err, products) {
  //products where the 'specs' field is a JSON document containing {weight: 30}
  //note that the corresponding SQL query would be phrased specs->>'weight'; Massive adds the quotes for you
});

//drill down a JSON path
db.products.find({"specs#>>{dimensions,length}": 15}, function(err, products) {
  //products where the 'specs' field is a JSON document having a nested 'dimensions' object containing {length: 15}
  //note that the corresponding SQL query would be phrased specs->>'{dimensions,length}'; Massive adds the quotes for you
});
```

## Using `count()`

You can get the number of records for a query by using the count method:

```js
db.products.count({id: [1, 2]}, function(err,res){
  //returns 2 as the result
});
```

## Using Schemas

If you like to separate your tables based on a schema, you can still work with them easily with Massive. For instance, our `users` table might be part of the `membership` schema:

```js
db.membership.users.find(1, function(err,res){
  //user returned
});
```

