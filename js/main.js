const STATUS_ELEMENT = document.getElementById('status');

const SAVE_ELEMENT = document.getElementById('save');
SAVE_ELEMENT.addEventListener('pointerdown', () => { saveBrickTerrain(); });

const CONNECT_ELEMENT = document.getElementById('connect');
CONNECT_ELEMENT.addEventListener('pointerdown', () => { SERIAL_CONTROLLER.init(); });