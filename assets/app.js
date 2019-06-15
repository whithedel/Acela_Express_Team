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
//ADDED: currentChat global variable, used to make buttons and find page to
// which chat messages are to be appended
var userName;
var currentChat = "publicPosts";

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
                    "favoriteUser": ["null"]
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
        handleTheMainBtn(user);
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
//ADDED: id, values given to button changed so both users are seen on the button
function displayUserAvailable(user) {
    var database = firebase.database();
    var userListRef = database.ref(`userList`)
    userListRef.orderByChild(`userName`).on(`child_added`, function (data, prevChildKey) {
        var allOtherUser = data.val();
        var databaseUsername = allOtherUser.userName;
        var currentUser = user.email.split('@')[0];
        if (currentUser != databaseUsername) {
            var htmlText = `<li class="list-group-item bg-transparent">
                            <button value="${databaseUsername} ${userName}" type="button" class="btn btn-outline-secondary btn-lg btn-block UserNameBtn1 UserNameBtn" id="allOtherUser-${databaseUsername}">
                                ${databaseUsername}
                            </button>
                        </li>`;
            $(`#userListSection`).append(htmlText);


            // LEAVE IT HERE I WILL USE IT LATER ///
            // setting up a listener on all buttons 
            // $(`#allOtherUser-${databaseUsername}`).on('click', function () {
            //     console.log('123456777fdsgfdg')
            //     handleUserNameBtnClick(currentUser, databaseUsername);
            // })
        }
    })
};

//function that will handle the function handle usernamebtbclcik
function handleTheMainBtn(user){
    var currentUser = user.email.split('@')[0];
    var userListRef = firebase.database().ref(`userList`)
    userListRef.on(`value`,function(snapshot){
        console.log(Object.values(snapshot.val()));
        data = Object.values(snapshot.val())
        data.forEach(function (data){
            var databaseUsername = data.userName;
            if(currentUser != databaseUsername){
                $(document).on('click',`#allOtherUser-${databaseUsername}`, function () {
                    console.log('123456777fdsgfdg')
                    handleUserNameBtnClick(currentUser, databaseUsername);
                }) 
            }

        })
    })
}

// Appending GIFs to page now set-up as two functions: One puts the GIf chosen into the Modal for message input,
// then the second function occurs when you click on the Send Message button in the modal 
function sendGIF(item) {
    var src = $(item).attr('src');
    var imgtag = '<img class="img-msg-item" src="' + src + '" />';
    var htmlText = '<div class="flip-card"><div class="flip-card-inner"><div class="flip-card-front">' +
        imgtag
        + '</div><div class="flip-card-back"><h3 id="msg-head>...</h3><p id="msg-body"></p></div></div></div>';
    $('#gifModal').modal('show');
    $('#gif-preview').html(htmlText);
};

//ADJUSTED: adds to database now under public and private chat-page data objects
$(document).on("click", "#append-gif", function appendGIF() {
    var hiddenMsg = $("#gif-message-text").val();
    var gifMsg = $("#gif-preview > .flip-card");
    var data;
    $(gifMsg).find("h3").text(userName + " says:");

    $(gifMsg).find(".flip-card-back").append("<p style='color: rgb(249, 255, 0); background-color: #2980b9;'>" + hiddenMsg + "</p>");
    data = document.getElementById("gif-preview").innerHTML;
    console.log(data);
    //$("#message-box").append(data);
    firebase.database().ref(currentChat).push(data);
    $("#gif-message-text").val("");
    $('#gifModal').modal('hide');

    autoScroll();
})

//ADDED: Function that appends images to the public page, not one-on-one chats
firebase.database().ref("publicPosts").on("child_added", function (snapshot) {
    // console.log(snapshot.val())
    $("#message-box").append(snapshot.val());
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


//all the logics for handleUserNameBtnClick that will start a conversation with someone else 
function handleUserNameBtnClick(currentUser, otherUser) {
    console.log('im handlebtnusernameclick')
    appendSendBtn(currentUser,otherUser);
    // $(document).on(`click`, `#${currentUser+otherUser}`, function () {
    //     console.log('im the on click btn')
    //     sendMessageToDatabase(currentUser,otherUser)
    // })
    var p1p2 = currentUser + '+' + otherUser;
    var p2p1 = otherUser + '+' + currentUser;
    var namepair = '';
    chatRoomExist = false;
    chats = null;
    var database = firebase.database();
    var chatRoomRef = database.ref(`chatRoom`);
    chatRoomRef.once(`value`, function (snapshot) {
        chats = Object.values(snapshot.val())
        chats.forEach(function (data) {
            namePair = data.namepair;
            console.log(namePair);
            if (namePair === p1p2 || namePair === p2p1) {
                chatRoomExist = true;
                $(document).on(`click`, `#${currentUser+otherUser}`, function () {
                    console.log('im the on click btn')
                    sendMessageToDatabase(currentUser,otherUser)
                })
                // loadMessages(currentUser, otherUser);
                //highlightUserNameButton(otherUser);
            }
        })
    }).then(function () {
        if (!chatRoomExist) {
            $(document).on(`click`, `#${currentUser+otherUser}`, function () {
                console.log('im the on click btn')
                sendMessageToDatabase(currentUser,otherUser)
            })
            var newPostKey = firebase.database().ref().child('conversation').push().key;
            chatRoomRef.push({
                'namepair': `${currentUser}+${otherUser}`,
                'conversation': 'null'
            }).then(function () {
                var chatRoomKey = findChatRoomKey(currentUser, otherUser);
                // var conversationRef = firebase.database().ref(`chatRoom/${chatRoomKey}/conversation`);
                sender(chatRoomKey).then(function () {
                    // loadMessages(currentUser, otherUser);
                })
            })
        
        }
        loadMessages(currentUser, otherUser);
        highlightUserNameButton(otherUser);
    })
}

//function that will load all messages from the database 
function loadMessages(currentUser, otherUser) {
    $(`#message-box`).empty()
    var chatRoomKey = findChatRoomKey(currentUser, otherUser);
    var conversationRef = firebase.database().ref(`chatRoom/${chatRoomKey}/conversation`);
    conversationRef.on(`child_added`, function (data) {
        data = data.val();
        var gif = `<img class="img-msg-item" src="${data.url}" />`;
        var htmlText =`
        <div class="flip-card">
            <div class="flip-card-inner">
                <div class="flip-card-front">
                    <img class="img-msg-item" src="${data.url}">
                </div>
                <div class="flip-card-back">
                    <h3 id="msg-head">${data.author} says:</h3>
                 <p id="msg-body"></p>
                    <p style="color: rgb(249, 255, 0); background-color: #2980b9;">${data.message}</p>
                </div>
            </div>
        </div>`


        if (data.url != 'null') {
            
            $(`#message-box`).append(htmlText);
            $(`#message-box`).show();
            autoScroll();
        }
            
    })
    autoScroll();
}

//function to create the object of a sender 
function sender(chatRoomKey, username = 'null', url = 'null', message = 'null', time = 0) {
    // A post entry.
    console.log('im sender function')
    var conversation = {
        author: username,
        url: url,
        message: message,
        time: time,
    };
    // Get a key for a new Post.
    var newPostKey = firebase.database().ref().child(`chatRoom/${chatRoomKey}/conversation`).push().key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates[`chatRoom/${chatRoomKey}/conversation/` + newPostKey] = conversation;


    return firebase.database().ref().update(updates);
}

//function to find chatRoom key 
function findChatRoomKey(currentUser, otherUser) {
    var returnKey = ``;
    var database = firebase.database();
    var chatRoomRef = database.ref(`chatRoom`)
    var p1p2 = currentUser + '+' + otherUser;
    var p2p1 = otherUser + '+' + currentUser;
    chatRoomRef.on(`value`, function (snapshot) {
        var chats = Object.entries(snapshot.val());
        chats.forEach(function (data, index) {
            var rooms = data[1];
            var namePair = rooms.namepair;
            if (namePair === p1p2 || namePair === p2p1) {
                returnKey = data[0];
                console.log(returnKey)
            }
        })
    })
    return returnKey
}


function highlightUserNameButton(otherUser) {
    $(`.UserNameBtn1`).removeClass('btnColor');
    $(`#allOtherUser-${otherUser}`).addClass('btnColor');
}
//ADDED: on click function for chat buttons that create or show chat pages
//INCOMPLETE: Not yet fully functional. Suspossed to create new pages
// for individual one-on-one chats

$(document).on("click", ".UserNameBtn", function (event) {
    event.preventDefault();

    // $("#message-box").hide();
    currentChat = $(this).val();
    console.log(currentChat.includes(userName));
    if (!document.getElementsByClassName(currentChat)) {
        $(".received_msg").append("<div class='chat-page " + currentChat + "'></div>");
        $("." + currentChat).show();
    } else if (document.getElementById(currentChat)) {
        console.log("already exists!");
        $("." + currentChat).show();
    }
});

//append send button pertaining to a specific sender 
function appendSendBtn(currentUser, otherUser) {
    $(`#append-gif`).hide();
    $(`.privateButton`).empty();
    var button = `<button type="button" id="${currentUser + otherUser}" class="btn btn-primary privateBtn">Send</button>`
    $(`.privateButton`).append(button)
}


// send messages to firebase  
function sendMessageToDatabase(currentUser, otherUser) {
    console.log('im sendmessagetodatabase')
    var chatRoomKey = findChatRoomKey(currentUser, otherUser)
    var username = currentUser
    var url = $(`.img-msg-item`).attr(`src`);
    var message = $(`#gif-message-text`).val();
    var time = 0
    sender(chatRoomKey, username, url, message, time)
}


//ADDED: allows user to return to public message board/chatroom
$(document).on("click", "#public-chat", function (event) {
    event.preventDefault();

    currentChat = "publicPosts";
    $(`.privateBtn`).hide();
    $("#append-gif").show();
    $("#message-box").show();
    $(".chat-page").hide();

});
