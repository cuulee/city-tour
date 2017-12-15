"use strict";

var CityTour = CityTour || {};


/*
   Generates target points for the camera to move to, simulating the camera
   flying in the air over the city.

   Since the movement is assumed to happen in the air, points are selected without
   worrying about whether it requires moving over roads or terrain. However, the
   target point will always be over a road intersection, to prevent choosing a
   target point that is outside of the city or over an area of land with no
   roads or buildings.

   Target points are chosen to alternate between either a point north or south of
   the previous target, or east or west of the previous target.
*/
CityTour.AerialNavigator = function(roadNetwork, initialTargetMapX, initialTargetMapZ) {
  var X_AXIS = 1;
  var Z_AXIS = 2;

  var targetMapX = initialTargetMapX;
  var targetMapZ = initialTargetMapZ;
  var movementAxis = X_AXIS;

  var determineNextTargetPoint = function() {
    var oldTargetMapX = targetMapX;
    var oldTargetMapZ = targetMapZ;

    while ((oldTargetMapX === targetMapX && oldTargetMapZ === targetMapZ) || !roadNetwork.hasIntersection(targetMapX, targetMapZ)) {
      if (movementAxis === X_AXIS) {
        targetMapX = Math.floor(Math.random() * CityTour.Config.BLOCK_COLUMNS) - CityTour.Config.HALF_BLOCK_COLUMNS;
      }
      else if (movementAxis === Z_AXIS) {
        targetMapZ = Math.floor(Math.random() * CityTour.Config.BLOCK_ROWS) - CityTour.Config.HALF_BLOCK_ROWS;
      }
    }

    movementAxis = (movementAxis === X_AXIS) ? Z_AXIS : X_AXIS;
  };

  var aerialNavigator = {};

  aerialNavigator.targetMapX = function() { return targetMapX; };
  aerialNavigator.targetMapZ = function() { return targetMapZ; };

  aerialNavigator.nextTarget = function() {
    determineNextTargetPoint();
  };

  return aerialNavigator;
};
