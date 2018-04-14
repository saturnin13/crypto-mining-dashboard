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
        socket.on("updatedWorkerConfigurations", updateWorkerConfigurations);
        socket.on("disconnect", () => {
            console.log("Disconnecting for client id  " + socket.request.session.passport.user);
            connectedClients.delete(socket);
        });
    });
};

function emitWorkersData(clientSocket) {
    db.manyOrNone("SELECT * " +
        "FROM workers " +
        "JOIN workers_configuration ON workers.id=workers_configuration.worker_id " +
        "WHERE user_id=$1", [clientSocket.request.session.passport.user])
        .then((result1)=> {
            db.manyOrNone("SELECT mined_cryptocurrencies.* " +
                "FROM workers " +
                "JOIN workers_configuration ON workers.id=workers_configuration.worker_id " +
                "JOIN mined_cryptocurrencies ON workers_configuration.id=mined_cryptocurrencies.worker_configuration_id " +
                "WHERE user_id=$1", [clientSocket.request.session.passport.user])
                .then((result2)=> {
                    result2.forEach(function(entry) {
                        delete entry["id"];
                        delete entry["worker_configuration_id"];
                    });
                    result1.forEach((worker, index) => {
                        worker.hashrate = worker.hashrate.toLocaleString(undefined,{ minimumFractionDigits: 2 });
                        worker.mined_cryptocurrencies = result2[index];
                    });
                    clientSocket.emit('workersData', {
                        workers: result1
                    });
                })
                .catch((err) => {
                    console.log("error getting config mined_cryptocurrencies data with " + err);
                });
        })
        .catch((err) => {
            console.error("error getting config workers data with " + err);
        });
}

function updateWorkerConfigurations(dataUpdatedWorker) {
    var updatedWorker = dataUpdatedWorker.worker;
    db.query("UPDATE workers_configuration " +
        "SET activate_mining=" + updatedWorker.activate_mining + " " +
        "WHERE worker_id=" + updatedWorker.worker_id)
        .then()
        .catch((err) => {
            console.error("error updating workers_configuration data with " + err);
        });
    db.query("UPDATE mined_cryptocurrencies " +
        "SET " + getAllCurrencySetValue(updatedWorker) + " " +
        "FROM workers_configuration " +
        "WHERE workers_configuration.id=mined_cryptocurrencies.worker_configuration_id AND worker_id=" + updatedWorker.worker_id)
        .catch((err) => {
            console.error("error updating mined_cryptocurrencies with " + err);
        });
}

function getAllCurrencySetValue(worker) {
    var result = "";
    for(let currency in worker.mined_cryptocurrencies) {
        result += "\"" + currency.toUpperCase() + "\"" + "=" + worker.mined_cryptocurrencies[currency] + ", ";
    }
    return result.substring(0, result.length - 2)
}