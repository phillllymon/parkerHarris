import {
    vectorMag,
    getHeading,
    toRadians,
    toDegrees
} from '../util/vector_util';

export const makeInArrow = (ctx, x, y, angle, offset, length, width, color) => {
    let arrowLength = Math.pow(length, 0.6) + 5;
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.moveTo(
        x - (offset * Math.sin(angle)),
        y + (offset * Math.cos(angle))
    );
    ctx.lineTo(
        x - ((offset + arrowLength) * Math.sin(angle)),
        y + ((offset + arrowLength) * Math.cos(angle))
    );
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = color;
    ctx.moveTo(
        x - ((offset - 2) * Math.sin(angle)),
        y + ((offset - 2) * Math.cos(angle))
    );
    ctx.lineTo(
        x - ((offset + 8) * Math.sin(angle + 0.15)),
        y + ((offset + 8) * Math.cos(angle + 0.15))
    );
    ctx.lineTo(
        x - ((offset + 8) * Math.sin(angle - 0.15)),
        y + ((offset + 8) * Math.cos(angle - 0.15))
    );
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
};

export const makeOutArrow = (ctx, x, y, angle, offset, length, width, color) => {
    let arrowLength = Math.pow(length, 0.6) + 5;
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.moveTo(
        x + (offset * Math.sin(angle)),
        y - (offset * Math.cos(angle))
    );
    ctx.lineTo(
        x + ((offset + arrowLength) * Math.sin(angle)),
        y - ((offset + arrowLength) * Math.cos(angle))
    );
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = color;
    ctx.moveTo(
        x + ((offset + arrowLength + 2) * Math.sin(angle)),
        y - ((offset + arrowLength + 2) * Math.cos(angle))
    );
    ctx.lineTo(
        x + ((offset + arrowLength - 8) * Math.sin(angle + 0.15)),
        y - ((offset + arrowLength - 8) * Math.cos(angle + 0.15))
    );
    ctx.lineTo(
        x + ((offset + arrowLength - 8) * Math.sin(angle - 0.15)),
        y - ((offset + arrowLength - 8) * Math.cos(angle - 0.15))
    );
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
};

export const makeStreamRipple = (ctx, x, y, velocity, heading) => {
    let boatVel = velocity;
    let boatSpeed = vectorMag(boatVel);
    let boatVelHeading = getHeading(boatVel);
    let relBoatVelHeading = toRadians(toDegrees(boatVelHeading) - heading);
    let streamVector = [
        boatSpeed * Math.sin(relBoatVelHeading),
        boatSpeed * Math.cos(relBoatVelHeading)
    ];
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'lightblue';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
        x - streamVector[0],
        y + streamVector[1]
    );
    ctx.stroke();
};

export const drawForceArrows = (ctx, x, y, arrows, model, boat, arrowColors = {}) => {

    //apparentWindArrow
    let appDir = boat.appWindDir;
    let appSpeed = boat.appWindSpeed;
    let appHeading = getHeading(appDir);
    let relAppHeading = toRadians(toDegrees(appHeading) - boat.heading);
    if (arrows.appWind) {
        makeInArrow(ctx, x, y, relAppHeading, 100, appSpeed, 6, (arrowColors.appWind ? arrowColors.appWind : 'lightblue'));
    }

    //windDragArrow
    //let appDir = boat.appWindDir;
    let dragAmt = vectorMag(model.dragOnSail);
    let relDragHeading = toRadians(toDegrees(getHeading(appDir)) - boat.heading);
    if (arrows.dragOnSail) {
        makeOutArrow(ctx, x, y, relDragHeading, 50, dragAmt, 6, (arrowColors.dragOnSail ? arrowColors.dragOnSail : 'lightblue'));
    }

    //windLiftArrow
    let liftVec = model.liftOnSail;
    let liftAmt = vectorMag(liftVec);
    let liftHeading = getHeading(liftVec);
    let relLiftHeading = toRadians(toDegrees(liftHeading) - boat.heading);
    if (arrows.sailLift) {
        makeOutArrow(ctx, x, y, relLiftHeading, 50, liftAmt, 6, (arrowColors.sailLift ? arrowColors.sailLift : 'lightblue'));
    }

    //windForceArrow
    let forceVec = model.forceOnSail;
    let forceAmt = vectorMag(forceVec);
    let forceHeading = getHeading(forceVec);
    let relForceHeading = toRadians(toDegrees(forceHeading) - boat.heading);
    if (arrows.sailForce) {
        makeOutArrow(ctx, x, y, relForceHeading, 50, forceAmt, 6, (arrowColors.sailForce ? arrowColors.sailForce : 'lightblue'));
    }

    //boardDragArrow
    let boardDragVec = model.dragOnBoard;
    let boardDragAmt = vectorMag(boardDragVec);
    let boardDragHeading = getHeading(boardDragVec);
    let relBoardDragHeading = toRadians(toDegrees(boardDragHeading) - boat.heading);
    if (arrows.boardDrag) {
        makeOutArrow(ctx, x, y, relBoardDragHeading, 70, boardDragAmt, 6, (arrowColors.boardDrag ? arrowColors.boardDrag : 'lightblue'));
    }

    //boardLiftArrow
    let boardLiftVec = model.liftOnBoard;
    let boardLiftAmt = vectorMag(boardLiftVec);
    let boardLiftHeading = getHeading(boardLiftVec);
    let relBoardLiftHeading = toRadians(toDegrees(boardLiftHeading) - boat.heading);
    if (arrows.boardLift) {
        makeOutArrow(ctx, x, y, relBoardLiftHeading, 50, boardLiftAmt, 6, (arrowColors.boardLift ? arrowColors.boardLift : 'lightblue'));
    }

    //boardForceArrow
    let boardForceVec = model.forceOnBoard;
    let boardForceAmt = vectorMag(boardForceVec);
    let boardForceHeading = getHeading(boardForceVec);
    let relBoardForceHeading = toRadians(toDegrees(boardForceHeading) - boat.heading);
    if (arrows.boardForce) {
        makeOutArrow(ctx, x, y, relBoardForceHeading, 50, boardForceAmt, 6, (arrowColors.boardForce ? arrowColors.boardForce : 'lightblue'));
    }

    //hullDragArrow
    let hullDragVec = model.dragOnHull;
    let hullDragAmt = vectorMag(hullDragVec);
    let hullDragHeading = getHeading(hullDragVec);
    let relHullDragHeading = toRadians(toDegrees(hullDragHeading) - boat.heading);
    if (arrows.hullDrag) {
        makeOutArrow(ctx, x, y, relHullDragHeading, 70, hullDragAmt, 6, (arrowColors.hullDrag ? arrowColors.boardDrag : 'lightblue'));
    }

    //totalForceArrow
    let totalForceVec = model.totalForce;
    let totalForceAmt = vectorMag(totalForceVec);
    let totalForceHeading = getHeading(totalForceVec);
    let reltotalForceHeading = toRadians(toDegrees(totalForceHeading) - boat.heading);
    if (arrows.totalForce) {
        makeOutArrow(ctx, x, y, reltotalForceHeading, 50, totalForceAmt, 6, (arrowColors.totalForce ? arrowColors.totalForce : 'lightblue'));
    }
};

