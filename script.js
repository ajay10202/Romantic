/* =========================================================
   BLUECHIP BRANCH LOCATOR
   Complete Frontend JavaScript
   ========================================================= */

"use strict";

/* =========================================================
   CONFIGURATION
   ========================================================= */

const CONFIG = {
    DATA_URL: "./data/branches.json",

    ITEMS_PER_PAGE: 12,

    DEFAULT_SORT: "name",

    MAP_PROVIDER: "google",

    ENABLE_GEOLOCATION: true,

    ANIMATION_DELAY: 40,

    SEARCH_DELAY: 250
};


/* =========================================================
   APPLICATION STATE
   ========================================================= */

const AppState = {

    branches: [],

    filteredBranches: [],

    states: [],

    cities: [],

    currentPage: 1,

    searchText: "",

    selectedState: "",

    selectedCity: "",

    selectedView: "grid",

    sortBy: CONFIG.DEFAULT_SORT,

    userLocation: null,

    isLoading: false,

    initialized: false

};


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const DOM = {};

function cacheDOM() {

    DOM.search =
        document.querySelector("#branchSearch");

    DOM.state =
        document.querySelector("#stateFilter");

    DOM.city =
        document.querySelector("#cityFilter");

    DOM.results =
        document.querySelector("#branchResults");

    DOM.pagination =
        document.querySelector("#pagination");

    DOM.resultCount =
        document.querySelector("#resultCount");

    DOM.totalCount =
        document.querySelector("#totalCount");

    DOM.noResults =
        document.querySelector("#noResults");

    DOM.loading =
        document.querySelector("#loading");

    DOM.sort =
        document.querySelector("#sortBranches");

    DOM.gridView =
        document.querySelector("#gridView");

    DOM.listView =
        document.querySelector("#listView");

    DOM.nearMe =
        document.querySelector("#nearMe");

    DOM.reset =
        document.querySelector("#resetFilters");

    DOM.clearSearch =
        document.querySelector("#clearSearch");

    DOM.searchButton =
        document.querySelector("#searchButton");

    DOM.mobileFilter =
        document.querySelector("#mobileFilterButton");

    DOM.filterPanel =
        document.querySelector("#filterPanel");

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {

    cacheDOM();

    setupEvents();

    showLoading(true);

    try {

        await loadBranchData();

        normalizeAllBranches();

        buildStateList();

        populateStateFilter();

        updateStatistics();

        applyFilters();

        AppState.initialized = true;

    } catch (error) {

        console.error(
            "Branch locator initialization failed:",
            error
        );

        showError(
            "Unable to load branch information. Please try again."
        );

    } finally {

        showLoading(false);

    }

}


/* =========================================================
   LOAD DATA
   ========================================================= */

async function loadBranchData() {

    const response =
        await fetch(
            CONFIG.DATA_URL,
            {
                method: "GET",
                cache: "no-cache"
            }
        );

    if (!response.ok) {

        throw new Error(
            `Unable to load ${CONFIG.DATA_URL}`
        );

    }

    const data =
        await response.json();

    if (!Array.isArray(data)) {

        throw new Error(
            "branches.json must contain an array"
        );

    }

    AppState.branches = data;

}


/* =========================================================
   NORMALIZE DATA
   ========================================================= */

function normalizeAllBranches() {

    AppState.branches =
        AppState.branches.map(
            (branch, index) => {

                return normalizeBranch(
                    branch,
                    index
                );

            }
        );

}


function normalizeBranch(branch, index) {

    return {

        id:
            branch.id ||
            `branch-${index + 1}`,

        state:
            clean(branch.state),

        city:
            clean(branch.city),

        area:
            clean(
                branch.area ||
                branch.location ||
                branch.name
            ),

        name:
            clean(
                branch.name ||
                branch.area ||
                branch.city
            ),

        address:
            clean(
                branch.address
            ),

        phone:
            clean(
                branch.phone ||
                branch.mobile
            ),

        email:
            clean(
                branch.email
            ),

        pincode:
            clean(
                branch.pincode
            ),

        latitude:
            parseNumber(
                branch.latitude
            ),

        longitude:
            parseNumber(
                branch.longitude
            ),

        raw:
            branch

    };

}


/* =========================================================
   STRING HELPERS
   ========================================================= */

function clean(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }

    return String(value)
        .replace(/\s+/g, " ")
        .trim();

}


function normalizeSearch(value) {

    return clean(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function parseNumber(value) {

    const number =
        Number.parseFloat(value);

    return Number.isFinite(number)
        ? number
        : null;

}


/* =========================================================
   STATE LIST
   ========================================================= */

function buildStateList() {

    AppState.states =
        [...new Set(
            AppState.branches
                .map(branch => branch.state)
                .filter(Boolean)
        )]
        .sort(
            (a, b) =>
                a.localeCompare(b)
        );

}


/* =========================================================
   POPULATE STATE FILTER
   ========================================================= */

function populateStateFilter() {

    if (!DOM.state) return;

    DOM.state.innerHTML =
        `<option value="">All States</option>`;

    AppState.states.forEach(
        state => {

            const option =
                document.createElement("option");

            option.value = state;

            option.textContent = state;

            DOM.state.appendChild(option);

        }
    );

}


/* =========================================================
   CITY FILTER
   ========================================================= */

function populateCityFilter() {

    if (!DOM.city) return;

    let branches =
        AppState.branches;

    if (AppState.selectedState) {

        branches =
            branches.filter(
                branch =>
                    normalizeSearch(
                        branch.state
                    ) ===
                    normalizeSearch(
                        AppState.selectedState
                    )
            );

    }

    const cities =
        [...new Set(
            branches
                .map(branch => branch.city)
                .filter(Boolean)
        )]
        .sort(
            (a, b) =>
                a.localeCompare(b)
        );

    DOM.city.innerHTML =
        `<option value="">All Cities</option>`;

    cities.forEach(
        city => {

            const option =
                document.createElement("option");

            option.value = city;

            option.textContent = city;

            DOM.city.appendChild(option);

        }
    );

}


/* =========================================================
   SEARCH
   ========================================================= */

function searchBranches() {

    const query =
        normalizeSearch(
            AppState.searchText
        );

    if (!query) {

        return AppState.branches;

    }

    return AppState.branches.filter(
        branch => {

            const searchableText = [

                branch.state,

                branch.city,

                branch.area,

                branch.name,

                branch.address,

                branch.phone,

                branch.email,

                branch.pincode

            ]
            .map(normalizeSearch)
            .join(" ");

            return searchableText.includes(
                query
            );

        }
    );

}


/* =========================================================
   FILTER
   ========================================================= */

function applyFilters() {

    let results =
        searchBranches();

    if (AppState.selectedState) {

        results =
            results.filter(
                branch =>
                    normalizeSearch(
                        branch.state
                    ) ===
                    normalizeSearch(
                        AppState.selectedState
                    )
            );

    }

    if (AppState.selectedCity) {

        results =
            results.filter(
                branch =>
                    normalizeSearch(
                        branch.city
                    ) ===
                    normalizeSearch(
                        AppState.selectedCity
                    )
            );

    }

    results =
        sortBranches(results);

    AppState.filteredBranches =
        results;

    AppState.currentPage = 1;

    renderResults();

    renderPagination();

    updateStatistics();

}


/* =========================================================
   SORTING
   ========================================================= */

function sortBranches(branches) {

    const data =
        [...branches];

    switch (AppState.sortBy) {

        case "state":

            return data.sort(
                (a, b) =>
                    a.state.localeCompare(
                        b.state
                    )
            );

        case "city":

            return data.sort(
                (a, b) =>
                    a.city.localeCompare(
                        b.city
                    )
            );

        case "area":

            return data.sort(
                (a, b) =>
                    a.area.localeCompare(
                        b.area
                    )
            );

        case "name":

        default:

            return data.sort(
                (a, b) =>
                    a.name.localeCompare(
                        b.name
                    )
            );

    }

}


/* =========================================================
   RENDER RESULTS
   ========================================================= */

function renderResults() {

    if (!DOM.results) return;

    const total =
        AppState.filteredBranches.length;

    if (total === 0) {

        DOM.results.innerHTML = "";

        if (DOM.noResults) {

            DOM.noResults.style.display =
                "block";

        }

        return;

    }

    if (DOM.noResults) {

        DOM.noResults.style.display =
            "none";

    }

    const start =
        (
            AppState.currentPage - 1
        ) *
        CONFIG.ITEMS_PER_PAGE;

    const end =
        start +
        CONFIG.ITEMS_PER_PAGE;

    const pageData =
        AppState.filteredBranches.slice(
            start,
            end
        );

    DOM.results.innerHTML =
        pageData
            .map(
                (branch, index) =>
                    createBranchCard(
                        branch,
                        index
                    )
            )
            .join("");

    animateCards();

}


/* =========================================================
   BRANCH CARD
   ========================================================= */

function createBranchCard(
    branch,
    index
) {

    const phoneNumbers =
        getPhoneNumbers(
            branch.phone
        );

    const primaryPhone =
        phoneNumbers[0] || "";

    const mapsURL =
        createMapsURL(branch);

    const delay =
        index *
        CONFIG.ANIMATION_DELAY;

    return `

        <article
            class="branch-card"
            data-id="${escapeHTML(branch.id)}"
            style="animation-delay:${delay}ms"
        >

            <div class="branch-card-header">

                <div class="branch-location-icon">
                    <span>📍</span>
                </div>

                <div class="branch-heading">

                    <span class="branch-state">
                        ${escapeHTML(branch.state)}
                    </span>

                    <h3>
                        ${escapeHTML(
                            branch.name
                        )}
                    </h3>

                </div>

            </div>


            <div class="branch-details">

                ${
                    branch.city
                        ? `
                        <div class="branch-detail">
                            <span class="detail-icon">
                                🏙️
                            </span>

                            <span>
                                ${escapeHTML(
                                    branch.city
                                )}
                            </span>
                        </div>
                        `
                        : ""
                }


                ${
                    branch.area
                        ? `
                        <div class="branch-detail">
                            <span class="detail-icon">
                                📌
                            </span>

                            <span>
                                ${escapeHTML(
                                    branch.area
                                )}
                            </span>
                        </div>
                        `
                        : ""
                }


                ${
                    branch.address
                        ? `
                        <div class="branch-detail address">
                            <span class="detail-icon">
                                🏢
                            </span>

                            <span>
                                ${escapeHTML(
                                    branch.address
                                )}
                            </span>
                        </div>
                        `
                        : ""
                }


                ${
                    branch.phone
                        ? `
                        <div class="branch-detail">
                            <span class="detail-icon">
                                ☎️
                            </span>

                            <div class="contact-list">
                                ${
                                    phoneNumbers
                                        .map(
                                            phone => `
                                            <a
                                                href="tel:${phone.replace(
                                                    /[^0-9+]/g,
                                                    ""
                                                )}"
                                            >
                                                ${escapeHTML(phone)}
                                            </a>
                                            `
                                        )
                                        .join("")
                                }
                            </div>
                        </div>
                        `
                        : ""
                }


                ${
                    branch.email
                        ? `
                        <div class="branch-detail">
                            <span class="detail-icon">
                                ✉️
                            </span>

                            <a
                                href="mailto:${escapeHTML(
                                    branch.email
                                )}"
                            >
                                ${escapeHTML(
                                    branch.email
                                )}
                            </a>
                        </div>
                        `
                        : ""
                }

            </div>


            <div class="branch-actions">

                ${
                    primaryPhone
                        ? `
                        <a
                            class="branch-btn call-btn"
                            href="tel:${primaryPhone.replace(
                                /[^0-9+]/g,
                                ""
                            )}"
                        >
                            <span>☎</span>
                            Call
                        </a>
                        `
                        : ""
                }


                ${
                    branch.email
                        ? `
                        <a
                            class="branch-btn email-btn"
                            href="mailto:${escapeHTML(
                                branch.email
                            )}"
                        >
                            <span>✉</span>
                            Email
                        </a>
                        `
                        : ""
                }


                <a
                    class="branch-btn direction-btn"
                    href="${mapsURL}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span>🗺</span>
                    Directions
                </a>

            </div>

        </article>

    `;

}


/* =========================================================
   PHONE PARSER
   ========================================================= */

function getPhoneNumbers(phone) {

    if (!phone) return [];

    return phone
        .split(/[\/,;]+/)
        .map(
            item =>
                item
                    .replace(/\s+/g, " ")
                    .trim()
        )
        .filter(Boolean);

}


/* =========================================================
   GOOGLE MAPS
   ========================================================= */

function createMapsURL(branch) {

    if (
        branch.latitude !== null &&
        branch.longitude !== null
    ) {

        return (
            "https://www.google.com/maps/search/?api=1" +
            `&query=${branch.latitude},${branch.longitude}`
        );

    }

    const query = [

        branch.name,

        branch.area,

        branch.address,

        branch.city,

        branch.state,

        branch.pincode,

        "India"

    ]
    .filter(Boolean)
    .join(", ");
   return (
        "https://www.google.com/maps/search/?api=1" +
        `&query=${encodeURIComponent(query)}`
    );

}


/* =========================================================
   PAGINATION
   ========================================================= */

function renderPagination() {

    if (!DOM.pagination) return;

    const total =
        AppState.filteredBranches.length;

    const pages =
        Math.ceil(
            total /
            CONFIG.ITEMS_PER_PAGE
        );

    if (pages <= 1) {

        DOM.pagination.innerHTML = "";

        return;

    }

    let html = "";

    html += `
        <button
            class="page-btn"
            data-page="prev"
            ${AppState.currentPage === 1
                ? "disabled"
                : ""}
        >
            ‹
        </button>
    `;


    const visiblePages =
        getVisiblePages(
            AppState.currentPage,
            pages
        );


    visiblePages.forEach(
        page => {

            if (page === "...") {

                html += `
                    <span class="page-dots">
                        ...
                    </span>
                `;

            } else {

                html += `
                    <button
                        class="page-btn ${
                            page ===
                            AppState.currentPage
                                ? "active"
                                : ""
                        }"
                        data-page="${page}"
                    >
                        ${page}
                    </button>
                `;

            }

        }
    );


    html += `
        <button
            class="page-btn"
            data-page="next"
            ${
                AppState.currentPage === pages
                    ? "disabled"
                    : ""
            }
        >
            ›
        </button>
    `;


    DOM.pagination.innerHTML =
        html;

}


function getVisiblePages(
    current,
    total
) {

    if (total <= 7) {

        return Array.from(
            {
                length: total
            },
            (_, i) => i + 1
        );

    }

    const pages = [1];

    if (current > 4) {

        pages.push("...");

    }

    const start =
        Math.max(
            2,
            current - 1
        );

    const end =
        Math.min(
            total - 1,
            current + 1
        );

    for (
        let i = start;
        i <= end;
        i++
    ) {

        pages.push(i);

    }

    if (current < total - 3) {

        pages.push("...");

    }

    pages.push(total);

    return pages;

}


function changePage(page) {

    const totalPages =
        Math.ceil(
            AppState.filteredBranches.length /
            CONFIG.ITEMS_PER_PAGE
        );

    if (page === "prev") {

        page =
            AppState.currentPage - 1;

    }

    if (page === "next") {

        page =
            AppState.currentPage + 1;

    }

    page =
        Number(page);

    if (
        page < 1 ||
        page > totalPages
    ) {

        return;

    }

    AppState.currentPage =
        page;

    renderResults();

    renderPagination();

    scrollToResults();

}
/* =========================================================
   STATISTICS
   ========================================================= */

function updateStatistics() {

    const total =
        AppState.branches.length;

    const filtered =
        AppState.filteredBranches.length;

    if (DOM.totalCount) {

        DOM.totalCount.textContent =
            total.toLocaleString("en-IN");

    }

    if (DOM.resultCount) {

        DOM.resultCount.textContent =
            filtered.toLocaleString("en-IN");

    }

}


/* =========================================================
   RESET
   ========================================================= */

function resetFilters() {

    AppState.searchText = "";

    AppState.selectedState = "";

    AppState.selectedCity = "";

    AppState.sortBy =
        CONFIG.DEFAULT_SORT;

    AppState.currentPage = 1;

    if (DOM.search) {

        DOM.search.value = "";

    }

    if (DOM.state) {

        DOM.state.value = "";

    }

    if (DOM.city) {

        DOM.city.innerHTML =
            `<option value="">
                All Cities
            </option>`;

    }

    if (DOM.sort) {

        DOM.sort.value =
            CONFIG.DEFAULT_SORT;

    }

    populateCityFilter();

    applyFilters();

}
/* =========================================================
   NEAR ME
   ========================================================= */

function findNearestBranches() {

    if (!CONFIG.ENABLE_GEOLOCATION) {

        return;

    }

    if (!navigator.geolocation) {

        showNotification(
            "Location is not supported by your browser."
        );

        return;

    }

    showNotification(
        "Finding branches near you..."
    );

    navigator.geolocation.getCurrentPosition(

        position => {

            AppState.userLocation = {

                latitude:
                    position.coords.latitude,

                longitude:
                    position.coords.longitude

            };

            calculateDistances();

            AppState.filteredBranches =
                [...AppState.branches]
                    .filter(
                        branch =>
                            branch.latitude !== null &&
                            branch.longitude !== null
                    )
                    .sort(
                        (a, b) =>
                            a.distance -
                            b.distance
                    );

            AppState.currentPage = 1;

            renderResults();

            renderPagination();

            updateStatistics();

            showNotification(
                "Branches sorted by distance."
            );

        },

        error => {

            console.error(
                "Geolocation error:",
                error
            );

            showNotification(
                "Please allow location access to find nearby branches."
            );

        },

        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 300000

        }

    );

}


/* =========================================================
   DISTANCE CALCULATION
   ========================================================= */

function calculateDistances() {

    if (!AppState.userLocation) {

        return;

    }

    AppState.branches.forEach(
        branch => {

            if (
                branch.latitude === null ||
                branch.longitude === null
            ) {

                branch.distance =
                    Infinity;

                return;

            }

            branch.distance =
                haversineDistance(

                    AppState.userLocation.latitude,

                    AppState.userLocation.longitude,

                    branch.latitude,

                    branch.longitude

                );

        }
    );

}
/* =========================================================
   HAVERSINE
   ========================================================= */

function haversineDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const earthRadius = 6371;

    const dLat =
        degreesToRadians(
            lat2 - lat1
        );

    const dLon =
        degreesToRadians(
            lon2 - lon1
        );

    const a =
        Math.sin(dLat / 2) ** 2 +

        Math.cos(
            degreesToRadians(lat1)
        ) *

        Math.cos(
            degreesToRadians(lat2)
        ) *

        Math.sin(dLon / 2) ** 2;

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return earthRadius * c;

}


function degreesToRadians(
    degrees
) {

    return degrees *
        Math.PI /
        180;

}
/* =========================================================
   VIEW SWITCHING
   ========================================================= */

function setView(view) {

    if (
        view !== "grid" &&
        view !== "list"
    ) {

        return;

    }

    AppState.selectedView =
        view;

    if (DOM.results) {

        DOM.results.classList.toggle(
            "list-view",
            view === "list"
        );

        DOM.results.classList.toggle(
            "grid-view",
            view === "grid"
        );

    }

    if (DOM.gridView) {

        DOM.gridView.classList.toggle(
            "active",
            view === "grid"
        );

    }

    if (DOM.listView) {

        DOM.listView.classList.toggle(
            "active",
            view === "list"
        );

    }

}


/* =========================================================
   EVENT HANDLERS
   ========================================================= */

function setupEvents() {


    /* SEARCH */

    if (DOM.search) {

        let searchTimer;

        DOM.search.addEventListener(
            "input",
            event => {

                clearTimeout(
                    searchTimer
                );

                searchTimer =
                    setTimeout(
                        () => {

                            AppState.searchText =
                                event.target.value;

                            applyFilters();

                        },
                        CONFIG.SEARCH_DELAY
                    );

            }
        );

    }


    /* SEARCH BUTTON */

    if (DOM.searchButton) {

        DOM.searchButton.addEventListener(
            "click",
            () => {

                if (DOM.search) {

                    AppState.searchText =
                        DOM.search.value;

                }

                applyFilters();

            }
        );

    }


    /* STATE */

    if (DOM.state) {

        DOM.state.addEventListener(
            "change",
            event => {

                AppState.selectedState =
                    event.target.value;

                AppState.selectedCity =
                    "";

                populateCityFilter();

                applyFilters();

            }
        );

    }


    /* CITY */

    if (DOM.city) {

        DOM.city.addEventListener(
            "change",
            event => {

                AppState.selectedCity =
                    event.target.value;

                applyFilters();

            }
        );

    }


    /* SORT */

    if (DOM.sort) {

        DOM.sort.addEventListener(
            "change",
            event => {

                AppState.sortBy =
                    event.target.value;

                applyFilters();

            }
        );

    }


    /* RESET */

    if (DOM.reset) {

        DOM.reset.addEventListener(
            "click",
            resetFilters
        );

    }
   /* CLEAR SEARCH */

    if (DOM.clearSearch) {

        DOM.clearSearch.addEventListener(
            "click",
            () => {

                if (DOM.search) {

                    DOM.search.value = "";

                }

                AppState.searchText =
                    "";

                applyFilters();

            }
        );

    }


    /* NEAR ME */

    if (DOM.nearMe) {

        DOM.nearMe.addEventListener(
            "click",
            findNearestBranches
        );

    }


    /* GRID VIEW */

    if (DOM.gridView) {

        DOM.gridView.addEventListener(
            "click",
            () =>
                setView("grid")
        );

    }


    /* LIST VIEW */

    if (DOM.listView) {

        DOM.listView.addEventListener(
            "click",
            () =>
                setView("list")
        );

    }


    /* PAGINATION */

    if (DOM.pagination) {

        DOM.pagination.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-page]"
                    );

                if (!button) return;

                changePage(
                    button.dataset.page
                );

            }
        );

    }


    /* MOBILE FILTER */

    if (
        DOM.mobileFilter &&
        DOM.filterPanel
    ) {

        DOM.mobileFilter.addEventListener(
            "click",
            () => {

                DOM.filterPanel.classList.toggle(
                    "open"
                );

            }
        );

    }


    /* ESCAPE KEY */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                DOM.filterPanel
            ) {

                DOM.filterPanel.classList.remove(
                    "open"
                );

            }

        }
    );

}

/* =========================================================
   ANIMATION
   ========================================================= */

function animateCards() {

    const cards =
        document.querySelectorAll(
            ".branch-card"
        );

    cards.forEach(
        (card, index) => {

            card.style.opacity = "0";

            card.style.transform =
                "translateY(15px)";

            setTimeout(
                () => {

                    card.style.transition =
                        "opacity .35s ease, transform .35s ease";

                    card.style.opacity =
                        "1";

                    card.style.transform =
                        "translateY(0)";

                },
                index *
                CONFIG.ANIMATION_DELAY
            );

        }
    );

}


/* =========================================================
   SCROLL
   ========================================================= */

function scrollToResults() {

    if (!DOM.results) return;

    const top =
        DOM.results.getBoundingClientRect()
            .top +
        window.scrollY -
        100;

    window.scrollTo({

        top,

        behavior: "smooth"

    });

}


/* =========================================================
   LOADING
   ========================================================= */

function showLoading(show) {

    AppState.isLoading =
        show;

    if (!DOM.loading) return;

    DOM.loading.style.display =
        show
            ? "flex"
            : "none";

}


/* =========================================================
   ERROR
   ========================================================= */

function showError(message) {

    if (!DOM.results) return;

    DOM.results.innerHTML = `

        <div class="branch-error">

            <div class="error-icon">
                ⚠️
            </div>

            <h3>
                Something went wrong
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

            <button
                onclick="location.reload()"
            >
                Try Again
            </button>

        </div>

    `;

}
/* =========================================================
   NOTIFICATION
   ========================================================= */

function showNotification(message) {

    let notification =
        document.querySelector(
            "#branchNotification"
        );

    if (!notification) {

        notification =
            document.createElement(
                "div"
            );

        notification.id =
            "branchNotification";

        notification.className =
            "branch-notification";

        document.body.appendChild(
            notification
        );

    }

    notification.textContent =
        message;

    notification.classList.add(
        "show"
    );

    clearTimeout(
        notification._timer
    );

    notification._timer =
        setTimeout(
            () => {

                notification.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =========================================================
   PUBLIC SEARCH API
   ========================================================= */

window.BluechipLocator = {

    search(query) {

        AppState.searchText =
            query || "";

        if (DOM.search) {

            DOM.search.value =
                AppState.searchText;

        }

        applyFilters();

    },


    filterState(state) {

        AppState.selectedState =
            state || "";

        if (DOM.state) {

            DOM.state.value =
                AppState.selectedState;

        }

        populateCityFilter();

        applyFilters();

    },


    filterCity(city) {

        AppState.selectedCity =
            city || "";

        if (DOM.city) {

            DOM.city.value =
                AppState.selectedCity;

        }

        applyFilters();

    },


    reset() {

        resetFilters();

    },


    nearMe() {

        findNearestBranches();

    },


    setView(view) {

        setView(view);

    },


    getAllBranches() {

        return [
            ...AppState.branches
        ];

    },


    getFilteredBranches() {

        return [
            ...AppState.filteredBranches
        ];

    },


    getStates() {

        return [
            ...AppState.states
        ];

    }

};


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /* Ctrl + K */

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            if (DOM.search) {

                DOM.search.focus();

            }

        }


        /* "/" */

        if (
            event.key === "/" &&
            document.activeElement.tagName !==
                "INPUT" &&
            document.activeElement.tagName !==
                "TEXTAREA"
        ) {

            event.preventDefault();

            if (DOM.search) {

                DOM.search.focus();
               }

        }

    }
);

/* =========================================================
   AUTO CLOSE MOBILE FILTER
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            !DOM.filterPanel ||
            !DOM.mobileFilter
        ) {

            return;

        }

        if (
            !DOM.filterPanel.contains(
                event.target
            ) &&
            !DOM.mobileFilter.contains(
                event.target
            )
        ) {

            DOM.filterPanel.classList.remove(
                "open"
            );

        }

    }
);


/* =========================================================
   HANDLE BROWSER BACK/FORWARD
   ========================================================= */

window.addEventListener(
    "popstate",
    () => {

        const params =
            new URLSearchParams(
                window.location.search
            );

        AppState.searchText =
            params.get("search") || "";

        AppState.selectedState =
            params.get("state") || "";

        AppState.selectedCity =
            params.get("city") || "";

        if (DOM.search) {

            DOM.search.value =
                AppState.searchText;

        }

        if (DOM.state) {

            DOM.state.value =
                AppState.selectedState;

        }

        populateCityFilter();

        if (DOM.city) {

            DOM.city.value =
                AppState.selectedCity;

        }

        applyFilters();

    }
);


/* =========================================================
   URL FILTER SUPPORT
   ========================================================= */

function updateURL() {

    if (!window.history) return;

    const params =
        new URLSearchParams();

    if (AppState.searchText) {

        params.set(
            "search",
            AppState.searchText
        );

    }

    if (AppState.selectedState) {

        params.set(
            "state",
            AppState.selectedState
        );

    }

    if (AppState.selectedCity) {

        params.set(
            "city",
            AppState.selectedCity
        );

    }

    const query =
        params.toString();

    const url =
        query
            ? `${location.pathname}?${query}`
            : location.pathname;

    history.replaceState(
        {},
        "",
        url
    );

}
/* =========================================================
   OVERRIDE APPLY FILTERS
   ========================================================= */

const originalApplyFilters =
    applyFilters;

applyFilters = function () {

    originalApplyFilters();

    updateURL();

};


/* =========================================================
   EXPORT
   ========================================================= */

window.BluechipBranchLocator = {

    version: "1.0.0",

    state: AppState,

    config: CONFIG,

    search:
        window.BluechipLocator.search,

    reset:
        window.BluechipLocator.reset,

    nearMe:
        window.BluechipLocator.nearMe

};


/* =========================================================
   END
   ========================================================= */
