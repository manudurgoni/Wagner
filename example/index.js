'use strict';

var domready = require('domready');
var THREE = require('three');
var raf = require('raf');
var dat = require('dat-gui');
var WAGNER = require('..');

// Passes
var BoxBlurPass = require('../src/passes/box-blur/BoxBlurPass');
var FXAAPass = require('../src/passes/fxaa/FXAAPass');
var BlendPass = require('../src/passes/blend/BlendPass');
var DOFPass = require('../src/passes/dof/DOFPass');

var scene, camera, renderer;
var material, light;
var cubes = [];
var composer, copyPass, boxBlurPass, fxaaPass, blendPass, dofPass;
var gui;
var scene2, light2, sphere;
var renderTarget;

var params = {
  usePostProcessing: true,
  useFXAA: true,
  useBlur: false,
  useBlend: false,
  useDOF: false,
  blendMode: {
    Normal: 1,
    Darken: 3,
    Multiply: 4,
    ColorBurn: 5,
    LinearBurn: 6,
    Lighten: 8,
    Screen: 9,
    ColorDodge: 10,
    LinearDodge: 11,
    Overlay: 13,
    SoftLight: 14,
    HardLight: 15,
    LinearLight: 17,
    Difference: 20,
    Exclusion: 21
  }
};

domready(function() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 100;

  renderer = new THREE.WebGLRenderer({alpha: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  light = new THREE.PointLight(0xFFFFFF, 1);
  light.position.copy(camera.position);
  scene.add(light);

  renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter
  });

  material = new THREE.MeshPhongMaterial({color: 0x3a9ceb});

  for(var i = 0, c; i < 500; i++) {
    c = addCube();
    cubes.push(c);
    scene.add(c);
  }
  c.position.set(0, 0, 50);

  scene2 = new THREE.Scene();
  light2 = new THREE.PointLight(0xFFFFFF, 0.5);
  light2.position.copy(camera.position);
  scene2.add(light2);
  sphere = new THREE.Mesh(new THREE.SphereGeometry(20, 8, 8), new THREE.MeshPhongMaterial({color: 0xffd074, shading: THREE.FlatShading}));
  scene2.add(sphere);
  renderer.render(scene2, camera, renderTarget);
  renderer.setClearColor(0x323232);

  initPostprocessing();
  initGui();

  window.addEventListener('resize', resize);
  
  raf(animate);
});

function resize() {
  composer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function addCube() {
  var cube = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), material);
  cube.position.set(
    Math.random() * 600 - 300,
    Math.random() * 600 - 300,
    Math.random() * -500
  );
  cube.rotation.set(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2
  );
  return cube;
}

function initPostprocessing() {
  renderer.autoClearColor = true;
  composer = new WAGNER.Composer(renderer);
  fxaaPass = new FXAAPass();
  boxBlurPass = new BoxBlurPass(2, 2);
  blendPass = new BlendPass({
    mode: WAGNER.BlendMode.LinearDodge,
    tInput2: renderTarget
  });
  dofPass = new DOFPass();
  return composer;
}

function initGui() {
  gui = new dat.GUI();
  gui.add(params, 'usePostProcessing');
  gui.add(params, 'useFXAA');
  gui.add(params, 'useBlur');
  gui.add(params, 'useBlend');
  gui.add(blendPass.params, 'mode', params.blendMode);
  gui.add(dofPass.params, 'focalDistance').step(0.001);
  gui.add(dofPass.params, 'aperture');
  gui.add(dofPass.params, 'blurAmount');
  return gui;
}

function animate() {
  raf(animate);

  for(var i = 0; i < cubes.length; i++) {
    cubes[i].rotation.y += 0.01 + ((i - cubes.length) * 0.00001);
    cubes[i].rotation.x += 0.01 + ((i - cubes.length) * 0.00001);
  }

  if(params.usePostProcessing) {
    composer.reset();
    composer.render(scene, camera);
    if(params.useBlend) composer.pass(blendPass);
    if(params.useBlur) composer.pass(boxBlurPass);
    if(params.useFXAA) composer.pass(dofPass);
    if(params.useDOF) composer.pass(fxaaPass);
    composer.toScreen();
  }
  else {
    renderer.render(scene, camera);
  }

}
