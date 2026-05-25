import { CGFobject } from '../../lib/CGF.js';

class MyObjPart extends CGFobject {
    constructor(scene, name, data) {
        super(scene);
        this.name = name;
        this.vertices = data.vertices;
        this.normals = data.normals;
        this.texCoords = data.texCoords;
        this.indices = data.indices;
        this.primitiveType = scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}

/**
 * OBJ loader that preserves named object sections, allowing the mule's legs
 * and tail to be animated with normal hierarchical transforms.
 */
export class MyGroupedMule extends CGFobject {
    constructor(scene, modelUrl) {
        super(scene);
        this.modelUrl = modelUrl;
        this.parts = new Map();
        this.partOrder = [];
        this.ready = false;

        this.loadModel().catch((error) => {
            console.error(`Failed to load grouped mule model: ${this.modelUrl}`, error);
        });
    }

    async loadModel() {
        const response = await fetch(this.modelUrl);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        this.loadData(await response.text());
        this.ready = true;
    }

    loadData(objectData) {
        const sourceVertices = [];
        const sourceNormals = [];
        const sourceTexCoords = [];
        const partData = new Map();
        const partOrder = [];
        let currentPart = null;

        const ensurePart = (name) => {
            if (!partData.has(name)) {
                partData.set(name, {
                    vertices: [],
                    normals: [],
                    texCoords: [],
                    indices: [],
                    hash: new Map(),
                });
                partOrder.push(name);
            }

            return partData.get(name);
        };

        const addFaceVertex = (part, token) => {
            if (part.hash.has(token)) {
                part.indices.push(part.hash.get(token));
                return;
            }

            const pieces = token.split('/');
            const vertexIndex = Number.parseInt(pieces[0], 10) - 1;
            const texIndex = pieces[1] ? Number.parseInt(pieces[1], 10) - 1 : -1;
            const normalIndex = pieces[2] ? Number.parseInt(pieces[2], 10) - 1 : -1;
            const vertex = sourceVertices[vertexIndex] ?? [0, 0, 0];
            const normal = sourceNormals[normalIndex] ?? [0, 1, 0];
            const texCoord = sourceTexCoords[texIndex] ?? [0, 0];
            const index = part.vertices.length / 3;

            part.vertices.push(vertex[0], vertex[1], vertex[2]);
            part.normals.push(normal[0], normal[1], normal[2]);
            part.texCoords.push(texCoord[0], texCoord[1]);
            part.hash.set(token, index);
            part.indices.push(index);
        };

        for (const rawLine of objectData.split('\n')) {
            const line = rawLine.trim();
            if (line.length === 0 || line.startsWith('#')) continue;

            const elements = line.split(/\s+/);
            const type = elements.shift();

            if (type === 'o' || type === 'g') {
                currentPart = ensurePart(elements[0] ?? 'UnnamedPart');
            } else if (type === 'v') {
                sourceVertices.push(elements.map(Number));
            } else if (type === 'vn') {
                sourceNormals.push(elements.map(Number));
            } else if (type === 'vt') {
                sourceTexCoords.push(elements.map(Number));
            } else if (type === 'f') {
                const part = currentPart ?? ensurePart('Default');

                for (let i = 1; i < elements.length - 1; i++) {
                    addFaceVertex(part, elements[0]);
                    addFaceVertex(part, elements[i]);
                    addFaceVertex(part, elements[i + 1]);
                }
            }
        }

        this.parts.clear();
        this.partOrder = partOrder;

        for (const name of partOrder) {
            const data = partData.get(name);
            delete data.hash;

            if (data.indices.length > 0) {
                this.parts.set(name, new MyObjPart(this.scene, name, data));
            }
        }
    }

    display() {
        if (!this.ready) return;

        for (const name of this.partOrder) {
            this.displayPart(name);
        }
    }

    displayAnimated(phase, intensity) {
        if (!this.ready) return;

        const legParts = new Set([
            'LeftFrontUpperLeg', 'LeftFrontLowerLeg', 'LeftFrontHoof',
            'RightFrontUpperLeg', 'RightFrontLowerLeg', 'RightFrontHoof',
            'LeftBackUpperLeg', 'LeftBackLowerLeg', 'LeftBackHoof',
            'RightBackUpperLeg', 'RightBackLowerLeg', 'RightBackHoof',
        ]);

        for (const name of this.partOrder) {
            if (!legParts.has(name) && name !== 'Tail') this.displayPart(name);
        }

        this.displayTail(phase, intensity);
        this.displayLeg('Left', 'Front', phase, intensity, 0.0);
        this.displayLeg('Right', 'Back', phase, intensity, 0.0);
        this.displayLeg('Right', 'Front', phase, intensity, Math.PI);
        this.displayLeg('Left', 'Back', phase, intensity, Math.PI);
    }

    displayPart(name) {
        const part = this.parts.get(name);
        if (part) part.display();
    }

    displayTail(phase, intensity) {
        this.scene.pushMatrix();
        this.applyPivotRotation(
            { x: 0.0, y: 1.13, z: -1.12 },
            Math.sin(phase + 0.7) * 0.18 * intensity,
            0,
            1,
            0
        );
        this.displayPart('Tail');
        this.scene.popMatrix();
    }

    displayLeg(side, pair, phase, intensity, phaseOffset) {
        const pose = this.getLegPose(side, pair, phase, intensity, phaseOffset);
        const upperName = `${side}${pair}UpperLeg`;
        const lowerName = `${side}${pair}LowerLeg`;
        const hoofName = `${side}${pair}Hoof`;

        this.scene.pushMatrix();
        this.applyPivotRotation(pose.upperPivot, pose.upperAngle, 1, 0, 0);
        this.displayPart(upperName);
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.applyPivotRotation(pose.upperPivot, pose.upperAngle, 1, 0, 0);
        this.applyPivotRotation(pose.lowerPivot, pose.lowerAngle, 1, 0, 0);
        this.displayPart(lowerName);
        this.displayPart(hoofName);
        this.scene.popMatrix();
    }

    getLegPose(side, pair, phase, intensity, phaseOffset = 0.0) {
        const sideSign = side === 'Left' ? -1 : 1;
        const isFront = pair === 'Front';
        const legPhase = phase + phaseOffset;
        const swing = Math.sin(legPhase);
        const lift = Math.max(0, -Math.cos(legPhase));
        const baseZ = isFront ? 0.56 : -0.66;

        return {
            upperPivot: { x: sideSign * 0.24, y: 1.0, z: isFront ? 0.54 : -0.67 },
            lowerPivot: { x: sideSign * 0.24, y: 0.58, z: baseZ },
            upperAngle: swing * 0.26 * intensity,
            lowerAngle: (lift * 0.34 - 0.08 * swing) * intensity,
        };
    }

    applyPivotRotation(pivot, angle, x, y, z) {
        this.scene.translate(pivot.x, pivot.y, pivot.z);
        this.scene.rotate(angle, x, y, z);
        this.scene.translate(-pivot.x, -pivot.y, -pivot.z);
    }
}
