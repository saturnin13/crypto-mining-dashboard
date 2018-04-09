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


//// Alert timeout
window.setTimeout(function() {
    $(".alert").fadeTo(2000, 0.4).slideUp(500, function(){
        $(this).remove();
    });
}, 2000);


//// Set up the websocket for receiving updates from the server
var socket = io();

socket.on('stats', function(data){
    app.workers = data.workers;
});

var app = new Vue({
    el: "#workers-table",
    data: {
        workers: []
    },
    methods: {

    }
});