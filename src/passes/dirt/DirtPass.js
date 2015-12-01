'use strict';

var THREE = require('three');
var Pass = require('../../Pass');
var BlendPass = require('../blend/BlendPass');

function DirtPass(options) {

	Pass.call(this);

	options = options || {};

	this.blendPass = new BlendPass();
	this.dirtTexture = THREE.ImageUtils.loadTexture( options.imgPath );

	this.params.blendMode = options.blendMode || 12;
	this.params.opacity = options.opacity || 1;

};

module.exports = DirtPass;

DirtPass.prototype = Object.create( Pass.prototype );
DirtPass.prototype.constructor = DirtPass;

DirtPass.prototype.isLoaded = function() {

	if( this.blendPass.isLoaded() ) {
		this.loaded = true;
	}
	return Pass.prototype.isLoaded.call( this );

};

DirtPass.prototype.run = function( c ) {
	this.blendPass.params.opacity = this.params.opacity;
	this.blendPass.params.sizeMode = 1;
	this.blendPass.params.mode = this.params.blendMode;
	this.blendPass.params.tInput2 = this.dirtTexture;
	if( this.dirtTexture.image ) {
		this.blendPass.params.resolution2.set( this.dirtTexture.image.width, this.dirtTexture.image.height );
		this.blendPass.params.aspectRatio2 = this.dirtTexture.image.width / this.dirtTexture.image.height;
	}
	this.blendPass.params.aspectRatio = c.read.width / c.read.height;
	c.pass( this.blendPass );

};
