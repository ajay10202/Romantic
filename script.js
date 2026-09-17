* {
    box-sizing: border-box;
}


body {
    margin: 0;

    font-family: Arial, sans-serif;

    background: #181818;

    color: white;

    overflow: hidden;
}


/* =========================
   TOP BAR
========================= */

.topbar {

    height: 58px;

    background: #252525;

    display: flex;

    align-items: center;

    gap: 10px;

    padding: 0 15px;

    border-bottom: 1px solid #444;
}


.logo {

    font-size: 20px;

    font-weight: bold;

    margin-right: 20px;
}


button,
.file-button {

    background: #333;

    color: white;

    border: 1px solid #555;

    padding: 9px 13px;

    border-radius: 5px;

    cursor: pointer;

    font-size: 13px;

    transition: 0.2s;
}


button:hover,
.file-button:hover {

    background: #444;
}


input[type="file"] {

    display: none;
}


/* =========================
   MAIN
========================= */

.main {

    display: flex;

    height: calc(100vh - 58px);
}


/* =========================
   SIDEBAR
========================= */

.sidebar {

    width: 190px;

    background: #222;

    padding: 15px;

    border-right: 1px solid #444;
}


.section-title {

    font-size: 12px;

    color: #999;

    margin:

        12px 0 8px;

    text-transform: uppercase;
}


.tool {

    width: 100%;

    margin-bottom: 7px;

    text-align: left;
}


/* =========================
   3D VIEWER
========================= */

.viewer {

    position: relative;

    flex: 1;

    background: #101010;
}


#viewer {

    width: 100%;

    height: 100%;
}


/* =========================
   MEASUREMENT PANEL
========================= */

.measure-panel {

    position: absolute;

    right: 15px;

    top: 15px;

    width: 230px;

    background: rgba(
        30,
        30,
        30,
        0.95
    );

    border: 1px solid #555;

    border-radius: 8px;

    padding: 14px;

    display: none;
}


.measure-panel h3 {

    margin: 0 0 10px;

    font-size: 15px;
}


.measure-panel p {

    color: #bbb;

    font-size: 13px;
}


.measure-result {

    font-size: 22px;

    font-weight: bold;

    margin-top: 12px;
}


/* =========================
   STATUS
========================= */

.status {

    position: absolute;

    bottom: 15px;

    left: 15px;

    background: rgba(
        0,
        0,
        0,
        0.7
    );

    padding: 8px 12px;

    border-radius: 5px;

    font-size: 12px;
}


/* =========================
   MEASUREMENT CURSOR
========================= */

.crosshair {

    cursor: crosshair !important;
}


/* =========================
   MOBILE
========================= */

@media (max-width: 700px) {

    .sidebar {

        width: 150px;

        padding: 10px;
    }


    .topbar {

        overflow-x: auto;
    }


    .logo {

        font-size: 16px;

        margin-right: 5px;
    }

        }
