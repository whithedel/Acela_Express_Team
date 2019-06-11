$(document).ready(function () {

    // initialize Firebase
    initFirebaseAuth();


    var searchTerm;
    // This function fetches the GIFs from Tenor API 
    $('#input-msg').on('change', function (e) {
        if ($(this).val() == '') return;
        $('.imagetmp').css("display", "block");
        testAPI(e);
    });

    $('#input-msg').on('click', function (e) {
        if ($(this).val() == '') return;
        $('.imagetmp').css("display", "block");
        testAPI(e);
    });


    $('#msg-content').on('click', function () {
        $('.imagetmp').css("display", "none");
    });

    function testAPI(event) {

        event.preventDefault();
        event.stopPropagation();

        var searchTerm = $("#input-msg").val().trim();
        var queryURL = "https://api.tenor.com/v1/search?q=" + searchTerm + "&key=YGY8YR0HQ8YW&limit=5&locale=en_US";
        // queryURLTwo is for the trivial API, deatils for it's functionality to be handled later
        var queryURLTwo = "https://opentdb.com/api.php?amount=1&difficulty=medium&type=multiple";

        $.ajax({
            url: queryURL,
            method: "GET",
        }).then(function (response) {
            if (!$('.imagetmp').is(':visible')) {
                $('.imagetmp').css("display", "block");
            }
            console.log(response.results[Math.floor(Math.random() * 4)].media[0].tinygif.url);
            console.log(response.results);
            $("#reviewImg").empty();
            for (var i = 0; i < response.results.length; i++) {
                var gifURL = response.results[i].media[0].mediumgif.url;
                var fileName = response.results[i].id;
                $('#reviewImg').append('<img class=\'img-item\'  src="' + gifURL + '" data-idx="' + fileName + '" onclick=\'javascript:sendGIF(this)\' />');
            }

        })
    };



    //handles signin on click function
    $('#loginBtn').on('click', signIn)

    //handles signout on click function
    $('#logoutBtn').on('click', signOut)

    //handles submit buttons
    $('#signUpBtn').on('click', handlesignUpBtnClick)
    // This function adds a selected GIF from the thumbnail column to the message box to be seen
    // By all members of the chat.

    // $(document).on("click", "#add-gif", testAPI);
    // $(document).on("click", ".gif-thumb", sendGIF);

});
 // Made userName a global variable for message on back of GIFs

 var userName;

//function to handlesignUpBtnClick
function handlesignUpBtnClick() {
    event.preventDefault()
    userName = $('#userName').val().trim();
    var email = userName + '@rhahekel.com';
    var password = $('#inputPassword1').val().trim();
    var password2 = $('#inputPassword2').val().trim();
    var hasError = false;
    if (validateForm(userName, password, password2)) {
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
            // Handle Errors here.
            //var errorCode = error.code;
            var errorMessage = error.message;
            alertMessage(errorMessage);
        }).then(addToDatabase)

        //function to update the database 
        function addToDatabase() {
            if (!hasError) {
                console.log(3, hasError);
                database = firebase.database();
                var setUserListRef = database.ref(`userList`);
                setUserListRef.push({
                    "userName": userName,
                    "lastSpoken": ["null"],
                    "favoritePlayer": ["null"]
                })
            }
        }
    }
};
//function to handle the form and verify if the form filled properly or not 
function validateForm(userName, password, password2) {
    var validForm = true;
    var alphanumeric = /^[a-zA-Z0-9]+$/
    if (password !== password2) {
        validForm = false;
        alertMessage('Password does not match');
    }
    else if (!userName.match(alphanumeric)) {
        validForm = false;
        alertMessage('Username can only be alphanumeric');
    } else if (userName.lenght === 0) {
        validForm = false;

    } else if (password.lenght === 0) {
        validForm = false;

    }

    return validForm;
};


//function that allows users to be able to sign in 
function signIn() {
    event.preventDefault()
    userName = $('#emailInput').val().trim();
    var email = $('#emailInput').val().trim() + '@rhahekel.com';
    var password = $('#passwordInput').val().trim();
    console.log(email)
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
        // Handle Errors here.
        // var errorCode = error.code;
        var errorMessage = error.message;
        alertMessage(errorMessage);
        // ...
    });
    //   $('#loginDropdown').hide();
}

//function that allows users to be able to sign out
function signOut() {
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
    }).catch(function (error) {
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
        displayUserAvailable(user);
        $('#userLogSection').hide();
        $('#midSection').show();
        $('#logoutBtn').show();
        $('#loginDropdown').hide();
        $('#dropdownMenu1').hide();
        $('#input-msg').focus();
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
function alertMessage(errorMessage) {
    $('#alertMessage').html(errorMessage)
    $('#alertMessage').show();
}

//functoin to display allUser available to play with
function displayUserAvailable(user) {
    var database = firebase.database();
    var userListRef = database.ref(`userList`)
    userListRef.orderByChild(`userName`).on(`child_added`, function (data, prevChildKey) {
        var allOtherUser = data.val();
        var databaseUsername = allOtherUser.userName;
        var currentUser = user.email.split('@')[0];
        if (currentUser != databaseUsername) {
            var htmlText = `<li class="list-group-item bg-transparent">
                            <button value="${databaseUsername}" type="button" class="btn btn-outline-secondary btn-lg btn-block playerUserNameBtn" id="allOtherUser-${databaseUsername}">
                                ${databaseUsername}
                            </button>
                        </li>`;
            $(`#userListSection`).append(htmlText);
 

            //LEAVE IT HERE I WILL USE IT LATER ///
            //setting up a listener on all buttons 
            // $(`#allOtherUser-${databaseUsername}`).on('click', function () {
            //     handlePlayerUserNameBtnClick(currentUser, databaseUsername);
            // })
        }
    })
};

// Appending GIFs to page now set-up as two functions: One puts the GIf chosen into the Modal for message input,
// then the second function occurs when you click on the Send Message button in the modal 
function sendGIF(item) {
    var src = $(item).attr('src');
    var imgtag = '<img class="img-msg-item" src="' + src + '" />';
    var htmlText = '<div class="flip-card"><div class="flip-card-inner"><div class="flip-card-front">' +
        imgtag
        + '</div><div class="flip-card-back"><h3>...</h3></div></div></div>';
    $('#gifModal').modal('show');
    $('#gif-preview').html(htmlText);
};

$(document).on("click", "#append-gif", function appendGIF() {
    var hiddenMsg = $("#gif-message-text").val();
    var gifMsg = $("#gif-preview > .flip-card");
    $("#gif-preview").find("h3").text(userName + " says:");
    $("#gif-preview").find(".flip-card-back").append("<p style='color: rgb(249, 255, 0); background-color: #2980b9;'>" + hiddenMsg + "</p>");
    $("#message-box").append(gifMsg);
    $("#gif-message-text").val("");
    $('#gifModal').modal('hide');

    autoScroll();
})

function autoScroll() {
    setTimeout(function () {
        var cc = $('#msg-content');
        var dd = cc[0].scrollHeight;
        cc.animate({
            scrollTop: dd
        }, 500);
    }, 1000);
}