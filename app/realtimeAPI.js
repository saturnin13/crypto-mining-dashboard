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
        socket.on("updatedWorkerConfigurations", updateWorkerGraphicCardConfigurations);
        socket.on("disconnect", () => {
            console.log("Disconnecting for client id  " + socket.request.session.passport.user);
            connectedClients.delete(socket);
        });
    });
};

function emitWorkersData(clientSocket) {
    console.log("Emitting worker data for socket " + clientSocket);
    db.manyOrNone("SELECT * " +
        "FROM workers " +
        "JOIN graphic_cards ON workers.id=graphic_cards.worker_id " +
        "JOIN graphic_cards_configuration ON graphic_cards.id=graphic_cards_configuration.graphic_card_id " +
        "WHERE user_id=$1", [clientSocket.request.session.passport.user])
        .then((workers_graphic_cards) => {
            db.manyOrNone("SELECT mined_cryptocurrencies.* " +
                "FROM workers " +
                "JOIN graphic_cards ON workers.id=graphic_cards.worker_id " +
                "JOIN graphic_cards_configuration ON graphic_cards.id=graphic_cards_configuration.graphic_card_id " +
                "JOIN mined_cryptocurrencies ON graphic_cards_configuration.id=mined_cryptocurrencies.graphic_card_configuration_id " +
                "WHERE user_id=$1 " +
                "ORDER BY graphic_cards.graphic_card_name", [clientSocket.request.session.passport.user])
                .then((mined_crypto_currencies)=> {
                    workers_graphic_cards.forEach((worker_graphic_card, index) => {
                        worker_graphic_card.hashrate = worker_graphic_card.hashrate.toLocaleString(undefined,{ minimumFractionDigits: 2 });
                        filtered_mined_crypto_currency = mined_crypto_currencies.filter(
                            (item) => item.graphic_card_configuration_id === worker_graphic_card.id
                        )[0];
                        delete filtered_mined_crypto_currency["graphic_card_configuration_id"];
                        delete filtered_mined_crypto_currency["id"];
                        worker_graphic_card.mined_cryptocurrencies = mined_crypto_currencies[0];
                    });
                    clientSocket.emit('workersData', {
                        workers: workers_graphic_cards
                    });
                })
                .catch((err) => {
                    console.log("error getting config mined_cryptocurrencies data with " + err);
                });
        })
        .catch((err) => {
            console.error("error getting config workers graphic cards data with " + err);
        });
}

function updateWorkerGraphicCardConfigurations(dataUpdatedWorkerGraphicCard) {
    console.log("Updating worker graphic card configuration with " + dataUpdatedWorkerGraphicCard);
    var updatedWorkerGraphicCard = dataUpdatedWorkerGraphicCard.worker;
    db.query("UPDATE graphic_cards_configuration " +
        "SET activate_mining=" + updatedWorkerGraphicCard.activate_mining + " " +
        "WHERE graphic_card_id=" + updatedWorkerGraphicCard.graphic_card_id)
        .then()
        .catch((err) => {
            console.error("error updating graphic_cards_configuration data with " + err);
        });
    db.query("UPDATE mined_cryptocurrencies " +
        "SET " + getAllCurrencySetValue(updatedWorkerGraphicCard) + " " +
        "FROM graphic_cards_configuration " +
        "WHERE graphic_cards_configuration.id=mined_cryptocurrencies.graphic_card_configuration_id AND graphic_card_id=" + updatedWorkerGraphicCard.graphic_card_id)
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