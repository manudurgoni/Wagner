'use strict';

var domready = require('domready');
var THREE = require('three');
var raf = require('raf');
var WAGNER = require('..');
var BoxBlurPass = require('../src/passes/box-blur/BoxBlurPass');

var scene, camera, renderer;
var cube;
var composer, copyPass, boxBlurPass;

domready(function() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 100;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  cube = new THREE.Mesh(new THREE.BoxGeometry(40, 40, 40), new THREE.MeshBasicMaterial({
    color: 0xFF0000,
    wireframe: true
  }));
  scene.add(cube);

  initPostprocessing();
  raf(animate);
});

function initPostprocessing() {
  renderer.autoClearColor = true;
  composer = new WAGNER.Composer(renderer);
  copyPass = new WAGNER.CopyPass();
  boxBlurPass = new BoxBlurPass();
}

function animate() {
  raf(animate);

  cube.rotation.y += 0.01;
  cube.rotation.x += 0.01;

  renderer.autoClearColor = true;
  composer.reset();
  composer.render(scene, camera);
  composer.pass(boxBlurPass);
  composer.toScreen();

  // renderer.render(scene, camera);

}
