"use strict";

/*==========================================================
    VESPATIMER v1.1
    CARTE DES ZONES POTENTIELLES
==========================================================*/

/*==========================================================
    ELEMENTS HTML
==========================================================*/

const backButton = document.getElementById("backButton");
const gpsButton = document.getElementById("gpsButton");
const showMapButton = document.getElementById("showMapButton");

const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");

const infoPanel = document.getElementById("infoPanel");

const loadingOverlay = document.getElementById("loadingOverlay");
const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");
const closeError = document.getElementById("closeError");

/*==========================================================
    VARIABLES
==========================================================*/

let map = null;
let potMarker = null;

let hornets = [];
let hornetLayers = [];

/*==========================================================
    COULEURS
==========================================================*/

const hornetColors = [

    "#D32F2F",
    "#1976D2",
    "#388E3C",
    "#F9A825",
    "#7B1FA2"

];/*==========================================================
    RETOUR
==========================================================*/

backButton.addEventListener("click",()=>{

    window.location.href="index.html";

});

/*==========================================================
    CHARGEMENT
==========================================================*/

function showLoading(){

    loadingOverlay.classList.remove("hidden");

}

function hideLoading(){

    loadingOverlay.classList.add("hidden");

}

/*==========================================================
    ERREURS
==========================================================*/

function showError(message){

    errorText.textContent = message;

    errorMessage.classList.remove("hidden");

}

closeError.addEventListener("click",()=>{

    errorMessage.classList.add("hidden");

});

/*==========================================================
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

            latitudeInput.value =
                position.coords.latitude.toFixed(6);

            longitudeInput.value =
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

}); /*==========================================================
    CREATION DE LA CARTE
==========================================================*/

function createMap(latitude, longitude){

    if(map){

        map.remove();

    }

    map = L.map("map").setView(

        [latitude, longitude],

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


    potMarker = L.marker([

        latitude,

        longitude

    ]).addTo(map);


    potMarker.bindPopup(

        "📍 Pot-à-Mèche"

    ).openPopup();


}


/*==========================================================
    BOUTON AFFICHER LA CARTE
==========================================================*/

showMapButton.addEventListener("click",()=>{


    const latitude =

        parseFloat(latitudeInput.value);


    const longitude =

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


    showLoading();


    createMap(

        latitude,

        longitude

    );


    hideLoading();


});
