import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';

export default class Gui {

	constructor( { animations, mixer, actions } ) {

		this.animations = animations;
		this.gui = new GUI();

	}

}

