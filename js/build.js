'use strict';

// https://threejs.org/
// https://cdn.jsdelivr.net/npm/three@0.147.0/examples/

// Lego Dimensions: https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Lego_dimensions.svg/512px-Lego_dimensions.svg.png
// 1 unit = 16mm
const BRICK_HEIGHT = 0.6 * 2; // 9.6mm * 2
const BRICK_HEIGHT_FLAT = 0.2 * 2; // 3.2mm * 2
const STUD_HEIGHT = 0.10625 * 2; // 1.7mm * 2
const STUD_RADIUS = 0.15625 * 2; // 2.5mm * 2
const STUD_SPACING = 0.5 * 2; // 8mm * 2

// Lego Colors: https://blogger.googleusercontent.com/img/a/AVvXsEi3sgDAZB13_deW0ESXjHMxgF94pYCGwNxTVYcBhSbrVKmpXCwAyZkaVgFJGyLb6gqKVcN28YCdIedvKU-0kWvQyf6L7eTuriMMiXFEYDdbL-jCEgyFNQMO0IRqjQdwgtatvMEUVvDUTlyMM9QfQQYDDoRDYr8P2QbixiidT0Ac4fZkqJjewL5OcY3FUA=s1600
const BRICK_COLORS = [0xFFFFFF, 0x151515, 0xA0A19F, 0x9675B4, 0x006CB7, 0x00A3DA, 0x009247, 0x00A8AF, 0xF7D112, 0xF57D20, 0xA65322, 0xE51E26, 0xE95DA2];

const ACTIVE_BRICK_ALPHA = 0.65;
const ACTIVE_BRICK_SIZE = 2;

const WORLD_SIZE = 24;
const WORLD_MIN = STUD_SPACING;
const WORLD_MAX = WORLD_SIZE - STUD_SPACING;

// https://www.sitepoint.com/get-url-parameters-with-javascript/
const URL_PARAMS = new URLSearchParams(window.location.search);
const CHARS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

let scene, camera, renderer, controls;
let brickTerrain = [];
let activeBrick = undefined;
let activeBrickColor = 0;

window.onload = function(event) {
    // Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    scene = new THREE.Scene();

    // Add camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(WORLD_SIZE * 3 / 2, WORLD_SIZE, WORLD_SIZE / 2);

    // Add controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(WORLD_SIZE / 2, 0, WORLD_SIZE / 2);
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = 3.14 / 2; // Two pi
    controls.enableDamping = true;
    controls.enablePan = false;
    // controls.autoRotate = true;

    // Add lights
    let ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.3);
    let directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(1, 1, 2);
    scene.add(directionalLight, ambientLight);

    // Create world baseplate
    createBrick(WORLD_SIZE / 2, -BRICK_HEIGHT_FLAT, WORLD_SIZE / 2, WORLD_SIZE, WORLD_SIZE, true, { color: BRICK_COLORS[0] });

    // Create brick terrain array
    // [x][z][y]
    for (let x = 0; x < WORLD_SIZE; x++) {
        brickTerrain.push([]);
        for (let z = 0; z < WORLD_SIZE; z++) {
            brickTerrain[x].push([]);
            for (let y = 0; y < WORLD_SIZE; y++) {
                brickTerrain[x][z].push(undefined);
            }
        }
    }

    // Create the brick that will move with player input
    activeBrick = createBrick(WORLD_MAX, 0, WORLD_MAX, ACTIVE_BRICK_SIZE, ACTIVE_BRICK_SIZE, false, { color: 0xFFFFFF, transparent: true, opacity: ACTIVE_BRICK_ALPHA });
    // Set the color to orange to start
    setActiveBrickColor(9);

    // Load brick terrain from URL
    loadBrickTerrain();

    // Update the scene
    update();
}

window.onresize = function(event) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

window.onkeydown = function(event) {
    switch (event.keyCode) {
        case 87: // W
        case 38: // Up
            moveActiveBrick(-1, 0, 0);
            break;
        case 65: // A
        case 37: // Left
            moveActiveBrick(0, 0, 1);
            break;
        case 83: // S
        case 40: // Down
            moveActiveBrick(1, 0, 0);
            break;
        case 68: // D
        case 39: // Right
            moveActiveBrick(0, 0, -1);
            break;
        case 32: // Space
            placeActiveBrick();
            break;
        case 13: // Enter
            setActiveBrickColor((activeBrickColor + 1) % BRICK_COLORS.length);
            break;
    }
}

function update() {
    requestAnimationFrame(update);

    readSerial();

    controls.update();
    renderer.render(scene, camera);
}

function createBrick(x, y, z, width = 2, depth = 2, isFlat = false, meshOptions = {}) {
    // Create group
    let brickGroup = new THREE.Group();
    let height = (isFlat ? BRICK_HEIGHT_FLAT : BRICK_HEIGHT);

    // Create cube base
    let cube = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshStandardMaterial(meshOptions)
    );
    cube.position.set(0, height / 2, 0);
    brickGroup.add(cube);

    // Create studs
    for (let studX = -width / 2; studX < width / 2; studX++) {
        for (let studZ = -depth / 2; studZ < depth / 2; studZ++) {
            let stud = new THREE.Mesh(
                new THREE.CylinderGeometry(STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 20),
                new THREE.MeshStandardMaterial(meshOptions)
            );
            stud.position.set((studX * STUD_SPACING) + (STUD_SPACING / 2), height + (STUD_HEIGHT / 2), (studZ * STUD_SPACING) + (STUD_SPACING / 2));
            brickGroup.add(stud);
        }
    }

    // Move all pieces of the brick
    brickGroup.position.set(x, y, z);

    // Add the entire brick to the scene
    scene.add(brickGroup);

    return brickGroup;
}

function saveBrickTerrain() {
    let saveData = "";

    for (let x = 0; x < WORLD_SIZE; x++) {
        for (let z = 0; z < WORLD_SIZE; z++) {
            for (let y = 0; y < WORLD_SIZE; y++) {
                if (brickTerrain[x][z][y] != undefined) {
                    let xString = CHARS[x];
                    let yString = CHARS[y];
                    let zString = CHARS[z];
                    let colorString = CHARS[BRICK_COLORS.indexOf(brickTerrain[x][z][y].children[0].material.color.getHex())];
                    saveData += xString + yString + zString + colorString;
                }
            }
        }
    }

    URL_PARAMS.set("terrain", saveData);
    window.location.search = URL_PARAMS;
}

function loadBrickTerrain() {
    // If there is no terrain parameter, there is nothing to load
    if (!URL_PARAMS.has("terrain")) {
        return;
    }

    // Split up the terrain parameter
    // https://codingbeautydev.com/blog/javascript-split-string-every-n-characters/#:~:text=To%20split%20a%20string%20every%20N%20characters%20in%20JavaScript%2C%20call,that%20each%20has%20N%20characters.
    let loadData = URL_PARAMS.get("terrain").match(/.{1,4}/g);
    // If there is no brick data to split up, there is nothing to load
    if (loadData == undefined || loadData.length == 0) {
        return;
    }

    loadData.forEach(item => {
        let itemData = item.match(/.{1,1}/g);

        try {
            let x = CHARS.indexOf(itemData[0]);
            let y = CHARS.indexOf(itemData[1]);
            let z = CHARS.indexOf(itemData[2]);
            let color = BRICK_COLORS[CHARS.indexOf(itemData[3])];

            brickTerrain[x][z][y] = createBrick(x, y, z, ACTIVE_BRICK_SIZE, ACTIVE_BRICK_SIZE, false, { color: color });
        } catch {
            console.error("Corrupt terrain data!");
        }
    });

    updateActiveBrick();
}

function moveActiveBrick(moveX, moveY, moveZ) {
    activeBrick.position.x = clamp(activeBrick.position.x + (moveX * STUD_SPACING), WORLD_MIN, WORLD_MAX);
    activeBrick.position.y = clamp(activeBrick.position.y + (moveY * BRICK_HEIGHT), 0, WORLD_SIZE * BRICK_HEIGHT);
    activeBrick.position.z = clamp(activeBrick.position.z + (moveZ * STUD_SPACING), WORLD_MIN, WORLD_MAX);

    updateActiveBrick();
}

function updateActiveBrick() {
    let x = activeBrick.position.x;
    let y = activeBrick.position.y;
    let z = activeBrick.position.z;

    // Update the position of the active brick to always stay visible
    if (checkForSurroundingBricksAt(x, y, z)) {
        // If the brick is intersecting with a block, move upwards
        moveActiveBrick(0, 1, 0);
    } else if (!checkForSurroundingBricksAt(x, y - BRICK_HEIGHT, z)) {
        // If the brick is floating in midair, move downwards
        moveActiveBrick(0, -1, 0);
    }
}

function placeActiveBrick() {
    let x = activeBrick.position.x;
    let y = activeBrick.position.y;
    let z = activeBrick.position.z;

    // If y is at the top of the world, then do not place a brick
    if (indexY(y) == WORLD_SIZE) {
        return;
    }

    brickTerrain[x][z][indexY(y)] = createBrick(x, y, z, ACTIVE_BRICK_SIZE, ACTIVE_BRICK_SIZE, false, { color: BRICK_COLORS[activeBrickColor] });

    updateActiveBrick();
}

function setActiveBrickColor(colorIndex) {
    activeBrickColor = colorIndex;
    activeBrick.children.forEach(brickPart => {
        brickPart.material.color.set(BRICK_COLORS[activeBrickColor]);
    });
}

// Returns true if there are bricks surrounding the position
function checkForSurroundingBricksAt(x, y, z) {
    return (
        checkForBrickAt(x + STUD_SPACING, y, z - STUD_SPACING) || checkForBrickAt(x + STUD_SPACING, y, z) || checkForBrickAt(x + STUD_SPACING, y, z + STUD_SPACING) ||
        checkForBrickAt(x, y, z - STUD_SPACING) || checkForBrickAt(x, y, z) || checkForBrickAt(x, y, z + STUD_SPACING) ||
        checkForBrickAt(x - STUD_SPACING, y, z - STUD_SPACING) || checkForBrickAt(x - STUD_SPACING, y, z) || checkForBrickAt(x - STUD_SPACING, y, z + STUD_SPACING)
    );
}

// Returns true if there is a brick at the position
function checkForBrickAt(x, y, z) {
    // If the check is out of bounds on the x or z axis, then there is no block there
    if (x < WORLD_MIN || x > WORLD_MAX || z < WORLD_MIN || z > WORLD_MAX) {
        return false;
    }

    // Since the ground should act as a block, this should also return true if the y value is less than 0
    if (y < 0) {
        return true;
    }

    // If the block at that position is undefined, then there is no block at the position
    if (brickTerrain[x][z][indexY(y)] == undefined) {
        return false;
    }

    // Return true if all of the previous checks fail
    return true;
}

function indexY(y) {
    return Math.round(y / BRICK_HEIGHT);
}

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}