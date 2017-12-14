"use strict";

var CityTour = CityTour || {};


CityTour.City = function(container) {
  var scene, timer, animationManager;
  var renderView;

  var detectWebGL = function() {
    if (!window.WebGLRenderingContext) {
      return false;
    }

    // Adapted from https://github.com/Modernizr/Modernizr/blob/master/feature-detects/webgl-extensions.js
    var canvas = document.createElement('canvas');
    var webgl_context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (webgl_context === null) {
      return false;
    }

    return true;
  };

  var generateWorldData = function() {
    var config = {
      terrain: {
        heightJitter: 20,
        heightJitterDecay: 0.65,
        probabilityOfRiver: (2 / 3),
      },
      roadNetwork: {
        safeFromDecayPercentage: 0.4,
      },
      zonedBlocks: {
        percentageDistanceDecayBegins: 0.4,
        maxBuildingStories: 40,
      },
    };

    return CityTour.WorldGenerator.generate(config);
  };

  var init = function(onComplete) {
    if (!detectWebGL()) {
      document.getElementById("loading-message").innerText = "This page is not compatible with your browser, because it requires WebGL.";
      return;
    }

    var masterStartTime = new Date();
    var masterEndTime;
    var terrainStartTime, terrainEndTime;
    var roadStartTime, roadEndTime;
    var buildingsStartTime, buildingsEndTime;

    // Generate abstract terrain, road network, building representations
    var worldData = generateWorldData();

    var sceneBuilder = new CityTour.Scene.Builder();
    scene = sceneBuilder.buildEmptyScene();
    terrainStartTime = new Date();
    scene.add(sceneBuilder.buildTerrainMeshes(worldData.terrain, worldData.roadNetwork));
    terrainEndTime = new Date();

    roadStartTime = new Date();
    scene.add(sceneBuilder.buildRoadNetworkMeshes(worldData.terrain, worldData.roadNetwork));
    roadEndTime = new Date();

    buildingsStartTime = new Date();
    scene.add(sceneBuilder.buildBuildingMeshes(worldData.buildings, worldData.roadNetwork));
    buildingsEndTime = new Date();

    masterEndTime = new Date();

    console.log("Time to generate scene geometry: " + (masterEndTime - masterStartTime) + "ms");
    console.log("  Terrain:   " + (terrainEndTime - terrainStartTime) + "ms");
    console.log("  Roads:     " + (roadEndTime - roadStartTime) + "ms");
    console.log("  Buildings: " + (buildingsEndTime - buildingsStartTime) + "ms");

    renderView = new CityTour.RenderView(container, scene);
    renderView.resize();

    timer = new CityTour.Timer();
    animationManager = new CityTour.AnimationManager(worldData.terrain, worldData.roadNetwork, renderView.poleCamera());
    timer.onTick = function(frameCount) {
      animationManager.tick(frameCount);
      renderView.render();
    };

    var SWOOP_DISTANCE_IN_BLOCKS = 20;
    var furthestOutIntersection = worldData.centerZ + CityTour.Config.HALF_BLOCK_ROWS;
    while (!worldData.roadNetwork.hasIntersection(worldData.centerX, furthestOutIntersection)) {
      furthestOutIntersection -= 1;
    }

    var initialCoordinates = {
      positionX: worldData.centerX * CityTour.Config.BLOCK_AND_STREET_WIDTH,
      positionY: 40,
      positionZ: (furthestOutIntersection + SWOOP_DISTANCE_IN_BLOCKS) * CityTour.Config.BLOCK_AND_STREET_DEPTH,
      rotationX: 0.0,
      rotationY: 0.0,
    };

    var targetSceneX = CityTour.Coordinates.mapXToSceneX(worldData.centerX);
    var targetSceneZ = CityTour.Coordinates.mapZToSceneZ(furthestOutIntersection);

    animationManager.init(initialCoordinates, targetSceneX, targetSceneZ);

    timer.onTick(1);
    container.appendChild(renderView.domElement());

    timer.start();
    masterEndTime = new Date();
    console.log("Time to generate world+scene: " + (masterEndTime - masterStartTime) + "ms");

    onComplete();
  };

  var resize = function() {
    renderView.resize();
  };

  var togglePause = function() {
    timer.togglePause();
  };

  var toggleDebug = function() {
    animationManager.toggleDebug();
  };

  var city = {};

  city.init = init;
  city.resize = resize;
  city.togglePause = togglePause;
  city.toggleDebug = toggleDebug;

  return city;
};
