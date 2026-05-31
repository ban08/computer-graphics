# CG 2025/2026

## Group T11G03

## Final Project - Gamified Spring Prairie Landscape

### Introduction

<!-- Project introduction and context -->

This project was developed for the L.EIC027 Computer Graphics curricular unit of the Bachelor in Informatics and Computer Engineering at FEUP, during the 2025/2026 academic year.

The goal of this project is to build an interactive 3D scene using WebCGF, applying geometric modelling, hierarchical transformations, illumination, materials, textures, shaders, real-time user interaction, and animation, along with practicing cooperative software development.

### Scene Description and Features

<!-- Brief description of the scene and features implemented -->

Our scene is a spring prairie survival game where the player controls a covered light wagon and tries to survive for as long as possible. The wagon must collect hay bales scattered across the terrain and deliver them to the barn to recover health, while avoiding rocks and solid obstacles such as the barn and fence. Health points decrease over time, and the final score corresponds to the number of seconds survived.

The environment includes a large sky dome, an animated sun, procedural moving clouds, and procedurally generated terrain with rolling hills. The terrain also contains a wagon pathway, grass patches, flowers, rocks, and a boundary fence that delimits the playable area.

The main interactive entity is a hierarchical prairie schooner wagon with textured components, animated wheels, a steerable front axle, visible cargo bales, and imported mule models. The wagon supports acceleration, braking, steering, and a follow camera focused on gameplay.

The gameplay system includes randomly placed hay bales, animated pinpoint arrows, proximity-based bale visibility, pick-up and drop-down mechanics, barn delivery interaction, collision detection, damage feedback, health restoration, score tracking, and a game-over state with automatic restart.

### Usage Instructions

<!-- Instructions to run the project (dependencies, how to launch) -->

The project runs in a browser using WebCGF. Because browser security restrictions prevent local files from being loaded directly, the project should be launched through a local HTTP server.

The expected folder structure is:

```text
parent-folder/
├── lib/
└── project/
```

The local server must be started from the parent folder that contains both `project/` and `lib/`, not from inside `project/`, since the project expects the WebCGF library to be available through the sibling `lib/` path.

One possible way to launch the project is:

```bash
cd parent-folder
python3 -m http.server 8000
```

Then open the following URL in a browser:

```text
http://localhost:8000/project/
```

Recommended browser: Google Chrome or another modern browser with WebGL support.

### Keyboard Controls

<!-- Keyboard controls reference table -->

The keyboard controls needed for gameplay are the following:

| Key | Controls |
| --- | --- |
| `W` | Accelerate wagon |
| `S` | Brake wagon |
| `A` | Steer wagon left |
| `D` | Steer wagon right |
| `P` | Pick up hay bale |
| `L` | Drop down hay bale |

#### Additional Controls

Additionally, the following controls may also be relevant for gameplay/showcase:

| Action | Controls |
| --- | --- |
| DAT.gui camera selector | Switch between `Free Camera` and `Follow Wagon` |
| Left mouse drag | Rotate/orbit the free camera |
| Right mouse drag | Pan/translate the free camera |
| Mouse wheel | Zoom the free camera |

### Implemented Features

<!-- List of implemented features (indicating which bonus was chosen, if any) -->

The implemented features are listed following the same order as the scene elements described in the project specification. Features and advanced features may include additional implementation not required by the specification, but still described below.

#### Sky, Clouds, and Sun

* Implemented a large inverted half-sphere sky dome to create a panoramic prairie environment.
* Added a visible sun object to the scene.
* Configured the main scene light so that its direction follows the sun position.
* Added an animated cloud layer above the terrain.

**Advanced features:**

* Shader-based animated cloud layer.
* Additional shader-based sky and sun rendering.

#### Terrain Elevation

* Implemented a terrain surface with subtle rolling hills.
* Added smooth height variation across the terrain while keeping it suitable for wagon movement.
* Added terrain height sampling so objects can be placed correctly on top of the generated terrain.

**Advanced features:**

* Procedural terrain generation instead of a static heightmap.
* Terrain height sampling matched with the generated terrain mesh.

#### Ground Surface

* Added visual variation to the ground using terrain colors and texture blending.
* Implemented a visible wagon path across the terrain.
* Added drier terrain areas to increase visual variety in the prairie landscape.

**Advanced features:**

* Shader-based terrain color and texture variation.
* Shader-based path and dry-area blending in the terrain material.

#### Scatter Elements

* Added rocks as scattered obstacle elements across the terrain.
* Used multiple rock textures and shape variation so rocks do not all look identical.
* Integrated rocks into the collision system so that they can damage the wagon.

**Advanced features:**

* Procedural placement of rocks.
* Vertex variation/deformation for more natural-looking rocks.
* Additional dust effect when rocks are hit.

#### Flora

* Implemented parameter-based flowers distributed across the terrain.
* Added variation in flower scale, stem height, number of petals, number of leaves, petal colors, petal textures, and placement.
* Used randomized flower parameters to create a more natural-looking prairie field.

**Advanced features:**

* Procedural variation of flower components.
* Procedural flower placement.

#### Grass

* Implemented dense grass patches across the terrain.
* Added variation between green grass and dry grass patches.
* Used low-complexity grass blade geometry suitable for repeated placement.

**Advanced features:**

* Shader-based wind animation for grass.
* Procedural grass patch placement and variation.

#### Covered Light Wagon / Prairie Schooner

* Created a hierarchical wagon model composed of:
  * Wooden wagon bed;
  * Cloth cover;
  * Front tongue;
  * Four wheels.
* Added visible hay bales inside the wagon when cargo is being carried.
* Added imported mule models in OBJ format attached to the wagon.

**Advanced features:**

* Detailed wagon model with multiple geometric components and textures.
* Animated mule leg and tail movement.

#### Wagon Interaction Mechanics

* Implemented keyboard-controlled wagon movement.
* Added acceleration with `W` and braking with `S`.
* Added steering with `A` and `D`.
* Restricted wagon movement to forward driving.
* Added hay bale pickup with `P`.
* Added hay bale dropdown/delivery with `L`.
* Limited the wagon cargo capacity to two hay bales.
* Added collision behavior for rocks, the barn, and the playable-area boundary.
* Rock collisions apply partial HP damage.
* Crashes against hard or solid objects, such as the barn or the playable-area boundary/fence line, cause immediate game over. This was an intentional gameplay-tuning decision to distinguish severe crashes from regular rock collisions.

**Advanced features:**

* Kinematics-based movement using speed, acceleration, steering angle, direction, and elapsed time.
* Smooth steering behavior.
* Additional collision feedback through rock impact effects.

#### Barn

* Implemented a barn model with textured walls, roof, windows, and doors.
* Added a circular delivery area in front of the barn.
* Added visual feedback to the delivery area when the wagon is inside the barn interaction zone.
* Integrated the barn with hay bale delivery, HP restoration, and delivered-bale counting.

#### Interface Elements

* Added DAT.gui interface elements showing:
  * Current health points;
  * Last damage taken;
  * Last health restored;
  * Total number of hay bales delivered to the barn;
  * Current score/game time.
* Added a camera selection control between the free camera and the wagon-follow camera.

#### Animation

* Animated all wagon wheels according to wagon movement.
* Animated the front axle and tongue according to the steering angle.
* Animated the hay bale pinpointing arrows with vertical movement.
* Animated the cloud layer.
* Animated mule leg and tail movement.
* Added visible cargo updates when hay bales are picked up, dropped, or delivered.

**Advanced features:**

* Detailed wagon movement animation, including wheel rotation, steering-dependent front axle/tongue rotation, and animated mule leg and tail movement.

#### Shaders

* Applied a wind-like shader to animate grass movement.
* Applied a vertical animation shader to the hay bale pinpointing arrows.

**Advanced features:**

* Added additional shaders for the terrain, sky, clouds, sun, and dust effects.

#### Gameplay System

* Implemented the survival gameplay loop based on wagon HP.
* Added continuous time-based HP depletion.
* Added HP loss when colliding with rocks.
* Added HP restoration when hay bales are delivered to the barn.
* Added score tracking based on survival time.
* Added randomly placed hay bales across the terrain.
* Made hay bale geometry visible only when the wagon is nearby.
* Added animated arrows to help locate hay bales.
* Added green arrow feedback when a hay bale can be picked up.
* Added game over behavior when HP reaches zero.
* Added restart/reset behavior after game over.
* Added a boundary fence around the playable area.

**Advanced features:**

* Procedural hay bale placement.
* Visibility-distance logic for hay bales.
* Complete game-state reset after game over.

### Known Issues and Limitations

<!-- Known issues or limitations (if any) -->

The following points describe current limitations of the project and possible areas for future improvement:

- Some of the project's constants, such as initial positions, element sizes, and placement rules, are currently scattered through multiple files. A more scalable structure would centralize these values in a dedicated configuration file, or reduce them to a single source of truth;

- Hay bale interactions do not currently include any visual feedback for pick up, drop down, spawn, disappear, or deliver actions, and solid object (barn and fence) collisions do not either. Both of these could benefit from visual effects that smoothen these interactions, similarly to rock collisions;

- The scene's scatter elements are limited to rocks, and while the prairie environment already includes grass, flowers, rocks, terrain variation, dirt paths, and fencing, some extra elements like bushes (utilizing L systems) could improve scatter element variety.

### Demo Video and Screenshots

<!-- Screenshot thumbnails or links to the 5 required screenshots -->
<!-- additionally we can also add the video delivery here -->

The screenshots and video required for delivery can be found in [docs/final](docs/final/):

- [Screenshot 1](docs/final/project-t11g03-1.png) - Overall scene overview

![Screenshot 1](docs/final/project-t11g03-1.png)

- [Screenshot 2](docs/final/project-t11g03-2.png) - Flower, rocks, and floor detail

![Screenshot 2](docs/final/project-t11g03-2.png)

- [Screenshot 3](docs/final/project-t11g03-3.png) - Wagon close-up

![Screenshot 3](docs/final/project-t11g03-3.png)

- [Animated screenshot 4](docs/final/project-t11g03-4.gif) - Multiple shader animation

![Animated screenshot 4](docs/final/project-t11g03-4.gif)

- [Screenshot 5](docs/final/project-t11g03-5.png) - Gameplay camera

![Screenshot 5](docs/final/project-t11g03-5.png)

- [Demonstration video](docs/final/project-t11g03.mp4), including:
    - A tour of the full scene
    - Wagon movement and animations
    - Pick-up and delivery of haybales
    - Shaders
 
<!-- gitlab custom markdown -->
![Demonstration video](docs/final/project-t11g03.mp4)

### AI Usage Declaration

<!-- A declaration on AI use, to what extent and for what purpose. -->

AI tools were used as support during the development of this project, mainly for clarification, organization, and polishing tasks. Their usage was limited to the following areas:

- Implementation planning:
    - Discussing possible implementation approaches for more complex features;
    - Reviewing alternatives before manual implementation by the group.

- Documentation:
    - Wording and rewriting README;
    - Refining and generating JSDoc;
    - Generating and refining explanatory comments throughout the code.

- Auxiliary assets:
    - Generating mule object;
    - Generating flower textures.

- Software quality:
    - Suggesting organization and responsibility separation;
    - Assisting in identifying relevant code sections to move into more appropriate areas.

In all cases of AI usage, the outputs were reviewed, adapted, and integrated manually by the group members.
Any implementation work not declared above was carried out by the group members.

### Project Authors

This project was developed by T11G03, composed of the following students:

| Name                       | Number    | E-Mail            |
| -------------------------- | --------- | ----------------- |
| Filipe Camacho             | 202208040 | up202208040@up.pt |
| Sara Marques Ribeiro       | 202305327 | up202305327@up.pt |
| Yago Sentieiro Alba        | 202306314 | up202306314@up.pt |

### References

- https://www.jasondavies.com/poisson-disc/
- https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf
- https://polyhaven.com/
- https://freesvg.org/
