"use strict";

var CityTour = CityTour || {};
CityTour.Scene = CityTour.Scene || {};

CityTour.Scene.Builder = function() {
  var SKY_COLOR = new THREE.Color(0x66ccff);

  var buildEmptyScene = function() {
    var scene, light, directionalLight;

    scene = new THREE.Scene();
    scene.background = SKY_COLOR;

    light = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    light.position.set( 0, 500, 0 );
    scene.add(light);

    directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(-1, 0.9, 0.9);
    scene.add(directionalLight);

    return scene;
  };

  var buildMeshGroup = function(groupName, meshes) {
    var group = new THREE.Group();
    group.name = groupName;

    meshes.forEach(function(mesh) {
      group.add(mesh);
    });

    return group;
  };

  var buildTerrainMeshes = function(terrain, roadNetwork) {
    return buildMeshGroup("terrainMeshes", CityTour.Scene.TerrainMeshBuilder().build(terrain, roadNetwork));
  };

  var buildRoadNetworkMeshes = function(terrain, roadNetwork) {
    return buildMeshGroup("roadNetworkMeshes", CityTour.Scene.RoadMeshBuilder().build(terrain, roadNetwork));
  };

  var buildBuildingMeshes = function(buildings, roadNetwork) {
    return buildMeshGroup("buildingMeshes", CityTour.Scene.BuildingMeshBuilder().build(buildings, roadNetwork));
  };


  return {
    buildEmptyScene: buildEmptyScene,
    buildTerrainMeshes: buildTerrainMeshes,
    buildRoadNetworkMeshes: buildRoadNetworkMeshes,
    buildBuildingMeshes: buildBuildingMeshes,
  };
};
