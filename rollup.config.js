import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import glslify from 'rollup-plugin-glslify'
import copy from 'rollup-plugin-copy'
import htmlTemplate from 'rollup-plugin-generate-html-template'
import del from 'rollup-plugin-delete'
import path from 'path'
import scss from 'rollup-plugin-scss'
import fs from 'fs'

export default {
	input: './src/index.js',
	output: {
		file: 'dist/bundle.js',
		format: 'iife',
		sourcemap: 'inline'
	},
	plugins: [
		glslify({			
			basedir: 'src/shaders',
			include: [
				'**/*.vs',
				'**/*.fs',
				'**/*.vert',
				'**/*.frag',
				'**/*.glsl'
			],
			exclude: 'node_modules/**'
		}),
		babel({
			compact: true,
			presets: [
				[
					'es2015', 
					{ modules: false }
				]
			],
			plugins:[
				"transform-class-properties",
				"external-helpers"
			],
			exclude: "node_modules/**"
		}),
		nodeResolve({
			jsnext: true,
			main: true
		}),		
		copy({
			targets: [
				{ src: 'src/index.html', dest: 'dist/' },
				{ src: 'static/assets/', dest: 'dist/' },
				{ src: 'static/libs/', dest: 'dist/' },
			]
		}),
		serve({
			open: true,
			verbose: true,
			contentBase: 'dist',
			// Options used in setting up server
			host: '0.0.0.0',
			port: 4000,
			headers: {
				'Access-Control-Allow-Origin': '*'
			}
		}),
		livereload({
			watch: 'dist'
		}),
		htmlTemplate({
			template: 'src/index.html',
			target: 'dist/index.html',
		})
	],
}