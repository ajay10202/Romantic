/* =====================================================
   BLUECHIP BRANCH LOCATOR
===================================================== */


/* =====================================================
   BRANCH DATA
=====================================================

   IMPORTANT:

   Keep the existing Bluechip branch data here.

   Every record must contain:

   state
   city
   area
   address
   phone
   email

===================================================== */

let branches = [

    /*
    Example structure only.

    DO NOT DELETE YOUR EXISTING DATA.

    Replace/add the complete existing branch
    database here or load it from JSON/API.
    */

    {
        state: "ANDHRA PRADESH",
        city: "BAPATLA",
        area: "BAPATLA",
        address: "12-8-27, SURYALANKA ROAD, REVENUE WARD NO. 20, NEAR GADIYARAM CENTRE, BAPATLA BAPATLA 522101",
        phone: "08643-220375 / 08643-220376",
        email: "bapatla@bluechipindia.co.in"
    },

    {
        state: "ANDHRA PRADESH",
        city: "BHIMAVARAM",
        area: "BHIMAVARAM",
        address: "DOOR NO. 7 - 9, FIRST FLOOR, J P ROAD, CHINAMIRAM, BHIMAVARAM BHIMAVARAM 534204",
        phone: "08816-293744 / 08816-293755",
        email: "bhimavaram@bluechipindia.co.in"
    },

    {
        state: "ANDHRA PRADESH",
        city: "ELURU",
        area: "ELURU",
        address: "DOOR NO - 24A-13-1/5, ASHOK NAGAR, REVENUE WARD NO. - 28, OPP. AYUSH HOSPITAL, ELURU ELURU 534002",
        phone: "08812-240263 / 08812-250263",
        email: "eluru@bluechipindia.co.in"
    },

    {
        state: "ANDHRA PRADESH",
        city: "GAJUWAKA",
        area: "GAJUWAKA",
        address: "DOOR NO. 7-16-43/1, 1ST FLOOR, ABOVE SBI ATM, PALLA STREET, OLD GAJUWAKA JUNCTION, GAJUWAKA 530026",
        phone: "0891-2545316 / 0891-2545319",
        email: "gajuwaka@bluechipindia.co.in"
    },

    {
        state: "ANDHRA PRADESH",
        city: "GUNTUR",
        area: "GUNTUR",
        address: "SRI MATTUPALLI COMPLEX, 1ST FLOOR, D.NO. 6-19-48 & 49, MAIN ROAD, ARUNDELPET, OPP M.R.O OFFICE, GUNTUR 522002",
        phone: "0863-6632526 / 0863-2240530",
        email: "guntur@bluechipindia.co.in"
    },

    {
        state: "DELHI",
        city: "DELHI",
        area: "DWARKA",
        address: "SHOP NO. 108, FIRST FLOOR, AGGARAWAL TOWER, PLOT NO. 2, SECTOR - 5, MLU PLAZA, DWARKA, DELHI 110075",
        phone: "011-45063550 / 011-49028431",
        email: "dwarka@bluechipindia.co.in"
    }

];


/* =====================================================
   DOM ELEMENTS
===================================================== */

const searchInput =
    document.getElementById("searchInput");

const clearSearch =
    document.getElementById("clearSearch");

const stateFilter =
    document.getElementById("stateFilter");

const cityFilter =
    document.getElementById("cityFilter");

const branchList =
    document.getElementById("branchList");

const noResults =
    document.getElementById("noResults");

const visibleCount =
    document.getElementById("visibleCount");

const branchCount =
    document.getElementById("branchCount");

const stateCount =
    document.getElementById("stateCount");

const cityCount =
    document.getElementById("cityCount");

const resultTitle =
    document.getElementById("resultTitle");

const resetFilters =
    document.getElementById("resetFilters");

const clearFiltersButton =
    document.getElementById("clearFiltersButton");

const nearMeBtn =
    document.getElementById("nearMeBtn");

const listViewBtn =
    document.getElementById("listViewBtn");

const mapViewBtn =
    document.getElementById("mapViewBtn");

const mapContainer =
    document.getElementById("mapContainer");


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateStatistics();

        populateStates();

        populateCities();

        renderBranches(branches);

    }
);


/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics() {

    branchCount.textContent =
        branches.length;

    const states =
        new Set(
            branches.map(
                branch =>
                    branch.state
            )
        );

    const cities =
        new Set(
            branches.map(
                branch =>
                    branch.city
            )
        );

    stateCount.textContent =
        states.size;

    cityCount.textContent =
        cities.size;

}


/* =====================================================
   STATE DROPDOWN
===================================================== */

function populateStates() {

    const states =
        [...new Set(
            branches.map(
                branch =>
                    branch.state
            )
        )]
        .sort();

    stateFilter.innerHTML =
        `<option value="">All States</option>`;

    states.forEach(
        state => {

            const option =
                document.createElement("option");

            option.value =
                state;

            option.textContent =
                state;

            stateFilter.appendChild(
                option
            );

        }
    );

}


/* =====================================================
   CITY DROPDOWN
===================================================== */

function populateCities() {

    const selectedState =
        stateFilter.value;

    let filteredBranches =
        branches;

    if (selectedState) {

        filteredBranches =
            branches.filter(
                branch =>
                    branch.state ===
                    selectedState
            );

    }

    const cities =
        [...new Set(
            filteredBranches.map(
                branch =>
                    branch.city
            )
        )]
        .sort();

    cityFilter.innerHTML =
        `<option value="">All Cities</option>`;

    cities.forEach(
        city => {

            const option =
                document.createElement("option");

            option.value =
                city;

            option.textContent =
                city;

            cityFilter.appendChild(
                option
            );

        }
    );

}


/* =====================================================
   FILTER
===================================================== */

function filterBranches() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedState =
        stateFilter.value;

    const selectedCity =
        cityFilter.value;


    const filtered =
        branches.filter(
            branch => {

                const searchText = (

                    branch.state +
                    " " +
                    branch.city +
                    " " +
                    branch.area +
                    " " +
                    branch.address +
                    " " +
                    branch.phone +
                    " " +
                    branch.email

                ).toLowerCase();


                const matchesSearch =
                    !search ||
                    searchText.includes(
                        search
                    );


                const matchesState =
                    !selectedState ||
                    branch.state ===
                    selectedState;


                const matchesCity =
                    !selectedCity ||
                    branch.city ===
                    selectedCity;


                return (

                    matchesSearch &&
                    matchesState &&
                    matchesCity

                );

            }
        );


    renderBranches(filtered);

}


/* =====================================================
   RENDER BRANCHES
===================================================== */

function renderBranches(
    data
) {

    branchList.innerHTML = "";

    visibleCount.textContent =
        data.length;


    if (data.length === 0) {

        branchList.classList.add(
            "hidden"
        );

        noResults.classList.remove(
            "hidden"
        );

        return;

    }


    branchList.classList.remove(
        "hidden"
    );

    noResults.classList.add(
        "hidden"
    );


    data.forEach(
        branch => {

            const card =
                createBranchCard(
                    branch
                );

            branchList.appendChild(
                card
            );

        }
    );


    updateResultTitle(data);

}


/* =====================================================
   BRANCH CARD
===================================================== */

function createBranchCard(
    branch
) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "branch-card";


    const encodedAddress =
        encodeURIComponent(
            branch.address
        );


    const phoneNumber =
        branch.phone
            .replace(
                /[^0-9+]/g,
                ""
            );


    card.innerHTML = `

        <div class="branch-top">

            <div>

                <div class="branch-area">

                    ${escapeHTML(
                        branch.area
                    )}

                </div>

                <div class="branch-location">

                    ${escapeHTML(
                        branch.city
                    )}
                    ,
                    ${escapeHTML(
                        branch.state
                    )}

                </div>

            </div>


            <div class="branch-icon">

                <i class="fa-solid fa-building"></i>

            </div>

        </div>


        <div class="branch-info">

            <div class="info-row">

                <i class="fa-solid fa-location-dot"></i>

                <span>

                    ${escapeHTML(
                        branch.address
                    )}

                </span>

            </div>


            <div class="info-row">

                <i class="fa-solid fa-phone"></i>

                <a href="tel:${phoneNumber}">

                    ${escapeHTML(
                        branch.phone
                    )}

                </a>

            </div>


            <div class="info-row">

                <i class="fa-solid fa-envelope"></i>

                <a href="mailto:${branch.email}">

                    ${escapeHTML(
                        branch.email
                    )}

                </a>

            </div>

        </div>


        <div class="branch-actions">

            <a
                href="tel:${phoneNumber}"
                class="branch-button call-button">

                <i class="fa-solid fa-phone"></i>

                Call Branch

            </a>


            <a
                href="https://www.google.com/maps/search/?api=1&query=${encodedAddress}"
                target="_blank"
                rel="noopener"
                class="branch-button direction-button">

                <i class="fa-solid fa-diamond-turn-right"></i>

                Directions

            </a>

        </div>

    `;


    return card;

}


/* =====================================================
   RESULT TITLE
===================================================== */

function updateResultTitle(
    data
) {

    if (
        stateFilter.value &&
        cityFilter.value
    ) {

        resultTitle.textContent =
            `${cityFilter.value} Branches`;

        return;

    }


    if (stateFilter.value) {

        resultTitle.textContent =
            `${stateFilter.value} Branches`;

        return;

    }


    resultTitle.textContent =
        "All Branches";

}


/* =====================================================
   SEARCH
===================================================== */

searchInput.addEventListener(
    "input",
    () => {

        filterBranches();

    }
);


/* =====================================================
   STATE CHANGE
===================================================== */

stateFilter.addEventListener(
    "change",
    () => {

        populateCities();

        cityFilter.value = "";

        filterBranches();

    }
);


/* =====================================================
   CITY CHANGE
===================================================== */

cityFilter.addEventListener(
    "change",
    () => {

        filterBranches();

    }
);


/* =====================================================
   CLEAR SEARCH
===================================================== */

clearSearch.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        filterBranches();

        searchInput.focus();

    }
);


/* =====================================================
   RESET
===================================================== */

function resetAllFilters() {

    searchInput.value = "";

    stateFilter.value = "";

    populateCities();

    cityFilter.value = "";

    renderBranches(
        branches
    );

}


resetFilters.addEventListener(
    "click",
    resetAllFilters
);


clearFiltersButton.addEventListener(
    "click",
    resetAllFilters
);


/* =====================================================
   LIST VIEW
===================================================== */

listViewBtn.addEventListener(
    "click",
    () => {

        listViewBtn.classList.add(
            "active"
        );

        mapViewBtn.classList.remove(
            "active"
        );

        branchList.classList.remove(
            "hidden"
        );

        mapContainer.classList.add(
            "hidden"
        );

    }
);


/* =====================================================
   MAP VIEW
===================================================== */

mapViewBtn.addEventListener(
    "click",
    () => {

        mapViewBtn.classList.add(
            "active"
        );

        listViewBtn.classList.remove(
            "active"
        );

        branchList.classList.add(
            "hidden"
        );

        mapContainer.classList.remove(
            "hidden"
        );

    }
);


/* =====================================================
   NEAR ME
===================================================== */

nearMeBtn.addEventListener(
    "click",
    () => {

        if (
            !navigator.geolocation
        ) {

            alert(
                "Location services are not supported by this browser."
            );

            return;

        }


        nearMeBtn.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            Finding...

        `;


        navigator.geolocation.getCurrentPosition(

            position => {

                const lat =
                    position.coords.latitude;

                const lng =
                    position.coords.longitude;


                /*
                    For actual nearest-branch
                    calculation, add latitude
                    and longitude to every branch.

                    Example:

                    latitude: 19.0760,
                    longitude: 72.8777
                */


                const mapsURL =
                    `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;


                window.open(
                    mapsURL,
                    "_blank"
                );


                nearMeBtn.innerHTML = `

                    <i class="fa-solid fa-location-crosshairs"></i>

                    Find Near Me

                `;

            },

            error => {

                alert(
                    "Unable to access your location. Please allow location permission."
                );


                nearMeBtn.innerHTML = `

                    <i class="fa-solid fa-location-crosshairs"></i>

                    Find Near Me

                `;

            }

        );

    }
);


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(
    value
) {

    if (!value) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
