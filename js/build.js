'use strict';

// https://threejs.org/
// https://cdn.jsdelivr.net/npm/three@0.147.0/examples/

// Lego Dimensions: https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Lego_dimensions.svg/512px-Lego_dimensions.svg.png
// 1 unit = 16mm
const BRICK_HEIGHT = 0.6; // 9.6mm
const BRICK_HEIGHT_FLAT = 0.2; // 3.2mm
const STUD_HEIGHT = 0.10625; // 1.7mm
const STUD_RADIUS = 0.15625; // 2.5mm
const STUD_SPACING = 0.5; // 8mm

// Lego Colors: https://blogger.googleusercontent.com/img/a/AVvXsEi3sgDAZB13_deW0ESXjHMxgF94pYCGwNxTVYcBhSbrVKmpXCwAyZkaVgFJGyLb6gqKVcN28YCdIedvKU-0kWvQyf6L7eTuriMMiXFEYDdbL-jCEgyFNQMO0IRqjQdwgtatvMEUVvDUTlyMM9QfQQYDDoRDYr8P2QbixiidT0Ac4fZkqJjewL5OcY3FUA=s1600
const BRICK_COLORS = [
    0xFFFFFF,
    0x151515,
    0xA0A19F,
    0x9675B4,
    0x006CB7,
    0x00A3DA,
    0x009247,
    0x00A8AF,
    0xF7D112,
    0xF57D20,
    0xA65322,
    0xE51E26,
    0xE95DA2
];

const WORLD_SIZE = 24;
const WORLD_MIN = -(WORLD_SIZE * STUD_SPACING / 2) + STUD_SPACING;
const WORLD_MAX = (WORLD_SIZE * STUD_SPACING / 2) - STUD_SPACING

let scene, camera, renderer, controls;
let brickTerrain = [];
let activeBrick = undefined;
let activeBrickColor = 9;

window.onload = function(event) {
    // Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    scene = new THREE.Scene();

    // Add camera and controls
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(WORLD_SIZE / 2, 8, 0);
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Add lights
    let ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.3);
    let directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(1, 1, 2);
    scene.add(directionalLight, ambientLight);

    // Create world baseplate
    createBrick(0, -BRICK_HEIGHT_FLAT, 0, WORLD_SIZE, WORLD_SIZE, true, { color: BRICK_COLORS[0] });

    // Load brick terrain
    // [x][z][y]
    for (let x = 0; x < WORLD_SIZE; x++) {
        brickTerrain.push([]);
        for (let z = 0; z < WORLD_SIZE; z++) {
            brickTerrain[x].push([]);
        }
    }

    // Create the brick that will move with player input
    activeBrick = createBrick(WORLD_MAX, 0, WORLD_MAX, 2, 2, false, { color: BRICK_COLORS[activeBrickColor], transparent: true, opacity: 0.5 });

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
            break;
    }
}

window.onkeyup = function(event) {}

function update() {
    requestAnimationFrame(update);

    readSerial();

    // controls.update();
    renderer.render(scene, camera);
}

function createBrick(x, y, z, studWidth = 2, studDepth = 2, isFlat = false, meshOptions = {}) {
    // Clamp position
    x = clamp(x, WORLD_MIN, WORLD_MAX);
    y = clamp(y, WORLD_MIN, WORLD_MAX);
    z = clamp(z, WORLD_MIN, WORLD_MAX);

    // Create group
    let brickGroup = new THREE.Group();
    let width = studWidth / 2;
    let height = (isFlat ? BRICK_HEIGHT_FLAT : BRICK_HEIGHT);
    let depth = studDepth / 2;

    // Create cube base
    let cube = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshStandardMaterial(meshOptions)
    );
    cube.position.set(0, height / 2, 0);
    brickGroup.add(cube);

    // Create studs
    for (let studX = -width; studX < width; studX++) {
        for (let studZ = -depth; studZ < depth; studZ++) {
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

function moveActiveBrick(moveX, moveY, moveZ) {
    activeBrick.position.x = clamp(activeBrick.position.x + (moveX * STUD_SPACING), WORLD_MIN, WORLD_MAX);
    activeBrick.position.y = clamp(activeBrick.position.y + (moveY * BRICK_HEIGHT), 0, 100);
    activeBrick.position.z = clamp(activeBrick.position.z + (moveZ * STUD_SPACING), WORLD_MIN, WORLD_MAX);
}

function placeActiveBrick() {
    let x = activeBrick.position.x;
    let y = activeBrick.position.y;
    let z = activeBrick.position.z;

    let indexZ = (z * 2) + (WORLD_SIZE / 2);
    let indexX = (x * 2) + (WORLD_SIZE / 2);

    // console.log(activeBrick.position);
    // console.log(indexX + ", " + indexZ);

    brickTerrain[indexX][indexZ].push(createBrick(x, y, z, 2, 2, false, { color: BRICK_COLORS[activeBrickColor] }));
}

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}