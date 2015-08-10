/*-
 * Javascript Sample Application: Connection to Informix using Mongo
 */

/*
Topics
1 Data Structures
1.1 Create collection
1.2 Create table
2 Inserts
2.1 Insert a single document into a collection 
2.2 Insert multiple documents into a collection 
3 Queries
3.1 Find one document in a collection 
3.2 Find documents in a collection 
3.3 Find all documents in a collection 
3.4 Count documents in a collection 
3.5 Order documents in a collection 
3.6 Find distinct fields in a collection 
3.7 Joins
3.7a Collection-Collection join
3.7b Table-Collection join
3.7c Table-Table join 
3.8 Modifying batch size 
3.9 Find with projection clause 
4 Update documents in a collection 
5 Delete documents in a collection 
6 SQL passthrough 
7 Transactions
8 Commands
8.1 CollStats 
8.2 DBStats 
9 Drop a collection
*/

var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var url = "";
var port = process.env.VCAP_APP_PORT || 3000;
var commands = [];
var collectionName = "nodeMongoGalaxy";
var joinCollectionName = "joinCollectionNode";
var codeTableName = "codeTable";
var cityTableName = "cityTable";
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
function doEverything(res) {
	MongoClient.connect(url, function(err, db) {
		
		if (err){ 
			return console.error("error: ", err.message);
		}
		
		var collection, joinCollection, codeTable, cityTable;
		function createCollection(err){
			if (err){
				return console.error("error: ", err.message);
			}
			collection = db.collection(collectionName, createJoinCollection);
			commands.push("#1 Data Structures");
			commands.push("#1.1 Created Collection " + collectionName);
		}
		function createJoinCollection(err){
			if(err){
				return console.error("error: ", err.message);
			}
			joinCollection = db.collection(joinCollectionName, createTable);
		}
		function createTable(err){
			if (err){
				return console.error("error: ", err.message);
			}
			db.command({"create" : cityTableName, "columns":[{"name":"name","type":"varchar(50)"}, 
			                                                 {"name": "population", "type": "int"}, 
			                                                 {"name": "longitude", "type": "decimal(8,4)"},
			                                                 {"name": "latitude", "type": "decimal(8,4)"}, 
			                                                 {"name": "countryCode", "type": "int"}]}, function(){
			                                                	 commands.push("#1.2 Created Table " + cityTableName);
			                                                	 createCodeTable();
			                                                 });
			
		}
		
		function createCodeTable(err){
			if (err){
				return console.error("error: ", err.message);
			}
			db.command({"create" : codeTableName, "columns":[{"name":"countryCode","type":"int"}, 
			                                                 {"name": "countryName", "type": "varchar(50)"}]}, function(){
			                                                	 insert();
			                                                 });
			                                                 
		}
		
		// Inserts a single document
		// Remove the insertMany callback to avoid calling the insertMany function 
		function insert(err) {
			if (err){
				return console.error("error: ", err.message);
			}

			collection.insert(kansasCityJSON, insertMany);
			commands.push("#2 Inserts");
			commands.push("#2.1 Insert a single document into a collection");
			commands.push("Inserted " + JSON.stringify(kansasCityJSON));
		}
		
		// Inserts multiple documents
		// Remove the findOne callback to avoid calling the findOne function
		function insertMany(err) {
			if (err){
				return console.error("error: ", err.message);
			}
			commands.push("#2.2 Insert documents into a collection");
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
				commands.push("#3 Queries");
				commands.push("#3.1 Find one document in a collection that matches a query condition");
				commands.push("Query result for find one of name Seattle:");
				commands.push(JSON.stringify(results));
		
				findAll();
			});
		}
		
		
		// Remove the find() callback to avoid calling the find function
		function findAll(err) {
			if (err){
				return console.error("error: ", err.message);
			}
			var cursor = collection.find({"population": {"$lt" : 8000000}});
			commands.push("#3.2 Find documents in a collection that matches query condition");
			commands.push("Query result for documents with population less than 8 million:");
	
			
			cursor.each(function(err, doc){
				if (doc === null) {
					find();
				} else {
				commands.push("Docs -> ", JSON.stringify(doc));
				}
			});
		}
		
		// Lists all documents in collection
		// Remove the update() callback to avoid calling the update function
		function find(err) {
			if (err){
				return console.error("error: ", err.message);
			}
			var cursor = collection.find();
			commands.push("#3.3 Find all documents in a collection");
			cursor.each(function(err, doc){
				if (doc === null) {
					count();
				} else {
				commands.push("Docs -> ", JSON.stringify(doc));
				}
			});
		}
		
		// Counts documents in query
		// Remove the update() callback to avoid calling the update function
		function count(err) {
			if (err){
				return console.error("error: ", err.message);
			}
			collection.find({"population": {"$lt" : 8000000}}).count(function(err, num){
				if (err) {
					return console.error("error: ", err.message);
				}
			
				commands.push("#3.4 Count documents in a query");
				commands.push("There are " + JSON.stringify(num) + " documents with a population less than 8 million");
				order();
			});
		}
		
		function order(err){
			if (err){
				return console.error("error: ", err.message);
			}
			var cursor = collection.find().sort({"population": -1});
			commands.push("#3.5 Sorted documents by population");
			cursor.each(function(err, doc){
				if (doc === null) {
					distinct();
				} else {
				commands.push("Docs -> ", JSON.stringify(doc));
				}
			});
			
		}
		
		function distinct(err){
			if (err){
				return console.error("error: ", err.message);
			}
			collection.distinct("countryCode", function(err, num){
				commands.push("#3.6 Find distinct codes in collection");
				commands.push("Distinct Codes: " + JSON.stringify(num));
				projection();
			});
			
		}
		
//		function joins(err){
//			if (err){
//				return console.error("error: ", err.message);
//			}
//			console.log("Fif");
//			var codeEntries = [{"countryCode": 1, "countryName": "USA and Canada"}, 
//			                   {"countryCode": 44, "countryName": "United Kingdom"},
//			                   {"countryCode": 81, "countryName": "Japan"},
//			                   {"countryCode": 34, "countryName": "Spain"},
//			                   {"countryCode": 61, "countryName": "Australia"}];
//			var sys = db.collection('system.join');
//			var codeTable = db.collection(codeTableName);
//			var cityTable = db.collection(cityTableName);
//			
//			function insertJoinCollection(err){
//				if (err){
//					return console.error("error: ", err.message);
//				}
//				joinCollection.insert(codeEntries, insertCodeTable);
//			}
//			
//			function insertCodeTable(err){
//				if (err){
//					return console.error("error: ", err.message);
//				}
//				console.log("Got here3");
//				codeTable.insert(codeEntries, insertCityTable);
//			}
//			
//			function insertCityTable(err){
//				if (err){
//					return console.error("error: ", err.message);
//				}
//				cityTable.insert([kansasCityJSON, seattleJSON, newYorkJSON, londonJSON, madridJSON, tokyoJSON], collectionCollectionJoin);
//			}
//			
//			function collectionCollectionJoin(err){
//				if (err){
//					return console.error("error: ", err.message);
//				}
//	
//				var joinCollectionCollection = { "$collections" : { collectionName : { "$project" : { "name" : 1 , "population" : 1 , "longitude" : 1 , "latitude" : 1}} , 
//					joinCollectionName : { "$project" : { "countryCode" : 1 , "countryName" : 1}}} , 
//					"$condition" : { "nodeMongoGalaxy.countryCode": "joinCollectionNode.countryCode"}};
//				sys.find(joinCollectionCollection, function(err, data){
//					commands.push("Joined Collection-Collection");
//					commands.push(data);
//					collectionTableJoin();
//				});
////				var cursor = sys.find(joinCollectionCollection);						
////				commands.push("Join collection-collection ");
////				cursor.each(function(err, doc){
////					if (doc === null) {
////						console.log("out of it");
////						projection();
////					} else {
////						console.log("in it");
//////						commands.push("Docs -> ", JSON.stringify(doc));
////					}
////				});
//			}
//			
//			function collectionTableJoin(err){
//				if (err){
//					return console.error("error: ", err.message);
//				}
//				var joinCollectionCollection = { "$collections" : { collectionName : { "$project" : { "name" : 1 , "population" : 1 , "longitude" : 1 , "latitude" : 1}} , 
//					codeTableName : { "$project" : { "countryCode" : 1 , "countryName" : 1}}} , 
//					"$condition" : { "nodeMongoGalaxy.countryCode": "codeTable.countryCode"}};
//				sys.find(joinCollectionCollection, function(err, data){
//					commands.push("Joined Collection-Table");
//					commands.push(data);
//					tableTableJoin();
//				});
//			}
//			
//			function tableTableJoin(err){
//				if (err){
//					return console.error("error: ", err.message);
//				}
//				var joinCollectionCollection = { "$collections" : { cityTableName : { "$project" : { "name" : 1 , "population" : 1 , "longitude" : 1 , "latitude" : 1}} , 
//					codeTableName : { "$project" : { "countryCode" : 1 , "countryName" : 1}}} , 
//					"$condition" : { "cityTable.countryCode": "codeTable.countryCode"}};
//				sys.find(joinCollectionCollection, function(err, data){
//					commands.push("Joined Collection-Table");
//					commands.push(data);
//					projection();
//				});
//			}
//			
//			insertJoinCollection();
//			
//		}
		
		function projection(err){
			if (err){
				return console.error("error: ", err.message);
			}
			var cursor = collection.find({"countryCode": 1}, {"longitude":0, "latitude" : 0});
			commands.push("#3.9 Find documents with projection");
			commands.push("Displaying results with countryCode 1 and without longitude and latitude: ");

			cursor.each(function(err, doc){
				if (doc === null) {
					update();
				} else {
				commands.push("Docs -> ", JSON.stringify(doc));
				}
			});
			
		}
		
		// Updates documents
		// Remove the remove callback to avoid calling the remove function
		function update(err){
			if (err){
				return console.error("error: ", err.message);
			}
			commands.push("#4 Update documents in a collection");
			collection.update({"name": seattle.name}, {"$set": { "countryCode": 999}}, remove);
			commands.push("Updated Seattle with countryCode 999");
		}
		
		// Removes documents
		// Remove the drop callback to avoid calling the drop function
		function remove(err) {
			if (err){
				return console.error("error: ", err.message);
			}
			commands.push("#5 Delete documents in a collection");
			collection.remove({"name": tokyo.name}, sqlPassthrough);
			commands.push("Removed Tokyo from collection");
		}
		
		// Start of SQL Passthrough
		function sqlPassthrough(err){
			if (err){
				return console.error("error: ", err.message);
			}
			
			var sql = db.collection("system.sql");
			commands.push("#6 SQL passthrough");
			function sqlCreate(err){
				if (err){
					return console.error("error: ", err.message);
				}
				commands.push("SQL Create Table");
				var query = {"$sql": "create if not exists table town (name varchar(255), countryCode int)"};

				var cursor = sql.find(query);
				cursor.each(function(err, doc){
					if (doc != null) {
						commands.push("Docs -> ", JSON.stringify(doc));
					} else {
						sqlInsert();
					}
				});
				
			}
			
			function sqlInsert(err){
				if (err){
					return console.error("error: ", err.message);
				}
				commands.push("SQL Insert");
				var query = {"$sql": "insert into town values ('Lawrence', 1)"};
				var cursor = sql.find(query);
				cursor.each(function(err, doc){
					if (doc != null) {
						commands.push("Docs -> ", JSON.stringify(doc));
					} else {
						sqlDrop();
					}
				});
			}
			 
			function sqlDrop(err){
				if (err){
					return console.error("error: ", err.message);
				}
				commands.push("SQL Drop Table");
				var query = {"$sql": "drop table town"};
				var cursor = sql.find(query);
				cursor.each(function(err, doc){
					if (doc != null) {
						commands.push("Docs -> ", JSON.stringify(doc));
					} else {
						commandStatements();
					}
				});
				
			}
			sqlCreate();
		}
		
//		function transactions(err){
//			if (err){
//				return console.error("error: ", err.message);
//			}
//			commands.push("#7 Transactions");
//			
//			function enableTransaction(){
//				db.command({"transaction": "enable"}, function(err){
//					if (err){
//						return console.error("error: ", err.message);
//					}
//					commands.push("Transactions enabled");
//					insertTransaction();
//				});
//			}
//			
//			function insertTransaction(){
//				commands.push("Insert Melboune");
//				collection.insert(melbourneJSON, commitTransaction);
//			}
//			
//			function commitTransaction(){
//				commands.push("Commit changes");
//				db.command({"transaction": "commit"}, function(err){
//					if (err){
//						return console.error("error: ", err.message);
//					}
//					incompletedTransaction();
//					});
//			}
//			
//			function incompletedTransaction(){
//				commands.push("Attempting to insert Sydney");
//				collection.insert(sydneyJSON, rollbackTransaction);
//			}
//			
//			function rollbackTransaction(){
//				commands.push("Rolling back transaction");
//				db.command({"transaction": "rollback"}, function(err){
//					if (err){
//						return console.error("error: ", err.message);
//					}
//					disableTransaction();
//				});
//			}
//			
//			function disableTransaction(){
//				db.command({"transaction": "disable"}, function(err){
//					if (err){
//						return console.error("error: ", err.message);
//					}
//					commands.push("Transactions disabled");
//					showChanges();
//				});
//			}
//			
//			function showChanges(err) {
//				if (err){
//					return console.error("error: ", err.message);
//				}
//				var cursor = collection.find();
//				commands.push("Displaying Changes in Collection");
//				cursor.each(function(err, doc){
//					if (doc === null) {
//						commandStatements();
//					} else {
//					commands.push("Docs -> ", JSON.stringify(doc));
//					}
//				});
//			}
//			enableTransaction();
//		}
		
		function commandStatements(err){
			if (err){
				return console.error("error: ", err.message);
			}
			commands.push("#8 Command statements");
			
			function dbStats(){
				db.stats(function(err, items){
					commands.push("#8.1 Database Stats");
					commands.push("DB stats: ", items);
					collStats();	
				});
			}
			
			function collStats(){
				collection.stats(function(err, items){
					commands.push("#8.2 Collection Stats");
					commands.push("coll stats: ", items);
					dropCollection();	
				});
				
			}

			dbStats();
		}
		// Drops the entire collection
		function dropCollection(err) {
			if (err){
				return console.error("error: ", err.message);
			}
			commands.push("#9 Drop a collection");
			db.dropCollection(collectionName, dropJoinCollection);
			commands.push("Collection dropped");
		}
		
		function dropJoinCollection(err) {
			if (err){
				return console.error("error: ", err.message);
			}
			db.dropCollection(joinCollectionName, dropCityTable);
			commands.push("Collection dropped");
		}
		
		function dropCityTable(err) {
			if (err){
				return console.error("error: ", err.message);
			}
			db.dropCollection(cityTableName, dropCodeTable);
			commands.push("Table dropped");
		}
		
		function dropCodeTable(err) {
			if (err){
				return console.error("error: ", err.message);
			}
			db.dropCollection(codeTableName, printLog);
			commands.push("Table dropped");
		}
		
		
		function printLog(){
			for (var i=0; i<commands.length;i++){
				console.log(commands[i]);
			}
		}
		
		function printBrowser(){
			app.set('view engine', 'ejs');
			res.render('index.ejs', {commands: commands});
			commands = [];
		}
		
		// Starts the chain of event by calling insert
		createCollection();
	
	});
}
function parseVcap(){
	var vcap_services = JSON.parse(process.env.VCAP_SERVICES);
	var credentials = vcap_services['altadb-dev'][0].credentials;
	var ssl = false;
	if (ssl){
		url = credentials.ssl_json_url;
	}
	else{
		url = credentials.json_url;
	}
}

app.get('/databasetest', function(req, res) {
	doEverything(res);
});

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/views/index.html');
});

app.listen(port,  function() {
	console.log("server starting on 3000");
});
