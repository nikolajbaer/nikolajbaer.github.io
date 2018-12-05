/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var renderer;
var camera;
var plane;
var cubes;
var uniforms;

function v() {
    var scene = new THREE.Scene();
    uniforms = {
        u_time: { value: 0.0, type: "f" },
        u_resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth, window.innerHeight) }

    };

    camera = new THREE.Camera();
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("canvas"), antialias: true });
    renderer.setClearColor(new THREE.Color(1, 1, 1, 1));
    renderer.setSize(window.innerWidth, window.innerHeight);

    var clock = new THREE.Clock();

    var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        fragmentShader: document.getElementById("fragment_shader").innerHTML
    });
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);
    camera.position.z = 1;

    function animate(now) {
        requestAnimationFrame(animate);

        // update uniforms
        uniforms.u_time.value = clock.getElapsedTime();

        renderer.render(scene, camera);
    }
    animate(0);
}

//window.onload = v;


/* resize handling */
var resizeTimeout;

window.onresize = function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handle_resize, 250);
};

function handle_resize() {
    if (renderer) {
        console.log("resizing");
        renderer.setSize(window.innerWidth, window.innerHeight);
        uniforms.u_resolution.value.x = window.innerWidth;
        uniforms.u_resolution.value.y = window.innerHeight;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
}

/***/ })
/******/ ]);