$(document).ready(function() {

    var searchTerm;
    // This function fetches the GIFs from Tenor API 
    function testAPI(event) {

        event.preventDefault();
        event.stopPropagation();

        searchTerm = $("#gif-search").val().trim();
        var queryURL = "https://api.tenor.com/v1/search?q=" + searchTerm + "&key=YGY8YR0HQ8YW&limit=5&locale=en_US";
        // queryURLTwo is for the trivial API, deatils for it's functionality to be handled later
        var queryURLTwo = "https://opentdb.com/api.php?amount=1&difficulty=medium&type=multiple";

        $.ajax({
            url: queryURL,
            method: "GET",
        }).then(function(response) {
            console.log(response.results[Math.floor(Math.random() * 4)].media[0].tinygif.url);
            $("#gif-choose").empty();
            // 5 GIFs are chosen and appended to the GIF thumbnail preview <div>. That number 
            // can be changed in the queryURL. Ideally, these will only be seen by the one user
            // searching and no one else
            for (var i = 0; i < response.results.length; i++) {
                var gifDiv = $("<div>");
                $(gifDiv).addClass("gif-thumb");
                $(gifDiv).attr("value", searchTerm);
                var gifURL = response.results[i].media[0].mediumgif.url;
                var miniGIF = $("<img>").attr({
                    src: gifURL,
                    width: "100px"
                });
                gifDiv.append(miniGIF);
                $("#gif-choose").prepend(gifDiv);
            }

        })

    };
    // initialize Firebase
    initFirebaseAuth();
 
    //handles signin on click function
     $('#loginBtn').on('click',signIn)
 
    //handles signout on click function
     $('#logoutBtn').on('click',signOut)
 
     //handles submit buttons
     $('#signUpBtn').on('click', handlesignUpBtnClick)
    // This function adds a selected GIF from the thumbnail column to the message box to be seen
    // By all members of the chat.
    function sendGIF(event) {

        event.preventDefault();
        var htmlText = `    <div class="flip-card">
                                <div class="flip-card-inner">
                                    <div class="flip-card-front">
                                        ${$(this).first().prop('outerHTML')}
                                    </div>
                                    <div class="flip-card-back">
                                        <h1> Im the back</h1>
                                    </div>
                                </div>
                            </div>
        `;
        $('#message-box').append(htmlText);
        $('.flip-card-back > h1').text($(this).attr("value"));
        console.log(this)
            // var gifBubble = $("<div>");
            // $(gifBubble).addClass("gif-bubble");
            // $(gifBubble).append(this);
            // $(".giphyImg").append(gifBubble);
        $(" .gif-thumb > img").attr("width", "100%");
        autoScroll();
    };

    function autoScroll() {
        var messageBox = '#message-box'
        $(messageBox).animate({ scrollTop: $(messageBox)[0].scrollHeight * 10 }, 100);

    }

    $(document).on("click", "#add-gif", testAPI);
    $(document).on("click", ".gif-thumb", sendGIF);

});


//function to handlesignUpBtnClick
function handlesignUpBtnClick() {
    event.preventDefault()
    var userName = $('#userName').val().trim();
    var email = userName+'@rhahekel.com';
    var password = $('#inputPassword1').val().trim();
    var password2 = $('#inputPassword2').val().trim();
    if(validateForm(userName,password,password2)){
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
            // Handle Errors here.
            //var errorCode = error.code;
            var errorMessage = error.message;
            alertMessage(errorMessage);
          });
    }
}

//function to handle the form and verify if the form filled properly or not 
function validateForm(userName,password,password2){
    var validForm = true;
    var alphanumeric = /^[a-zA-Z0-9]+$/
    if (password !== password2){
        validForm = false;
        alertMessage('Password does not match');
    }
    else if (!userName.match(alphanumeric)){
        validForm = false;
        alertMessage('Username can only be alphanumeric');
    } else if (userName.lenght === 0){
        validForm = false;
        
    } else if (password.lenght === 0) {
        validForm = false;
        
    } 
    
    return validForm;
}


//function that allows users to be able to sign in 
function signIn(){
    event.preventDefault()
    var email = $('#emailInput').val().trim()+'@rhahekel.com';
    var password = $('#passwordInput').val().trim();
    console.log(email)
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        // var errorCode = error.code;
        var errorMessage = error.message;
        alertMessage(errorMessage);
        // ...
      });
    //   $('#loginDropdown').hide();
}

//function that allows users to be able to sign out
function signOut(){
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
      }).catch(function(error) {
        // An error happened.
        var errorMessage = error.message;
        alertMessage(errorMessage);
      });
      location.reload();
}

// Triggers when the auth  **user** state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
    if (user) {
        console.log('hey')
    // User is signed in.
    $('#userLogSection').hide();
    $('#midSection').show();
    $('#logoutBtn').show();
    $('#loginDropdown').hide();
    $('#dropdownMenu1').hide();
    } else {
    // No user is signed in. user is signout
    }
};

// Initiate Firebase Auth.
function initFirebaseAuth() {
    // Listen to auth **user** state changes.
    firebase.auth().onAuthStateChanged(authStateObserver);
  }

//function to alert messages when it encounters an error
function alertMessage(errorMessage){
    $('#alertMessage').html(errorMessage)
    $('#alertMessage').show();
}
