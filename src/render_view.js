"use strict";

var CityTour = CityTour || {};

CityTour.RenderView = function(container, initialScene) {
  var scene;
  var renderer;
  var poleCamera;

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);

  var resize = function() {
    var width = container.clientWidth;
    var height = container.clientHeight;

    var camera = poleCamera.camera();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    render();
  };

  var render = function() {
    renderer.render(scene, poleCamera.camera());
  };

  var setScene = function(newScene) {
    scene = newScene;
    poleCamera = new CityTour.PoleCamera(scene.position);
    scene.add(poleCamera.pole());
  };

  setScene(initialScene);


  return {
    render: render,
    resize: resize,
    setScene: setScene,
    domElement: function() { return renderer.domElement; },
    poleCamera: function() { return poleCamera; },
  };
};
