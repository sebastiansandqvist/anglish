import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';

module.exports = {
	entry: 'src/index.js',
	dest: 'public/js/bundle.js',
	format: 'iife',
	plugins: [
		replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
		nodeResolve({ browser: true }),
		commonjs(),
		buble()
	]
};