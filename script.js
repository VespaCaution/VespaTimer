/*==========================================================
    VespaTimer v1.0
    Script principal
==========================================================*/

"use strict";

/*==========================================================
    CONFIGURATION
==========================================================*/

const HORNET_COUNT = 5;
const MAX_FLIGHTS = 5;

/*==========================================================
    ETAT GLOBAL
==========================================================*/

const hornets = [];

let surveyFinished = false;

/*==========================================================
    ELEMENTS HTML
==========================================================*/

const hornetContainer =
    document.getElementById("hornetContainer");

const hornetTemplate =
    document.getElementById("hornetTemplate");

const averageContainer =
    document.getElementById("averageContainer");

const runningTimers =
    document.getElementById("runningTimers");

const runningBanner =
    document.getElementById("runningBanner");

const progressFill =
    document.getElementById("globalProgressFill");

const progressText =
    document.getElementById("globalProgressText");

/*==========================================================
    DATE / HEURE
==========================================================*/

function initialiseDateTime(){

    const now = new Date();

    document.getElementById("date").value =
        now.toLocaleDateString("fr-CH");

    document.getElementById("time").value =
        now.toLocaleTimeString("fr-CH",{

            hour:"2-digit",

            minute:"2-digit"

        });

}

initialiseDateTime();

/*==========================================================
    FORMATAGE TEMPS
==========================================================*/

function formatTime(milliseconds){

    const minutes =
        Math.floor(milliseconds/60000);

    const seconds =
        Math.floor(
            (milliseconds%60000)/1000
        );

    const ms =
        Math.floor(milliseconds%1000);

    return (
        String(minutes).padStart(2,"0")
        + ":"
        + String(seconds).padStart(2,"0")
        + "."
        + String(ms).padStart(3,"0")
    );

}

/*==========================================================
    FORMAT MOYENNE
==========================================================*/

function average(array){

    if(array.length===0){

        return 0;

    }

    let total=0;

    for(const value of array){

        total+=value;

    }

    return total/array.length;

}/*==========================================================
    CREATION DES CARTES
==========================================================*/

function createHornet(id){

    const clone =
        hornetTemplate.content.cloneNode(true);

    const card =
        clone.querySelector(".hornet-card");

    const body =
        card.querySelector(".hornet-body");

    const header =
        card.querySelector(".hornet-header");

    const number =
        card.querySelector(".hornet-number");

    const title =
        card.querySelector(".hornet-name");

    const mark =
        card.querySelector(".marking");

    const bearing =
        card.querySelector(".bearing");

    const timer =
        card.querySelector(".timer-display");

    const status =
        card.querySelector(".status");

    const startButton =
        card.querySelector(".startButton");

    const stopButton =
        card.querySelector(".stopButton");

    const resetButton =
        card.querySelector(".resetButton");

    const averageText =
        card.querySelector(".averageTime");

    const flightList =
        card.querySelector(".flight-list");

    number.textContent =
        "🐝 FRELON " + id;

    title.textContent =
        "Sans nom";

    if(id!==1){

        body.classList.add("hidden");

    }

    const hornet={

        id,

        card,

        body,

        mark,

        bearing,

        timer,

        status,

        startButton,

        stopButton,

        resetButton,

        averageText,

        flightList,

        running:false,

        startTime:0,

        elapsed:0,

        interval:null,

        flights:[]

    };

    /*==============================
      Création des 5 vols
    ==============================*/

    for(let i=1;i<=MAX_FLIGHTS;i++){

        const row =
            document.createElement("div");

        row.className="flight-item";

        row.innerHTML=`

            <span class="flight-number">

                ${i}

            </span>

            <span class="flight-time">

                --

            </span>

            <button
                class="delete-flight">

                🗑️

            </button>

        `;

        hornet.flightList
            .appendChild(row);

    }

    /*==============================
      Nom du marquage
    ==============================*/

    mark.addEventListener("input",()=>{

        if(mark.value.trim()===""){

            title.textContent="Sans nom";

        }

        else{

            title.textContent=
                mark.value;

        }

        updateAveragePanel();

        updateRunningBanner();

    });

    /*==============================
      Accordéon
    ==============================*/

    header.addEventListener("click",()=>{

        document

            .querySelectorAll(".hornet-body")

            .forEach(element=>{

                element.classList

                    .add("hidden");

            });

        body.classList.remove("hidden");

    });

    hornetContainer
        .appendChild(card);

    hornets.push(hornet);

}

/*==========================================================
    CREATION DES 5 FRELONS
==========================================================*/

for(let i=1;i<=HORNET_COUNT;i++){

    createHornet(i);

}/*==========================================================
    CHRONOMETRES
==========================================================*/

function updateTimerDisplay(hornet){

    hornet.timer.textContent =
        formatTime(hornet.elapsed);

}

function updateStatus(hornet,state){

    hornet.status.className="status";

    switch(state){

        case "waiting":

            hornet.status.classList.add("waiting");
            hornet.status.textContent="⚪ En attente";
            break;

        case "running":

            hornet.status.classList.add("running");
            hornet.status.textContent="🟢 Chronométrage";
            break;

        case "finished":

            hornet.status.classList.add("finished");
            hornet.status.textContent="✅ 5 vols terminés";
            break;

    }

}

function startTimer(hornet){

    if(surveyFinished) return;

    if(hornet.running) return;

    if(hornet.flights.length>=MAX_FLIGHTS) return;

    hornet.running=true;

    hornet.startTime=
        performance.now()-hornet.elapsed;

    hornet.startButton.disabled=true;
    hornet.stopButton.disabled=false;

    updateStatus(hornet,"running");

    hornet.interval=setInterval(()=>{

        hornet.elapsed=
            performance.now()-hornet.startTime;

        updateTimerDisplay(hornet);

        updateRunningBanner();

    },10);

}

function stopTimer(hornet){

    if(!hornet.running){

        return;

    }

    clearInterval(hornet.interval);

    hornet.running=false;

    hornet.startButton.disabled=false;
    hornet.stopButton.disabled=true;

    saveFlight(hornet);

}

function resetTimer(hornet){

    if(hornet.running){

        clearInterval(hornet.interval);

        hornet.running=false;

    }

    hornet.elapsed=0;

    updateTimerDisplay(hornet);

    hornet.startButton.disabled=false;
    hornet.stopButton.disabled=true;

    if(hornet.flights.length>=MAX_FLIGHTS){

        updateStatus(hornet,"finished");

    }else{

        updateStatus(hornet,"waiting");

    }

    updateRunningBanner();

}

/*==========================================================
    EVENEMENTS
==========================================================*/

hornets.forEach(hornet=>{

    hornet.stopButton.disabled=true;

    hornet.startButton.addEventListener(

        "click",

        ()=>{

            startTimer(hornet);

        }

    );

    hornet.stopButton.addEventListener(

        "click",

        ()=>{

            stopTimer(hornet);

        }

    );

    hornet.resetButton.addEventListener(

        "click",

        ()=>{

            resetTimer(hornet);

        }

    );

    updateStatus(hornet,"waiting");

});/*==========================================================
    ENREGISTREMENT DES VOLS
==========================================================*/

function saveFlight(hornet){

    if(hornet.flights.length>=MAX_FLIGHTS){

        return;

    }

    const flightTime=Math.round(hornet.elapsed);

    hornet.flights.push(flightTime);

    hornet.elapsed=0;

    updateTimerDisplay(hornet);

    redrawFlightList(hornet);

    updateAverage(hornet);

    updateProgress();

    updateRunningBanner();

    if(hornet.flights.length>=MAX_FLIGHTS){

        hornet.startButton.disabled=true;

        hornet.stopButton.disabled=true;

        hornet.resetButton.disabled=true;

        updateStatus(hornet,"finished");

    }

    else{

        updateStatus(hornet,"waiting");

    }

}

/*==========================================================
    AFFICHAGE DES VOLS
==========================================================*/

function redrawFlightList(hornet){

    const rows=

        hornet.flightList.querySelectorAll(".flight-item");

    rows.forEach((row,index)=>{

        const time=

            row.querySelector(".flight-time");

        const button=

            row.querySelector(".delete-flight");

        if(index<hornet.flights.length){

            time.textContent=

                formatTime(hornet.flights[index]);

            button.disabled=false;

        }

        else{

            time.textContent="--";

            button.disabled=true;

        }

    });

}

/*==========================================================
    CALCUL DE LA MOYENNE
==========================================================*/

function updateAverage(hornet){

    if(hornet.flights.length===0){

        hornet.averageText.textContent="--";

        updateAveragePanel();

        return;

    }

    const avg=

        average(hornet.flights);

    hornet.averageText.textContent=

        formatTime(avg);

    updateAveragePanel();

}

/*==========================================================
    SUPPRESSION D'UN VOL
==========================================================*/

function deleteFlight(hornet,index){

    if(hornet.running){

        return;

    }

    if(index>=hornet.flights.length){

        return;

    }

    if(!confirm(

        "Supprimer ce temps ?"

    )){

        return;

    }

    hornet.flights.splice(index,1);

    redrawFlightList(hornet);

    updateAverage(hornet);

    updateProgress();

    hornet.startButton.disabled=false;

    hornet.resetButton.disabled=false;

    updateStatus(hornet,"waiting");

}

/*==========================================================
    EVENEMENTS DES POUBELLES
==========================================================*/

hornets.forEach(hornet=>{

    const buttons=

        hornet.flightList.querySelectorAll(

            ".delete-flight"

        );

    buttons.forEach((button,index)=>{

        button.disabled=true;

        button.addEventListener(

            "click",

            ()=>{

                deleteFlight(

                    hornet,

                    index

                );

            }

        );

    });

});/*==========================================================
    FENETRE A PROPOS
==========================================================*/

const aboutButton =
    document.getElementById("aboutButton");

const aboutModal =
    document.getElementById("aboutModal");

const closeAbout =
    document.getElementById("closeAbout");

aboutButton.addEventListener("click", () => {

    aboutModal.classList.remove("hidden");

});

closeAbout.addEventListener("click", () => {

    aboutModal.classList.add("hidden");

});

aboutModal.addEventListener("click", (event) => {

    if (event.target === aboutModal) {

        aboutModal.classList.add("hidden");

    }

});
/*==========================================================
    ARRET DE TOUS LES CHRONOMETRES
==========================================================*/

function stopAllTimers(){

    hornets.forEach(hornet=>{

        if(hornet.running){

            clearInterval(hornet.interval);

            hornet.running=false;

        }

    });

    updateRunningBanner();

}

/*==========================================================
    GENERATION DU RESUME
==========================================================*/

function generateSummary(){

    const container =
        document.getElementById("summaryContent");

    container.innerHTML = "";

    /* Informations générales */

    const info = document.createElement("div");

    info.className = "summary-card";

    info.innerHTML = `

        <h3>Informations</h3>

        <div class="summary-row">
            <strong>Lieu</strong>
            <span>${document.getElementById("location").value || "-"}</span>
        </div>

        <div class="summary-row">
            <strong>Prénom</strong>
            <span>${document.getElementById("firstname").value || "-"}</span>
        </div>

        <div class="summary-row">
            <strong>Nom</strong>
            <span>${document.getElementById("lastname").value || "-"}</span>
        </div>

        <div class="summary-row">
            <strong>Téléphone</strong>
            <span>${document.getElementById("phone").value || "-"}</span>
        </div>

        <div class="summary-row">
            <strong>Date</strong>
            <span>${document.getElementById("date").value}</span>
        </div>

        <div class="summary-row">
            <strong>Heure</strong>
            <span>${document.getElementById("time").value}</span>
        </div>

    `;

    container.appendChild(info);

    /* Résumé de chaque frelon */

    hornets.forEach(hornet=>{

        const card =
            document.createElement("div");

        card.className = "summary-card";

        const name =
            hornet.mark.value.trim() || ("Frelon " + hornet.id);

        let html = `

            <h3>${name}</h3>

            <div class="summary-row">
                <strong>Direction</strong>
                <span>${hornet.bearing.value || "--"}°</span>
            </div>

        `;

        for(let i=0;i<MAX_FLIGHTS;i++){

            html += `

                <div class="summary-row">

                    <span>Vol ${i+1}</span>

                    <span>${
                        hornet.flights[i] !== undefined
                        ? formatTime(hornet.flights[i])
                        : "--"
                    }</span>

                </div>

            `;

        }

        html += `

            <div class="summary-row">

                <strong>Temps moyen</strong>

                <strong>${hornet.averageText.textContent}</strong>

            </div>

        `;

        card.innerHTML = html;

        container.appendChild(card);

    });

    /* Remarques */

    const notes =
        document.createElement("div");

    notes.className = "summary-card";

    notes.innerHTML = `

        <h3>Remarques</h3>

        <p>${
            document.getElementById("notes").value || "-"
        }</p>

    `;

    container.appendChild(notes);

}/*==========================================================
    TERMINER LE RELEVE
==========================================================*/

const completeButton =
    document.getElementById("completeButton");

const summaryScreen =
    document.getElementById("summaryScreen");

completeButton.addEventListener("click",()=>{

completeButton.addEventListener("click",()=>{

    if(surveyFinished){

        return;

    }

    surveyFinished = true;

    stopAllTimers();

    hornets.forEach(hornet=>{

        hornet.startButton.disabled = true;
        hornet.stopButton.disabled = true;
        hornet.resetButton.disabled = true;

        hornet.mark.disabled = true;
        hornet.bearing.disabled = true;

    });

    document.getElementById("location").disabled = true;
    document.getElementById("firstname").disabled = true;
    document.getElementById("lastname").disabled = true;
    document.getElementById("phone").disabled = true;
    document.getElementById("notes").disabled = true;

    generateSummary();

    summaryScreen.classList.remove("hidden");

});
/*==========================================================
    INITIALISATION
==========================================================*/

function initialiseApplication(){

    hornets.forEach(hornet=>{

        updateTimerDisplay(hornet);

        redrawFlightList(hornet);

        updateAverage(hornet);

    });

    updateAveragePanel();

    updateProgress();

    updateRunningBanner();

}

initialiseApplication();

/*==========================================================
    RAFRAICHISSEMENT DE L'HEURE
==========================================================*/

setInterval(()=>{

    if(surveyFinished){

        return;

    }

    const now=new Date();

    document.getElementById("time").value=

        now.toLocaleTimeString("fr-CH",{

            hour:"2-digit",

            minute:"2-digit"

        });

},1000);/*==========================================================
    VALIDATION DES DIRECTIONS
==========================================================*/

hornets.forEach(hornet=>{

    hornet.bearing.addEventListener("input",()=>{

        let value=parseInt(hornet.bearing.value);

        if(isNaN(value)){

            hornet.bearing.value="";

            return;

        }

        if(value<0){

            value=0;

        }

        if(value>359){

            value=359;

        }

        hornet.bearing.value=value;

    });

});

/*==========================================================
    RACCOURCIS CLAVIER
==========================================================*/

document.addEventListener("keydown",(event)=>{

    if(event.key==="Escape"){

        aboutModal.classList.add("hidden");

    }

});

/*==========================================================
    SECURITE AVANT FERMETURE
==========================================================*/

window.addEventListener("beforeunload",(event)=>{

    if(surveyFinished){

        return;

    }

    const hasData =

        hornets.some(h=>h.flights.length>0) ||

        document.getElementById("location").value.trim()!=="" ||

        document.getElementById("notes").value.trim()!=="";

    if(hasData){

        event.preventDefault();

        event.returnValue="";

    }

});

/*==========================================================
    MESSAGE DE DEMARRAGE
==========================================================*/

console.log(

    "🐝 VespaTimer v1.0 chargé avec succès."

);

/*==========================================================
    FIN DU SCRIPT
==========================================================*/if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js");
    });
}
