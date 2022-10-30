import * as THREE from "three";
import fragment from "../shader/fragment.frag";
import vertex from "../shader/vertex.vert";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

let colors = require("nice-color-palettes");
// let palette = colors[Math.floor(Math.random() * colors.length)];

// palette = palette.map(color => new THREE.Color(color));

export default class Sketch {
    constructor(options) {
        this.scene = new THREE.Scene();
        this.gui = new GUI();

        this.container = options.dom;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.ratio = this.width / this.height;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(70, this.ratio, 0.001, 1000);

        // var frustumSize = 10;
        // var aspect = window.innerWidth / window.innerHeight;
        // this.camera = new THREE.OrthographicCamera(
        //     (frustumSize * aspect) / -2,
        //     (frustumSize * aspect) / 2,
        //     frustumSize / 2,
        //     frustumSize / -2,
        //     -1000,
        //     1000,
        // );
        // this.camera.position.set(0, 0, 1);

        this.controls = new OrbitControls(
            this.camera,
            this.renderer.domElement,
        );
        this.time = 0;

        this.isPlaying = true;
        this.settings();
        this.update_palette(this.settings.palette);

        this.addObjects();
        this.resize();
        this.render();
        this.setupResize();

        window.addEventListener("resize", this.on_window_resize.bind(this));
    }

    settings() {
        this.settings = {
            rot_x: 0.0,
            rot_y: 0.0,
            rot_z: 0.0,
            pos_z: 0.3,
            palette: 18,
        };
        this.gui.add(this.settings, "rot_x", -1.57, 1.57, 0.01);
        this.gui.add(this.settings, "rot_y", -1.57, 1.57, 0.01);
        this.gui.add(this.settings, "rot_z", -1.57, 1.57, 0.01);
        this.gui.add(this.settings, "pos_z", 0.0, 1.0, 0.01);
        this.gui.add(this.settings, "palette", 0, 99, 1);
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }

    addObjects() {
        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable",
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { type: "f", value: 0 },
                resolution: { type: "v4", value: new THREE.Vector4() },
                uColor: { value: this.palette },
                uvRate1: {
                    value: new THREE.Vector2(1, 1),
                },
            },
            // wireframe: true,
            // transparent: true,
            vertexShader: vertex,
            fragmentShader: fragment,
        });

        this.geometry1 = new THREE.PlaneGeometry(1.0, 1.0, 300, 300);
        this.plane1 = new THREE.Mesh(this.geometry1, this.material);
        this.scene.add(this.plane1);
    }

    stop() {
        this.isPlaying = false;
    }

    play() {
        if (!this.isPlaying) {
            this.render();
            this.isPlaying = true;
        }
    }

    update_palette(index) {
        this.palette = colors[index];
        this.palette = this.palette.map((color) => new THREE.Color(color));
    }

    render() {
        if (!this.isPlaying) return;
        this.time += 0.0001;
        this.gui;
        this.plane1.rotation.x = this.settings.rot_x;
        this.plane1.rotation.y = this.settings.rot_y;
        this.plane1.rotation.z = this.settings.rot_z;
        this.camera.position.z = this.settings.pos_z;
        this.camera.rotation.x = 0.05 * Math.sin(this.time * 10);
        this.camera.rotation.y = 0.05 * Math.cos(this.time * 10);
        this.camera.rotation.z = 2 * Math.PI * Math.cos(this.time);

        this.material.uniforms.time.value = this.time;
        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
    }

    on_window_resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.ratio = this.width / this.height;
        this.ratio = this.ratio > 1.5 ? 1.5 : this.ratio;
        this.ratio = this.ratio < 0.67 ? 0.67 : this.ratio;

        console.log(this.ratio);
        this.camera.aspect = this.ratio;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }
}

new Sketch({
    dom: document.getElementById("sketch"),
});
