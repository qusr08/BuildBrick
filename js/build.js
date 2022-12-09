'use strict';

// https://threejs.org/
// https://cdn.jsdelivr.net/npm/three@0.147.0/examples/

// Lego Dimensions: https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Lego_dimensions.svg/512px-Lego_dimensions.svg.png
// Lego Colors: https://blogger.googleusercontent.com/img/a/AVvXsEi3sgDAZB13_deW0ESXjHMxgF94pYCGwNxTVYcBhSbrVKmpXCwAyZkaVgFJGyLb6gqKVcN28YCdIedvKU-0kWvQyf6L7eTuriMMiXFEYDdbL-jCEgyFNQMO0IRqjQdwgtatvMEUVvDUTlyMM9QfQQYDDoRDYr8P2QbixiidT0Ac4fZkqJjewL5OcY3FUA=s1600
// 1 unit = 16mm
const BRICK_HEIGHT = 0.6; // 9.6mm
const BRICK_HEIGHT_FLAT = 0.2; // 3.2mm
const STUD_HEIGHT = 0.10625; // 1.7mm
const STUD_RADIUS = 0.15625; // 2.5mm
const STUD_SPACING = 0.5; // 8mm

let scene, camera, renderer, controls;
let bricks = [];

window.onload = function(event) {
    // Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    scene = new THREE.Scene();

    // Add camera and controls
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Add lights
    let ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.3);
    let directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(1, 1, 2);
    scene.add(directionalLight, ambientLight);

    // Create baseplate
    createBrick(0, 0, 0, 24, 24, BRICK_HEIGHT_FLAT, 0xFF0000);

    // Update the scene
    update();
}

window.onresize = function(event) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function update() {
    requestAnimationFrame(update);

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

    brickGroup.position.set(x, y, z);

    scene.add(brickGroup);
}