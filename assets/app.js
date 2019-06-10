$(document).ready(function() {

    var searchTerm;
    // This function fetches the GIFs from Tenor API 
    function testAPI(event) {

        event.preventDefault();
        event.stopPropagation();

        searchTerm = $("#gif-search").val().trim();
        var queryURL = "https://api.tenor.com/v1/search?q=" + searchTerm + "&key=YGY8YR0HQ8YW&limit=5&locale=en_US";

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
    //ADDED: function for asking question from Trivia Database API
    function popQuiz(event) {

        event.preventDefault();
        event.stopPropagation();

        // queryURLTwo is for the trivia API
        var queryURLTwo = "https://opentdb.com/api.php?amount=1&difficulty=medium&type=boolean";
        $.ajax({
            url: queryURLTwo,
            method: "GET"
        }).then(function(trivia) {
            
            console.log(trivia.results[0].question);
            var trueFalse = '<div class="flip-card"><div class="flip-card-inner"><div class="flip-card-front"><h3>'
            + userTag + ' asks:</h3><p>' + trivia.results[0].question 
            + '</p></div><div class="flip-card-back"><h2 class="guess-true">True</h2><h2 class="guess-false">False</h2></div></div></div>';

            firebase.database().ref("messageBox").push({
                question: trueFalse,
                right: trivia.results[0].correct_answer,
                correct: false,
                incorrect: false
            });
            
        })
    }

    // initialize Firebase
    initFirebaseAuth();
 
    //handles signin on click function
     $('#loginBtn').on('click',signIn)
 
    //handles signout on click function
     $('#logoutBtn').on('click',signOut)
 
     //handles submit buttons
     $('#signUpBtn').on('click', handlesignUpBtnClick)
    
    //CHANGED FOR TESTING: sendGIF function to be split into two parts, also added
    // .picked-gif class to the GIFs chosen and now the height is set at 100%
    // to address overflowing images. Also, htmlText rearranged and edited, still works
    function sendGIF(event) {

        event.preventDefault();
        $(this).addClass("picked-gif");
        $(".picked-gif > img").removeAttr("width");
        $(".picked-gif > img").attr("height", "100%");
        var htmlText = '<div class="flip-card"><div class="flip-card-inner"><div class="flip-card-front">' 
        + $(this).first().prop('outerHTML') + '</div><div class="flip-card-back"><h1>' 
        + userTag + ' says:</h1><h1>' + $(this).attr("value") + '</h1></div></div></div>';

        firebase.database().ref("messageBox").push(htmlText);

        $(this).remove();
        autoScroll();
                                        
    };

    function autoScroll() {
        var messageBox = '#message-box'
        $(messageBox).animate({ scrollTop: $(messageBox)[0].scrollHeight * 10 }, 100);

    }

    $(document).on("click", "#add-gif", testAPI);
    $(document).on("click", ".gif-thumb", sendGIF);
    //ADDED: listener for Pop Quiz button
    $(document).on("click", "#add-qtn", popQuiz);


});

//ADDED: userTag undefined here, gets defined under handlesignUpBtnClick() and signIn()
var userTag;

//ADDED: second part of sendGIF, using firebase. Had to copy/paste autoScroll() here due to scope issues
firebase.database().ref("messageBox").on("child_added", function(snapshot) {
    var messageBox = '#message-box'
    console.log(snapshot.val());
    $('#message-box').append(snapshot.val());
        // var gifBubble = $("<div>");
        // $(gifBubble).addClass("gif-bubble");
        // $(gifBubble).append(this);
        // $(".giphyImg").append(gifBubble);
    $(messageBox).animate({ scrollTop: $(messageBox)[0].scrollHeight * 10 }, 100);
    
});
//ADDED: second part of popQuiz function, appends question to message box
firebase.database().ref("messageBox").on("child_added", function(questionSnapshot) {
    var messageBox = '#message-box'
    console.log(questionSnapshot.val().question);
    $('#message-box').append(questionSnapshot.val().question);
    $('#message-box').animate({ scrollTop: $(messageBox)[0].scrollHeight * 10 }, 100);
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
    //ADDED: capture string of user email to use as userTag plus add name to firebase;
    userTag = email.substring(0, email.indexOf('@'));
    firebase.database().ref("users").push(userTag);
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
    //ADDED: capture string of user email to use as userTag
    userTag = email.substring(0, email.indexOf('@'));
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
