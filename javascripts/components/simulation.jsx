import React from 'react';
import TopDiagram from './display/top_diagram';
import MainDisplay from './display/main_display';
import GameDisplay from './display/game_display';
import SternDiagram from './display/stern_diagram';
import InputManager from './util/input_manager';
import Model from './physics/model';
import Boat from './physics/boat';
import WindMap from './physics/wind_map';

class Simulation extends React.Component {
    constructor(props) {
        super(props);
        this.inputManager = new InputManager();
        this.windMap = new WindMap(1200, 800);
        this.model = new Model(new Boat, this.windMap);
        this.state = {
            model: this.model,
            mode: 'simulation'
        }
        this.startSimulation = this.startSimulation.bind(this);
        this.mainLoop = this.mainLoop.bind(this);
        this.showCorrectDisplay = this.showCorrectDisplay.bind(this);
    }

    componentDidMount() {
        this.inputManager.startListening();
        this.startSimulation();
    }

    componentWillUnmount() {
        this.inputManager.stopListening();
    }

    startSimulation() {
        this.lastTime = Date.now();
        this.mainLoop();
    }

    mainLoop() {
        const dt = (Date.now() - this.lastTime) / 1000;

        this.model.update(this.inputManager.inputs, dt);
        this.setState({
            model: this.model
        });

        this.lastTime = Date.now();
        window.requestAnimationFrame(this.mainLoop);
    }

    showCorrectDisplay() {
        switch (this.state.mode) {
            case 'simulation':
                return (
                    <div>
                        <MainDisplay
                            model={this.state.model}
                            boat={this.state.model.boat}
                            windMap={this.state.model.windMap}
                        />
                    </div>
                );
            case 'game':
                return (
                    <div>
                        <GameDisplay
                            model={this.state.model}
                            boat={this.state.model.boat}
                            windMap={this.state.model.windMap}
                        />
                    </div>
                );
            default:
                return (
                    <div>
                        mode not set
                    </div>
                );
        }
    }

    render () {
        return (
            <div style={{'display' : 'flex'}}>
                <div>
                    <TopDiagram   
                        model={this.state.model}
                    />
                    <SternDiagram
                        model={this.state.model}
                    />
                </div>
                {this.showCorrectDisplay()}
            </div>
        );
    }
}

export default Simulation;