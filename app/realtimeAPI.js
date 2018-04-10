const globalConstant = require('../variables.js');

// DB in postgres
let db = require('./mydb').db();

module.exports = function(io, sessionMiddleware) {

    let connectedClients = new Set();

    let interval = setInterval(() => {
            connectedClients.forEach(clientSocket => {
                emitWorkersData(clientSocket)
            });
        }
        , globalConstant.HASHRATE_REFRESH_RATE);

    io.use(function(socket, next) {
        sessionMiddleware(socket.request, socket.request.res, next);
    });
    io.on('connection', function(socket){
        if(!socket.request.session.passport) {
            return
        }
        console.log("Newly connected client with id " + JSON.stringify(socket.request.session.passport.user));
        connectedClients.add(socket);
        emitWorkersData(socket);
        socket.on("disconnect", () => {
            console.log("Disconnecting for client id  " + socket.request.session.passport.user);
            connectedClients.delete(socket);
        });
    });
};

function emitWorkersData(clientSocket) {
    db.many("SELECT * " +
        "FROM workers " +
        "WHERE user_id=$1", [clientSocket.request.session.passport.user])
        .then((result)=> {
            result.forEach(worker => {
                worker.hashrate = worker.hashrate.toFixed(2);
            });
            clientSocket.emit('stats', {
                workers: result
            });
        })
        .catch((err) => {
            console.log("error getting workers data with " + err);
        });
}