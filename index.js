var https = require('https')
var http = require('http')

exports.handler = (event, context) => {

  try {

    if (event.session.new) {
      // New Session
      console.log("NEW SESSION")
    }

    switch (event.request.type) {

      case "LaunchRequest":
        // Launch Request
        console.log(`LAUNCH REQUEST`)
        context.succeed(
          generateResponse(
            buildSpeechletResponse("Welcome to Pebble Push, how may I help you?", false),
            {}
          )
        )
        break;

      case "IntentRequest":
        // Intent Request
        console.log(`INTENT REQUEST`)

        switch(event.request.intent.name) {
         case "normalReq":
            var reminder = event.request.intent.slots.Text.value;
            var date = event.request.intent.slots.Date.value;
            var time = event.request.intent.slots.Time.value;

            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1; //January is 0!
            var yyyy = today.getFullYear();
            var hours = today.getHours();
            console.log(hours);
            if(dd<10) {
                dd='0'+dd
            } 
            if(mm<10) {
                mm='0'+mm
            } 

            if(hours < 4){
                dd--;
            }
            today = yyyy+'-'+mm+'-'+dd;

            if(date === undefined){
                date = today;
            }
            if(time === undefined){
                time = '12:00';
            }

            console.log(reminder);
            console.log(date);
            console.log(time);

            var id = Math.floor((Math.random() * 999999) + 100000);

            var pin = {
                "id": "remind-"+12345,
                "time": date+"T"+time+"Z",
                "layout": {
                    "type": "genericPin",
                    "title": reminder,
                    "tinyIcon": "system://images/NOTIFICATION_FLAG"
                }
            }

            var put_options = {
                host: 'timeline-api.getpebble.com',
                path: '/v1/user/pins/remind-'+12345,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Token': '***REMOVED***'
                }
            };

            put_req = https.request(put_options, function (res) {
                console.log('STATUS: ' + res.statusCode);
                console.log('HEADERS: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    console.log('Response: ', chunk);
                    context.succeed(
                        generateResponse(
                            buildSpeechletResponse('Reminder is ' + reminder + ', date is ' + date + ', and time is ' + time, true),
                            {}
                        )
                    )
                });
            });

            put_req.on('error', function(e) {
                console.log('problem with request: ' + e.message);
            });

            put_req.write(JSON.stringify(pin));
            put_req.end();


            break;

         case "AMAZON.HelpIntent":
      	    console.log('HELP REQUEST');
      	    context.succeed(
                generateResponse(
                    buildSpeechletResponse('You can ask me to send a reminder to your Pebble Smartwatch with the reminder details, a date, and a time.... How may I help you?', false),
                    {}
                )
            )
        break;
        
        case "AMAZON.CancelIntent":
      	    console.log('HELP REQUEST');
      	    context.succeed(
                generateResponse(
                    buildSpeechletResponse('Thank you for using Pebble Push', true),
                    {}
                )
            )
        break;
        
        case "AMAZON.StopIntent":
      	    console.log('HELP REQUEST');
      	    context.succeed(
                generateResponse(
                    buildSpeechletResponse('Thank you for using Pebble Push', true),
                    {}
                )
            )
        break;

          default:
            throw "Invalid intent"
        }

        break;
    
    

      case "SessionEndedRequest":
        // Session Ended Request
        console.log('SESSION ENDED REQUEST')
        break;

      default:
        context.fail('INVALID REQUEST TYPE: ${event.request.type}')

    }

  } catch(error) { context.fail('Exception: '+error)}

}



// Helpers
buildSpeechletResponse = (outputText, shouldEndSession) => {

  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession
  }

}

generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }

}