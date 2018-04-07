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