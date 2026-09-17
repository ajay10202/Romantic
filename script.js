import * as THREE from "three";

import {
    OrbitControls
}
from "three/addons/controls/OrbitControls.js";

import {
    STLLoader
}
from "three/addons/loaders/STLLoader.js";

import {
    OBJLoader
}
from "three/addons/loaders/OBJLoader.js";


// ========================================
// HTML ELEMENTS
// ========================================

const container =
    document.getElementById("viewer");

const status =
    document.getElementById("status");

const measurePanel =
    document.getElementById("measurePanel");

const measureResult =
    document.getElementById("measureResult");


// ========================================
// VARIABLES
// ========================================

let scene;

let camera;

let renderer;

let controls;

let currentModel = null;

let wireframe = false;

let measuring = false;

let measurePoints = [];

let measureObjects = [];


// ========================================
// SCENE
// ========================================

scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x101010);


// ========================================
// CAMERA
// ========================================

camera =
    new THREE.PerspectiveCamera(

        45,

        container.clientWidth /
        container.clientHeight,

        0.01,

        100000
    );


camera.position.set(
    100,
    100,
    100
);


// ========================================
// RENDERER
// ========================================

renderer =
    new THREE.WebGLRenderer({

        antialias: true

    });


renderer.setPixelRatio(
    window.devicePixelRatio
);


renderer.setSize(

    container.clientWidth,

    container.clientHeight

);


container.appendChild(
    renderer.domElement
);


// ========================================
// ORBIT CONTROLS
// ========================================

controls =
    new OrbitControls(

        camera,

        renderer.domElement

    );


controls.enableDamping = true;

controls.dampingFactor = 0.08;


// ========================================
// LIGHTING
// ========================================

const ambientLight =
    new THREE.AmbientLight(

        0xffffff,

        2

    );


scene.add(
    ambientLight
);


const directionalLight =
    new THREE.DirectionalLight(

        0xffffff,

        3

    );


directionalLight.position.set(

    100,

    200,

    100

);


scene.add(
    directionalLight
);


// ========================================
// GRID
// ========================================

const grid =
    new THREE.GridHelper(

        500,

        50

    );


scene.add(
    grid
);


// ========================================
// AXES
// ========================================

const axes =
    new THREE.AxesHelper(
        100
    );


scene.add(
    axes
);


// ========================================
// FILE INPUT
// ========================================

document
    .getElementById("fileInput")
    .addEventListener(
        "change",
        loadFile
    );


function loadFile(event) {

    const file =
        event.target.files[0];

    if (!file)
        return;


    const extension =
        file.name
        .split(".")
        .pop()
        .toLowerCase();


    status.innerText =
        "Loading: " +
        file.name;


    const reader =
        new FileReader();


    reader.onload =
        function(event) {

            try {

                if (
                    extension === "stl"
                ) {

                    loadSTL(
                        event.target.result
                    );

                }

                else if (
                    extension === "obj"
                ) {

                    loadOBJ(
                        event.target.result
                    );

                }

                else {

                    alert(
                        "Please select STL or OBJ file."
                    );

                }

            }

            catch (error) {

                console.error(error);

                status.innerText =
                    "Failed to load model.";

            }

        };


    if (
        extension === "stl"
    ) {

        reader.readAsArrayBuffer(
            file
        );

    }

    else {

        reader.readAsText(
            file
        );

    }

}


// ========================================
// LOAD STL
// ========================================

function loadSTL(data) {

    const loader =
        new STLLoader();


    const geometry =
        loader.parse(data);


    geometry.computeVertexNormals();


    const material =
        new THREE.MeshStandardMaterial({

            color: 0x8fa8b8,

            metalness: 0.2,

            roughness: 0.55

        });


    const mesh =
        new THREE.Mesh(

            geometry,

            material

        );


    replaceModel(
        mesh
    );

}


// ========================================
// LOAD OBJ
// ========================================

function loadOBJ(data) {

    const loader =
        new OBJLoader();


    const object =
        loader.parse(data);


    object.traverse(

        function(child) {

            if (
                child.isMesh
            ) {

                child.material =
                    new THREE.MeshStandardMaterial({

                        color: 0x8fa8b8,

                        metalness: 0.2,

                        roughness: 0.55

                    });

            }

        }

    );


    replaceModel(
        object
    );

}


// ========================================
// REPLACE MODEL
// ========================================

function replaceModel(model) {

    if (currentModel) {

        scene.remove(
            currentModel
        );

    }


    currentModel =
        model;


    scene.add(
        currentModel
    );


    fitModel();


    status.innerText =
        "Model loaded successfully.";

}


// ========================================
// FIT MODEL
// ========================================

window.fitModel =
function() {

    if (!currentModel)
        return;


    const box =
        new THREE.Box3()
        .setFromObject(
            currentModel
        );


    const size =
        box.getSize(
            new THREE.Vector3()
        );


    const center =
        box.getCenter(
            new THREE.Vector3()
        );


    const maxSize =
        Math.max(

            size.x,

            size.y,

            size.z

        );


    const distance =
        maxSize * 2;


    camera.position.set(

        center.x + distance,

        center.y + distance,

        center.z + distance

    );


    controls.target.copy(
        center
    );


    controls.update();

};


// ========================================
// RESET VIEW
// ========================================

window.resetView =
function() {

    camera.position.set(

        100,

        100,

        100

    );


    controls.target.set(

        0,

        0,

        0

    );


    controls.update();

};


// ========================================
// STANDARD VIEWS
// ========================================

window.setView =
function(view) {

    if (!currentModel)
        return;


    const box =
        new THREE.Box3()
        .setFromObject(
            currentModel
        );


    const center =
        box.getCenter(
            new THREE.Vector3()
        );


    const size =
        box.getSize(
            new THREE.Vector3()
        );


    const distance =
        Math.max(

            size.x,

            size.y,

            size.z

        ) * 2;


    switch (view) {

        case "front":

            camera.position.set(

                center.x,

                center.y,

                center.z + distance

            );

            break;


        case "back":

            camera.position.set(

                center.x,

                center.y,

                center.z - distance

            );

            break;


        case "top":

            camera.position.set(

                center.x,

                center.y + distance,

                center.z

            );

            break;


        case "bottom":

            camera.position.set(

                center.x,

                center.y - distance,

                center.z

            );

            break;


        case "left":

            camera.position.set(

                center.x - distance,

                center.y,

                center.z

            );

            break;


        case "right":

            camera.position.set(

                center.x + distance,

                center.y,

                center.z

            );

            break;


        case "iso":

            camera.position.set(

                center.x + distance,

                center.y + distance,

                center.z + distance

            );

            break;

    }


    controls.target.copy(
        center
    );


    controls.update();

};


// ========================================
// WIREFRAME
// ========================================

window.toggleWireframe =
function() {

    if (!currentModel)
        return;


    wireframe =
        !wireframe;


    currentModel.traverse(

        function(child) {

            if (
                child.isMesh &&
                child.material
            ) {

                child.material.wireframe =
                    wireframe;

            }

        }

    );

};


// ========================================
// FULL SCREEN
// ========================================

window.toggleFullscreen =
function() {

    const viewer =
        document.querySelector(
            ".viewer"
        );


    if (
        !document.fullscreenElement
    ) {

        viewer.requestFullscreen();

    }

    else {

        document.exitFullscreen();

    }

};


// ========================================
// START MEASUREMENT
// ========================================

window.startMeasure =
function() {

    if (!currentModel) {

        alert(
            "Please load a 3D model first."
        );

        return;

    }


    clearMeasurement();


    measuring = true;


    measurePanel.style.display =
        "block";


    renderer.domElement.classList.add(
        "crosshair"
    );


    status.innerText =
        "Click first point.";

};


// ========================================
// RAYCASTER
// ========================================

const raycaster =
    new THREE.Raycaster();


const mouse =
    new THREE.Vector2();


renderer.domElement.addEventListener(

    "click",

    onViewerClick

);


function onViewerClick(event) {

    if (!measuring)
        return;


    const rect =
        renderer.domElement
        .getBoundingClientRect();


    mouse.x =

        (
            event.clientX -
            rect.left
        )
        /
        rect.width
        * 2 - 1;


    mouse.y =

        -(
            event.clientY -
            rect.top
        )
        /
        rect.height
        * 2 + 1;


    raycaster.setFromCamera(

        mouse,

        camera

    );


    const intersections =
        raycaster.intersectObject(

            currentModel,

            true

        );


    if (
        intersections.length === 0
    ) {

        return;

    }


    const point =
        intersections[0]
        .point
        .clone();


    measurePoints.push(
        point
    );


    createPointMarker(
        point
    );


    if (
        measurePoints.length === 1
    ) {

        status.innerText =
            "First point selected. Click second point.";

    }


    if (
        measurePoints.length === 2
    ) {

        calculateDistance();


        measuring = false;


        renderer.domElement
            .classList.remove(
                "crosshair"
            );

    }

}


// ========================================
// POINT MARKER
// ========================================

function createPointMarker(point) {

    const geometry =
        new THREE.SphereGeometry(

            1.5,

            16,

            16

        );


    const material =
        new THREE.MeshBasicMaterial({

            color: 0xff0000

        });


    const marker =
        new THREE.Mesh(

            geometry,

            material

        );


    marker.position.copy(
        point
    );


    scene.add(
        marker
    );


    measureObjects.push(
        marker
    );

}


// ========================================
// CALCULATE DISTANCE
// ========================================

function calculateDistance() {

    const point1 =
        measurePoints[0];


    const point2 =
        measurePoints[1];


    const distance =
        point1.distanceTo(
            point2
        );


    /*
       Model is assumed to be
       in millimetres.
    */


    measureResult.innerText =

        distance.toFixed(2) +
        " mm";


    createMeasurementLine(

        point1,

        point2

    );


    status.innerText =
        "Measurement complete.";

}


// ========================================
// MEASUREMENT LINE
// ========================================

function createMeasurementLine(
    point1,
    point2
) {

    const geometry =
        new THREE.BufferGeometry()
        .setFromPoints([

            point1,

            point2

        ]);


    const material =
        new THREE.LineBasicMaterial({

            color: 0xff0000

        });


    const line =
        new THREE.Line(

            geometry,

            material

        );


    scene.add(
        line
    );


    measureObjects.push(
        line
    );

}


// ========================================
// CLEAR MEASUREMENT
// ========================================

window.clearMeasurement =
function() {

    measurePoints = [];


    measureObjects.forEach(

        function(object) {

            scene.remove(
                object
            );

        }

    );


    measureObjects = [];


    measureResult.innerText =
        "0.00 mm";


    measuring = false;


    renderer.domElement
        .classList.remove(
            "crosshair"
        );


    status.innerText =
        "Ready.";

};


// ========================================
// WINDOW RESIZE
// ========================================

window.addEventListener(

    "resize",

    function() {

        camera.aspect =

            container.clientWidth /
            container.clientHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(

            container.clientWidth,

            container.clientHeight

        );

    }

);


// ========================================
// ANIMATION
// ========================================

function animate() {

    requestAnimationFrame(
        animate
    );


    controls.update();


    renderer.render(

        scene,

        camera

    );

}


animate();
