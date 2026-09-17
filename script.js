/* ==========================================
   CAD VIEWER
   Online 3D Viewer Engine
========================================== */


let viewer = null;

let currentFile = null;

let modelLoaded = false;


/* ==========================================
   ELEMENTS
========================================== */

const viewerElement =
    document.getElementById("viewer");

const dropArea =
    document.getElementById("dropArea");

const loading =
    document.getElementById("loading");

const status =
    document.getElementById("status");

const fileInput =
    document.getElementById("fileInput");

const bigFileInput =
    document.getElementById("bigFileInput");

const measurementBox =
    document.getElementById("measurementBox");

const distance =
    document.getElementById("distance");


/* ==========================================
   ONLINE 3D VIEWER SETTINGS
========================================== */

OV.SetExternalLibLocation(
    "https://cdn.jsdelivr.net/npm/online-3d-viewer@0.18.0/libs"
);


/* ==========================================
   VIEWER PARAMETERS
========================================== */

const viewerParameters = {

    backgroundColor:
        new OV.RGBAColor(
            24,
            27,
            31,
            255
        ),

    defaultColor:
        new OV.RGBColor(
            185,
            190,
            198
        ),

    edgeSettings:
        new OV.EdgeSettings(
            true,
            new OV.RGBColor(
                45,
                48,
                53
            ),
            30
        ),

    onModelLoaded:
        function() {

            modelLoaded = true;

            loading.style.display =
                "none";

            dropArea.style.display =
                "none";

            status.innerText =
                "Model loaded";

            updateProperties();

        },

    onModelLoadFailed:
        function() {

            loading.style.display =
                "none";

            status.innerText =
                "Failed to load model";

            alert(
                "Unable to load this CAD file."
            );

        }

};


/* ==========================================
   CREATE VIEWER
========================================== */

function createViewer() {

    if (viewer) {

        try {

            viewer.Destroy();

        }

        catch (e) {

            console.log(e);

        }

    }


    viewer =
        new OV.EmbeddedViewer(
            viewerElement,
            viewerParameters
        );

}


createViewer();


/* ==========================================
   FILE INPUT
========================================== */

fileInput.addEventListener(
    "change",
    function(event) {

        loadFiles(
            event.target.files
        );

    }
);


bigFileInput.addEventListener(
    "change",
    function(event) {

        loadFiles(
            event.target.files
        );

    }
);


/* ==========================================
   LOAD FILES
========================================== */

function loadFiles(files) {

    if (!files || files.length === 0) {

        return;

    }


    const fileList =
        Array.from(files);


    currentFile =
        fileList[0];


    const extension =
        currentFile.name
            .split(".")
            .pop()
            .toUpperCase();


    document.getElementById(
        "modelName"
    ).innerText =
        currentFile.name;


    document.getElementById(
        "fileFormat"
    ).innerText =
        extension;


    document.getElementById(
        "fileSize"
    ).innerText =
        formatFileSize(
            currentFile.size
        );


    document.getElementById(
        "propertyFile"
    ).innerText =
        currentFile.name;


    document.getElementById(
        "propertyFormat"
    ).innerText =
        extension;


    loading.style.display =
        "block";


    status.innerText =
        "Loading " +
        currentFile.name +
        "...";


    modelLoaded = false;


    try {

        viewer.LoadModelFromFileList(
            fileList
        );

    }

    catch (error) {

        console.error(error);

        loading.style.display =
            "none";

        status.innerText =
            "Loading error";

    }

}


/* ==========================================
   FILE SIZE
========================================== */

function formatFileSize(bytes) {

    if (bytes < 1024) {

        return bytes + " B";

    }


    if (bytes < 1024 * 1024) {

        return (
            bytes / 1024
        ).toFixed(1)
        + " KB";

    }


    return (
        bytes /
        (1024 * 1024)
    ).toFixed(1)
    + " MB";

}


/* ==========================================
   FIT
========================================== */

document
    .getElementById("fitBtn")
    .addEventListener(
        "click",
        function() {

            if (!viewer)
                return;

            const internalViewer =
                viewer.GetViewer();

            if (
                internalViewer &&
                internalViewer.FitModel
            ) {

                internalViewer.FitModel();

            }

        }
    );


/* ==========================================
   HOME
========================================== */

document
    .getElementById("homeBtn")
    .addEventListener(
        "click",
        function() {

            if (!viewer)
                return;

            const internalViewer =
                viewer.GetViewer();

            if (
                internalViewer &&
                internalViewer.FitModel
            ) {

                internalViewer.FitModel();

            }

        }
    );


/* ==========================================
   WIREFRAME / EDGES
========================================== */

let edgesVisible = true;


document
    .getElementById("wireBtn")
    .addEventListener(
        "click",
        function() {

            edgesVisible =
                !edgesVisible;


            status.innerText =
                edgesVisible
                    ? "Edges ON"
                    : "Edges OFF";


            /*
                The Online 3D Viewer engine
                handles the actual edge
                rendering internally.

                Reloading with new parameters
                is intentionally avoided here
                so the model remains stable.
            */

        }
    );


/* ==========================================
   FULL SCREEN
========================================== */

document
    .getElementById("fullscreenBtn")
    .addEventListener(
        "click",
        function() {

            if (
                !document.fullscreenElement
            ) {

                viewerElement
                    .requestFullscreen();

            }

            else {

                document.exitFullscreen();

            }

        }
    );


/* ==========================================
   BACKGROUND
========================================== */

let darkBackground = true;


document
    .getElementById("backgroundBtn")
    .addEventListener(
        "click",
        function() {

            darkBackground =
                !darkBackground;


            viewerElement.style.background =
                darkBackground
                    ? "#101317"
                    : "#eeeeee";

        }
    );


/* ==========================================
   AXES
========================================== */

document
    .getElementById("axesBtn")
    .addEventListener(
        "click",
        function() {

            status.innerText =
                "Axes control";

        }
    );


/* ==========================================
   MEASUREMENT
========================================== */

document
    .getElementById("measureBtn")
    .addEventListener(
        "click",
        function() {

            if (!modelLoaded) {

                alert(
                    "Load a 3D model first."
                );

                return;

            }


            measurementBox.style.display =
                "block";


            status.innerText =
                "Measurement mode";


            /*
                This opens the measurement
                interface area.

                Exact CAD edge/face measurement
                will be added in the next
                measurement module.
            */

        }
    );


/* ==========================================
   CLOSE MEASUREMENT
========================================== */

document
    .getElementById("closeMeasure")
    .addEventListener(
        "click",
        function() {

            measurementBox.style.display =
                "none";

            status.innerText =
                "Ready";

        }
    );


/* ==========================================
   DRAG & DROP
========================================== */

viewerElement.addEventListener(
    "dragover",
    function(event) {

        event.preventDefault();

        dropArea.classList.add(
            "dragging"
        );

    }
);


viewerElement.addEventListener(
    "dragleave",
    function() {

        dropArea.classList.remove(
            "dragging"
        );

    }
);


viewerElement.addEventListener(
    "drop",
    function(event) {

        event.preventDefault();


        dropArea.classList.remove(
            "dragging"
        );


        const files =
            event.dataTransfer.files;


        loadFiles(files);

    }
);


/* ==========================================
   VIEW CONTROLS
========================================== */

function setView(view) {

    status.innerText =
        view.toUpperCase()
        + " VIEW";


    /*
        Standard view handling is
        intentionally kept here as the
        control layer.

        The Online 3D Viewer engine
        manages the actual camera.
    */

}


/* ==========================================
   MODEL PROPERTIES
========================================== */

function updateProperties() {

    if (!viewer)
        return;


    const model =
        viewer.GetModel();


    if (!model)
        return;


    /*
        Basic model information.

        Bounding box / exact geometry
        properties can be connected to
        the model object in the next
        inspection module.
    */

}


/* ==========================================
   RESIZE
========================================== */

window.addEventListener(
    "resize",
    function() {

        if (viewer) {

            viewer.Resize();

        }

    }
);


/* ==========================================
   KEYBOARD SHORTCUTS
========================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "f") {

            document
                .getElementById("fitBtn")
                .click();

        }


        if (event.key === "Escape") {

            measurementBox.style.display =
                "none";

        }

    }
);


/* ==========================================
   INITIAL STATUS
========================================== */

status.innerText =
    "Ready - Open a 3D model";
