const _box = new THREE.Box3();
const _size = new THREE.Vector3();
const _center = new THREE.Vector3();

let rotationSpeed = 0.5;

const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
speedSlider.addEventListener('input', function () {
    rotationSpeed = parseFloat(this.value);
    speedValue.textContent = rotationSpeed.toFixed(2);
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
});
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
scene.add(hemiLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

const loader = new THREE.GLTFLoader();
let model = null;
const modelPaths = ["Modèles/Namazu de base.glb", "Modèles/NamazuFestif.glb", "Modèles/NamazuDore.glb"];

function loadModel(index) {
    const loaderDiv = document.getElementById("loader");
    loaderDiv.style.display = "block";
    loaderDiv.textContent = "Chargement du modèle...";

    if (model) {
        scene.remove(model);
        model.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                else child.material.dispose();
            }
        });
        model = null;
    }

    loader.load(modelPaths[index], function (gltf) {
        model = gltf.scene;
        scene.add(model);

        _box.setFromObject(model);
        _box.getSize(_size);
        _box.getCenter(_center);

        model.position.sub(_center);

        const maxDim = Math.max(_size.x, _size.y, _size.z);
        const fov = camera.fov * (Math.PI / 180);
        const distance = Math.abs(maxDim / Math.sin(fov / 2));

        camera.position.set(0, maxDim * 0.2, distance * 1.5);
        camera.lookAt(0, 0, 0);

        loaderDiv.style.display = "none";
    }, function (xhr) {
        if (xhr.total) {
            loaderDiv.textContent = "Chargement du modèle... " + ((xhr.loaded / xhr.total) * 100).toFixed(0) + "%";
        }
    }, function (error) {
        console.error("Erreur:", error);
        loaderDiv.textContent = "Erreur de chargement";
    });
}

// Initial model
loadModel(0);

// Model buttons
document.querySelectorAll('.model-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        loadModel(parseInt(this.getAttribute('data-index')));
    });
});

const clock = new THREE.Clock();
function animate() {
    const delta = clock.getDelta();
    if (model) model.rotation.y += rotationSpeed * delta;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Audio mute logic
const audio = document.getElementById('background-music');
const muteBtn = document.getElementById('mute-btn');

window.addEventListener('click', function playOnce() {
    audio.play().catch(() => {});
    window.removeEventListener('click', playOnce);
    updateMuteIcon();
});

function updateMuteIcon() {
    muteBtn.textContent = audio.muted || audio.paused ? '🔇' : '🔊';
}

muteBtn.addEventListener('click', function () {
    if (audio.paused || audio.muted) {
        audio.muted = false;
        audio.play();
    } else {
        audio.muted = true;
    }
    updateMuteIcon();
});

updateMuteIcon();


