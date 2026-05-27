import { CGFobject } from '../../lib/CGF.js';

/**
 * MyPlane (Double-Sided)
 * @constructor
 * @param scene - Reference to MyScene object
 * @param nrDivs - Number of subdivisions in both directions of the plane
 * @param minS - Minimum S texture coordinate
 * @param maxS - Maximum S texture coordinate
 * @param minT - Minimum T texture coordinate
 * @param maxT - Maximum T texture coordinate
 */
export class MyPlane extends CGFobject {
    constructor(scene, nrDivs, minS, maxS, minT, maxT) {
        super(scene);
        nrDivs = typeof nrDivs !== 'undefined' ? nrDivs : 1;
        this.nrDivs = nrDivs;
        this.patchLength = 1.0 / nrDivs;
        this.minS = minS || 0;
        this.maxS = maxS || 1;
        this.minT = minT || 0;
        this.maxT = maxT || 1;
        this.q = (this.maxS - this.minS) / this.nrDivs;
        this.w = (this.maxT - this.minT) / this.nrDivs;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.normals = [];
        this.texCoords = [];

        // frente
        var yCoord = 0.5;
        for (var j = 0; j <= this.nrDivs; j++) {
            var xCoord = -0.5;
            for (var i = 0; i <= this.nrDivs; i++) {
                this.vertices.push(xCoord, yCoord, 0);
                this.normals.push(0, 0, 1); // Normal aponta para a FRENTE
                this.texCoords.push(this.minS + i * this.q, this.minT + j * this.w);
                xCoord += this.patchLength;
            }
            yCoord -= this.patchLength;
        }

        // trás
        yCoord = 0.5;
        for (var j = 0; j <= this.nrDivs; j++) {
            var xCoord = -0.5;
            for (var i = 0; i <= this.nrDivs; i++) {
                this.vertices.push(xCoord, yCoord, 0);
                this.normals.push(0, 0, -1); // Normal aponta para TRÁS
                // Inverter o eixo S (X da textura) para não ficar espelhada!
                this.texCoords.push(this.maxS - (i * this.q), this.minT + j * this.w);
                xCoord += this.patchLength;
            }
            yCoord -= this.patchLength;
        }

        this.indices = [];
        var numVerticesPerFace = (this.nrDivs + 1) * (this.nrDivs + 1);

        // frente
        var ind = 0;
        for (var j = 0; j < this.nrDivs; j++) {
            for (var i = 0; i <= this.nrDivs; i++) {
                this.indices.push(ind);
                this.indices.push(ind + this.nrDivs + 1);
                ind++;
            }
            if (j + 1 < this.nrDivs) {
                this.indices.push(ind + this.nrDivs);
                this.indices.push(ind);
            }
        }

    
        var lastFrontIndex = this.indices[this.indices.length - 1];
        var firstBackIndex = numVerticesPerFace + this.nrDivs + 1;
        
        this.indices.push(lastFrontIndex);
        this.indices.push(firstBackIndex);

        // trás
        var indBack = numVerticesPerFace;
        for (var j = 0; j < this.nrDivs; j++) {
            for (var i = 0; i <= this.nrDivs; i++) {
                this.indices.push(indBack + this.nrDivs + 1);
                this.indices.push(indBack);
                indBack++;
            }
            if (j + 1 < this.nrDivs) {
                this.indices.push(indBack - 1);
                this.indices.push(indBack + this.nrDivs + 1);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLE_STRIP;
        this.initGLBuffers();
    }
}