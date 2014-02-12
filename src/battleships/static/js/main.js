
$(document).ready(function() {

    // render all timestamps using the 'moments' library
    $("[data-timestamp]").each(function() {
        var ts = $(this).attr("data-timestamp");
        if (ts) {
            var m = moment.unix(ts);
            $(this).
                html(m.fromNow()).
                attr("title", m.format())
        } else {
            $(this).html("-");
        }
    });

    // wire up buttons
    $("#how-to-button").click(function() {
        window.location.href = "/how-to";
    });
    $("#home").click(function() {
        window.location.href = "/";
    });

});
