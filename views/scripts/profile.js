//// Enable hashtag to access tabs
// Javascript to enable link to tab
var url = document.location.toString();
if (url.match('#')) {
    $('.nav-tabs a[href="#' + url.split('#')[1] + '"]').tab('show');
}

// Change hash for page-reload
$('.nav-tabs a').on('shown.bs.tab', function (e) {
    window.location.hash = e.target.hash;
})

// TODO: can be deleted as no alert used yet
//// Alert timeout
window.setTimeout(function() {
    $(".alert").fadeTo(2000, 0.4).slideUp(500, function(){
        $(this).remove();
    });
}, 2000);


//// Set up the websocket for receiving updates from the server
var socket = io();

// TODO : deal with the fact that when a config is updated it might be reversed for 1 seconds as the incoming data comes before the update reaches the database
socket.on('workersData', function(data){
    workers_table.workers = data.workers.sort(function(a, b){
        if(a.worker_name < b.worker_name) return -1;
        if(a.worker_name > b.worker_name) return 1;
        return 0;
    });
});

// TODO: use the component for workers and worker
var workers_table = new Vue({
    el: "#workers-table",
    data: {
        workers: []
    },
    computed: {

    },
    watch: {
        deep: true
    },
    methods: {
        updatedWorkerConfigurations: function (workerName) {
            this.workers.forEach(function(worker) {
                if(worker.worker_name === workerName) {
                    socket.emit('updatedWorkerConfigurations', {
                        worker: worker
                    });
                }
            });
        }
    }
});
