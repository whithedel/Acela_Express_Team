$(document).ready(function() {

// This function fetches the GIFs from Tenor API 
    function testAPI(event) {

        event.preventDefault();
        event.stopPropagation();

        var searchTerm = $("#gif-search").val().trim();
        var queryURL = "https://api.tenor.com/v1/search?q=" + searchTerm + "&key=YGY8YR0HQ8YW&limit=5&locale=en_US";
        // queryURLTwo is for the trivial API, deatils for it's functionality to be handled later
        var queryURLTwo = "https://opentdb.com/api.php?amount=1&difficulty=medium&type=multiple";

        $.ajax({
            url: queryURL,
            method: "GET",
        }).then(function(response) {
            console.log(response.results[Math.floor(Math.random()*4)].media[0].tinygif.url);
            $("#gif-choose").empty();
        // 5 GIFs are chosen and appended to the GIF thumbnail preview <div>. That number 
        // can be changed in the queryURL. Ideally, these will only be seen by the one user
        // searching and no one else
            for (var i = 0; i < response.results.length; i++) {
                var gifDiv = $("<div>");
                $(gifDiv).addClass("gif-thumb");
                var gifURL = response.results[i].media[0].tinygif.url;
                var miniGIF = $("<img>").attr({
                    src: gifURL,
                    width: "100px"
                });
                gifDiv.append(miniGIF);
                $("#gif-choose").prepend(gifDiv);        
            }
            
        })

    };

// This function adds a selected GIF from the thumbnail column to the message box to be seen
// By all members of the chat.
    function sendGIF(event) {
        
        event.preventDefault();
        var gifBubble = $("<div>");
        $(gifBubble).addClass("gif-bubble");
        $(gifBubble).append(this);
        $("#message-box").append(gifBubble);
        $(".gif-bubble > .gif-thumb > img").attr("width", "200px");

    };

    $(document).on("click", "#add-gif", testAPI);
    $(document).on("click", ".gif-thumb", sendGIF);

});