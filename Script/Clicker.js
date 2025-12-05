var click=0;
var str=""
var txt="Le but de la démarche NIRD est de promouvoir des postes Linux auprès des enseignants et des établissements scolaires, pour ce faire ils agissent en suivant un chemin progressif de 3 jalons: L’inclusif, Le responsable et la Durabilité. En tout premier il cherche des personnes pour mobiliser leurs système, cela peut être auto-désigné ou alors un enseignant volontaire se propose. Ensuite on prend part à une information sur la présentation des enjeux de ces systèmes, après cela nous les mettons en relation avec plusieurs autres enseignants. en continuant  il envoie un support pédagogique et technique pour pouvoir continuer la suite des opérations. Dans une seconde partie ils vont faire une “expérimentation” en installant des postes de travail neuf ou reconditionnés, il proposent aussi leurs aide au personne les plus démunie dans les collège et lycée. il font aussi des clubs d’informatique pour aider à ce reconditionnement de ces ordinateurs sous linux, il offre aussi du matériel au corps pédagogique. Un suivi est aussi mis en place pour permettre un suivi correct et efficace, Le but est d’avoir une première expérience concrète. En finalité le but est d'intégrer progressivement des poste dans le parc informatique des établissement et de promouvoir cette expérience auprès de la communauté éducative, tout cela en utilisant du matériel c neuf  et reconditionné pour le faire durer dans le temps."
var total=0
let interval;

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
    str=makeBold(str,wordsToBold)
    text.innerHTML = `<span style="font-size: 30px;">${str}</span>`;
}

var wordsToBold=["responsable"];

function makeBold(input, wordsToBold) {
    return input.replace(new RegExp('(\\b)(' + wordsToBold.join('|') + ')(\\b)','ig'), '$1<b>$2</b>$3');
}

function startClicking() {
    interval = setInterval(() => {
        clicker(); // your existing function
    }, 100); // adjust speed here (100 ms)
}

function stopClicking() {
    clearInterval(interval);
}
