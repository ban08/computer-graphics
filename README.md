# computer-graphics

A real-time 3D outdoor scene rendered in the browser with WebGL, built up from flat 2D exercises to a fully animated procedural landscape.

## What it does

The `tp1`–`tp5` folders are weekly exercises that build the fundamentals (geometry, transformations, textures, shaders, lighting). The `project/` folder is the final scene: an outdoor landscape you can fly around, with

- **procedurally generated terrain** and a textured ground,
- an **animated cloud layer** driven by noise, with live GUI controls,
- a **grass field** of thousands of blades, batched into single triangles and moved by a **wind shader**,
- an animated **wagon and horses** — turning wheels, steering, and a moving team.

## Stack

JavaScript and GLSL shaders on [WebCGF](https://paginas.fe.up.pt/~ruirodrig/pub/sw/webcgf/docs/) (a WebGL teaching framework), with dat.GUI for the controls.

## How to run

WebGL needs the files to be served over HTTP, not opened from disk:

```bash
cd project
python3 -m http.server 8080     # then open http://localhost:8080
```

## What I built

Group project of three for the Computer Graphics course (2025/26). My work is the parts of the final scene that make it feel alive:

- The **procedural terrain** generation.
- The **animated cloud layer** and its GUI controls.
- The **grass field**: the batched single-triangle blade primitive, the patch layout, and the **wind shader** that animates it.
- The **wagon and horses**: the models and their animation — wheel rotation, front-axle steering and the horse gait.

Teammates built most of the earlier exercises and other parts of the scene.

## What I would do differently

Move the grass and cloud parameters into a single shared configuration so the whole scene can be re-tuned from one place, and use instanced draw calls for the grass instead of batched geometry to push the blade count higher without the memory cost.
