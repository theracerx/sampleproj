
var ss=SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1bk2Jqs0owKd-4DzXyPucnu-TVZc7y-n2o0xv4C20vDQ/edit?usp=sharing");
var sheet = ss.getSheetByName("LogBook");
var sheet1 = ss.getSheetByName("1stAttempt");
var sheet2 = ss.getSheetByName("2ndAttempt");
var sheet3 = ss.getSheetByName("3rdAttempt");
var sheet4 = ss.getSheetByName("NthAttempt");
//retreived from https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes/blob/master/all/all.csv
var sheet5 = ss.getSheetByName("Countries");
var sheet6 = ss.getSheetByName("Statistics");
var sheet7 = ss.getSheetByName("AddInfo");
var lock = LockService.getScriptLock();

//edited from vscode
//detects which action to take based on the URL PASSED

function doGet(e){
  lock.tryLock(5000); //15 secs lock || attempt to generate a new lock after the earlier script is done
  
  if(lock.hasLock() == true && sheet6.getRange(6,2).getValue() != 500){ //if lock generated && not limit yet
    
    // console.log("AAAAA")
    SpreadsheetApp.flush();

    //update Script execution count
    var count = sheet6.getRange(6,2).getValue()
    sheet6.getRange(6,2).setValue(count + 1)
    
    //SpreadsheetApp.flush();

    lock.releaseLock();

    var op = e.parameter.action; 

    if(op=="verify_user"){   
      return verify_user(e);
    } else if(op=="retrieve_prog"){
      return retrieve_prog(e);
    } else if(op=="update_prog"){
      return update_prog(e);
    } else if(op=="verify_progpos"){
      return verify_progpos(e);
    } else if(op=="verify_prog"){
      return verify_prog(e);
    } else if(op=="secure_pass"){
      return secure_pass(e);
    } else if(op=="verify_pass"){
      return verify_pass(e);
    } else if(op=="recover_pass"){
      return recover_pass(e);
    } else if(op=="update_username"){
      return update_username(e);
    } else if(op=="update_pass"){
      return update_pass(e);
    } else if(op=="update_pass2"){
      return update_pass2(e);
    } else if(op=="update_recovery"){
      return update_recovery(e);
    } else if(op=="request_astronomy"){
      return request_astronomy();
    } else if(op=="verify_altsignin"){
      return verify_altsignin(e);
    } else if(op=="link_altsignin"){
      return link_altsignin(e);
    } else if(op=="unlink_altsignin"){
      return unlink_altsignin(e);
    } else if(op=="testDdos1"){
      return testDdos();
    } else { // invalid action
      var msg = "invalid action"
      msg = JSON.stringify({
        "msg": msg
      });
      
      return ContentService.createTextOutput("consoleme(" + msg + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  } else { //if Script execution limit reached || Long queue
    
    SpreadsheetApp.flush();

    //update Script execution count
    var count = sheet6.getRange(6,2).getValue()
    sheet6.getRange(6,2).setValue(count + 1)
    
    //SpreadsheetApp.flush();
    
    var user_state = "sv_busy"

    user_state = JSON.stringify({
      "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat);").setMimeType(ContentService.MimeType.JAVASCRIPT);  
  }  
}

//Receive action || parameter and pass it to function to handle
//proceeds to register_user || verify_pass
function verify_user(request){
 
  var username = request.parameter.username;
  var nxtaction = request.parameter.action2;
  
  var flag=1;
  var lr= sheet.getLastRow();
  for(var i=1;i<=lr;i++){
    var trgt = sheet.getRange(i, 3).getValue();
    
    if(username == trgt && nxtaction == "verify_pass"){ //username matched
      flag=0;
        return verify_pass(request,i);
    } else if (username == trgt && nxtaction == "register_user"){ //username exists already
        
      var user_state = "exist"
      
      user_state = JSON.stringify({
        "state": user_state
      });
      
      return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  }
  
  //add new row with recieved parameter from client
  if(flag==1){
    if(nxtaction == "register_user"){ //proceed to register
      return register_user(request);
    } else if (nxtaction == "verify_pass"){ //unregistered
      
      var user_state = "unregistered";

      user_state = JSON.stringify({
        "state": user_state
      });

      return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else { //invalid action2 param
      var msg = "Error on paramter.action2 in verify_user() returned: " + nxtaction;
      
      msg = JSON.stringify({
        "msg": msg
      });
      return ContentService.createTextOutput("alertme(" + msg + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  }
}

function register_user(request){
  
  var username = request.parameter.username;
  var userid = request.parameter.userID;
  var password = request.parameter.password;
  var sec_ques = request.parameter.sec_ques;
  var sec_ans = request.parameter.sec_ans;
  var c_loc = request.parameter.country; 
  //add new row with recieved parameter from client
  var d = new Date();
  var currentTime = d.toLocaleString();

  var lr= sheet5.getLastRow();
  var flag=1;
  for(var i=1;i<=lr;i++){
    var trgt = sheet5.getRange(i, 2).getValue();
    //if username matched
    if(c_loc == trgt){
      flag = 0;
      var c_country = sheet5.getRange(i, 1).getValue();
      var c_flag = request.parameter.flag;
      var c_sunrise = request.parameter.sunrise;
      var c_sunset = request.parameter.sunset;
      var c_solar_noon = request.parameter.solar_noon;
      var c_moonrise = request.parameter.moonrise;
      var c_moonset = request.parameter.moonset;

      lock.tryLock(5000)
      if (lock.hasLock()){ //if lock generated
        SpreadsheetApp.flush();

        //add basic data
        sheet.appendRow([currentTime, currentTime, username, password, "0", 1.1, c_country, sec_ques, sec_ans, userid,"","offline"]);
        sheet1.appendRow([username,0,0,"0"]);
        sheet2.appendRow([username,0,0,"0"]);
        sheet3.appendRow([username,0,0,"0"]);
        sheet4.appendRow([username,0,0,"0"]);
        sheet7.appendRow([username, c_sunrise, c_sunset, c_solar_noon, c_moonrise, c_moonset, c_flag])

        //update Registered Stat
        var totalReg = sheet.getLastRow();
        sheet6.getRange(2,2).setValue(totalReg - 1);

        SpreadsheetApp.flush();
        lock.releaseLock()

        var user_state = "registered"

        user_state = JSON.stringify({
          "state": user_state
        });

        totalReg = JSON.stringify({
          "msg": totalReg
        });

        return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat);collectStat(" + totalReg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);  
      } else { //if unable to generate lock

        var user_state = "sv_busy"

        user_state = JSON.stringify({
          "state": user_state
        });

        return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat);").setMimeType(ContentService.MimeType.JAVASCRIPT);  
      }

      
    }
  }
  if (flag == 1){

    var user_state = "loc_failed"
    user_state = JSON.stringify({
        "state": user_state
      });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);  
  }
}

function verify_pass(request,rank){ //gives astronomy user userid progpos session  
 
  var username = request.parameter.username;
  var password = request.parameter.password;
  var sessionid = request.parameter.sessionID;

  var trgt = sheet.getRange(rank,4).getValue();
  //var trgt2 = sheet7.getRange(rank,1).getValue();
  var trgt2 = sheet.getRange(rank,3).getValue();
  if(password == trgt && username == trgt2){

    //Update Last Active
    var d = new Date();
    var currentTime = d.toLocaleString();
    sheet.getRange(rank,2).setValue(currentTime)

    //Update SessionID 
    sheet.getRange(rank,11).setValue(sessionid);

    //Update User status to standby
    sheet.getRange(rank,12).setValue("standby");

    var user_state = "verified";

    user_state = JSON.stringify({
      "state": user_state
    });

    var user_progpos = sheet.getRange(rank,6).getValue();
    var c_country = sheet.getRange(rank,7).getValue();
    var c_sunrise = sheet7.getRange(rank,2).getValue();
    var c_sunset = sheet7.getRange(rank,3).getValue();
    var c_solar_noon = sheet7.getRange(rank,4).getValue();
    var c_moonrise = sheet7.getRange(rank,5).getValue();
    var c_moonset = sheet7.getRange(rank,6).getValue();
    var c_flag = sheet7.getRange(rank,7).getValue();
    var c_userid = sheet.getRange(rank,10).getValue();
    var c_rank = rank;

    data = JSON.stringify({
      "c_user": username, "c_progpos":user_progpos, "c_country":c_country, "c_sunrise":c_sunrise, "c_sunset":c_sunset, "c_solar_noon":c_solar_noon, "c_moonrise":c_moonrise, "c_moonset": c_moonset, "c_flag":c_flag, "c_userid":c_userid, "c_sessionid":sessionid, "c_rank":c_rank
    });

    return ContentService.createTextOutput("userState(" + user_state + "," + data + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);

  } else if (password != trgt){ //invalid pass
    var user_state = "incorrectpass"
   
    user_state = JSON.stringify({
      "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else { //invalid username????? wtf
    var user_state = "missing"
   
    user_state = JSON.stringify({
      "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function update_username(request){ //gives astronomy user userid progpos session  
 
  var username = request.parameter.username;
  var password = request.parameter.password;
  var newname = request.parameter.newname;
  var newpass = request.parameter.newpassword;
  var sessionid = request.parameter.sessionID;
  var rank = request.parameter.rank;

 

  //check if newname exists already
  var flag=1;
  var lr= sheet.getLastRow();
  for(var i=1;i<=lr;i++){
    var trgt = sheet.getRange(i, 3).getValue();
    if(newname == trgt){ //newname exists already
      var user_state = "exist";
      
      user_state = JSON.stringify({
        "state": user_state
      });

      return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  }

  //if not then update
  if (flag == 1){
    var trgt = sheet.getRange(rank,4).getValue();
    var trgt2 = sheet.getRange(rank,11).getValue();
    var trgt3 = sheet.getRange(rank,3).getValue();
    if(sessionid == trgt2 && username == trgt3 && password == trgt){ //if all matched
      sheet.getRange(rank, 3).setValue(newname);
      sheet.getRange(rank, 4).setValue(newpass);
      sheet1.getRange(rank, 1).setValue(newname);
      sheet2.getRange(rank, 1).setValue(newname);
      sheet3.getRange(rank, 1).setValue(newname);
      sheet4.getRange(rank, 1).setValue(newname);
      sheet7.getRange(rank, 1).setValue(newname);

      var user_state = "userupdated"

      user_state = JSON.stringify({
        "state": user_state
      });

      data = JSON.stringify({
        "c_user": newname
      });

      return ContentService.createTextOutput("userState(" + user_state + "," + data + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else if (sessionid != trgt2){ //invalid sessionid
      var user_state = "invalid_session" 
          
      user_state = JSON.stringify({
          "state": user_state
      });

      return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else if (username != trgt3){ //invalid username
      var user_state = "missing" 
          
      user_state = JSON.stringify({
          "state": user_state
      });

      return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else{ //invalid pass
      var user_state = "incorrectpass"
    
      user_state = JSON.stringify({
        "state": user_state
      });

      return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  } 
}

function recover_pass(request){
  var username = request.parameter.username;
  var flag=1;
  var lr= sheet.getLastRow();
  for(var i=1;i<=lr;i++){
    var trgt = sheet.getRange(i, 3).getValue();
    
    //if username matched
    if(username == trgt){
      flag=0;
      var sec_ques = sheet.getRange(i,8).getValue();
      var sec_ans = sheet.getRange(i,9).getValue();

      username = JSON.stringify({
      "name": username
      });
      
      sec_ques = JSON.stringify({
      "ques": sec_ques
      });

       sec_ans = JSON.stringify({
      "ans": sec_ans
      });

      return ContentService.createTextOutput("recoverPassword(" + username + "," + sec_ques + "," + sec_ans + "," + i +");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  }
  if(flag == 1 ){
    username = JSON.stringify({
      "name": username
    });

    var user_state = "missing";

    user_state = JSON.stringify({
      "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
    //return ContentService.createTextOutput("forgotPassword(" + username + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

}

function update_pass(request){
  var username = request.parameter.username;
  var password = request.parameter.password; //newpass
  var rank = request.parameter.rank;

  var trgt = sheet.getRange(rank, 3).getValue();
  
  if(username == trgt){

    sheet.getRange(rank,4).setValue(password);

    //Update Last Active
    var d = new Date();
    var currentTime = d.toLocaleString();
    sheet.getRange(rank,2).setValue(currentTime)

    var user_state = "passupdated"

    user_state = JSON.stringify({
      "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);

  } else{ //invalid username
    var user_state = "missing"
    
    user_state = JSON.stringify({
      "state": user_state
    });

    return ContentService.createTextOutput("userstate(" + user_state + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function update_pass2(request){
  var username = request.parameter.username;
  var password = request.parameter.password; //new
  var sessionid = request.parameter.sessionID;
  var rank = request.parameter.rank;

  var trgt = sheet.getRange(rank, 3).getValue();
  var trgt2 = sheet.getRange(rank, 11).getValue();

  if( sessionid == trgt2 && username == trgt){ //if all matched
    sheet.getRange(rank,4).setValue(password);

    //Update last Active
    var d = new Date();
    var currentTime = d.toLocaleString();
    sheet.getRange(rank,2).setValue(currentTime)

    var user_state = "passupdated"
  
    user_state = JSON.stringify({
      "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else if (sessionid != trgt2 ){ //invalid sessionid
    var user_state = "invalid_session"
      
    user_state = JSON.stringify({
      "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else{ //invalid username
    var user_state = "missing"
    
    user_state = JSON.stringify({
      "state": user_state
    });

    return ContentService.createTextOutput("userstate(" + user_state + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function update_recovery(request){
  var username = request.parameter.username;
  var sec_ques = request.parameter.sec_ques;
  var sec_ans = request.parameter.sec_ans;
  var sessionid = request.parameter.sessionID;
  var rank = request.parameter.rank;

  var trgt = sheet.getRange(rank, 3).getValue();
  var trgt2 = sheet.getRange(rank,11).getValue();

  if(username == trgt && trgt2 == sessionid){ //if username && sessionid matched
    flag=0;

    sheet.getRange(rank,8).setValue(sec_ques);
    sheet.getRange(rank,9).setValue(sec_ans);
    
    //Update last Active
    var d = new Date();
    var currentTime = d.toLocaleString();
    sheet.getRange(rank,2).setValue(currentTime)



    var user_state = "recovery_updated"
    
    user_state = JSON.stringify({
        "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else if (sessionid != trgt2){ //invalid sessionid
    var user_state = "invalid_session"
    
    user_state = JSON.stringify({
        "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else if (username != trgt){ //invalid name
    var user_state = "missing"
    
    user_state = JSON.stringify({
        "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function retrieve_miscdata(){ //unused
  var username = request.parameter.username;

  var flag=1;
  var lr= sheet7.getLastRow();
  for(var i=1;i<=lr;i++){
    var trgt = sheet7.getRange(i, 1).getValue();
    
    //if username matched
    if(username == trgt){
      flag=0;
      var c_sunrise = sheet7.getRange(i,2).getValue();
      var c_sunset = sheet7.getRange(i,3).getValue();
      var c_solar_noon = sheet7.getRange(i,4).getValue();
      var c_moonrise = sheet7.getRange(i,5).getValue();
      var c_moonset = sheet7.getRange(i,6).getValue();
      var c_flag = sheet7.getRange(i,7).getValue();



    }
  }

  if(flag == 1){
    var msg = "Username " + username + ", is missing miscdata on AddInfo sheet";

    msg = JSON.stringify({
      "msg": msg
    });

    return ContentService.createTextOutput("consoleme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

}




function retrieve_prog(request){ //returns episodeVal, episodeTime, episodeLink
 
  var username = request.parameter.username;
  var progpos = request.parameter.progpos;
  var progchap = request.parameter.progchap;
  var progep = request.parameter.progep;
  var sessionid = request.parameter.sessionID;
  var rank = request.parameter.rank;
  var status = sheet.getRange(rank,12).getValue()

  var trgt = sheet.getRange(rank,11).getValue();
  var trgt2 = sheet.getRange(rank, 3).getValue();
  var trgt3 = sheet.getRange(rank,6).getValue();
  if( sessionid == trgt && trgt2 == username && trgt3 == progpos && status != "offline"){
    

    if(progchap == "1"){
      var c_ep = parseFloat(progep) + 3; //locates current episode
      var c_epVal = sheet1.getRange(rank,c_ep).getValue(); // current episode value

      if (c_epVal != 0){ //has recorded data 

        //update Attempt
        var c_epAtmpt = sheet1.getRange(rank,3).getValue(); //currentAttempt
        var c_epAtmptN = parseFloat(c_epAtmpt) + 1;
        sheet1.getRange(rank,3).setValue(c_epAtmptN) //adds 1 to Attempt
        var c_epT = sheet1.getRange(rank,2).getValue(); //gets currentTime

        var msg = c_epVal + " but on its " + c_epAtmptN + " attmept! Plus time at " + c_epT;

        data = JSON.stringify({
          "c_epT": epT, "c_epVal": c_epVal, "c_progpos": progpos
        });

        return ContentService.createTextOutput("receiveProg(" + data + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);

      } else { // no recorded data yet
        
        sheet1.getRange(rank,3).setValue(1)// resets Attempt to 1
        sheet1.getRange(rank,2).setValue(0); //resets currentTime to 0

        data = JSON.stringify({
          "c_epT": 0, "c_epVal": 0, "c_progpos": progpos
        });

        return ContentService.createTextOutput("receiveProg(" + data + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
    } else if (progchap == "2"){
      var msg = "Success retrieve2"

      msg = JSON.stringify({
        "msg": msg
      });

      return ContentService.createTextOutput("consoleme(" + msg + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else if (progchap == "3"){
      var msg = "Success retrieve3"

      msg = JSON.stringify({
        "msg": msg
      });

      return ContentService.createTextOutput("consoleme(" + msg + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      var msg = "Success retrieveX"

      msg = JSON.stringify({
        "msg": msg
      });

      return ContentService.createTextOutput("consoleme(" + msg + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  } else if( sessionid != trgt || status == "offline"){ //invalid session
    var user_state = "invalid_session"
  
    user_state = JSON.stringify({
      "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else if (trgt3 != progpos){ //invalid progpos //redirect to correct progpos
    var msg = "Progpos didn't match!"

    msg = JSON.stringify({
      "msg": msg
    });

    return ContentService.createTextOutput("consoleme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else { //missing username

    var user_state = "missing"
  
    user_state = JSON.stringify({
      "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);

  }   
}

function retrieve_prog123123(request){
 
  var username = request.parameter.username;
  var progpos = request.parameter.progpos;
  var progchap = request.parameter.progchap;
  var progep = request.parameter.progep;
  var sessionid = request.parameter.sessionID;
  var rank = request.parameter.rank;

  var trgt = sheet.getRange(rank,11).getValue();
  var trgt2 = sheet.getRange(rank, 3).getValue();
  var trgt3 = sheet.getRange(rank,6).getValue();
  if( sessionid == trgt && trgt2 == username && trgt3 == progpos){
    if(progchap == "1"){
      c_ep = parseFloat(progep) + 3 //locates current episode
      c_epVal = sheet1.getRange(rank,c_ep).getValue(); // current episode value

      if (c_epVal != 0){ //has recorded data 

        //update Attempt
        var c_epAtmpt = sheet1.getRange(rank,).getValue(); //currentAttempt
        var c_epAtmptN = parseFloat(c_epAtmpt) + 1;
        sheet1.getRange(rank,c_ep).setValue(c_epAtmptN) //adds 1 to Attempt
        var c_epT = sheet1.getRange(rank,2).getValue();

        var msg = c_epVal + "but on its " + c_epAtmptN + " attmept! Plus time at " + c_epT;

        msg = JSON.stringify({
          "msg": msg
        });

        return ContentService.createTextOutput("consoleme(" + msg + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);

      } else { // no recorded data yet
        
        sheet1.getRange(rank,3).setValue(1)// resets Attempt to 1
        sheet1.getRange(rank,2).setValue(); //resets currentTime to 0
       
        var msg = c_epVal + " first attempt!";

        msg = JSON.stringify({
          "msg": msg
        });

        return ContentService.createTextOutput("consoleme(" + msg + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
      } 
    } else if (progchap == "2"){
      var msg = "Success retrieve2"

      msg = JSON.stringify({
        "msg": msg
      });

      return ContentService.createTextOutput("consoleme(" + msg + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else if (progchap == "3"){
      var msg = "Success retrieve3"

      msg = JSON.stringify({
        "msg": msg
      });

      return ContentService.createTextOutput("consoleme(" + msg + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      var msg = "Success retrieveX"

      msg = JSON.stringify({
        "msg": msg
      });

      return ContentService.createTextOutput("consoleme(" + msg + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  } else if( sessionid != trgt){ //invalid session
    var user_state = "invalid_session"
  
    user_state = JSON.stringify({
      "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else if (trgt3 != progpos){ //invalid progpos //redirect to correct progpos
    var msg = "Progpos didn't match!"

    msg = JSON.stringify({
      "msg": msg
    });

    return ContentService.createTextOutput("consoleme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else { //missing username

    var user_state = "missing"
  
    user_state = JSON.stringify({
      "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);

  }   
}


function retrieve_prog1111111111(request){
 
  var username = request.parameter.username;
  var progpos = request.parameter.progpos;
  var progchap = request.parameter.progchap;
  var progep = request.parameter.progep;
  var sessionid = request.parameter.sessionID;
  var rank = request.parameter.rank;

  var trgt = sheet.getRange(rank,11).getValue();
  var trgt2 = sheet.getRange(rank, 3).getValue();
  var trgt3 = sheet.getRange(rank,6).getValue();
  if( sessionid == trgt && trgt2 == username && trgt3 == progpos){

    var msg = "Success retrieve"

    msg = JSON.stringify({
      "msg": msg
    });

    return ContentService.createTextOutput("consoleme(" + msg + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);





  } else if( sessionid != trgt){ //invalid session
    var user_state = "invalid_session"
  
    user_state = JSON.stringify({
      "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else if (trgt3 != progpos){ //invalid progpos //redirect to correct progpos
    var msg = "Progpos didn't match!"

    msg = JSON.stringify({
      "msg": msg
    });

    return ContentService.createTextOutput("consoleme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else { //missing username

    var user_state = "missing"
  
    user_state = JSON.stringify({
      "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);

  }   
}


function retrieve_prog12312312(request){
 
  var username = request.parameter.username;
  var progpos = request.parameter.progpos;
  //var progchap = request.parameter.progchap;
  //var progep = request.parameter.progep;
  var sessionid = request.parameter.sessionID;
  var rank = request.parameter.rank;

  var flag = 1;
  var lr= sheet.getLastRow();
  for(var i=1;i<=lr;i++){
    var trgt = sheet.getRange(i,11).getValue();
    if (trgt == sessionid){
      flag = 0;
      var trgt2 = sheet.getRange(i, 3).getValue();
      var trgt3 = sheet.getRange(i,6).getValue();
      if( trgt2 == username && trgt3 == progpos){

        var msg = "Success retrieve"

        msg = JSON.stringify({
          "msg": msg
        });

        return ContentService.createTextOutput("consoleme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);





        
      } else if (trgt3 != progpos){ //invalid progpos
        var msg = "Progpos didn't match!"

        msg = JSON.stringify({
          "msg": msg
        });

        return ContentService.createTextOutput("consoleme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
      } else { //missing username

        var user_state = "missing"
      
        user_state = JSON.stringify({
          "state": user_state
        });

        return ContentService.createTextOutput("userState(" + user_state + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);

      }
    }     
  }

  if(flag == 1){
      var user_state = "invalid_session"
      
      user_state = JSON.stringify({
        "state": user_state
      });

      var msg = sessionid
      
      msg = JSON.stringify({
        "msg": msg
      });

      var msg2 = sheet.getRange(3,11).getValue();
      
      msg2 = JSON.stringify({
        "msg": msg2
      });

      return ContentService.createTextOutput("consoleme(" + msg2 + ");consoleme(" + msg + ");userState(" + user_state + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
    
    }  
}

function retrieve_progsdfasfdv(request){ //unused
 
  var username = request.parameter.username;
  var progpos = request.parameter.progpos;
  var sessionid = request.parameter.progpos;

  
  if (progpos == 1){
    var flag = 1;
    var lc= sheet1.getLastColumn();
    var lr= sheet1.getLastRow();
    for(var i=1;i<=lr;i++){
      var trgt = sheet1.getRange(i, 1).getValue();
      if(username == trgt){
        flag = 0
        var trgtrow = sheet1.getRange(i, 1, 1, lc).getValues();

        trgtrow = JSON.stringify({
        "row": trgtrow
        });

        return ContentService.createTextOutput("recieveProgress(" + trgtrow + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
    }
    if(flag == 1){
      var msg = "Progress for " + username + ", in progpos " + progpos + " is missing!";

      msg = JSON.stringify({
      "msg": msg
      });

      return ContentService.createTextOutput("alertme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  } else if (progpos == 2){
    var flag = 1;
    var lc= sheet2.getLastColumn();
    var lr= sheet2.getLastRow();
    for(var i=1;i<=lr;i++){
      var trgt = sheet2.getRange(i, 1).getValue();
      if(username == trgt){
        flag = 0
        var trgtrow = sheet2.getRange(i, 1, 1, lc).getValues();

        trgtrow = JSON.stringify({
        "row": trgtrow
        });

        return ContentService.createTextOutput("recieveProgress(" + trgtrow + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
    }
    if(flag == 1){
      var msg = "Progress for " + username + ", in progpos " + progpos + " is missing!";

      msg = JSON.stringify({
      "msg": msg
      });

      return ContentService.createTextOutput("alertme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  } else if (progpos == 3){
    var flag = 1;
    var lc= sheet3.getLastColumn();
    var lr= sheet3.getLastRow();
    for(var i=1;i<=lr;i++){
      var trgt = sheet3.getRange(i, 1).getValue();
      if(username == trgt){
        flag = 0
        var trgtrow = sheet3.getRange(i, 1, 1, lc).getValues();

        trgtrow = JSON.stringify({
        "row": trgtrow
        });

        return ContentService.createTextOutput("recieveProgress(" + trgtrow + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
    }
    if(flag == 1){
      var msg = "Progress for " + username + ", in progpos " + progpos + " is missing!";

      msg = JSON.stringify({
      "msg": msg
      });

      return ContentService.createTextOutput("alertme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  } else {
    var flag = 1;
    var lc= sheet4.getLastColumn();
    var lr= sheet4.getLastRow();
    for(var i=1;i<=lr;i++){
      var trgt = sheet4.getRange(i, 1).getValue();
      if(username == trgt){
        flag = 0
        var trgtrow = sheet4.getRange(i, 1, 1, lc).getValues();

        trgtrow = JSON.stringify({
        "row": trgtrow
        });

        return ContentService.createTextOutput("retrieveProgress(" + trgtrow + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
    }
    if(flag == 1){
      var msg = "Progress for " + username + ", in progpos " + progpos + " is missing!";

      msg = JSON.stringify({
      "msg": msg
      });

      return ContentService.createTextOutput("alertme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  }  
}





function update_prog(request){ //unused
  var username = request.parameter.username;
  var progpos = request.parameter.progpos;
  var progpos2 = request.parameter.progpos2;
  var n_prog = request.parameter.prog;

  var flag = 1;
  var lr= sheet.getLastRow();
  for(var i=1;i<=lr;i++){
    var trgt = sheet.getRange(i, 3).getValue();
    if(username == trgt){
      flag = 0
      var d_progpos = sheet.getRange(i,6).getValue();
      var u_progpos = progpos + "." + progpos2;
      if (d_progpos == u_progpos){
        if (progpos == 1){
          flag = 1
          var lr= sheet1.getLastRow();
          for(var i=1;i<=lr;i++){
            var trgt = sheet1.getRange(i, 1).getValue();
            if(username == trgt){
              flag = 0;
              //target the right chapter
              sheet1.getRange(i,progpos2).setValue(n_prog);

              var msg = "Progress successfully updated";
              msg = JSON.stringify({
                "msg": msg
              });

              return ContentService.createTextOutput("consoleme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
            }
          }
          if (flag == 1){
            var msg = "Username, " + username + ", was missing from our database in Sheet" + progpos;
            msg = JSON.stringify({
               "msg": msg
            });

            return ContentService.createTextOutput("consoleme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
          }
        } else if (progpos == 2){
          flag = 1;
          var lr= sheet2.getLastRow();
          for(var i=1;i<=lr;i++){
            var trgt = sheet2.getRange(i, 1).getValue();
            if(username == trgt){
              flag = 0;
              //target the right chapter
              sheet2.getRange(i,progpos2).setValue(n_prog);

              var msg = "Progress successfully updated";
              msg = JSON.stringify({
                "msg": msg
              });

              return ContentService.createTextOutput("consoleme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
            }
          }
          if (flag == 1){
            var msg = "Username, " + username + ", was missing from our database in Sheet" + progpos;
            msg = JSON.stringify({
               "msg": msg
            });

            return ContentService.createTextOutput("consoleme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
          }
        } else if (progpos == 3){ 
          flag = 1;
          var lr= sheet3.getLastRow();
          for(var i=1;i<=lr;i++){
            var trgt = sheet3.getRange(i, 1).getValue();
            if(username == trgt){
              flag = 0;
              //target the right chapter
              sheet3.getRange(i,progpos2).setValue(n_prog);

              var msg = "Progress successfully updated";
              msg = JSON.stringify({
                "msg": msg
              });

              return ContentService.createTextOutput("consoleme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
            }
          }
          if (flag == 1){
            var msg = "Username, " + username + ", was missing from our database in Sheet" + progpos;
            msg = JSON.stringify({
               "msg": msg
            });

            return ContentService.createTextOutput("consoleme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
          }
        } else { 
          flag = 1;
          var lr= sheet4.getLastRow();
          for(var i=1;i<=lr;i++){
            var trgt = sheet4.getRange(i, 1).getValue();
            if(username == trgt){
                flag = 0;
              //target the right chapter
              sheet4.getRange(i,progpos2).setValue(n_prog);

              var msg = "Progress successfully updated";
              msg = JSON.stringify({
                "msg": msg
              });

              return ContentService.createTextOutput("consoleme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
            }
          }
          if (flag == 1){
            var msg = "Username, " + username + ", was missing from our database in Sheet" + progpos;
            msg = JSON.stringify({
               "msg": msg
            });

            return ContentService.createTextOutput("consoleme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
          }
        }
      } else {
        var msg = "Progpos didn't match with our database";
        msg = JSON.stringify({
          "msg": msg
        });

        return ContentService.createTextOutput("consoleme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      

      trgtrow = JSON.stringify({
      "row": trgtrow
      });

      return ContentService.createTextOutput("recieveProgress(" + trgtrow + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  }

  if(flag == 1){
    var msg = "Username, " + username + ", was missing from our database";
    msg = JSON.stringify({
      "msg": msg
      });

    return ContentService.createTextOutput("alertme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

}

function verify_prog(request){ //unused
 
  var username = request.parameter.username;
  var progpos = request.parameter.progpos;
  
  if (progpos == 1){
    var flag = 1;
    var lc= sheet1.getLastColumn();
    var lr= sheet1.getLastRow();
    for(var i=1;i<=lr;i++){
      var trgt = sheet1.getRange(i, 1).getValue();
      if(username == trgt){
        flag = 0
        var trgtrow = sheet1.getRange(i, 1, 1, lc).getValues();

        trgtrow = JSON.stringify({
        "row": trgtrow
        });

        return ContentService.createTextOutput("verifyProgress(" + trgtrow + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
    }
    if(flag == 1){
      var msg = "Progress for " + username + ", in progpos " + progpos + " is missing!";

      msg = JSON.stringify({
      "msg": msg
      });

      return ContentService.createTextOutput("alertme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  } else if (progpos == 2){
    var flag = 1;
    var lc= sheet2.getLastColumn();
    var lr= sheet2.getLastRow();
    for(var i=1;i<=lr;i++){
      var trgt = sheet2.getRange(i, 1).getValue();
      if(username == trgt){
        flag = 0
        var trgtrow = sheet2.getRange(i, 1, 1, lc).getValues();

        trgtrow = JSON.stringify({
        "row": trgtrow
        });

        return ContentService.createTextOutput("verifyProgress(" + trgtrow + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
    }
    if(flag == 1){
      var msg = "Progress for " + username + ", in progpos " + progpos + " is missing!";

      msg = JSON.stringify({
      "msg": msg
      });

      return ContentService.createTextOutput("alertme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  } else if (progpos == 3){
    var flag = 1;
    var lc= sheet3.getLastColumn();
    var lr= sheet3.getLastRow();
    for(var i=1;i<=lr;i++){
      var trgt = sheet3.getRange(i, 1).getValue();
      if(username == trgt){
        flag = 0
        var trgtrow = sheet3.getRange(i, 1, 1, lc).getValues();

        trgtrow = JSON.stringify({
        "row": trgtrow
        });

        return ContentService.createTextOutput("verifyProgress(" + trgtrow + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
    }
    if(flag == 1){
      var msg = "Progress for " + username + ", in progpos " + progpos + " is missing!";

      msg = JSON.stringify({
      "msg": msg
      });

      return ContentService.createTextOutput("alertme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  } else {
    var flag = 1;
    var lc= sheet4.getLastColumn();
    var lr= sheet4.getLastRow();
    for(var i=1;i<=lr;i++){
      var trgt = sheet4.getRange(i, 1).getValue();
      if(username == trgt){
        flag = 0
        var trgtrow = sheet4.getRange(i, 1, 1, lc).getValues();

        trgtrow = JSON.stringify({
        "row": trgtrow
        });

        return ContentService.createTextOutput("verifyProgress(" + trgtrow + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
    }
    if(flag == 1){
      var msg = "Progress for " + username + ", in progpos " + progpos + " is missing!";

      msg = JSON.stringify({
      "msg": msg
      });

      return ContentService.createTextOutput("alertme(" + msg + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  }  
}

function verify_progpos(request){ //unused
  var username = request.parameter.username;
  
  var flag=1;
  var lr= sheet.getLastRow();
  for(var i=1;i<=lr;i++){
    var trgt = sheet.getRange(i, 3).getValue();
    
    //if username matched
    if(username == trgt){
      flag=0;

        var progpos = sheet.getRange(i,6).getValue();

        progpos = JSON.stringify({
          "progpos": progpos
        });

        return ContentService.createTextOutput("verifyProgressPos(" + progpos + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  }
  
  //add new row with recieved parameter from client
  if(flag==1){
      var msg = "Progpos for " + username + " wasn't found!";

      //convert var to be readable by javascript
      msg = JSON.stringify({
        "msg": msg
      });

      return ContentService.createTextOutput("alertme(" + msg + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function request_astronomy(){
  var today = new Date();
  var date = today.getFullYear()+'||'+(today.getMonth()+1)+'||'+today.getDate();
  var last_update = sheet6.getRange(4,4).getValue();

  if(date == last_update){ //date matched
    lock.tryLock(5000);
    if(lock.hasLock()){ //if lock is created

      SpreadsheetApp.flush();

      var limit = sheet6.getRange(4,3).getValue();
      var current_val = sheet6.getRange(4,2).getValue();

      if(current_val != limit){ //if limit not reached
        var new_val = current_val + 1;

        sheet6.getRange(4,2).setValue(new_val);

        var apiKey = "2935e8594f074424a091bb75d78b0f91"

        var data = JSON.stringify({
          "key": apiKey, "limit": limit, "c_val": current_val, "n_val": new_val
        });
        
        SpreadsheetApp.flush();
        lock.releaseLock();

        return ContentService.createTextOutput("requestAstronomy(" + data + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
      } else { // limit exceeded
        var calladmin_quota = MailApp.getRemainingDailyQuota();
        var calladmin_calls = sheet6.getRange(5,2).getValue();
        var last_calladmin = sheet6.getRange(5,4).getValue();
        if (date == last_calladmin){ //if date is the same
          if (calladmin_calls != calladmin_quota){
            MailApp.sendEmail({
              to: "franklinespiritu@gmail.com",
              subject: "Daily IPLookUp Limit",
              htmlBody: "<p>Check the date, check for bot attacks or surge of new users!</p>",
            })
            var new_val = parseInt(calladmin_calls) + 1;
            sheet6.getRange(5,2).setValue(new_val);

            var msg = "!calladmin has been initiated"
            var msg2 = "Server is not responding..."
            msg = JSON.stringify({
              "msg": msg
            });
            msg2 = JSON.stringify({
              "msg": msg2
            });

            SpreadsheetApp.flush();
            lock.releaseLock();

            return ContentService.createTextOutput(";consoleme(" + msg + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
          } else {
            var msg = "!calladmin has already been initiated too many times"
            var msg2 = "Server is not responding..."
            msg = JSON.stringify({
              "msg": msg
            });

            msg2 = JSON.stringify({
              "msg": msg2
            });

            SpreadsheetApp.flush();
            lock.releaseLock();

            return ContentService.createTextOutput("consoleme(" + msg + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
          }
        } else { //if date is different
          sheet6.getRange(5,4).setValue(date);
          sheet6.getRange(5,2).setValue("1");
          MailApp.sendEmail({
            to: "franklinespiritu@gmail.com",
            subject: "Daily IPLookUp Limit",
            htmlBody: "<p>Check the date, check for bot attacks or surge of new users!</p>",
          })
          
          var msg = "!calladmin has been initiated"
          var msg2 = "Server is not responding..."
          msg = JSON.stringify({
            "msg": msg
          });

          msg2 = JSON.stringify({
            "msg": msg2
          });

          SpreadsheetApp.flush();
          lock.releaseLock();

          return ContentService.createTextOutput("consoleme(" + msg + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
        }
      }

    } else { //if lock failed to generate
      var user_state = "sv_busy"

      user_state = JSON.stringify({
      "state": user_state
      });

      return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat);").setMimeType(ContentService.MimeType.JAVASCRIPT); 
    }
  } else {// date didn't match
    sheet6.getRange(4,4).setValue(date); // update date
    sheet6.getRange(4,2).setValue("1");
    var apiKey = "2935e8594f074424a091bb75d78b0f91"
    apiKey = JSON.stringify({
      "key": apiKey, "data": date, "last_update": last_update
    });
    return ContentService.createTextOutput("requestAstronomy(" + apiKey + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function verify_altsignin(request){
  var userid = request.parameter.userID;
  
  var flag=1;
  var lr= sheet.getLastRow();
  for(var i=1;i<=lr;i++){
    var trgt = sheet.getRange(i, 10).getValue();
    
    //if userid matched
    if(userid == trgt){
      flag=0;

      //Update Last Active
      var d = new Date();
      var currentTime = d.toLocaleString();
      sheet.getRange(i,2).setValue(currentTime)

      //Update SessionID
      var c_sessionid = request.parameter.sessionID;
      sheet.getRange(i,11).setValue(c_sessionid);

      var user_progpos = sheet.getRange(i,6).getValue();
      var c_country = sheet.getRange(i,7).getValue();

      var user_state = "verified";
      var username = sheet.getRange(i, 3).getValue()
      flag = 1;
      var lr= sheet7.getLastRow();
      for(var i=1;i<=lr;i++){

        var trgt = sheet7.getRange(i,1).getValue();

        //if username match, then return the ff:
        if(username == trgt){
          flag = 0;
          var c_sunrise = sheet7.getRange(i,2).getValue();
          var c_sunset = sheet7.getRange(i,3).getValue();
          var c_solar_noon = sheet7.getRange(i,4).getValue();
          var c_moonrise = sheet7.getRange(i,5).getValue();
          var c_moonset = sheet7.getRange(i,6).getValue();
          var c_flag = sheet7.getRange(i,7).getValue();
          var c_userid = sheet.getRange(i,10).getValue();
          var c_rank = i;

          user_state = JSON.stringify({
            "state": user_state
          });

          data = JSON.stringify({
            "c_user": username, "c_progpos":user_progpos, "c_country":c_country, "c_sunrise":c_sunrise, "c_sunset":c_sunset, "c_solar_noon":c_solar_noon, "c_moonrise":c_moonrise, "c_moonset": c_moonset, "c_flag":c_flag, "c_userid":c_userid, "c_sessionid":c_sessionid, "c_rank":c_rank
          });

          return ContentService.createTextOutput("userState(" + user_state + "," + data + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
        }
      }
    }
  }
  //if id didn't match
  if(flag==1){
    var username = request.parameter.username;

    userid = JSON.stringify({
      "id": userid
    });

    username = JSON.stringify({
      "name": username
    });

    return ContentService.createTextOutput("registerAltSignIn(" + userid + "," + username + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function link_altsignin(request){
  var userid  = request.parameter.userID;
  var username = request.parameter.username;
  var sessionid = request.parameter.sessionID;
  var rank = request.parameter.rank;

  var trgt = sheet.getRange(rank, 11).getValue();
  var trgt2 = sheet.getRange(rank,3).getValue();
  var trgt3 = sheet.getRange(rank,10).getValue();
  if(sessionid == trgt && username == trgt2 && trgt3 == "none"){ //if all matched


    //check if userid exist elsewhere 
    var flag=1;
    var lr= sheet.getLastRow();
    for(var i=1;i<=lr;i++){
      var trgt4 = sheet.getRange(i, 10).getValue();

      if (userid == trgt4){ //if userid is in use
        flag = 0
        var user_state = "linked_inuse"

        user_state = JSON.stringify({
            "state": user_state
        });

        return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
    }

    if(flag == 1){ //if userid free
      sheet.getRange(rank,10).setValue(userid)

      //Update last Active
      var d = new Date();
      var currentTime = d.toLocaleString();
      sheet.getRange(rank,2).setValue(currentTime)

      var user_state = "linked"

      user_state = JSON.stringify({
          "state": user_state
      });

      data = JSON.stringify({
          "c_userid": userid
      });

      return ContentService.createTextOutput("userState(" + user_state + "," + data + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  } else if(sessionid != trgt){ //invalid sessionid
    var user_state = "invalid_session" 
        
    user_state = JSON.stringify({
        "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else if (username != trgt2){ // invalid username
    var user_state = "missing" 
    
    user_state = JSON.stringify({
        "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else { // invalid userid
    var user_state = "linked_already" 
    
    user_state = JSON.stringify({
        "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function unlink_altsignin(request){
  var username = request.parameter.username;
  var sessionid = request.parameter.sessionID;
  var rank = request.parameter.rank;

  var trgt = sheet.getRange(rank,11).getValue();
  var trgt2 = sheet.getRange(rank,3).getValue();
  var trgt3 = sheet.getRange(rank,10).getValue();
  if(sessionid == trgt && username == trgt2 && trgt3 != "none"){ //if all matched
    var user_state = "unlinked"

    userid = "none"
    sheet.getRange(rank,10).setValue(userid)

    //Update last Active
    var d = new Date();
    var currentTime = d.toLocaleString();
    sheet.getRange(rank,2).setValue(currentTime)

    user_state = JSON.stringify({
        "state": user_state
    });

    data = JSON.stringify({
        "c_userid": userid
    });

      return ContentService.createTextOutput("userState(" + user_state + "," + data + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else if( sessionid != trgt){ // invalid sessionid
    var user_state = "invalid_session" 
        
    user_state = JSON.stringify({
        "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else if (username != trgt2){ // invalid username
    var user_state = "missing" 
    
    user_state = JSON.stringify({
        "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else { // invalid userid
    var user_state = "unlinked_already" 
    
    user_state = JSON.stringify({
        "state": user_state
    });

    return ContentService.createTextOutput("userState(" + user_state + ");clearTimeout(sv_stat)").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function retrieve_prog12312313131234(request){
 
  var username = request.parameter.username;
  var progpos = request.parameter.progpos;
  
  var flag=1;
  var lr= sheet1.getLastRow();
  for(var i=1;i<=lr;i++){
    var trgt = sheet1.getRange(i, 1).getValue();
    
    //if username matched on the Progress Sheet
    if(username == trgt){
      flag=0;
      var msg = "user Progress found!";

      //update last Active
      var d = new Date();
      var currentTime = d.toLocaleString();
      sheet.getRange(i,2).setValue(currentTime)
      
      var progress = getmatchedRow(i, sheet1);

      //convert var to be readable by javascript
      msg = JSON.stringify({
          "msg": msg
      });

      //convert var to be readable by javascript
      progress = JSON.stringify({
          "progress": progress
      });

      return ContentService.createTextOutput("consoleme(" + msg + ");userProgress(" + progress + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
      
    }
  }
  
  //add new row with recieved parameter from client
  if(flag==1){
    var msg = "Error in retrieve_prog(), username doesn't exist! ";
    //convert var to be readable by javascript
    msg = JSON.stringify({
      "msg": msg
    });
    return ContentService.createTextOutput("consoleme(" + msg + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}







function getmatchedRow(rowloc, trgtsheet) {

  var lastcolumn = trgtsheet.getLastColumn();
  var targetrow = trgtsheet.getRange(rowloc, 1, 1, lastcolumn).getValues();

  return targetrow;
}


//Triggers
function clearMe(){
  sheet6.getRange(8,1).setValue(0);
  console.log("HI")
  //var aaa = sheet6.getRange(8,1).getValue()
  //console.log(cat)
  //console.log(aaa)
}

//resets CRUD count to 0 after 100secs cuz 500request/100secs only!
function clearCRUDLimit(){ 
  console.log("Old val " + sheet6.getRange(6,2).getValue())
  Utilities.sleep(40000) //delays for 40 secs
  sheet6.getRange(6,2).setValue(0)
  console.log("New val " + sheet6.getRange(6,2).getValue())
}
//resets GeoLoc count to 0 after 24hrs cuz 1000request/day only!
function clearGeoLocLimit(){
  console.log("Old val " + sheet6.getRange(4,2).getValue())
  sheet6.getRange(4,2).setValue(0)
  console.log("New val " + sheet6.getRange(4,2).getValue())
}
function antiIdle(){
   
}
function exeCount(){
  console.log("Old val " + sheet6.getRange(6,2).getValue())

  //count Script execution
  var crudval = sheet6.getRange(6,2).getValue() + 1
  sheet6.getRange(6,2).setValue(crudval)


  console.log("New val " + sheet6.getRange(6,2).getValue())
}
function testDdos(){
  console.log(new Date)
  lock.tryLock(15000);
  console.log(new Date)
  if(lock.hasLock()){

    SpreadsheetApp.flush();

    console.log("Old val " + sheet6.getRange(6,2).getValue())
    var a = sheet6.getRange(6,2).getValue()

    sheet6.getRange(6,2).setValue(a + 1)
    console.log("New val " + sheet6.getRange(6,2).getValue())

    lock.releaseLock();

    var msg = "done"

    msg = JSON.stringify({
        "msg": msg
    });

      return ContentService.createTextOutput("consoleme(" + msg + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else{
    console.log("inused")

     var msg = "invalid"

    msg = JSON.stringify({
        "msg": msg
    });

    return ContentService.createTextOutput("consoleme(" + msg + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function countStandby(){
  var total = 0;
  lr = sheet.getLastRow();
  console.log(lr);
  for(var i=1;i<=lr;i++){
    trgt = sheet.getRange(i,12).getValue();
    if (trgt == "standby"){
      total = total + 1
    }
  }
  console.log(total)
}
function countOnline(){
  var total = 0;
  lr = sheet.getLastRow();
  console.log(lr);
  for(var i=1;i<=lr;i++){
    trgt = sheet.getRange(i,12).getValue();
    if (trgt == "online"){
      total = total + 1
    }
  }
  console.log(total)
}




