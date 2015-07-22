/*-
 * Javascript Sample Application: Connection to Informix using Mongo
 */

//Topics
//1 Data Structures
//1.1 Create collection
//1.2 Create table
//2 Inserts
//2.1 Insert a single document into a collection 
//2.2 Insert multiple documents into a collection 
//3 Queries
//3.1 Find one document in a collection 
//3.2 Find documents in a collection 
//3.3 Find all documents in a collection 
//3.4 Count documents in a collection 
//3.5 Order documents in a collection 
//3.6 Find distinct fields in a collection 
//3.7 Joins
//3.7a Collection-Collection join
//3.7b Table-Collection join
//3.7c Table-Table join 
//3.8 Modifying batch size 
//3.9 Find with projection clause 
//4 Update documents in a collection 
//5 Delete documents in a collection 
//6 SQL passthrough 
//7 Transactions
//8 Commands
//8.1 Count  
//8.2 Distinct 
//8.3 CollStats 
//8.4 DBStats 
//9 Drop a collection

var MongoClient = require('mongodb').MongoClient;
var collectionName = "nodeMongo";
var url;

var commands = [];
//var buffer = require('fs').readFileSync("");

function City(name, population, longitude, latitude, countryCode){
	this.name = name;
	this.population = population;
	this.longitude = longitude;
	this.latitude = latitude;
	this.countryCode = countryCode;
}

City.prototype.toJSON = function(){
	return JSON.parse('{"name": "' + this.name + '","population": ' + this.population + 
			',"longitude": ' + this.longitude + ',"latitude": ' + this.latitude + ',"countryCode": ' + this.countryCode + '}');
};

var kansasCity = new City("Kansas City", 467007, 39.0997, 94.5783, 1);
var kansasCityJSON = kansasCity.toJSON();
var seattle = new City("Seattle", 652405, 47.6097, 122.3331, 1);
var seattleJSON = seattle.toJSON();
var newYork = new City("New York", 8406000, 40.7127, 74.0059, 1);
var newYorkJSON = newYork.toJSON();
var london = new City("London", 8308000, 51.5072, 0.1275, 44);
var londonJSON = london.toJSON();
var tokyo = new City("Tokyo", 13350000, 35.6833, -139.6833, 81);
var tokyoJSON = tokyo.toJSON();
var madrid = new City("Madrid", 3165000, 40.4000, 3.7167, 34);
var madridJSON = madrid.toJSON();
var melbourne = new City("Melbourne", 4087000, -37.8136, -144.9631, 61);
var melbourneJSON = melbourne.toJSON();
var sydney = new City("Sydney", 4293000, -33.8650, -151.2094, 61);
var sydneyJSON = sydney.toJSON();

// Since node uses asynchronous server calls, in order to get commands to complete sequentially they are passed into the next functions as callbacks
// Remove the call to the next function to break the chain of events
MongoClient.connect(url, function(err, db) {
	
	if (err){ 
		return console.error("error: ", err.message);
	}
	var collection = db.collection(collectionName);
//	console.log(kansasCity.toJSON());
	// Inserts a single document
	// Remove the insertMany callback to avoid calling the insertMany function 
	function insert(err) {
		if (err){
			return console.error("error: ", err.message);
		}
		collection.insert(kansasCityJSON, insertMany);
		commands.push("#1 Inserts");
		commands.push("#1.1 Insert a single document into a collection");
		commands.push("Inserted " + JSON.stringify(kansasCityJSON));
	}
	
	// Inserts multiple documents
	// Remove the findOne callback to avoid calling the findOne function
	function insertMany(err) {
		if (err){
			return console.error("error: ", err.message);
		}
		commands.push("#1.2 Insert documents into a collection");
		collection.insert([seattleJSON, newYorkJSON, londonJSON, tokyoJSON, madridJSON], findOne);
		commands.push("Inserted \n" +JSON.stringify(seattleJSON) +
				"\n" + JSON.stringify(newYorkJSON) + "\n" + JSON.stringify(londonJSON));
	}
	
	// Find one that matches a query condition
	// Remove the findAll() callback to avoid calling the findAll function
	function findOne(err) {
		if (err){
			return console.error("error: ", err.message);
		}
		collection.findOne({name: "Seattle"}, function (err, results) {
			commands.push("#2 Queries");
			commands.push("#2.1 Find one document in a collection that matches a query condition");
			commands.push("Query result for find one of name Seattle:");
			commands.push(results);
	
			findAll();
		});
	}
	
	
	// Remove the find() callback to avoid calling the find function
	function findAll(err) {
		if (err){
			return console.error("error: ", err.message);
		}
		var cursor = collection.find({"population": {"$lt" : 8000000}});
		commands.push("#2.2 Find documents in a collection that matches query condition");
		commands.push("Query result for find all of name test1:");

		
		cursor.each(function(err, doc){
			if (doc == null) {
			find();
			} else {
			commands.push("Docs -> ", doc);
			}
		});
	}
	
	// Lists all documents in collection
	// Remove the update() callback to avoid calling the update function
	function find(err) {
		if (err){
			return console.error("error: ", err.message);
		}
		var cursor = collection.find()
		commands.push("#2.3 Find all documents in a collection");
		cursor.each(function(err, doc){
			if (doc == null) {
			update();
			} else {
			commands.push("Docs -> ", doc);
			}
		});
	}
	
	// Updates documents
	// Remove the remove callback to avoid calling the remove function
	function update(err){
		if (err){
			return console.error("error: ", err.message);
		}
		commands.push("#3 Update documents in a collection");
		collection.update({name : "test2"}, {$set : {value : 9}}, remove);
		commands.push("Updated test2 with value 9");
	}
	
	// Removes documents
	// Remove the drop callback to avoid calling the drop function
	function remove(err) {
		if (err){
			return console.error("error: ", err.message);
		}
		commands.push("#4 Delete documents in a collection");
		collection.remove({name : "test3"}, drop);
		commands.push("Removed test3 from collection");
	}
	
	// Drops the entire collection
	function drop(err) {
		if (err){
			return console.error("error: ", err.message);
		}
		commands.push("#5 Drop a collection");
		db.dropCollection(collectionName, printLog);
		commands.push("Collection dropped");
	}
	
	function printLog(){
		for (var i=0; i<commands.length;i++){
			console.log(commands[i]);
		}
	}
	// Starts the chain of event by calling insert
	function doEverything(err){
		if (err){
			return console.error("error: ", err.message);
		}
		insert();

		// vcap parsing
//		var vcap_services = JSON.parse(process.env.VCAP_SERVICES);
//		var altadb = json.loads(os.environ['VCAP_SERVICES'])['altadb-dev'][0]
//		var credentials = altadb['credentials']
//		if (ssl){
//			url = credentials.ssl_json_url;
//		}
//		else{
//			url = credentials.json_url;
//		}
//		console.log(url);
	}
	
	doEverything();
});
