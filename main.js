// === EXISTANT ===
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
const modelPaths = [
    "Modèles/Namazu de base.glb",
    "Modèles/NamazuFestif.glb",
    "Modèles/NamazuDore.glb",
    "Modèles/Tomberry.glb",
    "Modèles/Lopo.glb",
    "Modèles/Mog.glb"
];

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

// ===== MENU DÉROULANT POUR MODÈLES ===== //
const modelMenuToggle = document.getElementById('model-menu-toggle');
const modelMenu = document.getElementById('model-menu');

modelMenuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (modelMenu.style.display === "block") {
        modelMenu.style.display = "none";
        modelMenuToggle.textContent = "Model ▼";
    } else {
        modelMenu.style.display = "block";
        modelMenuToggle.textContent = "Model ▲";
    }
});

modelMenu.querySelectorAll('.model-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        modelMenu.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        loadModel(parseInt(this.getAttribute('data-index')));
        modelMenu.style.display = "none";
        modelMenuToggle.textContent = "Model ▼";
    });
});

document.addEventListener('click', (event) => {
    if (modelMenu.style.display !== "none") {
        modelMenu.style.display = "none";
        modelMenuToggle.textContent = "Model ▼";
    }
}, false);

const firstModelBtn = modelMenu.querySelector('.model-btn[data-index="0"]');
if(firstModelBtn) firstModelBtn.classList.add('active');

// ===== MENU DÉROULANT POUR background ===== //
const bgMenuToggle = document.getElementById('bg-menu-toggle');
const bgMenu = document.getElementById('bg-menu');

bgMenuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (bgMenu.style.display === "block") {
        bgMenu.style.display = "none";
        bgMenuToggle.textContent = "Background ▼";
    } else {
        bgMenu.style.display = "block";
        bgMenuToggle.textContent = "Background ▲";
    }
});

document.addEventListener('click', () => {
    if (bgMenu.style.display !== "none") {
        bgMenu.style.display = "none";
        bgMenuToggle.textContent = "Background ▼";
    }
});

bgMenu.querySelectorAll('.bg-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const imgPath = this.getAttribute('data-bg');
        document.body.style.backgroundImage = `url('${imgPath}')`;

        bgMenu.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        bgMenu.style.display = "none";
        bgMenuToggle.textContent = "Background ▼";
    });
});

// ===== ANIMATION ===== //
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

// ===== AUDIO ===== //
const audio = document.getElementById('background-music');
const muteBtn = document.getElementById('mute-btn');
audio.volume = 0.2;

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
