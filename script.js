// 1. INITIALIZE SMOOTH SCROLL
const lenis = new Lenis();
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
gsap.registerPlugin(ScrollTrigger);

// 2. STAR FIELD
function createStars() {
    const field = document.getElementById('star-field');
    for (let i = 0; i < 120; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2;
        star.style.width = `${size}px`; star.style.height = `${size}px`;
        star.style.top = `${Math.random() * 100}%`; star.style.left = `${Math.random() * 100}%`;
        gsap.to(star, { opacity: Math.random(), duration: 2 + Math.random() * 2, repeat: -1, yoyo: true });
        field.appendChild(star);
    }
}
createStars();

// 3. LOADING MANAGER
const manager = new THREE.LoadingManager();
manager.onProgress = (url, loaded, total) => {
    document.getElementById('loading-bar').style.width = (loaded/total)*100 + '%';
    document.getElementById('loading-percent').innerText = Math.round((loaded/total)*100);
};
manager.onLoad = () => { gsap.to("#loading-screen", { opacity: 0, duration: 1.5, onComplete: () => document.getElementById('loading-screen').style.display='none' }); };
const loader = new THREE.GLTFLoader(manager);

// 4. THREE.JS SCENE FACTORY (Web Gallery)
function setupScene(canvasId, containerId, modelPath) {
    const canvas = document.getElementById(canvasId);
    const container = document.getElementById(containerId);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 7;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false; controls.autoRotate = true;
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    loader.load(modelPath, (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        model.position.sub(box.getCenter(new THREE.Vector3()));
        model.scale.set(3, 3, 3);
        scene.add(model);
    });
    function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
    animate();
}

setupScene('webgl-1', 'box-1', './radio1.glb');
setupScene('webgl-2', 'box-2', './radio2.glb');

// 5. THE AR LOGIC (MINDAR)
let mindarThree = null;

async function startAR() {
    const arSystem = document.getElementById('ar-system');
    arSystem.style.display = 'block';

    mindarThree = new window.MINDAR.IMAGE.MindARThree({
        container: arSystem,
        imageTargetSrc: './FINAL POSTER.MIND', // Matches your exact filename
    });

    const {renderer, scene, camera} = mindarThree;
    const anchor = mindarThree.addAnchor(0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1));

    loader.load('./radio1.glb', (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.4, 0.4, 0.4);
        model.rotation.set(0, Math.PI / 2, 0);
        anchor.group.add(model);
    });

    await mindarThree.start();
    renderer.setAnimationLoop(() => { renderer.render(scene, camera); });
}

// 6. EVENT LISTENERS
document.querySelector('.enter-btn').addEventListener('click', startAR);
document.getElementById('start-ar-nav').addEventListener('click', startAR);

document.getElementById('close-ar').addEventListener('click', () => {
    if (mindarThree) mindarThree.stop();
    document.getElementById('ar-system').style.display = 'none';
});

// Navigation Highlight
const navLinks = document.querySelectorAll('.nav-links span[data-section]');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const targetId = link.getAttribute('data-section');
        lenis.scrollTo('#' + targetId);
    });
});
