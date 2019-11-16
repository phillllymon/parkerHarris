class Model {
    constructor(boat, windMap){
        this.boat = boat;
        this.windMap = windMap;
        this.dragOnSail = [0, 0];
        this.liftOnSail = [0, 0];
        this.forceOnSail = [0, 0];
        this.dragOnBoard = [0, 0];
        this.liftOnBoard = [0, 0];
        this.forceOnBoard = [0, 0];
        this.dragOnHull = [0, 0];
        this.totalForce = [0, 0];

        this.sailHeelForce = 0;
        this.boardHeelForce = 0;

        this.buoyancyForce = 0;

        // setInterval(() => {
        //     console.log('right: ' + this.rightMoment + ' heel: ' + this.heelMoment);
        // }, 1000);
    }

    

    update(inputs, dt) {
        
        if (inputs.right && !inputs.left){
            this.boat.pushRudder(dt, 1);
        }
        if (inputs.left && !inputs.right){
            this.boat.pushRudder(dt, -1);
        }
        if (inputs.up && !inputs.down){
            this.boat.trimMain(dt, 1);
        }
        if (inputs.down && !inputs.up) {
            this.boat.trimMain(dt, -1);
        }

        this.windMap.updateWaves(dt);

        this.boat.calculateAppWind(this.windMap.windHeading, this.windMap.windSpeed);
        this.dragOnSail = this.boat.calculateDragOnSail();
        this.liftOnSail = this.boat.calculateLiftOnSail();
        this.forceOnSail = this.boat.calculateForceOnSail();

        this.dragOnBoard = this.boat.calculateDragOnCenterBoard();
        this.liftOnBoard = this.boat.calculateLiftOnCenterBoard();
        this.forceOnBoard = this.boat.calculateForceOnCenterBoard();
        this.dragOnHull = this.boat.calculateDragOnHull();
        this.totalForce = this.boat.calculateTotalForceOnBoat();

        this.buoyancyForce = this.boat.sailorWeight + this.boat.boatWeight;
        this.sailorForce = this.boat.sailorWeight;

        this.sailHeelForce = this.boat.calculateSailHeelForce();
        this.boardHeelForce = this.boat.calculateBoardHeelForce();
        this.heelMoment = this.boat.calculateHeelMoment();
        this.rightMoment = this.boat.calculateRightMoment();
        this.boat.updateTippingVelocity(dt);
        this.boat.updateHeelAngle(dt);

        
        
        
        
        this.boat.updateVelocity(dt);
        this.boat.updatePosition(dt);
        this.boat.updateHeading(dt);
        this.boat.updateSailAngle(dt);
        
    };
}

export default Model;