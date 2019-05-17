const WebSocket = require('ws');
let MongoClient = require('mongodb').MongoClient;
// Connection URL
// const url = 'mongodb+srv://Garis_Svetlogorsk:6!EPBKH2cEv!uct@yegorstsephanovichmongodb-5mesx.azure.mongodb.net/test?retryWrites=true';
const url = 'mongodb://localhost:27017';
let records;

let wss = new WebSocket.Server({ port: 8080 });

wss.broadcast = function broadcast(data){
	wss.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN){
			client.send(data);
		}
	});
};

wss.on('connection', function connection(ws) {
	
	MongoClient.connect(url, function (err, client) {
		if (err) {
			console.error(err);
			throw err;
		}

		// записываем ссылки на таблицы (коллекции) в глобальные переменные
		let db = client.db('game');
		records = db.collection('records');

	});
	
	const client = new MongoClient(url, { useNewUrlParser: true });
	// let collection;
	client.connect(err => {
		records = client.db("game").collection("records");
	});
	
	ws.on('message', function incoming(message) {
		let record = JSON.parse(message);
		
		console.log(record);
		records.insertOne(record);
		records.find({"level": `${record.level}`}, { _id: 0 })
							.sort({result: 1}).limit(10).toArray(function(err, docs) {
								console.log("Found the following records");
								console.log(docs);
								wss.broadcast(JSON.stringify(docs));
		});
		
		// client.close();
	});
	
	ws.on('close', function () {
		console.log("client closed");
	});
	
});

wss.on('close', function () {
	console.log("connection closed");
});


