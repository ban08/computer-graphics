import { CGFobject, CGFappearance, CGFtexture } from '../../../lib/CGF.js';
import { MyTexturedBox } from '../../primitives/MyTexturedBox.js';
import { MyCappedCylinder } from '../../primitives/MyCappedCylinder.js';
import { MyTorus } from '../../primitives/MyTorus.js';
import { MyRoundedCoverShell } from '../../primitives/MyRoundedCoverShell.js';
import { MyArchBow } from '../../primitives/MyArchBow.js';
import { MySphere } from '../../primitives/MySphere.js';
import { MyGroupedMule } from '../../objects/MyGroupedMule.js';
import { MyHayBale } from '../../objects/MyHayBale.js';

/**
 * MyWagon
 * @constructor
 * @param scene - Reference to MyScene object
 * @param terrain - Terrain used to position the wagon
 */
export class MyWagon extends CGFobject {
    // --- constructor
    
    constructor(scene, terrain) {
        super(scene);

        this.terrain = terrain;
        this.x = 3.5;
        this.z = -20.8;
        this.rotation = -0.17;
        this.scaleFactor = 0.45;
        this.wheelCenterY = 0.62;
        this.wheelOuterRadius = 0.56;
        this.wheelGroundLocalY = this.wheelCenterY - this.wheelOuterRadius;
        this.muleScale = 0.86;
        this.muleZ = 5.10;
        this.muleHalfSpacing = 0.55;       // each mule sits at x = ±muleHalfSpacing
        this.muleHoofCenters = [
            { x: -0.24, z: 0.560 },
            { x: 0.24, z: 0.560 },
            { x: -0.24, z: -0.660 },
            { x: 0.24, z: -0.660 },
        ];
        this.hoofWidth = 0.115;
        this.hoofHeight = 0.075;
        this.hoofDepth = 0.115;
        this.hoofCenterY = 0.038;
        this.visible = true;
        this.maxTerrainTilt = 0.28;

        // movement related vars supplied by MyGameplay
        this.speed = 0.0;
        this.maxSpeed = 4.0;
        this.steerAngle = 0.0;
        this.wheelSpinAngle = 0.0;
        this.gaitPhase = 0.0;
        this.cargoBaleCount = 0;
        this.hayBaleInteractionOffset = 2.5;

        // --- Bed/cover key dimensions (single source of truth) -------------
        this.bedHalfWidth = 0.85;
        this.wallThickness = 0.10;
        this.bedHalfLength = 1.65;
        this.floorTop = 1.10;
        this.wallHeight = 0.78;
        this.wallTop = this.floorTop + this.wallHeight;
        this.coverHalfWidth = this.bedHalfWidth + this.wallThickness * 0.5;
        this.coverSideHeight = 0.45;
        this.coverArchHeight = 1.40;
        // Extended cover — runs from the back of the bed forward to just
        // behind the driver seat back. Both openings are framed with rolled
        // canvas lips so the cover reads like a real tied-up wagon canopy.
        this.coverFrontZ = this.bedHalfLength - 0.65;     // ~1.00, behind seat back
        this.coverBackZ = -this.bedHalfLength;
        this.coverLength = this.coverFrontZ - this.coverBackZ;

        // --- Drawbar + rear lateral stick --------------------------------
        // One central wagon pole runs between the pair and ends at a single
        // lateral stick placed behind the horses.
        this.tongueY = 0.84;
        this.tongueBackZ = 1.25;                              // attaches at the front bolster
        this.lateralStickZ = this.muleZ - this.muleScale * 1.68;
        this.lateralStickY = this.tongueY + 0.12;
        this.lateralStickHalfWidth = this.muleHalfSpacing + this.muleScale * 0.56;
        this.tongueFrontZ = this.lateralStickZ;
        this.tongueFrontY = this.lateralStickY;

        // Collision footprint covering the wagon + tongue + both mules
        this.collisionFootprint = [
            { x: 0.0, z: -this.bedHalfLength + 0.2, radius: 1.05 },
            { x: 0.0, z: -0.4, radius: 1.05 },
            { x: 0.0, z: 0.8, radius: 1.05 },
            { x: 0.0, z: this.bedHalfLength - 0.05, radius: 1.00 },
            { x: 0.0, z: this.bedHalfLength + 0.8, radius: 0.55 },
            { x: -this.muleHalfSpacing, z: this.muleZ, radius: 0.70 },
            { x: this.muleHalfSpacing, z: this.muleZ, radius: 0.70 },
            { x: -this.muleHalfSpacing, z: this.muleZ + 1.3, radius: 0.55 },
            { x: this.muleHalfSpacing, z: this.muleZ + 1.3, radius: 0.55 },
        ];

        this.createMaterials();
        this.createGeometry();
        // OBJ-loaded mule body — per spec ("Horses/mules should be imported
        // in OBJ format"). Extra mane and tail tuft are layered on top in
        // displayMule to enrich the silhouette.
        this.mule = new MyGroupedMule(scene, '/project/assets/mule.obj');
    }

    // --- misc

    createMaterials() {
        this.wood = this.makeMaterial('/project/textures/wagonWood.svg', {
            ambient: [0.45, 0.30, 0.17, 1],
            diffuse: [0.78, 0.48, 0.24, 1],
            specular: [0.18, 0.12, 0.07, 1],
            shininess: 24,
        });
        this.darkWood = this.makeMaterial('/project/textures/wagonWood.svg', {
            ambient: [0.22, 0.13, 0.07, 1],
            diffuse: [0.42, 0.24, 0.11, 1],
            specular: [0.10, 0.07, 0.04, 1],
            shininess: 18,
        });
        this.cloth = this.makeMaterial('/project/textures/wagonCloth.svg', {
            ambient: [0.78, 0.74, 0.62, 1],
            diffuse: [0.95, 0.90, 0.78, 1],
            specular: [0.10, 0.09, 0.07, 1],
            shininess: 4,
        });
       
        this.metal = this.makeMaterial('/project/textures/wagonMetal.svg', {
            ambient: [0.18, 0.17, 0.15, 1],
            diffuse: [0.35, 0.33, 0.29, 1],
            specular: [0.55, 0.52, 0.46, 1],
            shininess: 90,
        });
        this.leather = this.makeMaterial('/project/textures/wagonLeather.svg', {
            ambient: [0.20, 0.10, 0.05, 1],
            diffuse: [0.34, 0.18, 0.09, 1],
            specular: [0.16, 0.08, 0.04, 1],
            shininess: 22,
        });

        // Box-built horse — warm saddle-brown hide for the left animal and a
        // slightly darker chestnut for the right, so the pair reads as two
        // distinct mules even though the geometry is identical.
        this.muleMaterial = new CGFappearance(this.scene);
        this.muleMaterial.setAmbient(0.42, 0.22, 0.10, 1);
        this.muleMaterial.setDiffuse(0.70, 0.38, 0.16, 1);
        this.muleMaterial.setSpecular(0.10, 0.05, 0.02, 1);
        this.muleMaterial.setShininess(6);

        this.muleDarkMaterial = new CGFappearance(this.scene);
        this.muleDarkMaterial.setAmbient(0.30, 0.16, 0.08, 1);
        this.muleDarkMaterial.setDiffuse(0.52, 0.28, 0.12, 1);
        this.muleDarkMaterial.setSpecular(0.08, 0.05, 0.02, 1);
        this.muleDarkMaterial.setShininess(6);


        this.maneMaterial = new CGFappearance(this.scene);
        this.maneMaterial.setAmbient(0.10, 0.06, 0.03, 1);
        this.maneMaterial.setDiffuse(0.18, 0.11, 0.05, 1);
        this.maneMaterial.setSpecular(0.06, 0.04, 0.03, 1);
        this.maneMaterial.setShininess(8);

        this.eyeMaterial = new CGFappearance(this.scene);
        this.eyeMaterial.setAmbient(0.04, 0.03, 0.02, 1);
        this.eyeMaterial.setDiffuse(0.06, 0.04, 0.03, 1);
        this.eyeMaterial.setSpecular(0.55, 0.50, 0.45, 1);
        this.eyeMaterial.setShininess(80);


        // Iron bit — darker, slightly polished
        this.ironDark = new CGFappearance(this.scene);
        this.ironDark.setAmbient(0.10, 0.10, 0.10, 1);
        this.ironDark.setDiffuse(0.22, 0.22, 0.22, 1);
        this.ironDark.setSpecular(0.55, 0.55, 0.55, 1);
        this.ironDark.setShininess(80);

        // Soft tissue (nostrils) — subtle pink-grey
        this.tissue = new CGFappearance(this.scene);
        this.tissue.setAmbient(0.10, 0.06, 0.05, 1);
        this.tissue.setDiffuse(0.18, 0.10, 0.08, 1);
        this.tissue.setSpecular(0.05, 0.03, 0.03, 1);
        this.tissue.setShininess(8);

        // Hoof horn — very dark brown, wraps every side of each paw
        this.hoofMaterial = new CGFappearance(this.scene);
        this.hoofMaterial.setAmbient(0.05, 0.03, 0.02, 1);
        this.hoofMaterial.setDiffuse(0.10, 0.06, 0.04, 1);
        this.hoofMaterial.setSpecular(0.10, 0.07, 0.05, 1);
        this.hoofMaterial.setShininess(12);
    }

    makeMaterial(texturePath, props) {
        const mat = new CGFappearance(this.scene);
        const texture = new CGFtexture(this.scene, texturePath);

        mat.setAmbient(...props.ambient);
        mat.setDiffuse(...props.diffuse);
        mat.setSpecular(...props.specular);
        mat.setShininess(props.shininess);
        mat.setTexture(texture);
        mat.setTextureWrap('REPEAT', 'REPEAT');

        return mat;
    }

    createGeometry() {
        const bedW = this.bedHalfWidth * 2;
        const bedL = this.bedHalfLength * 2;
        const outerHalfW = this.bedHalfWidth + this.wallThickness;

        // Cargo box ---------------------------------------------------------
        this.floor = new MyTexturedBox(this.scene, bedW + this.wallThickness * 2, 0.12, bedL + this.wallThickness * 2, 0.55);
        this.sideWall = new MyTexturedBox(this.scene, this.wallThickness, this.wallHeight, bedL, 0.55);
        this.endWall = new MyTexturedBox(this.scene, bedW + this.wallThickness * 2, this.wallHeight, this.wallThickness, 0.55);
        this.topRail = new MyTexturedBox(this.scene, this.wallThickness * 1.15, 0.07, bedL + this.wallThickness * 2, 0.45);
        this.crossRail = new MyTexturedBox(this.scene, bedW + this.wallThickness * 2, 0.07, this.wallThickness * 1.15, 0.45);
        this.cornerPost = new MyTexturedBox(this.scene, 0.13, this.wallHeight + 0.10, 0.13, 0.35);
        this.bolt = new MyTexturedBox(this.scene, 0.07, 0.07, 0.03, 0.15);
        this.bolsterBeam = new MyTexturedBox(this.scene, bedW + this.wallThickness * 1.8, 0.18, 0.22, 0.35);
        this.tailgateBatten = new MyTexturedBox(this.scene, 0.035, this.wallHeight * 0.75, 0.035, 0.22);
        this.tailgateLatch = new MyTexturedBox(this.scene, 0.34, 0.045, 0.035, 0.14);

        // Built-in driver bench: one wide plank seat that spans the bed
        // wall-to-wall, a leather cushion on top, and a low back panel that
        // reads as part of the bed itself (no armrests, no slats).
        this.driverSeat = new MyTexturedBox(this.scene, bedW, 0.10, 0.52, 0.45);
        this.benchCushion = new MyTexturedBox(this.scene, bedW - 0.06, 0.05, 0.46, 0.30);
        this.seatBack = new MyTexturedBox(this.scene, bedW, 0.26, 0.06, 0.45);
        this.seatRiser = new MyTexturedBox(this.scene, bedW, 0.20, 0.06, 0.45);
        this.seatSupport = new MyTexturedBox(this.scene, 0.10, 0.32, 0.10, 0.30);

        // Cover (cloth) -----------------------------------------------------
        this.cover = new MyRoundedCoverShell(
            this.scene,
            this.coverHalfWidth,
            this.coverSideHeight,
            this.coverArchHeight,
            this.coverLength,
            24,
            10,
            true
        );
        this.coverBow = new MyArchBow(
            this.scene,
            this.coverHalfWidth + 0.006,
            this.coverSideHeight,
            this.coverArchHeight,
            0.05,
            24,
            8
        );
        this.ridgePole = new MyCappedCylinder(this.scene, 0.025, this.coverLength * 0.96, 16, 1);
        this.coverFlapTie = new MyTorus(this.scene, 0.121, 0.012, 18, 6);
        this.rearCoverArchRoll = new MyArchBow(
            this.scene,
            this.coverHalfWidth + 0.015,
            this.coverSideHeight,
            this.coverArchHeight,
            0.105,
            24,
            10
        );
        this.frontCoverArchRoll = new MyArchBow(
            this.scene,
            this.coverHalfWidth + 0.015,
            this.coverSideHeight,
            this.coverArchHeight,
            0.105,
            24,
            10
        );
        this.frontCoverStrap = new MyTexturedBox(this.scene, 0.045, 0.22, 0.030, 0.16);
        this.rearTieTail = new MyTexturedBox(this.scene, 0.030, 0.34, 0.024, 0.14);

        // Running gear ------------------------------------------------------
        this.axle = new MyCappedCylinder(this.scene, 0.065, outerHalfW * 2.05, 24, 1);
        this.hub = new MyCappedCylinder(this.scene, 0.12, 0.22, 24, 1);
        this.hubCap = new MyCappedCylinder(this.scene, 0.07, 0.06, 18, 1);
        this.hubPlate = new MyTorus(this.scene, 0.115, 0.012, 24, 6);
        this.wheelRim = new MyTorus(this.scene, this.wheelOuterRadius - 0.06, 0.05, 40, 8);
        this.wheelBand = new MyTorus(this.scene, this.wheelOuterRadius, 0.022, 40, 6);
        this.spoke = new MyTexturedBox(this.scene, 0.040, this.wheelOuterRadius - 0.08, 0.040, 0.20);
        this.lugBolt = new MySphere(this.scene, 0.024, 8, 6);
        this.tireStud = new MySphere(this.scene, 0.018, 8, 6);
        this.linchPin = new MyCappedCylinder(this.scene, 0.018, 0.10, 12, 1);

        // Chassis / underbody ----------------------------------------------
        this.frameRail = new MyTexturedBox(this.scene, 0.11, 0.14, bedL + 0.30, 0.45);
        this.frameCross = new MyTexturedBox(this.scene, bedW * 0.65, 0.10, 0.10, 0.35);

        // Stake-side rail along the bed walls (mid-rail under the top rail)
        this.stakeRail = new MyTexturedBox(this.scene, this.wallThickness * 0.55, 0.05, bedL + this.wallThickness, 0.45);

        // Driver area extras: footboard, rear-wall hinges and brake assembly
        this.footboard = new MyTexturedBox(this.scene, bedW * 0.82, 0.05, 0.40, 0.40);
        this.tailgateHinge = new MyTexturedBox(this.scene, 0.10, 0.05, 0.05, 0.12);
        this.brakeLever = new MyCappedCylinder(this.scene, 0.026, 0.80, 14, 1);
        this.brakeKnob = new MySphere(this.scene, 0.045, 12, 8);
        this.brakeBracket = new MyTexturedBox(this.scene, 0.09, 0.14, 0.09, 0.12);
        this.brakeShoe = new MyTexturedBox(this.scene, 0.22, 0.08, 0.08, 0.18);

        // Hitch hardware: iron caps/ring for the central pole and lateral stick.
        this.ironCap = new MyCappedCylinder(this.scene, 0.07, 0.05, 14, 1);
        this.tongueRing = new MyTorus(this.scene, 0.075, 0.018, 20, 6);
        this.lateralRopeRing = new MyTorus(this.scene, 0.060, 0.014, 20, 8);

        // Simple hitch: central tongue + one rear lateral stick
        this.tongueBeam = new MyCappedCylinder(this.scene, 0.07, 1.0, 16, 1);
        this.lateralStick = new MyCappedCylinder(this.scene, 0.055, this.lateralStickHalfWidth * 2.0, 18, 1);
        this.reinSegment = new MyTexturedBox(this.scene, 0.022, 0.020, 1.0, 0.18);

        // Cargo (hay bales) -------------------------------------------------
        this.hayBaleGeometry = new MyHayBale(this.scene);
        // ---- Mule overlay geometry -----------------------------------------
        // The OBJ mule is the base model; these boxes/spheres are drawn ON TOP
        // of it (inside the muleScale-scaled local frame) to enrich the
        // silhouette: a full mane along the neck, a tail tuft at the tip,
        // bridle, saddle pad, bit and dark hooves.

        // ---- Mule overlay geometry (drawn in OBJ-scaled local frame) -----
        this.eye = new MySphere(this.scene, 0.055, 14, 10);

        // Bridle straps — top-of-head pieces only (no cheek straps)
        this.noseStrap = new MyTexturedBox(this.scene, 0.42, 0.045, 0.06, 0.15);
        this.browStrap = new MyTexturedBox(this.scene, 0.46, 0.05, 0.05, 0.15);
        this.pollStrap = new MyTexturedBox(this.scene, 0.12, 0.035, 0.035, 0.15);

        // Tail tuft at the tip of the OBJ tail
        this.tailTuft = new MyTexturedBox(this.scene, 0.14, 0.22, 0.12, 0.12);

        // Forelock — tuft of mane between the ears
        this.forelock = new MyTexturedBox(this.scene, 0.07, 0.10, 0.035, 0.12);
        this.maneCrestBlock = new MyTexturedBox(this.scene, 0.095, 0.19, 0.095, 0.12);

        // Bit + bit rings across the side of the mouth
        this.bit = new MyCappedCylinder(this.scene, 0.016, 0.44, 14, 1);
        this.bitRing = new MyTorus(this.scene, 0.075, 0.014, 20, 8);
        this.nostril = new MySphere(this.scene, 0.034, 14, 10);

        // Hooves: compact dark-brown squares.
        this.hoofWrap = new MyTexturedBox(this.scene, this.hoofWidth, this.hoofHeight, this.hoofDepth, 0.12);
    }

    getMuleTerrainOffset(muleX, pose) {
        if (!this.terrain || !pose) return 0;

        const hoofHalfX = this.hoofWidth * 0.5 + 0.045;
        const hoofHalfZ = this.hoofDepth * 0.5 + 0.045;
        const hoofBottomY = this.hoofCenterY - this.hoofHeight * 0.5;
        const hoofSampleOffsets = [
            { x: 0, z: 0 },
            { x: -hoofHalfX, z: -hoofHalfZ },
            { x: hoofHalfX, z: -hoofHalfZ },
            { x: -hoofHalfX, z: hoofHalfZ },
            { x: hoofHalfX, z: hoofHalfZ },
        ];
        const hoofPoints = [];
        const lead = this.getMuleLeadTransform(muleX);
        const c = Math.cos(lead.yaw);
        const s = Math.sin(lead.yaw);

        for (const hoof of this.muleHoofCenters) {
            for (const offset of hoofSampleOffsets) {
                const hoofX = (hoof.x + offset.x) * this.muleScale;
                const hoofZ = (hoof.z + offset.z) * this.muleScale;

                hoofPoints.push({
                    x: lead.x + hoofX * c + hoofZ * s,
                    y: hoofBottomY * this.muleScale,
                    z: lead.z - hoofX * s + hoofZ * c,
                });
            }
        }

        let terrainSum = 0;
        let planeSum = 0;
        let maxDiff = -Infinity;

        for (const p of hoofPoints) {
            const [worldX, worldZ] = this.localPointToWorldXZ(p.x, p.y, p.z, pose);
            const terrainY = this.terrain.getHeightAt(worldX, worldZ);
            const planeY = this.localWorldHeight(p.x, p.y, p.z, pose);
            terrainSum += terrainY;
            planeSum += planeY;
            maxDiff = Math.max(maxDiff, terrainY - planeY);
        }

        const averageDiff = terrainSum / hoofPoints.length - planeSum / hoofPoints.length;
        const terrainClearance = 0.012;
        const verticalOffsetScale = this.scaleFactor * Math.max(
            0.25,
            Math.cos(pose.roll) * Math.cos(pose.pitch)
        );
        return this.clamp(
            Math.max(averageDiff, maxDiff + terrainClearance) / verticalOffsetScale,
            -0.35,
            1.20
        );
    }

    getWheelYOffset(localX, localZ) {
        if (!this.terrain || !this.currentPose) return 0;

        const terrainY = this.terrain.getHeightAt(...this.localToWorldXZ(localX, localZ));
        const wheelBottomY = this.localWorldHeight(localX, this.wheelGroundLocalY, localZ, this.currentPose);

        return this.clamp((terrainY - wheelBottomY) / this.scaleFactor, -0.20, 0.20);
    }

    localWorldHeight(localX, localY, localZ, pose) {
        return this.localPointToWorld(localX, localY, localZ, pose)[1];
    }

    localPointToWorldXZ(localX, localY, localZ, pose) {
        const [worldX, , worldZ] = this.localPointToWorld(localX, localY, localZ, pose);
        return [worldX, worldZ];
    }

    localPointToWorld(localX, localY, localZ, pose) {
        const p = pose ?? { y: 0, pitch: 0, roll: 0 };
        const scaledX = localX * this.scaleFactor;
        const scaledY = localY * this.scaleFactor;
        const scaledZ = localZ * this.scaleFactor;

        const cr = Math.cos(p.roll);
        const sr = Math.sin(p.roll);
        const rollX = scaledX * cr - scaledY * sr;
        const rollY = scaledX * sr + scaledY * cr;

        const cp = Math.cos(p.pitch);
        const sp = Math.sin(p.pitch);
        const pitchY = rollY * cp - scaledZ * sp;
        const pitchZ = rollY * sp + scaledZ * cp;

        const cy = Math.cos(this.rotation);
        const sy = Math.sin(this.rotation);
        return [
            this.x + rollX * cy + pitchZ * sy,
            p.y + pitchY,
            this.z - rollX * sy + pitchZ * cy,
        ];
    }

    localToWorldXZ(localX, localZ) {
        return this.localToWorldXZAt(localX, localZ, this.x, this.z, this.rotation);
    }

    localToWorldXZAt(localX, localZ, originX, originZ, rotation) {
        const c = Math.cos(rotation);
        const s = Math.sin(rotation);
        const sx = localX * this.scaleFactor;
        const sz = localZ * this.scaleFactor;

        return [
            originX + sx * c + sz * s,
            originZ - sx * s + sz * c,
        ];
    }

    averageHeight(points) {
        return points.reduce((sum, p) => sum + p.h, 0) / Math.max(points.length, 1);
    }

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    getGaitIntensity() {
        if (this.speed <= 0.001) return 0.0;

        const speedRatio = this.clamp(this.speed / Math.max(this.maxSpeed, 0.0001), 0.0, 1.0);
        return this.clamp(0.30 + speedRatio * 0.70, 0.0, 1.0);
    }

    getMuleSteerYaw() {
        return this.steerAngle * 0.82;
    }

    getMulePhase(localX) {
        return this.gaitPhase + (localX > 0 ? Math.PI * 0.12 : 0.0);
    }

    getMuleBodyBob(localX) {
        const phase = this.getMulePhase(localX);
        return Math.abs(Math.sin(phase * 2.0)) * 0.012 * this.getGaitIntensity();
    }

    getMuleLeadTransform(localX) {
        const yaw = this.getMuleSteerYaw();
        const c = Math.cos(yaw);
        const s = Math.sin(yaw);
        const pivotZ = this.getFrontAxleZ();
        const dz = this.muleZ - pivotZ;

        return {
            x: localX * c + dz * s,
            z: pivotZ - localX * s + dz * c,
            yaw,
        };
    }

    getMuleLeadPose(localX, terrainOffset) {
        const lead = this.getMuleLeadTransform(localX);

        return {
            ...lead,
            y: terrainOffset + this.getMuleBodyBob(localX),
        };
    }

    getMuleLocalPoint(localX, terrainOffset, pointX, pointY, pointZ) {
        const lead = this.getMuleLeadPose(localX, terrainOffset);
        const c = Math.cos(lead.yaw);
        const s = Math.sin(lead.yaw);
        const scaledX = pointX * this.muleScale;
        const scaledZ = pointZ * this.muleScale;

        return {
            x: lead.x + scaledX * c + scaledZ * s,
            y: lead.y + pointY * this.muleScale,
            z: lead.z - scaledX * s + scaledZ * c,
        };
    }

    // --- displayers

    // ----- Bed --------------------------------------------------------------

    displayBed() {
        // Underbody chassis — two longitudinal rails between the axles
        this.darkWood.apply();
        const railY = this.wheelCenterY + 0.10;
        for (const sx of [-1, 1]) {
            this.drawAt(this.frameRail, sx * (this.bedHalfWidth * 0.55), railY, 0);
        }
        // Short cross-tie connecting the two rails behind the front axle
        this.drawAt(this.frameCross, 0, railY - 0.02, this.bedHalfLength * 0.45);
        this.drawAt(this.frameCross, 0, railY - 0.02, -this.bedHalfLength * 0.45);

        this.darkWood.apply();
        this.drawAt(this.bolsterBeam, 0, this.wheelCenterY + 0.20, -this.bedHalfLength + 0.10);
        this.drawAt(this.bolsterBeam, 0, this.wheelCenterY + 0.20, this.bedHalfLength - 0.10);

        this.wood.apply();
        this.drawAt(this.floor, 0, this.floorTop - 0.06, 0);

        this.darkWood.apply();
        const outerHalfW = this.bedHalfWidth + this.wallThickness * 0.5;
        const wallCenterY = this.floorTop + this.wallHeight * 0.5;
        this.drawAt(this.sideWall, -outerHalfW, wallCenterY, 0);
        this.drawAt(this.sideWall, outerHalfW, wallCenterY, 0);
        // Front stays clear for the driver; the rear keeps its wooden wall
        // while the canvas flap above it is tied up.
        this.drawAt(this.endWall, 0, wallCenterY, -this.bedHalfLength - this.wallThickness * 0.5);
        const tailgateFaceZ = -this.bedHalfLength - this.wallThickness * 0.60;

        this.darkWood.apply();
        for (const x of [-0.32, 0.0, 0.32]) {
            this.drawAt(this.tailgateBatten, x, wallCenterY, tailgateFaceZ);
        }

        this.metal.apply();
        const latchY = this.floorTop + this.wallHeight * 0.52;
        this.drawAt(this.tailgateLatch, 0, latchY, tailgateFaceZ - 0.005);
        for (const x of [-0.20, 0.20]) {
            this.drawAt(this.bolt, x, latchY, tailgateFaceZ - 0.026);
        }

        // Rear corner posts brace the restored back wall.
        const cornerY = this.floorTop + (this.wallHeight + 0.10) * 0.5;
        for (const sx of [-1, 1]) {
            this.drawAt(
                this.cornerPost,
                sx * (this.bedHalfWidth + this.wallThickness * 0.5),
                cornerY,
                -(this.bedHalfLength + this.wallThickness * 0.5)
            );
        }

        // Top rails framing the bed — side rails plus a high rear header.
        this.wood.apply();
        this.drawAt(this.topRail, -outerHalfW - 0.005, this.wallTop + 0.035, 0);
        this.drawAt(this.topRail, outerHalfW + 0.005, this.wallTop + 0.035, 0);
        this.drawAt(this.crossRail, 0, this.wallTop + 0.035, -this.bedHalfLength - this.wallThickness * 0.5);


        // Mid stake rail on each side wall — visible plank seam below top rail
        this.wood.apply();
        const stakeY = this.floorTop + this.wallHeight * 0.55;
        for (const sx of [-1, 1]) {
            this.drawAt(this.stakeRail, sx * (outerHalfW + this.wallThickness * 0.45), stakeY, 0);
        }

        // Tailgate hinges on the restored rear wall.
        this.metal.apply();
        for (const sx of [-1, 1]) {
            this.drawAt(
                this.tailgateHinge,
                sx * (this.bedHalfWidth * 0.55),
                this.floorTop + 0.08,
                -this.bedHalfLength - this.wallThickness * 0.55
            );
            this.drawAt(
                this.tailgateHinge,
                sx * (this.bedHalfWidth * 0.55),
                this.floorTop + this.wallHeight - 0.10,
                -this.bedHalfLength - this.wallThickness * 0.55
            );
        }

        // Iron bolts at the rear corner posts only.
        this.metal.apply();
        for (const sx of [-1, 1]) {
            this.drawAt(
                this.bolt,
                sx * (outerHalfW + 0.02),
                this.floorTop + this.wallHeight * 0.28,
                -(this.bedHalfLength + this.wallThickness * 0.55),
                0, Math.PI / 2, 0
            );
            this.drawAt(
                this.bolt,
                sx * (outerHalfW + 0.02),
                this.floorTop + this.wallHeight * 0.78,
                -(this.bedHalfLength + this.wallThickness * 0.55),
                0, Math.PI / 2, 0
            );
        }
    }

    displayDriverSeat() {
        const seatZ = this.bedHalfLength - 0.35;
        const seatY = this.floorTop + 0.20;

        // Hidden support legs underneath the seat (anchored to the bed floor)
        this.darkWood.apply();
        for (const sx of [-1, 1]) {
            for (const sz of [-1, 1]) {
                this.drawAt(this.seatSupport, sx * 0.42, seatY - 0.16, seatZ + sz * 0.18);
            }
        }

        // Riser plank in front of the seat (reads like a kick-board built
        // into the wagon, closing the gap between floor and seat front)
        this.darkWood.apply();
        this.drawAt(this.seatRiser, 0, seatY - 0.05, seatZ + 0.27);

        // Wide seat plank that spans wall-to-wall — part of the wagon structure
        this.wood.apply();
        this.drawAt(this.driverSeat, 0, seatY, seatZ);

        // Leather cushion on top of the seat
        this.leather.apply();
        this.drawAt(this.benchCushion, 0, seatY + 0.075, seatZ);

        // Low back panel running wall-to-wall, like a continuation of the bed
        this.wood.apply();
        this.drawAt(this.seatBack, 0, seatY + 0.18, seatZ - 0.24);

        // Footboard — slanted plank just ahead of the driver seat
        this.scene.pushMatrix();
        this.scene.translate(0, this.floorTop + 0.02, this.bedHalfLength + 0.18);
        this.scene.rotate(-0.20, 1, 0, 0);
        this.footboard.display();
        this.scene.popMatrix();

        // Brake stick — outboard of the right wall, ahead of the bed, tilted
        // back toward the driver. All three pieces (bracket, lever, knob) are
        // anchored from the same base point so the geometry stays consistent.
        const sideOuterFaceX = this.bedHalfWidth + this.wallThickness;
        const brakeX = sideOuterFaceX + 0.045;          // bracket inner face touches the wall
        const brakeBaseY = this.floorTop + this.wallHeight * 0.50;
        const brakeBaseZ = this.bedHalfLength - 0.18;   // mounted on the side wall, not floating ahead
        const brakeAngle = 0.32;                         // lean from vertical (rad)
        const brakeLen = 0.85;
        const cosA = Math.cos(brakeAngle);
        const sinA = Math.sin(brakeAngle);
        const brakeTopY = brakeBaseY + cosA * brakeLen;
        const brakeTopZ = brakeBaseZ - sinA * brakeLen;
        const brakeCenterY = brakeBaseY + cosA * brakeLen * 0.5;
        const brakeCenterZ = brakeBaseZ - sinA * brakeLen * 0.5;

        // Iron bracket bolted to the wagon at the base
        this.metal.apply();
        this.drawAt(this.brakeBracket, brakeX, brakeBaseY, brakeBaseZ);

        // Wood lever — its centre is the midpoint between base and top, so
        // the lever bottom lands exactly on the bracket.
        this.darkWood.apply();
        this.scene.pushMatrix();
        this.scene.translate(brakeX, brakeCenterY, brakeCenterZ);
        this.scene.rotate(-brakeAngle, 1, 0, 0);
        this.scene.rotate(Math.PI / 2, 0, 0, 1);
        this.brakeLever.display();
        this.scene.popMatrix();

        // Iron knob placed AT the lever top (Y slightly above to sit on it)
        this.metal.apply();
        this.drawAt(this.brakeKnob, brakeX, brakeTopY + 0.025, brakeTopZ);

        // Brake shoe pressed against the rear right wheel
        this.darkWood.apply();
        this.drawAt(
            this.brakeShoe,
            this.bedHalfWidth + 0.06,
            this.wheelCenterY + this.wheelOuterRadius * 0.55,
            -this.bedHalfLength + 0.10
        );
    }

    // ----- Running gear ----------------------------------------------------

    displayRunningGear() {
        this.displayRearRunningGear();
        this.displayFrontSteeringAssembly();
    }

    displayRearRunningGear() {
        const rearAxleZ = -this.bedHalfLength + 0.10;
        const wheelHalfSpan = this.bedHalfWidth + 0.20;
        const leftOffset = this.getWheelYOffset(-this.bedHalfWidth - 0.18, rearAxleZ);
        const rightOffset = this.getWheelYOffset(this.bedHalfWidth + 0.18, rearAxleZ);

        this.metal.apply();
        this.drawAt(this.axle, 0, this.wheelCenterY + (leftOffset + rightOffset) * 0.5, rearAxleZ);

        for (const x of [-wheelHalfSpan, wheelHalfSpan]) {
            this.displayWheel(x, this.wheelCenterY + this.getWheelYOffset(x, rearAxleZ), rearAxleZ);
        }
    }

    displayFrontSteeringAssembly() {
        const frontAxleZ = this.getFrontAxleZ();
        const wheelHalfSpan = this.bedHalfWidth + 0.20;
        const wheelOffsets = [-wheelHalfSpan, wheelHalfSpan].map((x) => {
            const p = this.getSteeredPoint(x, this.wheelCenterY, frontAxleZ);
            return {
                x,
                offset: this.getWheelYOffset(p.x, p.z),
            };
        });
        const pivotY = this.wheelCenterY +
            (wheelOffsets[0].offset + wheelOffsets[1].offset) * 0.5;

        this.scene.pushMatrix();
        this.scene.translate(0, pivotY, frontAxleZ);
        this.scene.rotate(this.steerAngle, 0, 1, 0);

        this.metal.apply();
        this.axle.display();

        for (const wheel of wheelOffsets) {
            this.displayWheel(wheel.x, this.wheelCenterY + wheel.offset - pivotY, 0);
        }

        this.displayHitch(pivotY, frontAxleZ);

        this.scene.popMatrix();
    }

    getFrontAxleZ() {
        return this.bedHalfLength - 0.10;
    }

    getSteeredPoint(x, y, z) {
        const pivotZ = this.getFrontAxleZ();
        const dz = z - pivotZ;
        const c = Math.cos(this.steerAngle);
        const s = Math.sin(this.steerAngle);

        return {
            x: x * c + dz * s,
            y,
            z: pivotZ - x * s + dz * c,
        };
    }

    displayWheel(x, y, z) {
        // The wheel sits on the outside of the bed; the hub cap (visible
        // protruding nut) belongs on the outboard face of the hub.
        const outboardSign = x > 0 ? 1 : -1;

        this.scene.pushMatrix();
        this.scene.translate(x, y, z);
        this.scene.rotate(this.wheelSpinAngle, 1, 0, 0);

        this.darkWood.apply();
        this.wheelRim.display();
        this.hub.display();

        for (let i = 0; i < 12; i++) {
            this.scene.pushMatrix();
            this.scene.rotate((i / 12) * Math.PI * 2, 1, 0, 0);
            this.scene.translate(0, (this.wheelOuterRadius - 0.08) * 0.5, 0);
            this.spoke.display();
            this.scene.popMatrix();
        }

        this.metal.apply();
        this.wheelBand.display();

        // Hub plate (iron washer) flush against the spokes on both faces
        for (const side of [-1, 1]) {
            this.scene.pushMatrix();
            this.scene.translate(side * 0.115, 0, 0);
            this.hubPlate.display();
            this.scene.popMatrix();
        }

        // Outboard hub cap — short fat cylinder hiding the linchpin
        this.scene.pushMatrix();
        this.scene.translate(outboardSign * 0.13, 0, 0);
        this.scene.rotate(outboardSign * Math.PI / 2, 0, 0, 1);
        this.hubCap.display();
        this.scene.popMatrix();

        // Inboard linchpin — small rod going through the axle nut
        this.scene.pushMatrix();
        this.scene.translate(-outboardSign * 0.16, 0, 0);
        this.scene.rotate(outboardSign * Math.PI / 2, 0, 0, 1);
        this.linchPin.display();
        this.scene.popMatrix();

        // Iron tire studs spaced around the rim
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            this.scene.pushMatrix();
            this.scene.translate(outboardSign * 0.018, Math.cos(a) * this.wheelOuterRadius, Math.sin(a) * this.wheelOuterRadius);
            this.tireStud.display();
            this.scene.popMatrix();
        }

        // Iron lug bolts arranged on the outboard face of the hub
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            this.scene.pushMatrix();
            this.scene.translate(outboardSign * 0.135, Math.cos(a) * 0.085, Math.sin(a) * 0.085);
            this.lugBolt.display();
            this.scene.popMatrix();
        }

        this.scene.popMatrix();
    }

    // ----- Cover ----------------------------------------------------------

    displayCover() {
        const coverBaseY = this.wallTop + 0.005;
        const coverCenterZ = (this.coverFrontZ + this.coverBackZ) * 0.5;

        this.cloth.apply();
        this.drawAt(this.cover, 0, coverBaseY, coverCenterZ);

        // Wooden bows following the cover profile.
        this.wood.apply();
        const bowZs = [
            this.coverBackZ + 0.05,
            this.coverBackZ + this.coverLength * 0.30,
            this.coverBackZ + this.coverLength * 0.55,
            this.coverBackZ + this.coverLength * 0.80,
            this.coverFrontZ - 0.04,
        ];
        for (const z of bowZs) {
            this.drawAt(this.coverBow, 0, coverBaseY, z);
        }

        // Two ridge poles up high for visual structure
        const archTop = coverBaseY + this.coverSideHeight + this.coverArchHeight;
        for (const x of [-0.30, 0.30]) {
            this.drawAt(this.ridgePole, x, archTop - 0.05, coverCenterZ, 0, Math.PI / 2, 0);
        }

        // Canvas flaps make both openings look intentional.
        this.displayRearRolledCoverFlap(this.coverBackZ - 0.04);
        this.displayFrontRolledCoverFlap(this.coverFrontZ + 0.04);
    }

    displayRearRolledCoverFlap(z) {
        this.displayRolledCoverFlap(z, this.rearCoverArchRoll, true);
    }

    displayFrontRolledCoverFlap(z) {
        this.displayRolledCoverFlap(z, this.frontCoverArchRoll, false);
    }

    displayRolledCoverFlap(z, archRoll, addRearDetail) {
        const baseY = this.wallTop + 0.005;
        const topY = baseY + this.coverSideHeight + this.coverArchHeight - 0.03;
        const sideY = baseY + this.coverSideHeight * 0.55;
        const sideX = this.coverHalfWidth + 0.02;

        this.cloth.apply();
        this.drawAt(archRoll, 0, baseY, z);

        this.leather.apply();
        if (!addRearDetail) {
            this.drawCoverTieRing(0, topY, z);
        }

        for (const sx of [-1, 1]) {
            this.drawAt(this.frontCoverStrap, sx * sideX, sideY, z);
            this.drawAt(this.frontCoverStrap, sx * sideX, sideY + 0.36, z);
        }

        if (!addRearDetail) return;

        const rearTiePoints = [
            { x: -0.70, y: topY - 0.28, angle: -0.16 },
            { x: -0.44, y: topY - 0.10, angle: -0.12 },
            { x: 0.00, y: topY - 0.03, angle: 0.00 },
            { x: 0.44, y: topY - 0.10, angle: 0.12 },
            { x: 0.70, y: topY - 0.28, angle: 0.16 },
        ];
        for (let i = 0; i < rearTiePoints.length; i++) {
            const tie = rearTiePoints[i];
            this.drawAt(
                this.rearTieTail,
                tie.x,
                tie.y - 0.20,
                z - 0.012,
                0,
                0,
                tie.angle + this.getRearTieSwing(i)
            );
        }

        for (const sx of [-1, 1]) {
            this.drawAt(
                this.rearTieTail,
                sx * sideX,
                sideY + 0.11,
                z - 0.012,
                0,
                0,
                -sx * 0.12 + this.getRearTieSwing(sx < 0 ? 5 : 6)
            );
        }
    }

    getRearTieSwing(index) {
        const steerLean = this.clamp(-this.steerAngle * 0.42, -0.24, 0.24);
        const roadSway = Math.sin(this.gaitPhase * 2.4 + index * 0.75) * 0.045 * this.getGaitIntensity();
        return steerLean + roadSway;
    }

    drawCoverTieRing(x, y, z) {
        this.drawAt(this.coverFlapTie, x, y, z, 0, Math.PI / 2, 0);
    }

    // ----- Cargo ----------------------------------------------------------

    displayCargo() {
        // visually accurate to gameplay
        const cargoSlots = [
            { x: 0.00, y: 1.46, z: 0.40, rotation: 0.06, scale: 2.1 },
            { x: 0.08, y: 2.22, z: 0.25, rotation: 1.39, scale: 2.1 },
        ];

        const baleCount = Math.max(0, Math.min(this.cargoBaleCount, cargoSlots.length));

        for (let i = 0; i < baleCount; i++) {
            const slot = cargoSlots[i];
            this.displayBale(slot.x, slot.y, slot.z, slot.rotation, slot.scale);
        }
    }

    displayBale(x, y, z, rotation, scale) {
        this.scene.pushMatrix();
        this.scene.translate(x, y, z);
        this.scene.rotate(rotation, 0, 1, 0);
        this.scene.scale(scale, scale, scale);

        this.hayBaleGeometry.display();

        this.scene.popMatrix();
    }

    // ----- Hitch (central tongue + rear lateral stick) -------------------

    displayHitch(pivotY = 0, pivotZ = 0) {
        const tongueBackY = this.tongueY - pivotY;
        const tongueFrontY = this.tongueFrontY - pivotY;   // rises slightly toward horses
        const tongueBackZ = this.tongueBackZ - pivotZ;
        const tongueFrontZ = this.tongueFrontZ - pivotZ;

        // One central pole from the wagon to the horse line.
        this.darkWood.apply();
        this.drawShaft(0, tongueBackY, tongueBackZ, tongueFrontY, tongueFrontZ, this.tongueBeam);

        // One lateral stick across the back of the horses.
        this.drawAt(this.lateralStick, 0, this.lateralStickY - pivotY, this.lateralStickZ - pivotZ);

        // Small caps on the lateral-stick ends and pole tip.
        this.metal.apply();
        for (const sign of [-1, 1]) {
            this.scene.pushMatrix();
            this.scene.translate(
                sign * this.lateralStickHalfWidth,
                this.lateralStickY - pivotY,
                this.lateralStickZ - pivotZ
            );
            this.ironCap.display();
            this.scene.popMatrix();
        }

        // Iron ring at the very tip of the tongue, used by the inner reins.
        this.scene.pushMatrix();
        this.scene.translate(0, tongueFrontY + 0.04, tongueFrontZ);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.tongueRing.display();
        this.scene.popMatrix();

        // Matching rings near the lateral-stick edges, where the outer reins tie on.
        for (const side of [-1, 1]) {
            this.scene.pushMatrix();
            this.scene.translate(
                side * (this.muleHalfSpacing + this.muleScale * 0.48),
                this.lateralStickY + 0.04 - pivotY,
                this.lateralStickZ + 0.05 - pivotZ
            );
            this.lateralRopeRing.display();
            this.scene.popMatrix();
        }
    }

    // ----- Harness --------------------------------------------------------

    displayHarness() {
        this.leather.apply();
        for (const side of [-1, 1]) {
            this.displayHorseHarness(side);
        }
    }

    /** Draw the mouth reins for one mule (side = ±1). */
    displayHorseHarness(side) {
        const muleX = side * this.muleHalfSpacing;
        const offset = side < 0 ? this.leftMuleOffset : this.rightMuleOffset;
        const reinSway = Math.sin(this.gaitPhase * 2.0 + side * 0.6) * 0.05 * this.getGaitIntensity();
        const outerRing = this.getMuleLocalPoint(muleX, offset, side * 0.22, 1.66, 1.52);
        const innerRing = this.getMuleLocalPoint(muleX, offset, -side * 0.22, 1.66, 1.52);

        // Both reins first tie onto the lateral stick behind the horses. The
        // outer rein ties near the outside end; the inner rein ties near the
        // middle ring, with separate side points so the two inner ropes never
        // cross over each other.
        const outerShaftTieX = side * (this.muleHalfSpacing + this.muleScale * 0.48);
        const innerShaftTieX = side * 0.055;
        const shaftTieY = this.lateralStickY + 0.04;
        const outerTieZ = this.lateralStickZ + 0.05;
        const innerTieZ = this.lateralStickZ;
        const outerTie = this.getSteeredPoint(outerShaftTieX, shaftTieY, outerTieZ);
        const innerTie = this.getSteeredPoint(innerShaftTieX, shaftTieY, innerTieZ);

        // After tying to the side stick, the reins continue back toward the
        // wagon along the same side.
        const wagonOuterX = side * 0.42;
        const wagonInnerX = side * 0.16;
        const wagonY = this.floorTop + 0.55;
        const wagonZ = this.bedHalfLength + 0.08;

        this.leather.apply();
        this.drawSaggingRope(
            outerRing.x, outerRing.y, outerRing.z,
            outerTie.x, outerTie.y, outerTie.z,
            0.12, 18,
            this.reinSegment,
            side * 0.42
        );
        this.drawSaggingRope(
            innerRing.x, innerRing.y, innerRing.z,
            innerTie.x, innerTie.y, innerTie.z,
            0.15, 22,
            this.reinSegment,
            -side * 0.13 + reinSway
        );
        this.drawSaggingRope(
            outerTie.x, outerTie.y, outerTie.z,
            wagonOuterX, wagonY, wagonZ,
            0.08, 16,
            this.reinSegment
        );
        this.drawSaggingRope(
            innerTie.x, innerTie.y, innerTie.z,
            wagonInnerX, wagonY, wagonZ,
            0.07, 16,
            this.reinSegment
        );
    }

    // ----- Mule (called twice — for left and right animal) ----------------

    displayMule(localX, terrainOffset) {
        const phase = this.getMulePhase(localX);
        const intensity = this.getGaitIntensity();
        const lead = this.getMuleLeadPose(localX, terrainOffset);
        const tailSway = Math.sin(phase + 0.7) * 0.18 * intensity;

        this.scene.pushMatrix();
        this.scene.translate(lead.x, lead.y, lead.z);
        this.scene.rotate(lead.yaw, 0, 1, 0);
        // Scale the entire mule frame by muleScale so the OBJ and the overlay
        // details share the same coordinate system.
        this.scene.scale(this.muleScale, this.muleScale, this.muleScale);

        // Warm saddle-brown hide for the left animal, chestnut for the right
        const hide = localX < 0 ? this.muleMaterial : this.muleDarkMaterial;
        hide.apply();

        // OBJ body — disable face culling because the export does not have
        // consistently outward-facing normals on every group.
        this.scene.gl.disable(this.scene.gl.CULL_FACE);
        this.mule.displayAnimated(phase, intensity);
        this.scene.gl.enable(this.scene.gl.CULL_FACE);

        // Tail tuft at the tip of the OBJ tail (tail ends near y=0.55, z=-1.45)
        this.maneMaterial.apply();
        this.displayManeCrest();

        this.scene.pushMatrix();
        this.scene.translate(0, 1.13, -1.12);
        this.scene.rotate(tailSway, 0, 1, 0);
        this.scene.translate(0, -1.13, 1.12);
        this.scene.translate(0, 0.56, -1.46);
        this.scene.rotate(-0.35, 1, 0, 0);
        this.tailTuft.display();
        this.scene.popMatrix();

        this.displayAnimatedHoofOverlays(phase, intensity);
        this.displayMuleDetails();
        this.scene.popMatrix();
    }

    displayManeCrest() {
        // Centers follow the top curve of the rounded neck. Because each block
        // is half-buried into the OBJ neck, the visible protruding part reads
        // like equal dark squares instead of changing size with the curve.
        const crestBlocks = [
            { y: 1.755, z: 0.455 },
            { y: 1.850, z: 0.575 },
            { y: 1.905, z: 0.695 },
            { y: 1.945, z: 0.815 },
            { y: 1.960, z: 0.935 },
            { y: 1.935, z: 1.055 },
        ];

        for (const block of crestBlocks) {
            this.drawAt(this.maneCrestBlock, 0, block.y, block.z);
        }
    }

    displayMuleDetails() {
        // OBJ mule head bounds (positions below are in OBJ-scaled mule frame):
        //   head   x[-0.28, 0.28]  y[1.66, 2.12]  z[0.88, 1.60]
        //   muzzle x[-0.21, 0.21]  y[1.58, 1.88]  z[1.35, 1.89]
        //
        // Bit + bit-rings position: across the corners of the mouth at the
        // back of the muzzle, near the cheek. The rein anchors on the same
        // ring centres so the rope visibly clips on.
        const bitY = 1.68;
        const bitZ = 1.52;
        const bitRingX = 0.22;
        const bitRingY = bitY - 0.02;

        // ----- Face: eyes ---------------------------------------------------
        // Just the dark pupils — no highlights, no eyelid, nothing below them.
        this.eyeMaterial.apply();
        this.drawAt(this.eye, -0.245, 1.92, 1.28);
        this.drawAt(this.eye, 0.245, 1.92, 1.28);

        // Nostrils — set into the front of the muzzle
        this.tissue.apply();
        this.drawAt(this.nostril, -0.090, 1.74, 1.86);
        this.drawAt(this.nostril, 0.090, 1.74, 1.86);

        // ----- Forelock between the ears -----------------------------------
        this.maneMaterial.apply();
        this.drawAt(this.forelock, 0, 2.08, 1.18, -0.10, 0, 0);

        // ----- Bridle straps (top of the head only — no cheek pieces) -----
        this.leather.apply();
        this.drawAt(this.noseStrap, 0, 1.72, 1.62);              // noseband
        this.drawAt(this.browStrap, 0, 2.02, 1.34);              // browband
        this.drawAt(this.pollStrap, 0, 2.08, 1.14);              // small poll strap between ears

        // ----- Bit + side rings --------------------------------------------
        this.ironDark.apply();
        this.drawAt(this.bit, 0, bitY, bitZ);
        for (const sign of [-1, 1]) {
            // Ring sits OUTSIDE the bit end so it's visible as a real ring
            this.drawAt(this.bitRing, sign * bitRingX, bitRingY, bitZ);
        }

    }

    displayAnimatedHoofOverlays(phase, intensity) {
        this.hoofMaterial.apply();

        const hooves = [
            { side: 'Left', pair: 'Front', x: -0.24, z: 0.560, phaseOffset: 0.0 },
            { side: 'Right', pair: 'Front', x: 0.24, z: 0.560, phaseOffset: Math.PI },
            { side: 'Left', pair: 'Back', x: -0.24, z: -0.660, phaseOffset: Math.PI },
            { side: 'Right', pair: 'Back', x: 0.24, z: -0.660, phaseOffset: 0.0 },
        ];

        for (const hoof of hooves) {
            const pose = this.getMuleLegPose(hoof.side, hoof.pair, phase, intensity, hoof.phaseOffset);

            this.scene.pushMatrix();
            this.applyPivotRotation(pose.upperPivot, pose.upperAngle, 1, 0, 0);
            this.applyPivotRotation(pose.lowerPivot, pose.lowerAngle, 1, 0, 0);
            this.drawAt(this.hoofWrap, hoof.x, this.hoofCenterY, hoof.z);
            this.scene.popMatrix();
        }
    }

    getMuleLegPose(side, pair, phase, intensity, phaseOffset = 0.0) {
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

    // ----- Beam helpers ---------------------------------------------------

    drawShaft(x, backY, backZ, frontY, frontZ, geometry) {
        const dy = frontY - backY;
        const dz = frontZ - backZ;
        const length = Math.hypot(dy, dz);
        if (length < 0.0001) return;

        const pitch = -Math.atan2(dy, dz);

        this.scene.pushMatrix();
        this.scene.translate(x, (backY + frontY) * 0.5, (backZ + frontZ) * 0.5);
        this.scene.rotate(pitch, 1, 0, 0);
        this.scene.rotate(-Math.PI / 2, 0, 1, 0);
        this.scene.scale(length, 1, 1);
        geometry.display();
        this.scene.popMatrix();
    }

    // ----- Rope helpers ---------------------------------------------------

    drawSaggingRope(x0, y0, z0, x1, y1, z1, sag, segments, geometry, xDeflect = 0) {
        // Quadratic Bézier control point: averaged endpoints, pulled down by
        // `sag` (gravity) and pulled sideways by `xDeflect` so the rope can
        // curve around obstacles (e.g., a horse's flank).
        const midX = (x0 + x1) * 0.5 + xDeflect;
        const midY = Math.min(y0, y1) - sag;
        const midZ = (z0 + z1) * 0.5;
        let prev = { x: x0, y: y0, z: z0 };

        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const inv = 1 - t;
            const x = inv * inv * x0 + 2 * inv * t * midX + t * t * x1;
            const y = inv * inv * y0 + 2 * inv * t * midY + t * t * y1;
            const z = inv * inv * z0 + 2 * inv * t * midZ + t * t * z1;

            this.drawRopeSegment3D(prev.x, prev.y, prev.z, x, y, z, geometry);
            prev = { x, y, z };
        }
    }

    drawRopeSegment3D(x0, y0, z0, x1, y1, z1, geometry) {
        const dx = x1 - x0;
        const dy = y1 - y0;
        const dz = z1 - z0;
        const length = Math.hypot(dx, dy, dz);
        if (length <= 0.0001) return;

        const cx = (x0 + x1) * 0.5;
        const cy = (y0 + y1) * 0.5;
        const cz = (z0 + z1) * 0.5;

        const yaw = Math.atan2(dx, dz);
        const horizontal = Math.hypot(dx, dz);
        const pitch = -Math.atan2(dy, horizontal);

        this.scene.pushMatrix();
        this.scene.translate(cx, cy, cz);
        this.scene.rotate(yaw, 0, 1, 0);
        this.scene.rotate(pitch, 1, 0, 0);
        this.scene.scale(1, 1, length);
        geometry.display();
        this.scene.popMatrix();
    }

    drawAt(object, x, y, z, rotX = 0, rotY = 0, rotZ = 0) {
        this.scene.pushMatrix();
        this.scene.translate(x, y, z);
        if (rotX !== 0) this.scene.rotate(rotX, 1, 0, 0);
        if (rotY !== 0) this.scene.rotate(rotY, 0, 1, 0);
        if (rotZ !== 0) this.scene.rotate(rotZ, 0, 0, 1);
        object.display();
        this.scene.popMatrix();
    }

    advanceMovementAnimation(distance) {
        const wheelWorldRadius = Math.max(this.wheelOuterRadius * this.scaleFactor, 0.0001);
        this.wheelSpinAngle = (this.wheelSpinAngle + distance / wheelWorldRadius) % (Math.PI * 2);
        this.gaitPhase = (this.gaitPhase + (distance / Math.max(this.scaleFactor, 0.0001)) * 3.2) % (Math.PI * 2);
    }

    display() {
        if (!this.visible) return;
        const pose = this.getTerrainPose();
        this.currentPose = pose;
        this.leftMuleOffset = this.getMuleTerrainOffset(-this.muleHalfSpacing, pose);
        this.rightMuleOffset = this.getMuleTerrainOffset(this.muleHalfSpacing, pose);

        this.scene.pushMatrix();
        this.scene.translate(this.x, pose.y, this.z);
        this.scene.rotate(this.rotation, 0, 1, 0);
        this.scene.rotate(pose.pitch, 1, 0, 0);
        this.scene.rotate(pose.roll, 0, 0, 1);
        this.scene.scale(this.scaleFactor, this.scaleFactor, this.scaleFactor);

        this.displayRunningGear();
        this.displayBed();
        this.displayDriverSeat();
        this.displayCover();
        this.displayCargo();
        this.displayMule(-this.muleHalfSpacing, this.leftMuleOffset);
        this.displayMule(this.muleHalfSpacing, this.rightMuleOffset);
        this.displayHarness();

        this.scene.popMatrix();
    }

    // --- exposed getters

    getPose() {
        return {
            x: this.x,
            z: this.z,
            rotation: this.rotation,
        };
    }

    getBaleInteractionPoint() {
        return {
            x: this.x - Math.sin(this.rotation) * this.hayBaleInteractionOffset,
            z: this.z - Math.cos(this.rotation) * this.hayBaleInteractionOffset,
        };
    }

    getCollisionCirclesAt(originX = this.x, originZ = this.z, rotation = this.rotation, margin = 0.0) {
        return this.collisionFootprint.map((circle) => {
            const [x, z] = this.localToWorldXZAt(circle.x, circle.z, originX, originZ, rotation);

            return {
                x,
                z,
                radius: circle.radius * this.scaleFactor + margin,
            };
        });
    }

    getTerrainPose() {
        if (!this.terrain) return { y: 0, pitch: 0, roll: 0 };

        const halfW = this.bedHalfWidth + this.wallThickness * 0.5;
        const halfL = this.bedHalfLength * 0.78;
        const contacts = [
            { x: -halfW, z: -halfL },
            { x: halfW, z: -halfL },
            { x: -halfW, z: halfL },
            { x: halfW, z: halfL },
        ].map((p) => ({ ...p, h: this.terrain.getHeightAt(...this.localToWorldXZ(p.x, p.z)) }));

        const left = this.averageHeight(contacts.filter((p) => p.x < 0));
        const right = this.averageHeight(contacts.filter((p) => p.x > 0));
        const front = this.averageHeight(contacts.filter((p) => p.z > 0.5));
        const back = this.averageHeight(contacts.filter((p) => p.z < 0));
        const roll = this.clamp(
            Math.atan2(right - left, this.scaleFactor * 2.34),
            -this.maxTerrainTilt,
            this.maxTerrainTilt
        );
        const pitch = this.clamp(
            Math.atan2(back - front, this.scaleFactor * (halfL * 2)),
            -this.maxTerrainTilt,
            this.maxTerrainTilt
        );
        const y = contacts.reduce((sum, p) => {
            return sum + p.h - this.scaleFactor * (
                this.wheelGroundLocalY + p.x * Math.sin(roll) - p.z * Math.sin(pitch)
            );
        }, 0) / contacts.length;

        return { y, pitch, roll };
    }

    // --- exposed setters

    setPose(x, z, rotation = this.rotation) {
        this.x = x;
        this.z = z;
        this.rotation = rotation;
    }

    setMotionState({ speed = this.speed, maxSpeed = this.maxSpeed, steerAngle = this.steerAngle }) {
        this.speed = speed;
        this.maxSpeed = maxSpeed;
        this.steerAngle = steerAngle;
    }

    setCargoBaleCount(count) {
        this.cargoBaleCount = count;
    }
}
