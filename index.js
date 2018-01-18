console.log('test1234');

var http = require("http");
const PORT = process.env.PORT || 5000;

http.createServer(function (request, response) {

    // Send the HTTP header
    // HTTP Status: 200 : OK
    // Content Type: text/plain
    response.writeHead(200, {'Content-Type': 'text/plain'});

    // Send the response body as "Hello World"
    response.end('Hello World\n');
}).listen(PORT);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');

const {Client} = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

client.connect();

client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
    if (err) throw err;
for (let row of res.rows) {
    console.log(JSON.stringify(row));
}
client.end();
});