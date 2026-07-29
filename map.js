/*==========================================================
    VespaTimer v1.1
    Carte des zones potentielles
==========================================================*/

"use strict";

/*==========================================================
    ELEMENTS HTML
==========================================================*/

const backButton =
    document.getElementById("backButton");

const gpsButton =
    document.getElementById("gpsButton");

const showMapButton =
    document.getElementById("showMapButton");

const latitudeInput =
    document.getElementById("latitude");

const longitudeInput =
    document.getElementById("longitude");

const infoPanel =
    document.getElementById("infoPanel");

const loadingOverlay =
    document.getElementById("loadingOverlay");

const errorMessage =
    document.getElementById("errorMessage");

const errorText =
    document.getElementById("errorText");

const closeError =
    document.getElementById("closeError");

/*==========================================================
    VARIABLES
==========================================================*/

let map;

let potMarker = null;

let hornetLayers = [];

/*==========================================================
    RETOUR
==========================================================*/

backButton.addEventListener("click",()=>{

    window.location.href="index.html";

});

/*==========================================================
    FONCTIONS
==========================================================*/

function showLoading(){

    loadingOverlay.classList.remove("hidden");

}

function hideLoading(){

    loadingOverlay.classList.add("hidden");

}

function showError(message){

    errorText.textContent = message;

    errorMessage.classList.remove("hidden");

}

closeError.addEventListener("click",()=>{

    errorMessage.classList.add("hidden");

});/*==========================================================
    GPS
==========================================================*/

gpsButton.addEventListener("click",()=>{

    if(!navigator.geolocation){

        showError(

            "La géolocalisation n'est pas disponible sur cet appareil."

        );

        return;

    }

    showLoading();

    navigator.geolocation.getCurrentPosition(

        position=>{

            latitudeInput.value=

                position.coords.latitude.toFixed(6);

            longitudeInput.value=

                position.coords.longitude.toFixed(6);

            hideLoading();

        },

        ()=>{

            hideLoading();

            showError(

                "Impossible d'obtenir votre position."

            );

        },

        {

            enableHighAccuracy:true,

            timeout:10000,

            maximumAge:0

        }

    );

});

/*==========================================================
    CARTE
==========================================================*/

createMap(latitude,longitude);

prepareHornets();

drawHornetZones(latitude,longitude);

    if(map){

        map.remove();

    }

    map=L.map("map").setView(

        [latitude,longitude],

        17

    );

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            maxZoom:22,

            attribution:

                "&copy; OpenStreetMap contributors"

        }

    ).addTo(map);

    if(potMarker){

        potMarker.remove();

    }

    potMarker=L.marker([

        latitude,

        longitude

    ]).addTo(map);

    potMarker.bindPopup(

        "📍 Pot-à-Mèche"

    );

}

/*==========================================================
    AFFICHER LA CARTE
==========================================================*/

showMapButton.addEventListener("click",()=>{

    const latitude=

        parseFloat(latitudeInput.value);

    const longitude=

        parseFloat(longitudeInput.value);

    if(

        isNaN(latitude) ||

        isNaN(longitude)

    ){

        showError(

            "Veuillez entrer une latitude et une longitude."

        );

        return;

    }

    createMap(

        latitude,

        longitude

    );

});/*==========================================================
    LECTURE DES DONNEES DE VESPATIMER
==========================================================*/

let hornets = [];

function loadHornetData(){

    const savedData = localStorage.getItem("vespatimerSurvey");

    if(!savedData){

        infoPanel.innerHTML = `
            <p><strong>Aucun relevé trouvé.</strong></p>
            <p>Retournez dans VespaTimer et ouvrez la carte depuis un relevé.</p>
        `;
        return false;
    }

    try{

        hornets = JSON.parse(savedData);

        return true;

    }

    catch(error){

        console.error(error);

        showError("Impossible de lire les données du relevé.");

        return false;

    }

}

/*==========================================================
    AFFICHAGE DES DONNEES
==========================================================*/

function updateInfoPanel(){

    if(hornets.length===0){

        return;

    }

    let html="<h3>Frelons enregistrés</h3>";

    hornets.forEach((hornet,index)=>{

        html+=`

            <div style="margin-bottom:14px;">

                <strong>${hornet.name || "Frelon "+(index+1)}</strong><br>

                Direction : ${hornet.direction}°<br>

                Temps moyen : ${hornet.average}

            </div>

        `;

    });

    infoPanel.innerHTML=html;

}

/*==========================================================
    INITIALISATION
==========================================================*/

if(loadHornetData()){

    updateInfoPanel();

}/*==========================================================
    CALCUL DES DISTANCES ESTIMEES
==========================================================*/

function calculateEstimatedDistance(averageSeconds){

    if(

        averageSeconds === null ||

        averageSeconds === undefined ||

        averageSeconds <= 30

    ){

        return null;

    }

    return (averageSeconds - 30) * 2.5;

}

/*==========================================================
    PREPARATION DES DONNEES
==========================================================*/

function prepareHornets(){

    hornets.forEach(hornet=>{

        hornet.distance = calculateEstimatedDistance(

            hornet.average

        );

    });

}

/*==========================================================
    AFFICHAGE DES DISTANCES
==========================================================*/

function updateInfoPanel(){

    if(hornets.length===0){

        return;

    }

    let html = "<h3>Frelons enregistrés</h3>";

    hornets.forEach((hornet,index)=>{

        html += `

        <div style="margin-bottom:16px;">

            <strong>${hornet.name || "Frelon "+(index+1)}</strong><br>

            Direction : ${hornet.direction}°<br>

            Temps moyen : ${hornet.average.toFixed(1)} s<br>

            Distance estimée : ${
                hornet.distance === null
                    ? "Non calculable"
                    : hornet.distance.toFixed(1) + " m"
            }

        </div>

        `;

    });

    infoPanel.innerHTML = html;

}

/*==========================================================
    INITIALISATION
==========================================================*/

if(loadHornetData()){

    prepareHornets();

    updateInfoPanel();

}/*==========================================================
    COULEURS DES FRELONS
==========================================================*/

const hornetColors = [

    "#D32F2F",
    "#1976D2",
    "#388E3C",
    "#F9A825",
    "#7B1FA2"

];

/*==========================================================
    DESSIN DES ZONES POTENTIELLES
==========================================================*/

function drawHornetZones(latitude, longitude){

    hornetLayers.forEach(layer=>{

        map.removeLayer(layer);

    });

    hornetLayers=[];

    hornets.forEach((hornet,index)=>{

        if(hornet.distance===null){

            return;

        }

        const angle=(hornet.direction-90)*(Math.PI/180);

        const endLat=

            latitude+

            ((hornet.distance*Math.sin(angle))/111320);

        const endLng=

            longitude+

            ((hornet.distance*Math.cos(angle))/

            (111320*Math.cos(latitude*Math.PI/180)));

        const line=L.polyline(

            [

                [latitude,longitude],

                [endLat,endLng]

            ],

            {

                color:hornetColors[index],

                weight:5

            }

        ).addTo(map);

        const circle=L.circle(

            [endLat,endLng],

            {

                radius:20,

                color:hornetColors[index],

                fillColor:hornetColors[index],

                fillOpacity:0.35

            }

        ).addTo(map);

        line.bindPopup(

            "<strong>"+

            (hornet.name||("Frelon "+(index+1)))+

            "</strong><br>"+

            "Direction : "+hornet.direction+"°<br>"+

            "Temps moyen : "+hornet.average.toFixed(1)+" s<br>"+

            "Distance estimée : "+hornet.distance.toFixed(1)+" m"

        );

        circle.bindPopup(

            "<strong>"+

            (hornet.name||("Frelon "+(index+1)))+

            "</strong><br>"+

            "Zone potentielle du nid"

        );

        hornetLayers.push(line);

        hornetLayers.push(circle);

    });drawOverlapZones();

}/*==========================================================
    DESSIN D'UN SECTEUR DE RECHERCHE
==========================================================*/

function drawSearchSector(latitude, longitude, hornet, color){

    const startAngle = hornet.direction - 15;
    const endAngle   = hornet.direction + 15;

    const points = [];

    points.push([latitude, longitude]);

    for(let angle=startAngle; angle<=endAngle; angle++){

        const rad = (angle - 90) * Math.PI / 180;

        const lat =

            latitude +

            ((hornet.distance * Math.sin(rad)) / 111320);

        const lng =

            longitude +

            ((hornet.distance * Math.cos(rad)) /

            (111320 * Math.cos(latitude * Math.PI / 180)));

        points.push([lat, lng]);

    }

    points.push([latitude, longitude]);

    const sector = L.polygon(points,{

        color:color,

        fillColor:color,

        fillOpacity:0.25,

        weight:2

    }).addTo(map);

    sector.bindPopup(

        "<strong>"+

        (hornet.name || "Frelon")+

        "</strong><br><br>"+

        "🧭 Direction : "+hornet.direction+"°<br>"+

        "⏱ Temps moyen : "+hornet.average.toFixed(1)+" s<br>"+

        "📏 Distance estimée : "+hornet.distance.toFixed(1)+" m<br><br>"+

        "<strong>Zone potentielle du nid</strong>"

    );

    hornetLayers.push(sector);drawSearchSector(

    latitude,

    longitude,

    hornet,

    hornetColors[index]

);

}/*==========================================================
    ZONES DE RECOUVREMENT
==========================================================*/

function drawOverlapZones(){

    const threshold = 50; // mètres

    for(let i=0;i<hornets.length;i++){

        if(hornets[i].distance===null){

            continue;

        }

        for(let j=i+1;j<hornets.length;j++){

            if(hornets[j].distance===null){

                continue;

            }

            const p1 = getNestPoint(hornets[i]);

            const p2 = getNestPoint(hornets[j]);

            const distance = map.distance(p1,p2);

            if(distance<=threshold){

                const midLat =

                    (p1.lat+p2.lat)/2;

                const midLng =

                    (p1.lng+p2.lng)/2;

                const overlap = L.circleMarker(

                    [midLat,midLng],

                    {

                        radius:10,

                        color:"#FF00FF",

                        fillColor:"#FF00FF",

                        fillOpacity:0.8

                    }

                ).addTo(map);

                overlap.bindPopup(

                    "<strong>⭐ Zone prioritaire</strong><br><br>"+

                    hornets[i].name+

                    "<br>"+

                    hornets[j].name+

                    "<br><br>"+

                    "Deux estimations sont très proches."

                );

                hornetLayers.push(overlap);

            }

        }

    }

}

/*==========================================================
    CALCUL DU POINT ESTIME
==========================================================*/

function getNestPoint(hornet){

    const latitude =

        parseFloat(latitudeInput.value);

    const longitude =

        parseFloat(longitudeInput.value);

    const angle =

        (hornet.direction-90) *

        Math.PI/180;

    return L.latLng(

        latitude+

        ((hornet.distance*Math.sin(angle))/111320),

        longitude+

        ((hornet.distance*Math.cos(angle))/

        (111320*Math.cos(latitude*Math.PI/180)))

    );

}
