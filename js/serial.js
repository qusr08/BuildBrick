'use strict';

// Example code: https://stackoverflow.com/questions/30114474/communicate-with-the-serial-port-from-client-web-browser
// Start and end characters: https://stackoverflow.com/questions/54921049/reading-from-serial-port-gives-split-up-string

class SerialController {
    constructor() {
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();

        this.initialized = false;
        this.reading = false;
    }

    async init() {
        if ('serial' in navigator) {
            try {
                let port = await navigator.serial.requestPort();
                await port.open({ baudRate: 9600 });
                this.reader = port.readable.getReader();
                let signals = await port.getSignals();

                this.initialized = true;
                connectElement.style.visibility = 'hidden';
                statusElement.innerHTML = 'CONNECTED';
                statusElement.style.backgroundColor = 'green';
            } catch (err) {
                console.error('There was an error opening the serial port:', err);
            }
        } else {
            console.error('Web serial doesn\'t seem to be enabled in your browser. Try enabling it by visiting:');
            console.error('chrome://flags/#enable-experimental-web-platform-features');
            console.error('opera://flags/#enable-experimental-web-platform-features');
            console.error('edge://flags/#enable-experimental-web-platform-features');
        }
    }

    async read() {
        this.reading = true;

        // Input should be in the form:
        // 1111222234
        // 1, 2: poteniometer values
        // 3, 4: button values

        try {
            let output = "";

            // Make sure the output includes the entire data string
            do {
                let rawData = await this.reader.read();
                output += this.decoder.decode(rawData.value);
            } while (output.indexOf("\r\n") < 0);

            this.reading = false;
            return output;
        } catch (err) {
            let errorMessage = `error reading data: ${err}`;
            console.error(errorMessage);

            this.reading = false;
            return errorMessage;
        }
    }
}

let serialController = new SerialController();

let statusElement = document.getElementById('status');
let saveElement = document.getElementById('save');
saveElement.addEventListener('pointerdown', () => {});
let connectElement = document.getElementById('connect');
connectElement.addEventListener('pointerdown', () => { serialController.init(); });

async function readSerial() {
    // Make sure the serial controller is initialized and not currently reading data before reading new data
    if (serialController.initialized && !serialController.reading) {
        console.log(await serialController.read());
    }
}