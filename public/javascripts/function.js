$(document).ready(function() {
    "use strict";

    $.ajax({

            type: "get",
            url: "/top",
            contentType: "application/json; charset=utf-8",
            dataType: "json",

        })
        .done(function(data, status) {
            var i = 0;
            for (i = 0; i < data.length; i++) {
                $(".row").append("<li><a href='" + data[i].longurl + "' target='_blank'>" + data[i].longurl + "</a></li>");

            }
            $(".row").append("</table>");
        })
        .fail(function(data, status) {
            console.log("Failed");
            console.log(data);
            console.log(status);
        });

    $("#button").click(function() {
        var url = $("#url").val().trim();
        if (url === "" || url === "undefined") {
            //alert("Please enter the URL!");
            $("#error").addClass("alert alert-warning");
            $("#error").html("<span class='error'> oops! enter a url</span>");
        } else {
            var UserUrl = JSON.stringify({
                ogurl: url
            });
            $.ajax({

                    type: "POST",
                    url: "/",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: UserUrl
                })
                .done(function(data, status) {

                    $("#error").hide();
                    $("#result").html("");
                    $("#result").append("<a href=" + data.url + ">" + data.url + "</a>");
                })
                .fail(function(data, status) {
                    console.log("Failed");
                    console.log(data);
                    console.log(status);
                });
        }
    });
});