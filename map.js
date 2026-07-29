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

    );loadHornetData();


prepareHornets();
    updateInfoPanel();


    hideLoading();


});/*==========================================================
    LECTURE DES DONNEES VESPATIMER
==========================================================*/

function loadHornetData(){

    const savedData =

        localStorage.getItem("vespatimerSurvey");


    if(!savedData){

        infoPanel.innerHTML = `

            <p><strong>Aucun relevé trouvé.</strong></p>

            <p>
                Retournez dans VespaTimer,
                terminez un relevé puis ouvrez la carte.
            </p>

        `;

        return false;

    }


    try{

        hornets = JSON.parse(savedData);


        return true;


    }

    catch(error){


        console.error(error);


        showError(

            "Impossible de lire les données VespaTimer."

        );


        return false;

    }

}


/*==========================================================
    AFFICHAGE DES INFORMATIONS
==========================================================*/

function updateInfoPanel(){


    if(hornets.length===0){

        return;

    }


    let html = `

        <h3>🐝 Frelons enregistrés</h3>

    `;


    hornets.forEach((hornet,index)=>{


        html += `

        <div style="margin-bottom:15px;">

            <strong>

                ${hornet.name || "Frelon "+(index+1)}

            </strong>

            <br>

            🧭 Direction :
            ${hornet.direction || "--"}°

            <br>

            ⏱ Temps moyen :
            ${Number(hornet.average).toFixed(1)}
            secondes

        </div>

        `;


    });


    infoPanel.innerHTML = html;


}Distance = (Temps moyen - 30) × 2.5/*==========================================================
    CALCUL DES DISTANCES ESTIMEES
==========================================================*/

function calculateNestDistance(averageTime){

    if(

        averageTime === undefined ||

        averageTime === null ||

        averageTime <= 30

    ){

        return null;

    }


    return (

        (averageTime - 30) * 2.5

    );

}


/*==========================================================
    PREPARATION DES FRELONS
==========================================================*/

function prepareHornets(){

    hornets.forEach(hornet=>{


        hornet.distance =

            calculateNestDistance(

                Number(hornet.average)

            );


    });


} /*==========================================================
    CALCUL DU POINT ESTIME
==========================================================*/

function calculateNestPoint(latitude, longitude, hornet){

    const angle =

        (hornet.direction - 90)

        *

        Math.PI / 180;


    const endLatitude =

        latitude +

        (

            (hornet.distance * Math.sin(angle))

            /

            111320

        );


    const endLongitude =

        longitude +

        (

            (hornet.distance * Math.cos(angle))

            /

            (

                111320 *

                Math.cos(latitude * Math.PI / 180)

            )

        );


    return [

        endLatitude,

        endLongitude

    ];

}



/*==========================================================
    DESSIN DES TRAJECTOIRES
==========================================================*/

function drawHornetRoutes(latitude, longitude){


    hornetLayers.forEach(layer=>{

        map.removeLayer(layer);

    });


    hornetLayers=[];



    hornets.forEach((hornet,index)=>{


        if(hornet.distance === null){

            return;

        }


        const point =

            calculateNestPoint(

                latitude,

                longitude,

                hornet

            );



        const line = L.polyline(

            [

                [latitude,longitude],

                point

            ],

            {

                color: hornetColors[index],

                weight:5

            }

        ).addTo(map);



        const marker = L.circle(

            point,

            {

                radius:20,

                color:hornetColors[index],

                fillColor:hornetColors[index],

                fillOpacity:0.4

            }

        ).addTo(map);



        line.bindPopup(`

            <strong>

                ${hornet.name || "Frelon "+(index+1)}

            </strong>

            <br><br>

            🧭 Direction :
            ${hornet.direction}°

            <br>

            ⏱ Temps moyen :
            ${Number(hornet.average).toFixed(1)} s

            <br>

            📏 Distance :
            ${hornet.distance.toFixed(1)} m

        `);



        marker.bindPopup(`

            <strong>

                Zone potentielle du nid

            </strong>

            <br><br>

            ${hornet.name || "Frelon "+(index+1)}

        `);



        hornetLayers.push(line);

        hornetLayers.push(marker);


    });


}/*==========================================================
    SECTEUR DE RECHERCHE
==========================================================*/

function drawSearchSector(latitude, longitude, hornet, color){


    const points = [];


    points.push([

        latitude,

        longitude

    ]);



    const startAngle =

        hornet.direction - 15;


    const endAngle =

        hornet.direction + 15;



    for(

        let angle=startAngle;

        angle<=endAngle;

        angle+=2

    ){


        const rad =

            (angle - 90)

            *

            Math.PI / 180;



        const lat =

            latitude +

            (

                hornet.distance *

                Math.sin(rad)

                /

                111320

            );



        const lng =

            longitude +

            (

                hornet.distance *

                Math.cos(rad)

                /

                (

                    111320 *

                    Math.cos(latitude * Math.PI / 180)

                )

            );



        points.push([

            lat,

            lng

        ]);

    }



    points.push([

        latitude,

        longitude

    ]);



    const sector = L.polygon(

        points,

        {

            color:color,

            fillColor:color,

            fillOpacity:0.25,

            weight:2

        }

    ).addTo(map);



    sector.bindPopup(`

        <strong>

        ${hornet.name || "Frelon"}

        </strong>

        <br><br>

        🧭 Direction :

        ${hornet.direction}°

        <br>

        📏 Distance :

        ${hornet.distance.toFixed(1)} m

        <br><br>

        Zone potentielle du nid

    `);



    hornetLayers.push(sector);


}/*==========================================================
    ZONES PRIORITAIRES
==========================================================*/

function drawPriorityZones(){


    for(let i=0;i<hornets.length;i++){


        if(hornets[i].distance === null){

            continue;

        }



        const point1 =

            calculateNestPoint(

                Number(latitudeInput.value),

                Number(longitudeInput.value),

                hornets[i]

            );



        for(let j=i+1;j<hornets.length;j++){


            if(hornets[j].distance === null){

                continue;

            }



            const point2 =

                calculateNestPoint(

                    Number(latitudeInput.value),

                    Number(longitudeInput.value),

                    hornets[j]

                );



            const distance =

                L.latLng(point1)

                .distanceTo(

                    L.latLng(point2)

                );



            if(distance <= 50){


                const middle = [

                    (point1[0]+point2[0])/2,

                    (point1[1]+point2[1])/2

                ];



                const priority =

                    L.circleMarker(

                        middle,

                        {

                            radius:12,

                            color:"#FF00FF",

                            fillColor:"#FF00FF",

                            fillOpacity:0.8

                        }

                    )

                    .addTo(map);



                priority.bindPopup(`

                    <strong>

                    ⭐ Zone prioritaire

                    </strong>

                    <br><br>

                    Les estimations de plusieurs frelons

                    sont proches.

                    <br><br>

                    À vérifier en priorité.

                `);



                hornetLayers.push(priority);


            }

        }

    }


}
