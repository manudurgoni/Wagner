'use strict';

var THREE = require('three');
var glslify = require('glslify');
var Pass = require('../../Pass');
var vertex = glslify('../../shaders/vertex/basic.glsl');
var fragment = glslify('./box-blur-fs.glsl');

function BoxBlurPass() {
  Pass.call(this);
  this.setShader(vertex, fragment);
  this.params.delta = new THREE.Vector2(0, 0);
  this.params.taps = 1;
}

module.exports = BoxBlurPass;

BoxBlurPass.prototype = Object.create(Pass.prototype);
BoxBlurPass.prototype.constructor = BoxBlurPass;

BoxBlurPass.prototype.run = function(composer) {
  this.shader.uniforms.delta.value.copy(this.params.delta);
  /*for( var j = 0; j < this.params.taps; j++ ) {
    this.shader.uniforms.delta.value.copy( this.params.delta );
    c.pass( this.shader );
  }*/
  composer.pass(this.shader);

};
