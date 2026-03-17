/**
 * Agent Avatar World - Three.js Application
 * A 3D world featuring stylized avatars of the Tap Rush agents
 */

// Global variables
let scene, camera, renderer, controls;
let agents = {};
let selectedAgent = null;
let raycaster, mouse;
let clock = new THREE.Clock();
let mixer;
let animations = {};

// Agent configurations based on photos
const AGENT_CONFIGS = {
    groot: {
        name: 'Groot',
        description: 'The Digital Ent - Rooted in code, growing with knowledge',
        color: 0x8B4513,
        secondaryColor: 0x228B22,
        position: { x: -3, y: 0, z: 0 },
        scale: 1.2,
        type: 'tree'
    },
    fin: {
        name: 'Fin',
        description: 'The Strategist - Sharp mind, sharper style',
        color: 0x8B4513,
        secondaryColor: 0xF5F5DC,
        position: { x: 0, y: 0, z: 2 },
        scale: 1,
        type: 'human'
    },
    betty: {
        name: 'Betty',
        description: 'The Creative - Pink pixels and endless imagination',
        color: 0xFF69B4,
        secondaryColor: 0xFFB6C1,
        position: { x: 3, y: 0, z: 0 },
        scale: 0.9,
        type: 'voxel'
    }
};

// Initialize the application
function init() {
    console.log('Starting init...');
    
    // Check if THREE is available
    if (typeof THREE === 'undefined') {
        throw new Error('Three.js not loaded');
    }
    console.log('Three.js available');
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

    // Camera setup
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    console.log('Renderer created');

    // Controls
    if (typeof THREE.OrbitControls === 'undefined') {
        throw new Error('OrbitControls not loaded');
    }
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controls.minDistance = 5;
    controls.maxDistance = 20;
    console.log('Controls created');

    // Lighting
    setupLighting();

    // Environment
    createEnvironment();

    // Agents
    createAgents();

    // Raycaster for interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onMouseClick);
    renderer.domElement.addEventListener('mousemove', onMouseMove);

    // UI Event listeners
    setupUIEvents();

    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
        }, 500);
    }, 1500);

    // Start animation loop
    animate();
}

// Setup lighting
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main directional light (sun)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    scene.add(dirLight);

    // Accent lights for atmosphere
    const pointLight1 = new THREE.PointLight(0x90EE90, 0.5, 20);
    pointLight1.position.set(-5, 5, -5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xFF69B4, 0.3, 20);
    pointLight2.position.set(5, 5, 5);
    scene.add(pointLight2);
}

// Create the 3D environment
function createEnvironment() {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(40, 40);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a3e,
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid pattern on floor
    const gridHelper = new THREE.GridHelper(40, 40, 0x3a3a4e, 0x2a2a3e);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Office furniture - Conference table
    createTable();

    // Office furniture - Chairs
    createChairs();

    // Office furniture - Plants
    createPlants();

    // Floating particles for atmosphere
    createParticles();
}

// Create conference table
function createTable() {
    const tableGroup = new THREE.Group();

    // Table top
    const topGeometry = new THREE.BoxGeometry(8, 0.2, 4);
    const topMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a3728,
        roughness: 0.6
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 1.5;
    top.castShadow = true;
    top.receiveShadow = true;
    tableGroup.add(top);

    // Table legs
    const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333 });
    
    const positions = [
        [-3.5, 0.75, -1.5],
        [3.5, 0.75, -1.5],
        [-3.5, 0.75, 1.5],
        [3.5, 0.75, 1.5]
    ];

    positions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(...pos);
        leg.castShadow = true;
        tableGroup.add(leg);
    });

    scene.add(tableGroup);
}

// Create chairs
function createChairs() {
    const chairPositions = [
        { x: -5, z: 0, rot: Math.PI / 2 },
        { x: 5, z: 0, rot: -Math.PI / 2 },
        { x: 0, z: -3, rot: 0 },
        { x: 0, z: 3, rot: Math.PI }
    ];

    chairPositions.forEach(pos => {
        const chair = createChair();
        chair.position.set(pos.x, 0, pos.z);
        chair.rotation.y = pos.rot;
        scene.add(chair);
    });
}

function createChair() {
    const chairGroup = new THREE.Group();

    // Seat
    const seatGeometry = new THREE.BoxGeometry(1.2, 0.1, 1.2);
    const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x444 });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.y = 1;
    seat.castShadow = true;
    chairGroup.add(seat);

    // Back
    const backGeometry = new THREE.BoxGeometry(1.2, 1.2, 0.1);
    const back = new THREE.Mesh(backGeometry, seatMaterial);
    back.position.set(0, 1.6, -0.55);
    back.castShadow = true;
    chairGroup.add(back);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333 });
    
    const legPositions = [
        [-0.5, 0.5, -0.5],
        [0.5, 0.5, -0.5],
        [-0.5, 0.5, 0.5],
        [0.5, 0.5, 0.5]
    ];

    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(...pos);
        leg.castShadow = true;
        chairGroup.add(leg);
    });

    return chairGroup;
}

// Create decorative plants
function createPlants() {
    const plantPositions = [
        { x: -8, z: -8 },
        { x: 8, z: -8 },
        { x: -8, z: 8 },
        { x: 8, z: 8 }
    ];

    plantPositions.forEach(pos => {
        const plant = createPlant();
        plant.position.set(pos.x, 0, pos.z);
        scene.add(plant);
    });
}

function createPlant() {
    const plantGroup = new THREE.Group();

    // Pot
    const potGeometry = new THREE.CylinderGeometry(0.6, 0.4, 1, 8);
    const potMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const pot = new THREE.Mesh(potGeometry, potMaterial);
    pot.position.y = 0.5;
    pot.castShadow = true;
    plantGroup.add(pot);

    // Plant body
    const bodyGeometry = new THREE.ConeGeometry(0.8, 2, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 2;
    body.castShadow = true;
    plantGroup.add(body);

    return plantGroup;
}

// Create floating particles
function createParticles() {
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 30;
        positions[i + 1] = Math.random() * 10;
        positions[i + 2] = (Math.random() - 0.5) * 30;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0x90EE90,
        size: 0.05,
        transparent: true,
        opacity: 0.6
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Animate particles
    particles.userData = { speeds: Array(particleCount).fill(0).map(() => Math.random() * 0.02 + 0.01) };
    
    function animateParticles() {
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 1] += particles.userData.speeds[i];
            if (positions[i * 3 + 1] > 10) {
                positions[i * 3 + 1] = 0;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }

    particles.animate = animateParticles;
    scene.userData.particles = particles;
}

// Create all agents
function createAgents() {
    Object.keys(AGENT_CONFIGS).forEach(key => {
        const config = AGENT_CONFIGS[key];
        const agent = createAgent(config);
        agent.position.set(config.position.x, config.position.y, config.position.z);
        agent.scale.setScalar(config.scale);
        agent.userData = { 
            id: key, 
            config: config,
            originalY: config.position.y,
            walkOffset: Math.random() * Math.PI * 2
        };
        scene.add(agent);
        agents[key] = agent;
    });
}

// Create individual agent based on type
function createAgent(config) {
    const group = new THREE.Group();

    if (config.type === 'tree') {
        createGrootAvatar(group, config);
    } else if (config.type === 'voxel') {
        createBettyAvatar(group, config);
    } else {
        createFinAvatar(group, config);
    }

    // Add name label
    createNameLabel(group, config.name);

    return group;
}

// Create Groot-style tree avatar
function createGrootAvatar(group, config) {
    // Body (trunk)
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.8, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: config.color,
        roughness: 0.9
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeometry = new THREE.CylinderGeometry(0.5, 0.4, 0.8, 8);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.y = 2.2;
    head.castShadow = true;
    group.add(head);

    // Face features
    const eyeGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 2.3, 0.4);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 2.3, 0.4);
    group.add(rightEye);

    // Mouth
    const mouthGeometry = new THREE.CylinderGeometry(0.08, 0.2, 4, 8);
    const mouth = new THREE.Mesh(mouthGeometry, eyeMaterial);
    mouth.rotation.z = Math.PI / 2;
    mouth.position.set(0, 2.1, 0.45);
    group.add(mouth);

    // Arms (branches)
    const armGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1.2, 6);
    
    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.position.set(-0.7, 1.4, 0);
    leftArm.rotation.z = Math.PI / 4;
    leftArm.castShadow = true;
    group.add(leftArm);
    group.userData.leftArm = leftArm;
    
    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.position.set(0.7, 1.4, 0);
    rightArm.rotation.z = -Math.PI / 4;
    rightArm.castShadow = true;
    group.add(rightArm);
    group.userData.rightArm = rightArm;

    // Leaves on head
    const leavesGeometry = new THREE.SphereGeometry(0.3, 6, 6);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: config.secondaryColor });
    
    for (let i = 0; i < 5; i++) {
        const leaf = new THREE.Mesh(leavesGeometry, leavesMaterial);
        const angle = (i / 5) * Math.PI * 2;
        leaf.position.set(
            Math.cos(angle) * 0.3,
            2.7 + Math.random() * 0.2,
            Math.sin(angle) * 0.3
        );
        leaf.scale.setScalar(0.5 + Math.random() * 0.3);
        group.add(leaf);
    }

    // Legs (roots)
    const legGeometry = new THREE.CylinderGeometry(0.15, 0.1, 0.8, 6);
    
    const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    leftLeg.position.set(-0.25, 0.4, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);
    group.userData.leftLeg = leftLeg;
    
    const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
    rightLeg.position.set(0.25, 0.4, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);
    group.userData.rightLeg = rightLeg;
}

// Create Fin-style human avatar
function createFinAvatar(group, config) {
    // Body
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: config.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.4;
    body.castShadow = true;
    group.add(body);

    // Shirt (white part)
    const shirtGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.42);
    const shirtMaterial = new THREE.MeshStandardMaterial({ color: config.secondaryColor });
    const shirt = new THREE.Mesh(shirtGeometry, shirtMaterial);
    shirt.position.y = 1.4;
    group.add(shirt);

    // Head
    const headGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.5);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFDBAC });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.3;
    head.castShadow = true;
    group.add(head);

    // Hair
    const hairGeometry = new THREE.BoxGeometry(0.55, 0.2, 0.55);
    const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x222 });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 2.6;
    group.add(hair);

    // Glasses
    const glassesGeometry = new THREE.BoxGeometry(0.52, 0.15, 0.52);
    const glassesMaterial = new THREE.MeshStandardMaterial({ color: 0x000 });
    const glasses = new THREE.Mesh(glassesGeometry, glassesMaterial);
    glasses.position.y = 2.35;
    group.add(glasses);

    // Arms
    const armGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
    const armMaterial = new THREE.MeshStandardMaterial({ color: config.color });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.6, 1.4, 0);
    leftArm.castShadow = true;
    group.add(leftArm);
    group.userData.leftArm = leftArm;
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.6, 1.4, 0);
    rightArm.castShadow = true;
    group.add(rightArm);
    group.userData.rightArm = rightArm;

    // Hands
    const handGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const handMaterial = new THREE.MeshStandardMaterial({ color: 0xFFDBAC });
    
    const leftHand = new THREE.Mesh(handGeometry, handMaterial);
    leftHand.position.set(-0.6, 0.9, 0);
    group.add(leftHand);
    
    const rightHand = new THREE.Mesh(handGeometry, handMaterial);
    rightHand.position.set(0.6, 0.9, 0);
    group.add(rightHand);

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.25, 1, 0.3);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333 });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.2, 0.5, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);
    group.userData.leftLeg = leftLeg;
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.2, 0.5, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);
    group.userData.rightLeg = rightLeg;
}

// Create Betty-style voxel avatar
function createBettyAvatar(group, config) {
    // Body (voxel style - segmented)
    const bodyParts = [];
    
    // Main body block
    const bodyGeometry = new THREE.BoxGeometry(0.7, 1, 0.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: config.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.3;
    body.castShadow = true;
    group.add(body);

    // Badge/Detail
    const badgeGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.52);
    const badgeMaterial = new THREE.MeshStandardMaterial({ color: 0xFFF });
    const badge = new THREE.Mesh(badgeGeometry, badgeMaterial);
    badge.position.set(0.15, 1.4, 0);
    group.add(badge);

    // Head (voxel style)
    const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const headMaterial = new THREE.MeshStandardMaterial({ color: config.secondaryColor });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.2;
    head.castShadow = true;
    group.add(head);

    // Hair (voxel blocks)
    const hairGeometry = new THREE.BoxGeometry(0.65, 0.3, 0.65);
    const hairMaterial = new THREE.MeshStandardMaterial({ color: 0xFFB6C1 });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 2.55;
    group.add(hair);

    // Glasses (voxel style)
    const glassesGeometry = new THREE.BoxGeometry(0.62, 0.2, 0.62);
    const glassesMaterial = new THREE.MeshStandardMaterial({ color: 0x222 });
    const glasses = new THREE.Mesh(glassesGeometry, glassesMaterial);
    glasses.position.y = 2.25;
    group.add(glasses);

    // Arms (voxel blocks)
    const armGeometry = new THREE.BoxGeometry(0.2, 0.9, 0.2);
    const armMaterial = new THREE.MeshStandardMaterial({ color: config.color });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.55, 1.3, 0);
    leftArm.castShadow = true;
    group.add(leftArm);
    group.userData.leftArm = leftArm;
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.55, 1.3, 0);
    rightArm.castShadow = true;
    group.add(rightArm);
    group.userData.rightArm = rightArm;

    // Legs (voxel blocks)
    const legGeometry = new THREE.BoxGeometry(0.22, 0.8, 0.22);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x444 });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.18, 0.4, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);
    group.userData.leftLeg = leftLeg;
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.18, 0.4, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);
    group.userData.rightLeg = rightLeg;
}

// Create name label above agent
function createNameLabel(group, name) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.roundRect(0, 0, 256, 64, 10);
    context.fill();
    
    context.font = 'bold 32px Arial';
    context.fillStyle = '#90EE90';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(name, 128, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.position.y = 3.2;
    sprite.scale.set(2, 0.5, 1);
    
    group.add(sprite);
    group.userData.nameLabel = sprite;
}

// Animation functions
function animateWalk(agent, time) {
    const walkSpeed = 3;
    const walkRange = 0.3;
    
    // Bobbing motion
    agent.position.y = agent.userData.originalY + Math.abs(Math.sin(time * walkSpeed)) * 0.1;
    
    // Arm swinging
    if (agent.userData.leftArm) {
        agent.userData.leftArm.rotation.x = Math.sin(time * walkSpeed) * walkRange;
    }
    if (agent.userData.rightArm) {
        agent.userData.rightArm.rotation.x = -Math.sin(time * walkSpeed) * walkRange;
    }
    
    // Leg movement
    if (agent.userData.leftLeg) {
        agent.userData.leftLeg.rotation.x = -Math.sin(time * walkSpeed) * walkRange * 0.5;
    }
    if (agent.userData.rightLeg) {
        agent.userData.rightLeg.rotation.x = Math.sin(time * walkSpeed) * walkRange * 0.5;
    }
}

function animateWave(agent, time) {
    if (agent.userData.rightArm) {
        agent.userData.rightArm.rotation.z = Math.PI - 0.5 + Math.sin(time * 10) * 0.3;
    }
}

function animateDance(agent, time) {
    const danceSpeed = 4;
    
    // Spin
    agent.rotation.y = Math.sin(time * danceSpeed * 0.5) * 0.5;
    
    // Jump
    agent.position.y = agent.userData.originalY + Math.abs(Math.sin(time * danceSpeed)) * 0.3;
    
    // Arms up
    if (agent.userData.leftArm) {
        agent.userData.leftArm.rotation.z = Math.PI * 0.7 + Math.sin(time * danceSpeed * 2) * 0.2;
    }
    if (agent.userData.rightArm) {
        agent.userData.rightArm.rotation.z = -Math.PI * 0.7 - Math.sin(time * danceSpeed * 2) * 0.2;
    }
}

function resetAnimation(agent) {
    agent.rotation.y = 0;
    agent.position.y = agent.userData.originalY;
    
    if (agent.userData.leftArm) {
        agent.userData.leftArm.rotation.set(0, 0, 0);
    }
    if (agent.userData.rightArm) {
        agent.userData.rightArm.rotation.set(0, 0, 0);
    }
    if (agent.userData.leftLeg) {
        agent.userData.leftLeg.rotation.set(0, 0, 0);
    }
    if (agent.userData.rightLeg) {
        agent.userData.rightLeg.rotation.set(0, 0, 0);
    }
}

// Event handlers
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseClick(event) {
    raycaster.setFromCamera(mouse, camera);
    
    const agentMeshes = Object.values(agents).map(agent => {
        return agent.children.filter(child => child.type === 'Mesh');
    }).flat();
    
    const intersects = raycaster.intersectObjects(agentMeshes, true);
    
    if (intersects.length > 0) {
        // Find which agent was clicked
        let clickedObject = intersects[0].object;
        while (clickedObject.parent && !clickedObject.parent.userData.id) {
            clickedObject = clickedObject.parent;
        }
        
        if (clickedObject.parent && clickedObject.parent.userData.id) {
            selectAgent(clickedObject.parent.userData.id);
        }
    }
}

function selectAgent(agentId) {
    selectedAgent = agentId;
    
    // Update UI
    document.querySelectorAll('.agent-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-agent="${agentId}"]`).classList.add('active');
    
    // Show interaction panel
    const panel = document.getElementById('interaction-panel');
    panel.style.display = 'block';
    document.getElementById('selected-agent-name').textContent = AGENT_CONFIGS[agentId].name;
    document.getElementById('selected-agent-desc').textContent = AGENT_CONFIGS[agentId].description;
    
    // Focus camera on agent
    const agent = agents[agentId];
    const targetPos = agent.position.clone();
    
    // Smooth camera transition
    const startPos = camera.position.clone();
    const endPos = new THREE.Vector3(
        targetPos.x + 3,
        targetPos.y + 2,
        targetPos.z + 5
    );
    
    let progress = 0;
    function animateCamera() {
        progress += 0.05;
        if (progress <= 1) {
            camera.position.lerpVectors(startPos, endPos, progress);
            controls.target.lerp(targetPos, 0.1);
            requestAnimationFrame(animateCamera);
        }
    }
    animateCamera();
}

function setupUIEvents() {
    // Agent cards
    document.querySelectorAll('.agent-card').forEach(card => {
        card.addEventListener('click', () => {
            selectAgent(card.dataset.agent);
        });
    });
    
    // Action buttons
    document.getElementById('btn-wave').addEventListener('click', () => {
        if (selectedAgent) {
            agents[selectedAgent].userData.action = 'wave';
            setTimeout(() => {
                agents[selectedAgent].userData.action = null;
                resetAnimation(agents[selectedAgent]);
            }, 2000);
        }
    });
    
    document.getElementById('btn-dance').addEventListener('click', () => {
        if (selectedAgent) {
            agents[selectedAgent].userData.action = 'dance';
        }
    });
    
    document.getElementById('btn-follow').addEventListener('click', () => {
        if (selectedAgent) {
            agents[selectedAgent].userData.action = 'follow';
        }
    });
    
    document.getElementById('btn-reset').addEventListener('click', () => {
        if (selectedAgent) {
            agents[selectedAgent].userData.action = null;
            resetAnimation(agents[selectedAgent]);
        }
    });
}

// Main animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    const delta = clock.getDelta();
    
    // Update controls
    controls.update();
    
    // Animate particles
    if (scene.userData.particles) {
        scene.userData.particles.animate();
    }
    
    // Animate agents
    Object.keys(agents).forEach(key => {
        const agent = agents[key];
        const action = agent.userData.action;
        
        if (action === 'wave') {
            animateWave(agent, time);
        } else if (action === 'dance') {
            animateDance(agent, time);
        } else if (action === 'follow') {
            // Walk in a circle
            const radius = 3;
            const speed = 0.5;
            agent.position.x = Math.cos(time * speed) * radius;
            agent.position.z = Math.sin(time * speed) * radius;
            agent.rotation.y = -time * speed + Math.PI / 2;
            animateWalk(agent, time);
        } else {
            // Idle animation
            agent.position.y = agent.userData.originalY + Math.sin(time * 2 + agent.userData.walkOffset) * 0.05;
            
            // Subtle breathing
            if (agent.userData.leftArm) {
                agent.userData.leftArm.rotation.z = Math.sin(time + agent.userData.walkOffset) * 0.05;
            }
            if (agent.userData.rightArm) {
                agent.userData.rightArm.rotation.z = -Math.sin(time + agent.userData.walkOffset) * 0.05;
            }
        }
        
        // Make name label always face camera
        if (agent.userData.nameLabel) {
            agent.userData.nameLabel.material.rotation = 0;
        }
    });
    
    // Render
    renderer.render(scene, camera);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready, starting init...');
    try {
        init();
        console.log('Init completed');
    } catch (err) {
        console.error('Init failed:', err);
        document.getElementById('loading-screen').innerHTML = 
            '<div style="color:red;padding:20px;"><h3>Error</h3><p>' + err.message + '</p><pre>' + err.stack + '</pre></div>';
    }
});