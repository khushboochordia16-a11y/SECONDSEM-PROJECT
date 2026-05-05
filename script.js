// ==========================================
// 1. CORE UTILITIES
// ==========================================
const lenis = new Lenis();
function raf(time) { 
    lenis.raf(time); 
    requestAnimationFrame(raf); 
}
requestAnimationFrame(raf);

gsap.registerPlugin(ScrollTrigger);

function scrollToSection(sectionId) {
    lenis.scrollTo('#' + sectionId);
}

// ==========================================
// LOADING MANAGER
// ==========================================
const loadingScreen = document.getElementById('loading-screen');
const loadingBar = document.getElementById('loading-bar');
const loadingPercent = document.getElementById('loading-percent');

const manager = new THREE.LoadingManager();

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    const progress = (itemsLoaded / itemsTotal) * 100;
    loadingBar.style.width = progress + '%';
    loadingPercent.innerText = Math.round(progress);
};

manager.onLoad = function () {
    gsap.to(loadingScreen, {
        opacity: 0,
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
            loadingScreen.style.display = 'none';
        }
    });
};

const loader = new THREE.GLTFLoader(manager);

// ==========================================
// 2. SCENE 1: GRAMOPHONE
// ==========================================
const container1 = document.querySelector('.hover-box-1');
const canvas1 = document.querySelector('#webgl-1');
const scene1 = new THREE.Scene();

const camera1 = new THREE.PerspectiveCamera(45, container1.clientWidth / container1.clientHeight, 0.1, 1000);
camera1.position.z = 6; 

const renderer1 = new THREE.WebGLRenderer({ canvas: canvas1, antialias: true, alpha: true });
renderer1.setSize(container1.clientWidth, container1.clientHeight);
renderer1.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// PROPER ORBIT CONTROLS FOR SCENE 1
const controls1 = new THREE.OrbitControls(camera1, renderer1.domElement);
controls1.enableDamping = true;
controls1.dampingFactor = 0.05;
controls1.enableZoom = false;
controls1.autoRotate = true;    
controls1.autoRotateSpeed = 1.5; 

// Lighting
scene1.add(new THREE.AmbientLight(0xffffff, 1.2)); 
const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.0); 
dirLight1.position.set(5, 5, 3);
scene1.add(dirLight1);

// Golden Dust
let particlesMesh1;
const particlesGeo1 = new THREE.BufferGeometry();
const particlesArray1 = new Float32Array(150 * 3);
for(let i = 0; i < 150 * 3; i++) {
    particlesArray1[i] = (Math.random() - 0.5) * 10; 
}
particlesGeo1.setAttribute('position', new THREE.BufferAttribute(particlesArray1, 3));
const particlesMat1 = new THREE.PointsMaterial({
    size: 0.03, color: 0xc5a059, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending
});
particlesMesh1 = new THREE.Points(particlesGeo1, particlesMat1);
scene1.add(particlesMesh1);

// Load Radio 1
let radio1Wrapper;
loader.load('./radio1.glb', function(gltf) {
    let radio1 = gltf.scene;
    const box = new THREE.Box3().setFromObject(radio1);
    const center = box.getCenter(new THREE.Vector3());
    radio1.position.sub(center);

    radio1Wrapper = new THREE.Group();
    radio1Wrapper.add(radio1);

    const size = box.getSize(new THREE.Vector3());
    const scale = 3.2 / Math.max(size.x, size.y, size.z);
    radio1Wrapper.scale.set(scale, scale, scale);

    scene1.add(radio1Wrapper);
});


// ==========================================
// 3. SCENE 2: BPL CD RADIO
// ==========================================
const container2 = document.querySelector('.hover-box-2');
const canvas2 = document.querySelector('#webgl-2');
const scene2 = new THREE.Scene();

const camera2 = new THREE.PerspectiveCamera(45, container2.clientWidth / container2.clientHeight, 0.1, 1000);
camera2.position.z = 6; 

const renderer2 = new THREE.WebGLRenderer({ canvas: canvas2, antialias: true, alpha: true });
renderer2.setSize(container2.clientWidth, container2.clientHeight);
renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// PROPER ORBIT CONTROLS FOR SCENE 2
const controls2 = new THREE.OrbitControls(camera2, renderer2.domElement);
controls2.enableDamping = true;
controls2.dampingFactor = 0.05;
controls2.enableZoom = false;
controls2.autoRotate = true;
controls2.autoRotateSpeed = 1.5;

// Lighting
scene2.add(new THREE.AmbientLight(0xffffff, 1.2)); 
const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.2); 
dirLight2.position.set(5, 5, 3);
scene2.add(dirLight2);

// Load Radio 2
let radio2Wrapper;
loader.load('./radio2.glb', function(gltf) {
    let radio2 = gltf.scene;
    const box = new THREE.Box3().setFromObject(radio2);
    const center = box.getCenter(new THREE.Vector3());
    radio2.position.sub(center);

    radio2Wrapper = new THREE.Group();
    radio2Wrapper.add(radio2);

    const size = box.getSize(new THREE.Vector3());
    const scale = 3.2 / Math.max(size.x, size.y, size.z);
    radio2Wrapper.scale.set(scale, scale, scale);

    scene2.add(radio2Wrapper);
});


// ==========================================
// 4. ANIMATION & RENDER LOOP
// ==========================================
function animate() {
    requestAnimationFrame(animate);

    controls1.update();
    controls2.update();
    
    if (particlesMesh1) {
        particlesMesh1.rotation.y -= 0.001;
        particlesMesh1.rotation.x += 0.0005;
    }
    
    renderer1.render(scene1, camera1);
    renderer2.render(scene2, camera2);
}
animate();


// ==========================================
// 5. SCROLL TRIGGER & RESIZE
// ==========================================
gsap.to(".waves-wrapper", {
    scrollTrigger: { trigger: ".exhibit-grid", start: "top bottom", end: "bottom top", scrub: true },
    opacity: 0.05
});

gsap.timeline({
    scrollTrigger: { trigger: "#exhibit-2", start: "top bottom", end: "top center", scrub: true }
})
.to('#exhibit-1', { opacity: 0.1, duration: 1 })
.from('#exhibit-2', { opacity: 0, duration: 1 }, 0);

window.addEventListener('resize', () => {
    if (container1.clientWidth > 0) {
        camera1.aspect = container1.clientWidth / container1.clientHeight;
        camera1.updateProjectionMatrix();
        renderer1.setSize(container1.clientWidth, container1.clientHeight);
    }
    if (container2.clientWidth > 0) {
        camera2.aspect = container2.clientWidth / container2.clientHeight;
        camera2.updateProjectionMatrix();
        renderer2.setSize(container2.clientWidth, container2.clientHeight);
    }
});


// ==========================================
// 6. NAVIGATION LOGIC
// ==========================================
const navLinks = document.querySelectorAll('.nav-links span');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        scrollToSection(link.getAttribute('data-section'));
    });
});

document.querySelector('.enter-btn').addEventListener('click', () => {
    scrollToSection('exhibit-1');
});

const allSections = document.querySelectorAll('.museum-section');
allSections.forEach(section => {
    ScrollTrigger.create({
        trigger: section,
        start: "top 30%", 
        end: "bottom 30%",
        onEnter: () => updateNavActive(section.id || section.classList[1]),
        onEnterBack: () => updateNavActive(section.id || section.classList[1])
    });
});

function updateNavActive(sectionDataValue) {
    navLinks.forEach(link => link.classList.remove('active'));
    const targetLink = document.querySelector(`.nav-links span[data-section="${sectionDataValue}"]`);
    if (targetLink) targetLink.classList.add('active');
}