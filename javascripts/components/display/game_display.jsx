import React from 'react';
import ArrowButton from './arrow_button';
import {
    getUnitVector,
    vectorMag
} from '../util/vector_util';
import {
    drawForceArrows,
    makeStreamRipple
} from './canvas_helper';

class GameDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.width = 1200;
        this.height = 800;

        this.arrows = {
            appWind: true,
            sailLift: false,
            dragOnSail: false,
            sailForce: false,
            boardLift: false,
            boardDrag: false,
            boardForce: false,
            hullDrag: false,
            totalForce: false,
        };

        this.arrowColors = {
            appWind: 'lightblue',
            sailLift: 'green',
            dragOnSail: 'red',
            sailForce: 'black',
            boardLift: 'green',
            boardDrag: 'red',
            boardForce: 'black',
            hullDrag: 'red',
            totalForce: 'black'
        }

      //  this.rocksImage = new Image();
      //  this.rocksImage.src = "../../../assets/rocks.png";
      //  this.rocksImage.onload = () => {console.log('poop');};
        this.rocks = [
            [20, 20, 60, 60],
            [160, 160, 200, 200]
        ];

        this.toggleArrow = this.toggleArrow.bind(this);
        this.setArrowColor = this.setArrowColor.bind(this);

        this.drawWater = this.drawWater.bind(this);
    }

    toggleArrow(e) {
        let val = this.arrows[e.target.id];
        this.arrows[e.target.id] = val ? false : true;
    }

    setArrowColor(arrow, color) {
        this.arrowColors[arrow] = color;
    }

    componentDidMount() {
        this.ctx = this.refs.canvas.getContext('2d');
        this.drawModel();
    }

    componentDidUpdate() {
        this.drawModel();
    }

    clearDisplay() {
        this.ctx.fillStyle = 'darkblue';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawModel() {
        this.clearDisplay();
        this.drawWater();
        this.drawRocks();
        this.drawBoat();
    }

    drawWater() {
        let boat = this.props.boat;
        let ctx = this.ctx;
        let pos = boat.position;
        //translate to boat
        ctx.translate(-pos[0], -pos[1]);
        ctx.translate(this.width / 2, this.height / 2);

        let windMap = this.props.windMap;
        windMap.waves.forEach((row) => {
            row.forEach((wave) => {
                ctx.strokeStyle = 'blue';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(wave.pos[0], wave.pos[1]);
                let widthFactor = wave.stage < 12 ? wave.stage : 17 - (2 * wave.stage);
                ctx.lineTo(wave.pos[0] + (1 * widthFactor + 2), wave.pos[1]);
                ctx.moveTo(wave.pos[0], wave.pos[1]);
                ctx.lineTo(wave.pos[0] - (1 * widthFactor + 2), wave.pos[1]);
                ctx.stroke();
            });
        });

        //translate back
        ctx.translate(-(this.width / 2), -(this.height / 2));
        ctx.translate(pos[0], pos[1]);
    }

    drawRocks() {
        let boat = this.props.boat;
        let ctx = this.ctx;
        let pos = boat.position;
        //translate to boat
        ctx.translate(-pos[0], -pos[1]);
        ctx.translate(this.width / 2, this.height / 2);
        // ctx.fillStyle = ctx.createPattern(this.rocksImage, "repeat");
        this.rocks.forEach((rock) => {
            ctx.fillRect(rock[0], rock[1], (rock[2] - rock[0]), (rock[3] - rock[1]));
        });

        //translate back
        ctx.translate(-(this.width / 2), -(this.height / 2));
        ctx.translate(pos[0], pos[1]);
    }

    drawBoat() {
        let model = this.props.model;
        let boat = this.props.boat;
        let dir = boat.heading * Math.PI / 180;
        
        let ctx = this.ctx;

        //orient to boat
        ctx.translate(this.width / 2, this.height / 2);
        ctx.rotate(dir);

        //streamRipples
        makeStreamRipple(ctx, 0, -33, boat.velocity, boat.heading);
        makeStreamRipple(ctx, 17, 29, boat.velocity, boat.heading);
        makeStreamRipple(ctx, -17, 29, boat.velocity, boat.heading);

        //draw boat
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(35, 10, 55, 2.8, 4.0, false);
        ctx.arc(-35, 10, 55, 4.0 + (3.14 - (2 * (4.0 - 3.14))), 3.14 - 2.8, false);
        //ctx.arc(-35, 10, 55, 9.42 - 4, false);   //slow brain not seeing why this is not equivalent...
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        let mastPos = [0, -15];
        ctx.arc(mastPos[0], mastPos[1], 2, 0, 2 * Math.PI, true);
        ctx.fill();

        let sailAngle = boat.sailAngle * Math.PI / 180;
        let unitDir = [Math.sin(sailAngle), Math.cos(sailAngle)];
        let boomEndpoint = [
            mastPos[0] + unitDir[0] * 45, 
            mastPos[1] + unitDir[1] * 45
        ];
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.moveTo(0, -15);
        ctx.lineTo(boomEndpoint[0], boomEndpoint[1]);
        ctx.stroke();

        drawForceArrows(ctx, 0, 0, this.arrows, model, boat, this.arrowColors);

        //orient back
        ctx.rotate(-dir);
        ctx.translate(-(this.width / 2), -(this.height / 2));

    }

    mainControls() {
        return (
            <div style={{'display' : 'flex'}}>
                {
                    Object.keys(this.arrows).map((key, idx) => {
                        return (
                        <div key={idx}>
                            <ArrowButton 
                                arrow={key}
                                active={this.arrows[key]} 
                                color={this.arrowColors[key]}
                                setArrowColor={this.setArrowColor}
                                toggleArrow={this.toggleArrow}
                            />
                        </div>
                        );
                
                    })
                }
            </div>
        );
    }

    render() {
        return (
            <div style={{'position': 'relative'}}>
                <div className="rocks"
                style={{
                    'top': `${100 - this.props.boat.position[1]}px`,
                    'left': `${100 - this.props.boat.position[0]}px`,
                    'height': '90px',
                    'width': '90px',
                    'zIndex': '3'
                }}></div>
                
                <canvas ref="canvas"
                    width="1200px"
                    height="800px"
                />
            </div>
        );
    }
}

export default GameDisplay;