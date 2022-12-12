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

// https://stackoverflow.com/questions/9419263/how-to-play-audio
// https://freesound.org/people/rioforce/packs/14369/?page=2#sound
const SFX_MOVE = new Audio('/sfx/move.wav');
const SFX_PLACE = new Audio('/sfx/place.wav');
const SFX_SWITCH = new Audio('/sfx/switch.wav');
const SFX_UNDO = new Audio('/sfx/undo.wav');

let scene, camera, renderer, controls;
let brickTerrain = [];
let brickPlaceOrder = [];
let activeBrick = undefined;
let activeBrickColor = 0;

window.onload = function(event) {
    // Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x424242, 1);
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
    controls.minDistance = WORLD_SIZE * 0.5;
    controls.maxDistance = WORLD_SIZE * 1.5;
    controls.enableDamping = true;
    controls.enablePan = false;
    // controls.autoRotate = true;

    // Add lights
    let ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.3);
    let directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(1, 1, 2);
    scene.add(directionalLight, ambientLight);

    // Create world baseplate
    createBrick({ x: WORLD_SIZE / 2, y: -BRICK_HEIGHT_FLAT, z: WORLD_SIZE / 2 }, WORLD_SIZE, WORLD_SIZE, true, { color: BRICK_COLORS[0] });

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
    activeBrick = createBrick({ x: WORLD_MAX, y: 0, z: WORLD_MAX }, ACTIVE_BRICK_SIZE, ACTIVE_BRICK_SIZE, false, { color: 0xFFFFFF, transparent: true, opacity: ACTIVE_BRICK_ALPHA });
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
            moveActiveBrick(-1, 0, 0, true);
            break;
        case 65: // A
        case 37: // Left
            moveActiveBrick(0, 0, 1, true);
            break;
        case 83: // S
        case 40: // Down
            moveActiveBrick(1, 0, 0, true);
            break;
        case 68: // D
        case 39: // Right
            moveActiveBrick(0, 0, -1, true);
            break;
        case 32: // Space
            placeBrick(activeBrick.position);
            break;
        case 13: // Enter
            setActiveBrickColor((activeBrickColor + 1) % BRICK_COLORS.length);
            break;
        case 85: // U
            undoBrick();
            break;
    }
}

function update() {
    requestAnimationFrame(update);

    readSerial();

    controls.update();
    renderer.render(scene, camera);
}

function createBrick(position, width = 2, depth = 2, isFlat = false, meshOptions = {}) {
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
    brickGroup.position.set(position.x, position.y, position.z);

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

            brickTerrain[x][z][y] = createBrick(x, y * BRICK_HEIGHT, z, ACTIVE_BRICK_SIZE, ACTIVE_BRICK_SIZE, false, { color: color });
        } catch {
            console.error("Corrupt terrain data!");
        }
    });

    updateActiveBrick();
}

function moveActiveBrick(moveX, moveY, moveZ, playSound) {
    activeBrick.position.x = clamp(activeBrick.position.x + (moveX * STUD_SPACING), WORLD_MIN, WORLD_MAX);
    activeBrick.position.y = clamp(activeBrick.position.y + (moveY * BRICK_HEIGHT), 0, WORLD_SIZE * BRICK_HEIGHT);
    activeBrick.position.z = clamp(activeBrick.position.z + (moveZ * STUD_SPACING), WORLD_MIN, WORLD_MAX);

    if (playSound) {
        SFX_MOVE.currentTime = 0;
        SFX_MOVE.play();
    }

    updateActiveBrick();
}

function updateActiveBrick() {
    let position = activeBrick.position;

    // Update the position of the active brick to always stay visible
    if (checkForIntersectingBrickAt(position)) {
        // If the brick is intersecting with a block, move upwards
        moveActiveBrick(0, 1, 0, false);
    } else if (!checkForIntersectingBrickAt({ x: position.x, y: position.y - BRICK_HEIGHT, z: position.z })) {
        // If the brick is floating in midair, move downwards
        moveActiveBrick(0, -1, 0, false);
    }
}

function placeBrick(position) {
    // If y is at the top of the world, then do not place a brick
    if (indexY(position.y) == WORLD_SIZE) {
        return;
    }

    brickTerrain[position.x][position.z][indexY(position.y)] = createBrick(position, ACTIVE_BRICK_SIZE, ACTIVE_BRICK_SIZE, false, { color: BRICK_COLORS[activeBrickColor] });
    brickPlaceOrder.push({ x: position.x, y: position.y, z: position.z });

    SFX_PLACE.currentTime = 0;
    SFX_PLACE.play();

    updateActiveBrick();
}

function undoBrick() {
    // If there is nothing to undo, do not try and undo the place
    if (brickPlaceOrder.length == 0) {
        return;
    }

    // Get the coordinates of the previous block
    let prevPosition = brickPlaceOrder.pop();

    // Remove the brick from the scene
    scene.remove(brickTerrain[prevPosition.x][prevPosition.z][indexY(prevPosition.y)]);
    brickTerrain[prevPosition.x][prevPosition.z][indexY(prevPosition.y)] = undefined;

    SFX_UNDO.currentTime = 0;
    SFX_UNDO.play();

    updateActiveBrick();
}

function setActiveBrickColor(colorIndex) {
    activeBrickColor = colorIndex;
    activeBrick.children.forEach(brickPart => {
        brickPart.material.color.set(BRICK_COLORS[activeBrickColor]);
    });

    SFX_SWITCH.currentTime = 0;
    SFX_SWITCH.play();
}

function checkForIntersectingBrickAt(position) {
    return (
        checkForBrickAt({ x: position.x + STUD_SPACING, y: position.y, z: position.z - STUD_SPACING }) ||
        checkForBrickAt({ x: position.x + STUD_SPACING, y: position.y, z: position.z }) ||
        checkForBrickAt({ x: position.x + STUD_SPACING, y: position.y, z: position.z + STUD_SPACING }) ||
        checkForBrickAt({ x: position.x, y: position.y, z: position.z - STUD_SPACING }) ||
        checkForBrickAt({ x: position.x, y: position.y, z: position.z }) ||
        checkForBrickAt({ x: position.x, y: position.y, z: position.z + STUD_SPACING }) ||
        checkForBrickAt({ x: position.x - STUD_SPACING, y: position.y, z: position.z - STUD_SPACING }) ||
        checkForBrickAt({ x: position.x - STUD_SPACING, y: position.y, z: position.z }) ||
        checkForBrickAt({ x: position.x - STUD_SPACING, y: position.y, z: position.z + STUD_SPACING })
    );
}

function checkForBrickAt(position) {
    // If the check is out of bounds on the x or z axis, then there is no block there
    if (!inXBounds(position.x) || !inZBounds(position.z)) {
        return false;
    }

    // Since the ground should act as a block, this should also return true if the y value is less than 0
    if (indexY(position.y) < 0) {
        return true;
    }

    // If the block at that position is undefined, then there is no block at the position
    if (brickTerrain[position.x][position.z][indexY(position.y)] == undefined) {
        return false;
    }

    // Return true if all of the previous checks fail
    // This means that there is a brick at the specified position
    return true;
}

function inXBounds(x) {
    return (x >= WORLD_MIN && x <= WORLD_MAX);
}

function inZBounds(z) {
    return (z >= WORLD_MIN && z <= WORLD_MAX);
}

function inYBounds(y) {
    return (y >= 0 && y <= WORLD_SIZE * BRICK_HEIGHT);
}

function indexY(y) {
    return Math.round(y / BRICK_HEIGHT);
}

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}