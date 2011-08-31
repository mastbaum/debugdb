function togglePane(paneId) {
    var vis = true;
    var status = document.getElementById(paneId+'_0').style.display;

    if(status.length == 6)
       vis = 1;
    if(status.length == 4)
       vis = 0;

    if(vis == false) {
        document.getElementById(paneId+'_toggle').style.color='black'
        for(var i=0; i<16; i++) {
            document.getElementById(paneId+'_'+i).style.display='inline'
            document.getElementById(paneId+'_'+i).style.height='100%'
        }
    }
    if(vis == true) {
        document.getElementById(paneId+'_toggle').style.color='#ccc'
        for(var i=0; i<16; i++) {
            document.getElementById(paneId+'_'+i).style.display='none'
            document.getElementById(paneId+'_'+i).style.height='100%'
        }
    }
}

function setCookie(elementId) {
    var c_name = elementId;
    var exdays = 100;
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var value = document.getElementById(elementId).checked;
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires = " + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

function setCheckboxes() {
    var i,x,y,ARRcookies = document.cookie.split(";");
    for (i=0; i<ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        if (y == "true")
            y = true;
        else
            y = false;
        x = x.replace(/^\s+|\s+$/g,"");
        if (x == 'penn')
            document.getElementById('penn').checked = y;
        if (x == 'underground')
            document.getElementById('underground').checked = y;
        if (x == 'surface')
            document.getElementById('surface').checked = y;
    }
}

