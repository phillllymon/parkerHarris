import React from 'react';
import ArrowButton from './arrow_button';
import {
    getUnitVector,
    vectorMag
} from '../util/vector_util';
import {
    drawForceArrows,
    makeStreamRipple,
    makeInArrow
} from './canvas_helper';

class MainDisplay extends React.Component {
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

        this.centerBoat = this.centerBoat.bind(this);
        this.toggleArrow = this.toggleArrow.bind(this);
        this.setArrowColor = this.setArrowColor.bind(this);

        this.state = {
            intro: 1
        };
    }

    introPopup() {
        if (this.state.intro) {
            switch (this.state.intro) {
                case 1:
                    return (
                        <div className="intro">
                            <center>
                                Welcome to Wind & Waves!
                                <br />
                                <br />
                                Sail your boat around using WASD for controls:
                                <br />
                                -steer with A and D
                                <br />
                                -W to let your sail out
                                <br />
                                -S to pull your sail in
                                <br />
                                <br />
                                <button 
                                    className="intro_button"
                                    onClick={() => this.setState({intro: 2})}
                                >
                                    OK, got it
                                </button>
                            </center>
                        </div>
                    );
                case 2:
                    return (
                        <div className="intro" style={{'top': '25', 'transform': 'translate(-50%, 0)', 'paddingTop': '5px'}}>
                            <center>                  
                                {'\u2B06'}              
                                <br/>
                                Use the buttons along the top of this display to see <br/>the different forces acting on your boat:
                                <br/>
                                <br/>
                                -click the buttons to toggle force arrows
                                <br/>
                                -you can also set the color of each arrow
                                <br />
                                <br />
                                <button
                                    className="intro_button"
                                    onClick={() => {
                                        this.setState({ intro: false });
                                        this.centerBoat();
                                    }}
                                >
                                    OK, sail now
                                </button>
                            </center>
                        </div>
                    );
                default:
                    return (
                        <div>
                        </div>
                    );
            }
            
        }
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
        this.ctx.fillRect(0, 0, 1200, 800);
    }

    drawModel() {
        this.clearDisplay();
        this.drawBoat();
    }

    drawBoat() {
        let model = this.props.model;
        let boat = this.props.boat;
        let pos = boat.position;
        let dir = boat.heading * Math.PI / 180;
        let windMap = this.props.windMap;
        let ctx = this.ctx;

        //display waves
        windMap.waves.forEach( (row) => {
            row.forEach( (wave) => {
                ctx.strokeStyle = 'blue';
                // if (wave.stage > 8){
                //     ctx.strokeStyle = 'lightblue';
                // }
                // else {
                //     ctx.strokeStyle = 'blue';
                // }
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(wave.pos[0], wave.pos[1]);
                let widthFactor = wave.stage < 12 ? wave.stage : 17 - (2*wave.stage);
                //let widthFactor = wave.stage;
                ctx.lineTo(wave.pos[0] + (1 * widthFactor + 2), wave.pos[1]);
                ctx.moveTo(wave.pos[0], wave.pos[1]);
                ctx.lineTo(wave.pos[0] - (1 * widthFactor + 2), wave.pos[1]);
                ctx.stroke();
            });
        });

        //orient to boat
        ctx.translate(pos[0], pos[1]);
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

        ctx.rotate(-dir);
        ctx.translate(-(pos[0]), -(pos[1]));

        //display true wind
        makeInArrow(ctx, 600, 150, Math.PI, 100, 100, 10, 'lightblue');

    }

    mainControls() {
        return (
            <div style={{'display' : 'flex'}}>
                <button 
                    style={{'position' : 'fixed', 'top' : '30', 'left' : '310'}}
                    onClick={this.centerBoat}>re-center boat
                </button>
                <button
                    style={{ 'position': 'fixed', 'top': '30', 'left': '420' }}
                    onClick={() => this.setState({intro: 1})}>see intro again
                </button>
                <div
                    style={{
                        'position': 'fixed',
                        'top': '30',
                        'left': '855',
                        'color': 'lightblue'
                    }}
                >
                    TRUE WIND
                </div>
                {this.introPopup()}
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

    centerBoat() {
        this.props.model.boat.position = [this.width / 2, this.height / 2];
    }

    render() {
        return (
            <div>
                {this.mainControls()}
                <canvas ref="canvas"
                    width="1200px"
                    height="800px"
                />
            </div>
        );
    }
}

export default MainDisplay;