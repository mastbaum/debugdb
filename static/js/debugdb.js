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

