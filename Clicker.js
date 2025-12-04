var click=0;
var str=""
var txt="azerft"
var total=0

var text = document.getElementById("str");
var c = document.getElementById("total")

function clicker(){
    click+=1;
    total+=1;
    if(click==txt.length+1){
        reset()
    }else{
        showxfirstchar()
    }
    c.innerHTML = total;
}
function reset(){
    click=0;
    showxfirstchar();
}

function showxfirstchar(){
    str=txt.substring(0, click)
    text.innerHTML = str;
}