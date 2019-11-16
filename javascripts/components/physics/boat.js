import {
    vectorMag,
    vectorSum,
    getUnitVector,
    getHeadingDeg,
    toRadians
} from '../util/vector_util';
import Foil from './foil';

class Boat {
    constructor(){

        //PARTS
        this.sail = new Foil(0.8, 0.4, 0.1);        //0.8, 0.4, 0.1
        this.centerBoard = new Foil(4, 1, 0);       //4, 1, 0
        this.hull = new Foil(0, 0, 1);              //0, 0, 1

        //PHYSICAL CONSTANTS
        this.mass = 5;
        this.heelInertia = 500;
        this.boatWeight = 500;
        this.sailorWeight = 5000;
        this.tipDragCoeff = 750;

        //SPEEDS
        this.maxSailorSpeed = 500;         //pixels/second
        this.rudderSpeed = 100;         //deg/second
        this.turningSpeed = 2;          //deg/second/rudder/degree
        this.trimmingSpeed = 30         //deg/second
        this.tippingVelocity = 0;       //deg/second

        //initial component positions
        this.sailorPosition = 0;
        this.rudderAngle = 0;
        this.sailAngle = 60;
        this.heelAngle = 0;
        this.mainSheetPos = 60;         //max |angle| of sail (sheet position)
        this.tack = 'starboard';

        //initial values
        this.position = [600, 400];
        this.heading = 270;
        this.velocity = [0, 0];
        this.appWindDir = [0, 0];
        this.appWindSpeed = 0;
        this.appWindVel = [0, 0];

        //dimensions
        this.maxSailorPosition = 76;    //pixels
        this.maxSheetAngle = 100;       //because of stays or whatever
        this.maxBuoyancyOffset = 40;    //pixels
        this.maxSailOffset = 130;       //pixels
        this.maxBoardOffset = 50;
        
        //offsets
        this.sailorOffset = 0;
        this.sailOffset = this.maxSailOffset;
        this.boardOffset = this.maxBoardOffset; 
        this.buoyancyOffset = 0; 
    }

    updateHeelAngle(dt) {
        this.heelAngle += (this.tippingVelocity * dt);
        if (Math.abs(this.heelAngle) > 45) {
            this.heelAngle = (this.heelAngle > 0 ? 45 : -45);
        }
        let angleFactor = Math.cos(toRadians(Math.abs(this.heelAngle)));
        let zeroAngleFactor = Math.sin(toRadians(-1 * this.heelAngle));
        this.sailOffset = this.maxSailOffset * angleFactor;
        this.boardOffset = this.maxBoardOffset * angleFactor;
        this.buoyancyOffset = this.maxBuoyancyOffset * zeroAngleFactor;
        //move sailor
        let sailorSpeed = this.maxSailorSpeed * Math.sin(Math.abs(toRadians(this.heelAngle)));
        let moveAmt = sailorSpeed * dt;
        if (this.heelAngle > 0) moveAmt *= -1;
        if (Math.abs(this.heelAngle) > 1) this.sailorPosition += moveAmt;
        if (this.sailorPosition > 0){
            if (this.sailorPosition > this.maxSailorPosition) this.sailorPosition = this.maxSailorPosition;
        }
        else {
            if (this.sailorPosition < -1 * this.maxSailorPosition) this.sailorPosition = -1 * this.maxSailorPosition;
        }
        this.sailorOffset = this.sailorPosition * angleFactor;
    }

    updateTippingVelocity(dt) {
        let frictionMoment = this.tipDragCoeff * (this.tippingVelocity) * (this.tippingVelocity);
        if (this.tippingVelocity < 0) frictionMoment *= -1;
        let moment = this.calculateTotalMoment() + frictionMoment;
        let acc = moment / this.heelInertia;
        this.tippingVelocity -= (acc * dt);
    }

    calculateTotalMoment() {
        let heelMoment = this.calculateHeelMoment();
        let rightMoment = this.calculateRightMoment();
        return heelMoment + rightMoment;
    }

    calculateRightMoment() {    //CCW is positive, CW is negative
        let buoyancy = this.boatWeight + this.sailorWeight;
        let moment = (buoyancy * this.buoyancyOffset) + (this.sailorWeight * this.sailorOffset);
        return (this.tack === 'starboard' ? -1 * moment : -1 * moment);
    }

    calculateHeelMoment() {     //CCW is positive, CW is negative
        let sailForce = this.calculateSailHeelForce();
        let boardForce = this.calculateBoardHeelForce();
        let moment = (sailForce * this.sailOffset) + (boardForce * this.boardOffset);
        return (this.tack === 'starboard' ? moment : -1 * moment);
    }

    calculateSailHeelForce() {
        let sailForce = this.calculateForceOnSail();
        let sailForceHeading = getHeadingDeg(sailForce);
        let angle = toRadians(this.heading - sailForceHeading);
        let sailHeelForce = Math.abs(vectorMag(sailForce) * Math.sin(angle));
        return sailHeelForce;
    }

    calculateBoardHeelForce() {
        let boardForce = this.calculateForceOnCenterBoard();
        let boardForceHeading = getHeadingDeg(boardForce);
        let angle = toRadians(this.heading - boardForceHeading);
        let boardHeelForce = Math.abs(vectorMag(boardForce) * Math.sin(angle));
        return boardHeelForce;
    }

    pushRudder(dt, dir) {
        this.moveRudder(-dir * dt * this.rudderSpeed);
    }

    moveRudder(angle) {
        this.rudderAngle += angle;
        if (this.rudderAngle < -80) this.rudderAngle = -80;
        if (this.rudderAngle > 80) this.rudderAngle = 80;
    }

    trimMain(dt, dir) {
        let sheetAngle = dir * dt * this.trimmingSpeed;
        this.mainSheetPos += sheetAngle;
        if (this.mainSheetPos > this.maxSheetAngle){
            this.mainSheetPos = this.maxSheetAngle;
        }
        if (this.mainSheetPos < 0){
            this.mainSheetPos = 0;
        }
    }

    updateHeading(dt) {
        this.heading -= this.turningSpeed * this.rudderAngle * dt;
        if (this.heading > 360) this.heading -= 360;
        if (this.heading < 0) this.heading += 360;
    }

    calculateTotalForceOnBoat() {
        let sailForce = this.calculateForceOnSail();
        let boardForce = this.calculateForceOnCenterBoard();
        let hullForce = this.calculateDragOnHull();
        return [
            sailForce[0] + boardForce[0] + hullForce[0], 
            sailForce[1] + boardForce[1] + hullForce[1]
        ];
    }

    updateVelocity(dt) {
        let totalForce = this.calculateTotalForceOnBoat();
        let acc = [totalForce[0] / this.mass, totalForce[1] / this.mass];
        this.velocity[0] += dt * acc[0];
        this.velocity[1] += dt * acc[1];
    }

    updatePosition(dt) {
        let moveVector = [dt * this.velocity[0], dt * this.velocity[1]];
        this.position[0] += moveVector[0];
        this.position[1] += moveVector[1];
    }

    updateSailAngle(dt) {
        let windHeading = getHeadingDeg(this.appWindDir);

        this.sailAngle = Math.abs(180 - windHeading + this.heading);
        if (this.sailAngle > 180){
            this.sailAngle = this.sailAngle - 360;
        }

        if (Math.abs(this.sailAngle) > this.mainSheetPos) {
            
            this.sailAngle = this.heading < 180 ? 
            this.mainSheetPos : 
            this.mainSheetPos * -1;
        }
        this.tack = this.sailAngle < 0 ? 'starboard' : 'port';
    }

    calculateAppWind(windHeading, windSpeed) {
        let moveDir = getUnitVector(this.velocity);
        let moveHeading = getHeadingDeg(moveDir);
        let radHeading = this.heading * Math.PI/180;
        //let radHeading = moveHeading * Math.PI / 180;
        let boatDir = [Math.sin(radHeading), -Math.cos(radHeading)];
        let boatVel = [boatDir[0] * this.speed, boatDir[1] * this.speed];
        let radTrueWind = (windHeading - 180) * Math.PI/180;
        let trueDir = [Math.sin(radTrueWind), -Math.cos(radTrueWind)];
        let trueVel = [trueDir[0] * windSpeed, trueDir[1] * windSpeed];

        this.appWindVel = [trueVel[0] - this.velocity[0], trueVel[1] - this.velocity[1]];

        this.appWindDir = getUnitVector(this.appWindVel);
        this.appWindSpeed = vectorMag(this.appWindVel);


        
        return this.appWindVel;
    }

    calculateForceOnSail() {
        let lift = this.calculateLiftOnSail();
        let drag = this.calculateDragOnSail();
        return [lift[0] + drag[0], lift[1] + drag[1]];
    }

    //Math.cos(toRadians(Math.abs(this.heelAngle))) * 

    calculateDragOnSail() {
        let absSailAngle = this.heading - this.sailAngle;
        return this.sail.calculateDrag(absSailAngle, this.appWindVel, this.heelAngle);
    }

    calculateLiftOnSail() {
        let absSailAngle = this.heading - this.sailAngle;
        return this.sail.calculateLift(absSailAngle, this.appWindVel, this.heelAngle);
    }

    calculateDragOnCenterBoard() {
        let absBoardAngle = this.heading - 180;
        let waterVector = [-this.velocity[0], -this.velocity[1]];
        let boardDrag = this.centerBoard.calculateDrag(absBoardAngle, waterVector, this.heelAngle);
        return boardDrag;
    }

    calculateLiftOnCenterBoard() {
        let absBoardAngle = this.heading - 180;
        let waterVector = [-this.velocity[0], -this.velocity[1]];
        let boardLift = this.centerBoard.calculateLift(absBoardAngle, waterVector, this.heelAngle);
        return boardLift;
    }

    calculateForceOnCenterBoard() {
        let lift = this.calculateLiftOnCenterBoard();
        let drag = this.calculateDragOnCenterBoard();
        return [lift[0] + drag[0], lift[1] + drag[1]];
    }

    calculateDragOnHull() {
        let absHullAngle = this.heading - 180;
        let waterVector = [-this.velocity[0], -this.velocity[1]];
        let hullDrag = this.hull.calculateDrag(absHullAngle, waterVector);
        return hullDrag;
    }

}

export default Boat;