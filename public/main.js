$(function () {
  //jquerry variablen für html-elemente
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); //username hier
  var $messages = $('.messages');           //nachrichten hier
  var $inputMessage = $('.inputMessage');   //eingabefeld für nachricht
  var $loginPage = $('.login.page');        //username nachfrage
  var $putintextPage = $('.putintext.page');        //nachricht eingabe hier
  var $chatPage = $('.chat.page');          //chat hier

  var username;
  var connected = false;                    //ist angemeldet?

  //focus eingabefeld
  var $currentInput = $usernameInput.focus();

  //socket.io objekt anlegen
  var socket = io();


  //reaktion auf tastendruck hier
  $window.keydown(function (event) {
    //return-taste, nummer 13 in ascii
    if (event.which === 13) {
      if (username) {
        //hat er username eingegeben, dann geht es um nachricht
        sendMessage();
      } else {
        //sonst muss user noch username eingeben
        setUsername();
      }
    }
  });

  //setter für username
  function setUsername() {
    //username holen und leerzeichen vorne und hinten wegmachen
    username = $usernameInput.val().trim();

    //prüf ob username nicht leer ist und mach weiter
    if (username) {
      //login-maske weg und nachrichten-/chat-maske rein
      $loginPage.fadeOut();
      $putintextPage.show();
      $chatPage.show();

      //eingabefeld für nachrichten kommt ins focus
      $currentInput = $inputMessage.focus();


      //info über neue user an dem server schicken und wenn alles in ordnung kommt vom server nachricht zurück
      socket.emit('add user', username);
    }
  }

  //sendung von nachrichten hier
  function sendMessage() {
    //nachricht holen, ohne leerzeichen vorne und hinten
    var message = $inputMessage.val().trim();

    //prüf ob nachrichtfeld nicht leer ist und ob wir noch verbunden sind
    if (message && connected) {
      //eingabefeld leer setzen
      $inputMessage.val('');

      //nachrichte in chatprotokoll
      addChatMessage({ username: username, message: message });

      //server über neue nachrichten informieren und server muss nachricht an allen verteilen
      socket.emit('new message', message);
    }
  }

  //protokollnachricht in chatprotokoll
  function log(message) {
    var $el = $('<li>').addClass('log').text(message);
    if (message == "Willkommen beim Chat!") {
      var $el = $('<li style="color: red">').addClass('log').text(message);
    }
    $messages.append($el);
  }

  //nachricht in chatprotokoll
  function addChatMessage(data) {
    var $usernameDiv = $('<span class="username"/>').text(data.username);
    var $messageBodyDiv = $('<span class="messageBody">').text(data.message);
    var $messageDiv = $('<li class="message"/>').append($usernameDiv, $messageBodyDiv);
    $messages.append($messageDiv);
  }

  //socket.io events

  //server schickt nachricht - anmeldung war erfolgreich
  socket.on('login', function (data) {
    connected = true;
    log("Willkommen beim Chat!");
  });

  //server schickt neue nachricht info zum chatprotokoll
  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  //server schickt neue user nachricht info zum chatprotokoll
  socket.on('user joined', function (data) {
    log(data + ' joined');
  });

  //server schickt user left nachricht info zum chatprotokoll
  socket.on('user left', function (data) {
    log(data + ' left');
  });
});