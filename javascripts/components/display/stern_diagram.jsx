import React from 'react';
import {
    toRadians,
    toDegrees,
    getHeading,
    vectorMag
} from '../util/vector_util';
import {
    makeInArrow,
    makeOutArrow,
    makeStreamRipple
} from './canvas_helper';

class SternDiagram extends React.Component {
    constructor(props) {
        super(props);
        this.appDir = [0, 0];
        this.appHeading = 0;
    }

    componentDidMount() {
        this.ctx = this.refs.canvas.getContext('2d');
        this.drawDiagram();
    }

    componentDidUpdate() {
        this.drawDiagram();
    }

    clearDisplay() {
        this.ctx.fillStyle = 'lightblue';
        this.ctx.fillRect(0, 0, 300, 310);
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(0, 310, 300, 300);
    }

    drawDiagram() {
        this.clearDisplay();
        this.drawBoat();
    }

    drawBoat() {
        let model = this.props.model;
        let boat = model.boat;
        let ctx = this.ctx;      

        ctx.translate(150, 300);
        
        let heelAngle = toRadians(boat.heelAngle);
        let floatAmt = 20 * Math.sin(Math.abs(heelAngle));
        ctx.translate(0, -1 * floatAmt);
        ctx.rotate(heelAngle);

        let headLower = 0;
        let buttPosition = boat.sailorPosition;
        if (Math.abs(buttPosition) > 45) {
            let extra = Math.abs(buttPosition) - 50;
            if (extra > 24) {
                extra = 24;
            }
            headLower = 25 - Math.sqrt(625 - (extra * extra));
            buttPosition = (buttPosition > 0 ? 50 : -50);
        }

        //mast
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.moveTo(-2, -290);
        ctx.fillRect(-2, -290, 4, 270);
        ctx.fill();

        let boomDist = Math.sin(toRadians(boat.sailAngle)) * 140;
        //sail
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(0, -290);
        ctx.lineTo(boomDist, -50);
        ctx.lineTo(0, -50);
        ctx.fill();

        //boom
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'black';
        ctx.moveTo(0, -50);
        ctx.lineTo(boomDist, -50);
        ctx.stroke();

        //sailor legs
        let legLength = 27;
        let a = buttPosition / 2;
        let b = Math.sqrt((legLength * legLength) - (a * a));
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.strokeStyle = 'orange';
        ctx.lineCap = 'round';
        ctx.moveTo(0, -20);
        ctx.lineTo(0 + a, -20 - b);
        ctx.lineTo(buttPosition, -20);
        ctx.stroke();

        //sailor body
        ctx.beginPath();
        ctx.moveTo(buttPosition, -25);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 18;
        ctx.lineCap = 'round';
        ctx.lineTo(boat.sailorPosition, -57 + headLower);
        ctx.stroke();
        ctx.lineCap = 'butt';

        //sailor head
        ctx.beginPath();
        ctx.fillStyle = 'orange';
        ctx.arc(boat.sailorPosition, -75 + headLower, 9, 2 * Math.PI, 0, false);
        ctx.fill();

        //hull
        ctx.beginPath();
        ctx.fillStyle = 'brown';
        ctx.arc(-20, -20, 40, Math.PI / 2, Math.PI, false);
        ctx.lineTo(20, -20);
        ctx.arc(20, -20, 40, 0, Math.PI / 2);
        ctx.fill();

        //centerboard
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.moveTo(-2, 20);
        ctx.fillRect(-2, 20, 4, 60);
        ctx.fill();

        //sailor force
        makeInArrow(ctx, 0.8 * boat.sailorOffset, -40, Math.PI - heelAngle, 60, boat.sailorWeight, 8, 'black');
        
        ctx.rotate(-1 * heelAngle);
        ctx.translate(0, floatAmt);
        
        let sideOffset = 50 * Math.sin(toRadians(boat.heelAngle));
        //heeling forces
        if (boat.tack === 'starboard') {
            let sailHeelForce = model.sailHeelForce;
            makeInArrow(ctx, -30 + (sideOffset * 1.5), (-1 * boat.sailOffset), -Math.PI / 2, 60, sailHeelForce, 8, 'red');
            let boardHeelForce = model.boardHeelForce;
            makeInArrow(ctx, 30 - sideOffset, boat.boardOffset, Math.PI / 2, 60, boardHeelForce, 8, 'red');
        }
        else {
            let sailHeelForce = model.sailHeelForce;
            makeInArrow(ctx, 30 + (sideOffset * 1.5), (-1 * boat.sailOffset), Math.PI / 2, 60, sailHeelForce, 8, 'red');
            let boardHeelForce = model.boardHeelForce;
            makeInArrow(ctx, -30 - sideOffset, boat.boardOffset, -Math.PI / 2, 60, boardHeelForce, 8, 'red');
        }

        //righting forces ALSO SAILOR FORCE ABOVE!!!
        let buoyancyForce = model.buoyancyForce;
        makeInArrow(ctx, (-1 * boat.buoyancyOffset), -30, 0, 70, buoyancyForce, 8, 'green');

        //translate back
        ctx.translate(-150, -300);
    }

    render (){
        return (
            <div>
                <canvas ref="canvas"
                    width="300px"
                    height="400px"
                />
            </div>
        );
    }
}

export default SternDiagram;