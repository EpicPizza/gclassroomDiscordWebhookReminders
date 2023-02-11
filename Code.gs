function check() {
  var threads = GmailApp.getInboxThreads();

  for(var i = 0; i < threads.length; i++) {
    var content = getUsefulStuff(threads[i].getMessages()[0].getBody()); //just looks through the first message in each thread
    if(content != null) { //if it returns content and not null, it has found an annoucement
      if(threads[i].getMessages()[0].isStarred() == false) { //only sends it if it has not been starred, stars are used to track if it has been processed
        Logger.log(content);
        threads[i].getMessages()[0].star() //stars for next time
        content = content.replace(/&lt/, "<");
        content = content.replace(/&gt/, ">");
        content += "\n\nLink: " + link;
        send(content, true); // send to discord
      } else { //if it is starred, just ignore and return the program, since there wouldn't be any more stars after this.
        return;
      }
    }
  }
}

function send(content, ping)  { //reference: https://www.labnol.org/code/20563-post-message-to-discord-webhooks
  if(ping) {
    content = "<\@&your-role-ping> \n" + content; //<----- put role ping here
  }
  var url = "your-webhook-url"; //<----- setup a webook and put it here
  var payload = JSON.stringify({ content: content });

  var params = {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    payload: payload,
    muteHttpExceptions: true,
  };

  var response = UrlFetchApp.fetch(url, params);

  Logger.log(response.getContentText());
}

function getUsefulStuff(importantInfo) {
  if(importantInfo.includes("your-teacher-name") /* To identify certain class */ && importantInfo.includes("<tr><td style=\"font-size: 11px; font-weight: 500; letter-spacing: 0.8px; float:left; text-transform: uppercase; line-height: 16px;color: #5F6368;\">New announcement</td><td style=\"font-family:  Google Sans,Roboto,Helvetica,Arial,sans-serif; font-size: 14px; letter-spacing: 0.25px; color: #3c4043; float:right;\"></td></tr><tr height=4px></tr>") /* Checks if it is an annoucement */) {
    importantInfo = importantInfo.substring(importantInfo.indexOf("<tr><td style=\"font-size: 11px; font-weight: 500; letter-spacing: 0.8px; float:left; text-transform: uppercase; line-height: 16px;color: #5F6368;\">New announcement</td><td style=\"font-family:  Google Sans,Roboto,Helvetica,Arial,sans-serif; font-size: 14px; letter-spacing: 0.25px; color: #3c4043; float:right;\"></td></tr><tr height=4px></tr>") + 321, importantInfo.indexOf("<tr height=0></tr><tr height=16px></tr>")); //uses certain pieces of html in email to mark location of useful information
    return filter(importantInfo); //filter html out
  }
  return undefined; //if it didn't find an annoucment
}

function getUsefulStuffLink(importantInfo) { //same thing but for link
  if(importantInfo.includes("your-teacher-name") && importantInfo.includes("<tbody><tr><td><a href=https://accounts.google.com/AccountChooser?continue=https://classroom.google.com/c/")) {
    importantInfo = importantInfo.substring(importantInfo.indexOf("<tbody><tr><td><a href=https://accounts.google.com/AccountChooser?continue=https://classroom.google.com/c/") + 75, importantInfo.indexOf("target=_blank>Open</a>") - 343);
    return importantInfo;
  }
  return undefined;
}

function filter(html) {
  var lastChar;
  var output = "";
  for(var i = 0; i < html.length; i++) { //what this function does is that it only saves the information between the > and <, which is the non-html stuff, if there is a line break after, it adds \n.
    if(html[i] == ">") {
      lastChar = i;
    } else if(html[i] == "<") {
      if(i - lastChar == 1 || lastChar == undefined) {
        lastChar = 0;
        if(html[i + 1] == "b" && html[i + 2] == "r") {
          output += "\n";
        }
      } else {
        output += html.substring(lastChar + 1, i);
        if(html[i + 1] == "b" && html[i + 2] == "r") {
          output += "\n";
        }
      }
    }
  }
  return output;
}
