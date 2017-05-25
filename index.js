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

            var timezone = "EDT";
            var timelineID = '***REMOVED***';
            var offset;

            switch(timezone){
                case "EDT":
                    offset = "-04:00";
                    break;
                case "CDT":
                    offset = "-05:00";
                    break;
                case "MDT":
                    offset = "-06:00";
                    break;
                case "PDT":
                    offset = "-07:00";
                    break;
                case "AKDT":
                    offset = "-08:00";
                    break;
                case "HST":
                    offset = "-10:00";
                    break;
                default:
                    offset = "-04:00";
                    break;
            }

            var formattedTime = date+"T"+time+":00"+offset;
            var formattedReminder = capitalizeEachWord(reminder);

            var pin = {
                "id": "pebblepush-"+date+"-"+time,
                "time": formattedTime,
                "duration": 15,
                "createNotification": {
                    "layout": {
                    "type": "genericNotification",
                    "title": "New Reminder",
                    "tinyIcon": "system://images/NOTIFICATION_LIGHTHOUSE",
                    "body": "PebblePush just added " + formattedReminder + " to your Timeline"
                    }
                },
                "reminders": [
                    {
                    "time": formattedTime,
                    "layout": {
                        "type": "genericReminder",
                        "tinyIcon": "system://images/NOTIFICATION_REMINDER",
                        "title": formattedReminder
                        }
                    }
                ],
                "layout": {
                    "type": "genericPin",
                    "title": formattedReminder,
                    "tinyIcon": "system://images/NOTIFICATION_REMINDER",
                    "body": "Created by PebblePush on Amazon Alexa"
                }
            };

            var put_options = {
                host: 'timeline-api.getpebble.com',
                path: '/v1/user/pins/pebblepush-'+date+'-'+time,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Token': timelineID
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
            console.log(JSON.stringify(pin));
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

function capitalizeEachWord(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}