/*
chatServer.js
Author: David Goedicke (da.goedicke@gmail.com)
Closley based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

var express = require('express'); // web server application
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server
var io = require('socket.io')(http); // connect websocket library to server
var serverPort = 8000;
var moment = require('moment');
moment().format();

//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION -----------------------------//
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
  console.log('a new user connected');
  var questionNum = 0; // keep count of question, used for IF condition.
  socket.on('loaded', function() { // we wait until the client has loaded and contacted us that it is ready to go.

    socket.emit('answer', "Hey, hello I am travelHelper, a simple chat bot."); //We start with the introduction;
    setTimeout(timedQuestion, 5000, socket, "What is your name?"); // Wait a moment and respond with a question.

  });
  socket.on('message', (data) => { // If we get a new message from the client we process it;
    console.log(data);
    questionNum = bot(data, socket, questionNum); // run the bot function with the new message
  });
  socket.on('disconnect', function() { // This function  gets called when the browser window gets closed
    console.log('user disconnected');
  });
});
//--------------------------CHAT BOT FUNCTION-------------------------------//
function bot(data, socket, questionNum) {
  var input = data; // This is generally really terrible from a security point of view ToDo avoid code injection
  var answer;
  var question;
  var waitTime;

  /// These are the main statments that make up the conversation.
  if (questionNum == 0) {
    answer = 'Hello ' + input + ' :-)'; // output response
    waitTime = 5000;
    question = 'When are you going traveling? (month/day/year format please)'; // load next question
  } else if (questionNum == 1) {
    let firstDate = moment(input, 'M/D/YYYY');
    let secondDate = moment(new Date().toLocaleString().split(',')[0], 'M/D/YYYY');
    console.log('Second'+ secondDate);
    console.log('First' + firstDate);
    var timeDifference =  firstDate.diff(secondDate, 'days');
    answer = 'Cool, that means you will leave in ' + timeDifference + ' days';//output response
   // answer = 'Really, ' + input + ' years old? So that means you were born in: ' + (2018 - parseInt(input)); // output response
    waitTime = 5000;
    question = 'Where are you going?'; // load next question
  } else if (questionNum == 2) {
    answer = 'Cool! I have never been to ' + input + '.';
    waitTime = 5000;
    question = 'It seems like it will be cold when you get there if you look up the weather. Did you pack your jacket?' //load next question
  } else if (questionNum == 3) { 
    if (input.toLowerCase() === 'yes') 
     answer = 'Cool! Good Job :)';
    else 
     answer = 'Pack your jacket! it really looks like it will be freezing';
	
//     waitTime = 5000;
//     questionNum++;
//   } else if (input.toLowerCase() === 'no') {
//     answer = 'Pack your jacket! It really looks like it will be freezing! I wont budge until you say that you packed your jacket';
//     waitTime = 0; 
//     questionNum--; //Here we go back in  the question number this can end up in a loop
//   } else {
//     question = 'Did you look up the weather and see how cold it will be?';
//     answer = 'I did not understand you. Could you please answer "yes" or "no"?';
//     questionNum--;
//     waitTime = 5000;
     waitTime = 5000;
//    question = '';
//   } 
//  } else if (questionNum == 4) {
//    answer = 'Good Job for packing warmly.';
//    waitTime = 5000;	
    question = 'Just curious, whats the color of your jacket?'; // load next question
  } else if (questionNum == 4) {
    answer = 'Ok, ' + input + ' it is.';
    socket.emit('changeBG', input.toLowerCase());
    waitTime = 5000;
    question = 'Can you still read the font?'; // load next question
  } else if (questionNum == 5) {
    if (input.toLowerCase() === 'yes' || input === 1) {
      answer = 'Perfect!';
      waitTime = 5000;
      question = 'Whats your favorite place?';
    } else if (input.toLowerCase() === 'no' || input === 0) {
      socket.emit('changeFont', 'white'); /// we really should look up the inverse of what we said befor.
      answer = ''
      question = 'How about now?';
      waitTime = 0;
      questionNum--; // Here we go back in the question number this can end up in a loop
    } else {
      question = 'Can you still read the font?'; // load next question
      answer = 'I did not understand you. Could you please answer "yes" or "no"?'
      questionNum--;
      waitTime = 5000;
    }
    // load next question
  } else {
    answer = 'I have nothing more to say!'; // output response
    waitTime = 0;
    question = '';
  }


  /// We take the changed data and distribute it across the required objects.
  socket.emit('answer', answer);
  setTimeout(timedQuestion, waitTime, socket, question);
  return (questionNum + 1);
}

function timedQuestion(socket, question) {
  if (question != '') {
    socket.emit('question', question);
  } else {
    //console.log('No Question send!');
  }

}
//----------------------------------------------------------------------------//
