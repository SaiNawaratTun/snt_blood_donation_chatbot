//
// This is main file containing code implementing the Express server and functionality for the Express echo bot.
//
"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const path = require("path");
var messengerButton =
  '<html><head><title>Facebook Messenger Bot</title></head><body><h1>Facebook Messenger Bot</h1>This is a bot based on Messenger Platform QuickStart. For more details, see their <a href="https://developers.facebook.com/docs/messenger-platform/guides/quick-start">docs</a>.<script src="https://button.glitch.me/button.js" data-style="glitch"></script><div class="glitchButton" style="position:fixed;top:20px;right:20px;"></div></body></html>';

// The rest of the code implements the routes for our Express server.
let app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// Webhook validation
app.get("/webhook", function(req, res) {
  if (
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === process.env.VERIFY_TOKEN
  ) {
    console.log("Validating webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

// Display the web page
app.get("/", function(req, res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(messengerButton);
  res.end();
});

// Message processing
app.post("/webhook", function(req, res) {
  console.log(req.body);
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === "page") {
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else if (event.postback) {
          receivedPostback(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

// Incoming events handling
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  var quickReply = "";
  if (message.quick_reply) {
    quickReply = message.quick_reply;
  }

  console.log("TEST", quickReply);

  console.log(
    "Received message for user %d and page %d at %d with message:",
    senderID,
    recipientID,
    timeOfMessage
  );
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (event.message.quick_reply) {
    sendQuickReply(senderID, quickReply, messageId, messageText);
  } else if (messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back the template example. Otherwise, just echo the text we received.
    switch (messageText) {
      case "generic":
        sendGenericMessage(senderID);
        break;

      case "Hi":
        sendTextMessage(senderID, "Hi!, welcome to SNT Blood Donation");
        break;

      case "Love you":
        sendTextMessage(senderID, "Sorry!, This is your personal problem");
        break;
      case "Start":
        sendTextMessage(senderID, "Welcome to SNT Blood Donation!");
        sendplay(senderID);
        sendadmin(senderID);
        break;

      default:
        sendTextMessage(
          senderID,
          "Thank You for your message. We will look into this and get back to you soon, if the bot reply is not relevent to your question since the bot is limited to SNT Blood Donation Service"
        );
        sendplay(senderID);
        sendadmin(senderID);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;

  console.log(
    "Received postback for user %d and page %d with payload '%s' " + "at %d",
    senderID,
    recipientID,
    payload,
    timeOfPostback
  );

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful
  //sendTextMessage(senderID, "Postback called");
  switch (payload) {
    case "GET_STARTED":
      // sendstart(senderID);
      sendTextMessage(senderID, "Welcome to SNT Blood Donation!");
      sendplay(senderID);
      sendadmin(senderID);
      break;

    //     case 'start_now':
    // sendplay(senderID);
    //     break;

    case "donate":
      senddonate(senderID);
      break;

    case "yes":
      sendphoto(senderID);
      sendphoto1(senderID);
      sendinforok(senderID);
      break;

    case "inforok":
      sendAskMessage(senderID);
      break;

    case "no":
      sendAskMessage(senderID);
      break;

    case "admin":
      sendfeedback(senderID);
      break;

    case "Keep going":
      sendHealthRecord(senderID);
      break;

    case "Go back":
      sendTextMessage(
        senderID,
        "Sorry!, If you arn't in that condition you cannot donate your blood"
      );
      sendplay(senderID);
      sendadmin(senderID);
      break;

    case "yes record":
      sendYesRecord(senderID);
      break;

    case "no record":
      sendNoRecord(senderID);
      break;

    case "ok":
      sendAgreement(senderID);
      break;

    case "agree":
      sendForm(senderID);
      break;

    case "disagree":
      sendTextMessage(
        senderID,
        "Sorry! Dear Sir/Madam, \n\nIf you disagree our online registration system agreement we hope you not to register in our online registeration system \n\nBut you can come and register with paper work registration and it will not have that presonal privacy agreement."
      );
      sendplay(senderID);
      sendadmin(senderID);
      break;

    case "request":
      sendwarranty(senderID);
      break;

    case "covid":
      sendcovid(senderID);
      break;
    case "continue":
      sendbloodtype(senderID);
      break;
    case "back":
      sendTextMessage(senderID, "Thank You for being honest!");
      sendplay(senderID);
      sendadmin(senderID);
      break;
  }
}

//////////////////////////
// Sending helpers
//////////////////////////

//for quick_reply payload
function sendQuickReply(senderID, quickReply, messageId, messageText) {
  var quickReplyPayload = quickReply.payload;
  console.log("QUICK REPLY", quickReply);
  console.log(
    "Quick reply for message %$ with payload %$",
    messageId,
    quickReplyPayload
  );
  if (quickReplyPayload) {
    switch (quickReplyPayload) {
      case "A":
        //sendTextMessage(senderID, "Please wait! we will looking the blood type you need");
        sendA(senderID);
        break;

      case "B":
        sendB(senderID);
        //sendaudio(senderID);
        break;

      case "O":
        sendO(senderID);
        break;

      case "AB":
        sendAB(senderID);
        break;

      case "blood":
        sendinformation(senderID);
        break;

      case "fd":
        senddfood(senderID);
        break;

      case "cdonate":
        sendthing(senderID);
        break;

      case "volunteer":
        sendvolask(senderID);
        break;
        
        case "vyes":
        sendvolunteer(senderID);
        break;
        
      case "vno":
        sendTextMessage(senderID, "Welcome to SNT Blood Donation!");
      sendplay(senderID);
      sendadmin(senderID);
        break;
        
      default:
        sendTextMessage(senderID, "Payload not defined");
    } //switch
  }
}
//end of pay load

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "rift",
              subtitle: "Next-generation virtual reality",
              item_url: "https://www.oculus.com/en-us/rift/",
              image_url: "http://messengerdemo.parseapp.com/img/rift.png",
              buttons: [
                {
                  type: "web_url",
                  url: "https://www.oculus.com/en-us/rift/",
                  title: "Open Web URL"
                },
                {
                  type: "postback",
                  title: "Call Postback",
                  payload: "Payload for first bubble"
                }
              ]
            },
            {
              title: "touch",
              subtitle: "Your Hands, Now in VR",
              item_url: "https://www.oculus.com/en-us/touch/",
              image_url: "http://messengerdemo.parseapp.com/img/touch.png",
              buttons: [
                {
                  type: "web_url",
                  url: "https://www.oculus.com/en-us/touch/",
                  title: "Open Web URL"
                },
                {
                  type: "postback",
                  title: "Call Postback",
                  payload: "Payload for second bubble"
                }
              ]
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

// function sendstart(recipientId) {
//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     message: {
//       attachment: {
//         type: "template",
//         payload: {
//           template_type: "button",
//           text: "Welcome to SNT Blood Donation!",
//           buttons:[{
//               type: "postback",
//               title: "Start Now",
//               payload: "start_now"
//           }]
//         }
//       }
//     }
//   };

//   callSendAPI(messageData);
// }

function sendplay(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text:
            "Please choose one you need to! \n\nIf you want donate your blood and Food/Drink please click 'Donate' button \n\nIf you want to request Blood please click 'Request Blood' button \n\nIf you want to donate thing or volunteer for COVID-19 please click 'COVID-19' button \nThank You!",
          buttons: [
            {
              type: "postback",
              title: "Donate",
              payload: "donate"
            },
            {
              type: "postback",
              title: "Request Blood",
              payload: "request"
            },
            {
              type: "postback",
              title: "COVID-19",
              payload: "covid"
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendadmin(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "\nIf you want to give feedback or send message to admin ",
          buttons: [
            {
              type: "postback",
              title: "Admin",
              payload: "admin"
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}
//               Start of Donate function
function senddonate(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    composer_input_disabled: true,
    message: {
      text:
        "Please select what you want to donate \n\nIf you want to donate your blood please select 'Blood' Button \n\nIf you want to donate refreshments for the blood donors at the hospital please select 'Refreshments' Button",
      quick_replies: [
        {
          content_type: "text",
          title: "Blood",
          payload: "blood"
        },
        {
          content_type: "text",
          title: "Refreshments",
          payload: "fd"
        }
      ]
    }
  };

  callSendAPI(messageData);
}

function sendcovid(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    composer_input_disabled: true,
    message: {
      text:
        "Please select one button \n\nIf you want to donate thing for COVID-19 please select 'Donate' Button \n\nIf you want to do volunteer for COVID-19 please select 'Volunteer' Button",
      quick_replies: [
        {
          content_type: "text",
          title: "Donate",
          payload: "cdonate"
        },
        {
          content_type: "text",
          title: "Volunteer",
          payload: "volunteer"
        }
      ]
    }
  };

  callSendAPI(messageData);
}

function sendvolask(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    composer_input_disabled: true,
    message: {
              text: "Dear Sir/Madam, \n\nIf you want to be volunteer you need to be 18+, healthy and have permission form your guardian. \nAre You?",
      quick_replies: [
        {
          content_type: "text",
          title: "Yes",
          payload: "vyes"
        },
        {
          content_type: "text",
          title: "No",
          payload: "vno"
        }
      ]
    }
  };

  callSendAPI(messageData);
}

//for bloodtype quick_reply payload

function sendinformation(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Want to know the thing need to do or don't before you donate?",
          buttons: [
            {
              type: "postback",
              title: "Yes,I do!",
              payload: "yes"
            },
            {
              type: "postback",
              title: "Already know!",
              payload: "no"
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendinforok(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Continue to Donation!",
          buttons: [
            {
              type: "postback",
              title: "Continue!",
              payload: "inforok"
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendAskMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text:
            "The Donor General Requirement : \n\nIf you want to donate your blood at least your weight need to have 110lb, Age need to be between 18 - 60 and have to be healthy. \n\nAre you have that condition?",
          buttons: [
            {
              type: "postback",
              title: "Yes",
              payload: "Keep going"
            },
            {
              type: "postback",
              title: "No",
              payload: "Go back"
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendHealthRecord(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Are you have personal health record?",
          buttons: [
            {
              type: "postback",
              title: "Yes",
              payload: "yes record"
            },
            {
              type: "postback",
              title: "No",
              payload: "no record"
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendYesRecord(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text:
            "When you come to donate your blood please take your personal health record with you.",
          buttons: [
            {
              type: "postback",
              title: "Ok!",
              payload: "ok"
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendNoRecord(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text:
            "It is ok! But before donation you have to give some minute to health check up!",
          buttons: [
            {
              type: "postback",
              title: "Ok!",
              payload: "ok"
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendAgreement(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text:
            "Agreement : \n\nThe reason of transfusion blood need to be for the donation and not for money.  After you finish of making the appointment, we want to use donor personal information that fill in the form 'Donor Name' and 'Phone Number' to show the person who need blood and request blood for emergency operation or surgery. Then that person may contact to you for your blood and discuss for donate your blood to them. \n\nAre you agree with that following?",
          buttons: [
            {
              type: "postback",
              title: "Agree",
              payload: "agree"
            },
            {
              type: "postback",
              title: "Disagree",
              payload: "disagree"
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendForm(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Blood Donation",
              subtitle: "Make Appointment for Blood Donation",
              item_url: "http://sntblooddonation.herokuapp.com/form/create",
              image_url:
                "https://cdn.glitch.com/e1b7e589-00c2-447a-8eab-99638556a841%2F103788115_109631140802132_5044912409659083185_n.jpg?v=1597105887458",
              buttons: [
                {
                  type: "web_url",
                  url: "https://sntblooddonation.herokuapp.com/form/create",
                  title: "Open",
                //   "webview_height_ratio": "full",
                // "messenger_extensions": true
                },
                {
                  type: "postback",
                  title: "Cancel",
                  payload: "GET_STARTED"
                }
              ]
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function senddfood(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Refreshments Donation",
              subtitle: "Make Appointment for Refreshment donation",
              item_url: "http://sntblooddonation.herokuapp.com/food/create",
              image_url:
                "https://cdn.glitch.com/e1b7e589-00c2-447a-8eab-99638556a841%2F103788115_109631140802132_5044912409659083185_n.jpg?v=1597105887458",
              buttons: [
                {
                  type: "web_url",
                  url: "https://sntblooddonation.herokuapp.com/food/create",
                  title: "Open",
                //   "webview_height_ratio": "full",
                // "messenger_extensions": true
                },
                {
                  type: "postback",
                  title: "Cancel",
                  payload: "GET_STARTED"
                }
              ]
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendthing(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "COVID-19 Items",
              subtitle: "Registration for COVID-19 Items Donation",
              item_url: "http://sntblooddonation.herokuapp.com/item/create",
              image_url:
                "https://cdn.glitch.com/e1b7e589-00c2-447a-8eab-99638556a841%2F103788115_109631140802132_5044912409659083185_n.jpg?v=1597105887458",
              buttons: [
                {
                  type: "web_url",
                  url: "https://sntblooddonation.herokuapp.com/item/create",
                  title: "Open",
                //   "webview_height_ratio": "full",
                // "messenger_extensions": true
                },
                {
                  type: "postback",
                  title: "Cancel",
                  payload: "GET_STARTED"
                }
              ]
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendvolunteer(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "COVID-19 Volunteer",
              subtitle: "Registration for COVID-19 volunteer",
              item_url: "http://sntblooddonation.herokuapp.com/volunteer/create",
              image_url:
                "https://cdn.glitch.com/e1b7e589-00c2-447a-8eab-99638556a841%2F103788115_109631140802132_5044912409659083185_n.jpg?v=1597105887458",
              buttons: [
                {
                  type: "web_url",
                  url: "https://sntblooddonation.herokuapp.com/volunteer/create",
                  title: "Open",
                //   "webview_height_ratio": "full",
                // "messenger_extensions": true
                },
                {
                  type: "postback",
                  title: "Cancel",
                  payload: "GET_STARTED"
                }
              ]
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendfeedback(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Message or Feedback",
              subtitle: "Sent Message or Feedback to Admin",
              item_url: "http://sntblooddonation.herokuapp.com/feedback/create",
              image_url:
                "https://cdn.glitch.com/e1b7e589-00c2-447a-8eab-99638556a841%2F103788115_109631140802132_5044912409659083185_n.jpg?v=1597105887458",
              buttons: [
                {
                  type: "web_url",
                  url: "https://sntblooddonation.herokuapp.com/feedback/create",
                  title: "Open",
                // "webview_height_ratio": "full",
                // "messenger_extensions": true
                },
                {
                  type: "postback",
                  title: "Cancel",
                  payload: "GET_STARTED"
                }
              ]
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}
//               End Donate code

//               Start of Request

function sendwarranty(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text:
            "Dear Requester, \n\nWe hope you are the people who really in need because we will show you the donor personal 'Phone No'. So, don't use it wrongly and we hope you know it is illegal and unethical. \n\nThank You!",
          buttons: [
            {
              type: "postback",
              title: "Continue!",
              payload: "continue"
            },
            {
              type: "postback",
              title: "Go Back!",
              payload: "back"
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendbloodtype(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    composer_input_disabled: true,
    message: {
      text: "Select Blood Type You Need",
      quick_replies: [
        {
          content_type: "text",
          title: "A",
          payload: "A"
        },
        {
          content_type: "text",
          title: "B",
          payload: "B"
        },
        {
          content_type: "text",
          title: "O",
          payload: "O"
        },
        {
          content_type: "text",
          title: "AB",
          payload: "AB"
        }
      ]
    }
  };

  callSendAPI(messageData);
}

function sendA(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "SNT Blood Donation",
              subtitle: "Make Request for Blood Type A",
              item_url: "http://sntblooddonation.herokuapp.com/a",
              image_url:
                "https://cdn.glitch.com/e1b7e589-00c2-447a-8eab-99638556a841%2F103788115_109631140802132_5044912409659083185_n.jpg?v=1597105887458",
              buttons: [
                {
                  type: "web_url",
                  url: "https://sntblooddonation.herokuapp.com/a",
                  title: "Open",
                  "webview_height_ratio": "full",
                "messenger_extensions": true
                },
                {
                  type: "postback",
                  title: "Cancel",
                  payload: "GET_STARTED"
                }
              ]
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendB(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "SNT Blood Donation",
              subtitle: "Make Request for Blood Type B",
              item_url: "http://sntblooddonation.herokuapp.com/b",
              image_url:
                "https://cdn.glitch.com/e1b7e589-00c2-447a-8eab-99638556a841%2F103788115_109631140802132_5044912409659083185_n.jpg?v=1597105887458",
              buttons: [
                {
                  type: "web_url",
                  url: "https://sntblooddonation.herokuapp.com/b",
                  title: "Open",
                  "webview_height_ratio": "full",
                "messenger_extensions": true
                },
                {
                  type: "postback",
                  title: "Cancel",
                  payload: "GET_STARTED"
                }
              ]
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendO(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "SNT Blood Donation",
              subtitle: "Make Request for Blood Type O",
              item_url: "http://sntblooddonation.herokuapp.com/o",
              image_url:
                "https://cdn.glitch.com/e1b7e589-00c2-447a-8eab-99638556a841%2F103788115_109631140802132_5044912409659083185_n.jpg?v=1597105887458",
              buttons: [
                {
                  type: "web_url",
                  url: "https://sntblooddonation.herokuapp.com/o",
                  title: "Open",
                  "webview_height_ratio": "full",
                "messenger_extensions": true
                },
                {
                  type: "postback",
                  title: "Cancel",
                  payload: "GET_STARTED"
                }
              ]
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendAB(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "SNT Blood Donation",
              subtitle: "Make Request for Blood Type AB",
              item_url: "http://sntblooddonation.herokuapp.com/ab",
              image_url:
                "https://cdn.glitch.com/e1b7e589-00c2-447a-8eab-99638556a841%2F103788115_109631140802132_5044912409659083185_n.jpg?v=1597105887458",
              buttons: [
                {
                  type: "web_url",
                  url: "https://sntblooddonation.herokuapp.com/ab",
                  title: "Open",
                  "webview_height_ratio": "full",
                "messenger_extensions": true
                },
                {
                  type: "postback",
                  title: "Cancel",
                  payload: "GET_STARTED"
                }
              ]
            }
          ]
        }
      }
    }
  };

  callSendAPI(messageData);
}



//             End Request

function callSendAPI(messageData) {
  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: "POST",
      json: messageData
    },
    function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var recipientId = body.recipient_id;
        var messageId = body.message_id;

        console.log(
          "Successfully sent generic message with id %s to recipient %s",
          messageId,
          recipientId
        );
      } else {
        console.error("Unable to send message.");
        console.error(response);
        console.error(error);
      }
    }
  );
}

// Set Express to listen out for HTTP requests
var server = app.listen(process.env.PORT || 3000, function() {
  console.log("Listening on port %s", server.address().port);
});

//This is function for add photo
function sendphoto(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
      message: {
        attachment: {
          type: "image",
          payload: {
            url: "https://cdn.glitch.com/e1b7e589-00c2-447a-8eab-99638556a841%2Fdo%20and%20dont%20B.jpg?v=1598562592669",
            "is_reusable":true
          }
        }
      }
    };
  callSendAPI(messageData);
}

function sendphoto1(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
      message: {
        attachment: {
          type: "image",
          payload: {
            url: "https://cdn.glitch.com/e1b7e589-00c2-447a-8eab-99638556a841%2Fdo%20and%20dont%20A.jpg?v=1598562583906",
            "is_reusable":true
          }
        }
      }
    };
  callSendAPI(messageData);
}
//This is audio file function
function sendaudio(recipientId) {
  const get_random_song = ar => ar[Math.floor(Math.random() * ar.length)];
  var song1 =
    "https://drive.google.com/file/d/1lu_Be42X6WUiSd_HFcyxXgIE28rIi-qX/view?ths=true";
  const song = [song1];

  {
    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        attachment: {
          type: "audio",
          payload: {
            url: get_random_song(song)
          }
        }
      }
    };
  }
  callSendAPI(messageData);
}
function sendVideo(recipientId){
const get_random_Video = ((ar) => ( ar[ Math.floor( Math.random() * ar.length ) ] ))
var Video1 = "https://youtu.be/z13OyA3hIqI";

const Video = [Video1]

{
 var messageData = {   
   recipient: {
        id: recipientId
    },
    message: {
        attachment: {
            type: "video",
            payload: {
                url: get_random_Video( Video )
            }
        }
    }
}
}
callSendAPI(messageData);}
