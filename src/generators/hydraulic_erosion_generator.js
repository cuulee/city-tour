"use strict";

var CityTour = CityTour || {};

CityTour.HydraulicErosionGenerator = (function() {
  var RAINDROP_COUNT = 10000;
  var WATER_HEIGHT_PER_RAINDROP = 1.0;
  var EVAPORATION_WATER_HEIGHT = 2.5;

  var addRainfall = function(terrainCoordinates) {
    var i;
    var maxColumnIndex = terrainCoordinates.length - 1;
    var maxRowIndex = terrainCoordinates[0].length - 1;
    var column, row;

    for (i = 0; i < RAINDROP_COUNT; i++) {
      column = Math.round(Math.random() * maxColumnIndex);
      row = Math.round(Math.random() * maxRowIndex);

      terrainCoordinates[column][row].waterHeight += WATER_HEIGHT_PER_RAINDROP;
    }
  };

  var emptyWaterFlowCoordinates = function(terrainCoordinates) {
    var x, z;
    var waterFlowCoordinates = [];

    for (x = 0; x < terrainCoordinates.length; x++) {
      waterFlowCoordinates[x] = [];

      for (z = 0; z < terrainCoordinates[0].length; z++) {
        waterFlowCoordinates[x][z] = { landDelta: 0.0, waterDelta: 0.0 };
      }
    }

    return waterFlowCoordinates;
  };

  var erode = function(terrainCoordinates, iterationCount) {
    var waterFlowCoordinates;
    var northHeight, southHeight, westHeight, eastHeight, southWestHeight, northEastHeight;
    var currentLandHeight, currentHeight, minTargetHeight;
    var minTargetX, minTargetZ;
    var landDelta, waterDelta, maxLandDelta, maxWaterDelta;
    var i, x, z;

    var columnCount = terrainCoordinates.length;
    var rowCount = terrainCoordinates[0].length;

    for (i = 0; i < iterationCount; i++) {
      waterFlowCoordinates = emptyWaterFlowCoordinates(terrainCoordinates);

      for (x = 0; x < columnCount; x++) {
        for (z = 0; z < rowCount; z++) {
          currentLandHeight = terrainCoordinates[x][z].height;
          currentHeight = currentLandHeight + terrainCoordinates[x][z].waterHeight;
          minTargetHeight = Number.POSITIVE_INFINITY;

          // North
          if (z > 0) {
            northHeight = terrainCoordinates[x][z - 1].height + terrainCoordinates[x][z - 1].waterHeight;
            if (northHeight < minTargetHeight) {
              minTargetHeight = northHeight;
              minTargetX = x;
              minTargetZ = z - 1;
            }
          }

          // South
          if (z < terrainCoordinates[0].length - 1) {
            southHeight = terrainCoordinates[x][z + 1].height + terrainCoordinates[x][z + 1].waterHeight;
            if (southHeight < minTargetHeight) {
              minTargetHeight = southHeight;
              minTargetX = x;
              minTargetZ = z + 1;
            }
          }

          // West
          if (x > 0) {
            westHeight = terrainCoordinates[x - 1][z].height + terrainCoordinates[x - 1][z].waterHeight;
            if (westHeight < minTargetHeight) {
              minTargetHeight = westHeight;
              minTargetX = x - 1;
              minTargetZ = z;
            }
          }

          // East
          if (x < terrainCoordinates.length - 1) {
            eastHeight = terrainCoordinates[x + 1][z].height + terrainCoordinates[x + 1][z].waterHeight;
            if (eastHeight < minTargetHeight) {
              minTargetHeight = eastHeight;
              minTargetX = x + 1;
              minTargetZ = z;
            }
          }

          // Southwest
          if (x > 0 && z < (terrainCoordinates[0].length - 1)) {
            southWestHeight = terrainCoordinates[x - 1][z + 1].height + terrainCoordinates[x - 1][z + 1].waterHeight;
            if (southWestHeight < minTargetHeight) {
              minTargetHeight = southWestHeight;
              minTargetX = x - 1;
              minTargetZ = z + 1;
            }
          }

          // Northeast
          if (x < (terrainCoordinates.length - 1) && z > 0) {
            northEastHeight = terrainCoordinates[x + 1][z - 1].height + terrainCoordinates[x + 1][z - 1].waterHeight;
            if (northEastHeight < minTargetHeight) {
              minTargetHeight = northEastHeight;
              minTargetX = x + 1;
              minTargetZ = z - 1;
            }
          }

          if (currentHeight > minTargetHeight && terrainCoordinates[x][z].waterHeight > 0.0) {
            maxLandDelta = (currentLandHeight - terrainCoordinates[minTargetX][minTargetZ].height) / 2;
            landDelta = (maxLandDelta > 0.0) ? Math.min(1.0, maxLandDelta) : 0.0;

            maxWaterDelta = (currentHeight - minTargetHeight) / 2;
            waterDelta = Math.min(maxWaterDelta, terrainCoordinates[x][z].waterHeight);

            waterFlowCoordinates[x][z].landDelta -= landDelta;
            waterFlowCoordinates[x][z].waterDelta -= waterDelta;

            waterFlowCoordinates[minTargetX][minTargetZ].landDelta += landDelta;
            waterFlowCoordinates[minTargetX][minTargetZ].waterDelta += waterDelta;
          }
        }
      }

      for (x = 0; x < columnCount; x++) {
        for (z = 0; z < rowCount; z++) {
          terrainCoordinates[x][z].height += waterFlowCoordinates[x][z].landDelta;
          terrainCoordinates[x][z].waterHeight += waterFlowCoordinates[x][z].waterDelta;
        }
      }
    }
  };

  var evaporate = function(terrainCoordinates) {
    var x, z;

    for (x = 0; x < terrainCoordinates.length; x++) {
      for (z = 0; z < terrainCoordinates[0].length; z++) {
        terrainCoordinates[x][z].waterHeight = Math.max(terrainCoordinates[x][z].waterHeight - EVAPORATION_WATER_HEIGHT, 0.0);
      }
    }
  };


  return {
    addRainfall: addRainfall,
    evaporate: evaporate,
    erode: erode,
  };
})();
