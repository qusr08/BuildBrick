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

const BRICK_PLACE_HEIGHT = BRICK_HEIGHT * 1.5;

const WORLD_SIZE = 24;
const WORLD_MIN = -(WORLD_SIZE * STUD_SPACING / 2) + STUD_SPACING;
const WORLD_MAX = (WORLD_SIZE * STUD_SPACING / 2) - STUD_SPACING

let scene, camera, renderer, controls;
let bricks = [];
let currentBrick;

window.onload = function (event) {
    // Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    scene = new THREE.Scene();

    // Add camera and controls
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 8, 10);
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Add lights
    let ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.3);
    let directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(1, 1, 2);
    scene.add(directionalLight, ambientLight);

    // Create baseplate
    createBrick(0, -BRICK_HEIGHT_FLAT, 0, WORLD_SIZE, WORLD_SIZE, BRICK_HEIGHT_FLAT, BRICK_COLORS[0]);

    // Create the brick that will move with player input
    currentBrick = createBrick(0, BRICK_PLACE_HEIGHT, 0, 2, 2, BRICK_HEIGHT, BRICK_COLORS[9]);

    // Update the scene
    update();
}

window.onresize = function (event) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

window.onkeydown = function (event) {
    // console.log(event.keyCode);
    switch (event.keyCode) {
        case 87: // W
        case 38: // Up
            currentBrick.position.x = clamp(currentBrick.position.x - STUD_SPACING, WORLD_MIN, WORLD_MAX);
            break;
        case 65: // A
        case 37: // Left
            currentBrick.position.z = clamp(currentBrick.position.z + STUD_SPACING, WORLD_MIN, WORLD_MAX);
            break;
        case 83: // S
        case 40: // Down
            currentBrick.position.x = clamp(currentBrick.position.x + STUD_SPACING, WORLD_MIN, WORLD_MAX);
            break;
        case 68: // D
        case 39: // Right
            currentBrick.position.z = clamp(currentBrick.position.z - STUD_SPACING, WORLD_MIN, WORLD_MAX);
            break;
        case 32: // Space
            break;
        case 13: // Enter
            break;
    }
}

window.onkeyup = function (event) { }

function update() {
    requestAnimationFrame(update);

    readSerial();

    controls.update();
    renderer.render(scene, camera);
}

function createBrick(x, y, z, studWidth = 2, studDepth = 2, brickHeight = BRICK_HEIGHT, color) {
    // Create group
    let brickGroup = new THREE.Group();

    // Create cube base
    let cube = new THREE.Mesh(
        new THREE.BoxGeometry(studWidth / 2, brickHeight, studDepth / 2),
        new THREE.MeshStandardMaterial({ color: color })
    );
    cube.position.set(0, brickHeight / 2, 0);
    brickGroup.add(cube);

    // Create studs
    for (let studX = -studWidth / 2; studX < studWidth / 2; studX++) {
        for (let studZ = -studDepth / 2; studZ < studDepth / 2; studZ++) {
            let stud = new THREE.Mesh(
                new THREE.CylinderGeometry(STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 20),
                new THREE.MeshStandardMaterial({ color: color })
            );
            stud.position.set((studX * STUD_SPACING) + (STUD_SPACING / 2), brickHeight + (STUD_HEIGHT / 2), (studZ * STUD_SPACING) + (STUD_SPACING / 2));
            brickGroup.add(stud);
        }
    }

    // Move all pieces of the brick
    brickGroup.position.set(x, y, z);

    // Add the entire brick to the scene
    scene.add(brickGroup);

    return brickGroup;
}

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}