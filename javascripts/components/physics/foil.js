import {
    vectorMag,
    getUnitVector,
    getHeadingDeg,
    toRadians,
    toDegrees
} from '../util/vector_util';

class Foil {
    constructor(cLift, cDrag, minDrag = 1) {
        this.cLift = cLift;
        this.cDrag = cDrag;
        this.minDrag = minDrag;

        this.angle = 0;
    }

    //both params absolute
    calculateDrag(foilAngle, fluidVelocity, tipAngle = 0) {
        this.angle = foilAngle;

        let fluidDir = getUnitVector(fluidVelocity);
        let fluidHeading = getHeadingDeg(fluidDir);
        let fluidSpeed = vectorMag(fluidVelocity);
        //let angleOfAttack = foilAngle - fluidHeading;
        let angleOfAttack = Math.abs(foilAngle - fluidHeading);
        let radAttack = -(toRadians(angleOfAttack) - Math.PI);
        let dragMag = (this.minDrag * fluidSpeed) + 
            Math.abs(this.cDrag * (fluidSpeed * fluidSpeed) * Math.sin(radAttack));
        dragMag *= Math.cos(toRadians(Math.abs(tipAngle)));
        return [dragMag * fluidDir[0], dragMag * fluidDir[1]];
    }

    calculateLift(foilAngle, fluidVelocity, tipAngle = 0) {
        let fluidDir = getUnitVector(fluidVelocity);
        let fluidHeading = getHeadingDeg(fluidDir);
        let fluidSpeed = vectorMag(fluidVelocity);
        let angleOfAttack = foilAngle - fluidHeading;
        let radAttack = -(toRadians(angleOfAttack) - Math.PI);
        let liftMag = this.cLift * (fluidSpeed * fluidSpeed) * Math.sin(radAttack) * Math.cos(radAttack);
        liftMag *= Math.cos(toRadians(Math.abs(tipAngle)));
        let liftDir = [-fluidDir[1], fluidDir[0]];
        return [liftMag * liftDir[0], liftMag * liftDir[1]];
    }

}

export default Foil;