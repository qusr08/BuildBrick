# BuildBrick

![Final BuildBrick](https://github.com/qusr08/BuildBrick/blob/main/media/buildbrick_image_4.jpg)
 
## Files
> [buildbrick.ino](https://github.com/qusr08/BuildBrick/blob/main/ino/buildbrick/buildbrick.ino): The Arduino file for controlling the BuildBrick

> [build.js](https://github.com/qusr08/BuildBrick/blob/main/js/build.js): The Javascript file responsible for running the Lego building sandbox

> [serial.js](https://github.com/qusr08/BuildBrick/blob/main/js/serial.js): The Javascript file responsible for connecting to the BuildBrick through a serial port

> [index.html](https://github.com/qusr08/BuildBrick/blob/main/index.html): The main HTML file for the website

## My Goal
> My goal for this project was to make a very meaningful interaction between my Arduino and my computer. Lego as my household object really dictated the theme of my project and made it easy to come up with most of the functionality for BuildBrick.

## Demo/Explanation Video
> [IGME-470 P3 Squawk Demo](https://www.youtube.com/watch?v=9kNOhgKtYPk): A video showing off and explaining what I was able to do for this project.

## How It's Done
> The purpose of the BuildBrick is to control a Lego building sandbox website that I made. Underneath the studs, there are two buttons and two potentiometers. The potentiometers control the x and y positions of the Lego brick on the website, and the buttons are used to place and change the color of the Lego brick. On the inside of the BuildBrick, there is a buzzer that gives auditory feedback to the controls as the user changes them. For the potentiometers, the pitch emitted by the buzzer goes up and down, giving a unique sound for each position on the board. Each button also plays a tone as well when they are pressed.

> For the website, the user presses the “CONNECT TO BUILDBRICK” button to access the serial port of the Arduino. This then allows the user to rotate or press the studs on the BuildBrick to build inside the website. Once the user has finished their build, they can share it by pressing the “SAVE BUILD” button. This saves all of the brick data to the URL of the website, meaning that the user can copy and paste the link and have another person pull up exactly what they have made.

> Try the website for yourself! Go to https://qusr08.github.io/BuildBrick/ and use the controls below:
> * WASD or arrow keys to move Lego brick position
> * Enter to cycle the color of the Lego brick
> * Space to place the Lego brick
> * U to undo any previous placements

## Circuit Schematic

## Challenges And Problems Encountered
> Going into the project, I knew how difficult the website was going to be to create. Making an entire building sandbox from scratch in Javascript was no easy task, and it took me a very long time to make. The biggest challenge I faced while developing the website was how to determine if the Lego brick the user controls should stack on top of it. The Lego brick that the user controls moves up and down based on collision with other Lego bricks in the world. This seems like nothing when said in a sentence like that, but it took forever to come up with a way to track brick data in three dimensions. Not to mention that each brick is two by two studs so using a regular three-dimensional array did not cut it. The idea that lead to me being able to solve this problem was to make the world positions of the Lego bricks and the indices in the data array to be the same, as converting between the two was making my code very long and hard to follow. Overall, I am very happy with how the website turned out, and I think its functionality is extremely great.

> One of the biggest challenges that I faced, and that was demonstrated in my video, was the sensors I have for my Arduino. I have used them for over 6 years and they finally decided to break on me for this project. The wiring of them inside the BuildBrick was very difficult and caused some of the sensors to break. I have had no experience with wiring something like this before, and I feel that my lack of knowledge bit me in the butt. I definitely over-scoped a little bit for this project, but in the end, I do not regret my decision to do this idea. I think this is one of the most interesting projects I have worked on, and will definitely be making a second, more refined version of the BuildBrick.

> I am very sorry that I could not make something satisfactory for this assignment. I know the physical prototype does not function exactly as it should, and I know how important that is for this class. I hope that the website or meaningful interaction I strived for will stay in your mind. The complex experience I tried to create didn’t end up working out as I would have liked, but I feel damn good about trying.

## Development Photos

![Development BuildBrick](https://github.com/qusr08/BuildBrick/blob/main/media/buildbrick_image_1.jpg)
![Development BuildBrick](https://github.com/qusr08/BuildBrick/blob/main/media/buildbrick_image_2.jpg)
![Development BuildBrick](https://github.com/qusr08/BuildBrick/blob/main/media/buildbrick_image_3.jpg)

## Resources
> [three.js](https://threejs.org/): Used to make the 3D models on the website

> [Tinkercad](https://www.tinkercad.com/): Used to make the 3D model of the BuildBrick
> 
> [Fritzing](https://fritzing.org/): Used for making the schematic of the circuit

> [Arduino Project Hub](https://create.arduino.cc/projecthub): Used to better understand the wiring of Arduino components

> Utilized the Construct at RIT to print the parts for the BuildBrick
