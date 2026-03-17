/**
 * Agent Avatar World - Enhanced Office Edition
 * A 3D world featuring stylized avatars in a modern office environment
 */

// Global variables
let scene, camera, renderer, controls;
let agents = {};
let selectedAgent = null;
let raycaster, mouse;
let clock = new THREE.Clock();
let mixer;
let animations = {};
let officeItems = {}; // Store interactive office items
let isMeetingMode = false;

// Office zones for agent navigation
const OFFICE_ZONES = {
    grootDesk: { x: -8, y: 0, z: -6, rot: Math.PI / 4 },
    finDesk: { x: 0, y: 0, z: -8, rot: 0 },
    bettyDesk: { x: 8, y: 0, z: -6, rot: -Math.PI / 4 },
    conferenceTable: { x: 0, y: 0, z: 5, rot: 0 },
    lounge: { x: -10, y: 0, z: 8, rot: Math.PI / 2 },
    coffeeStation: { x: 10, y: 0, z: 8, rot: -Math.PI / 2 }
};

// Agent configurations
const AGENT_CONFIGS = {
    groot: {
        name: 'Groot',
        description: 'The Digital Ent - Rooted in code, growing with knowledge',
        color: 0x8B4513,
        secondaryColor: 0x228B22,
        position: OFFICE_ZONES.grootDesk,
        scale: 1.2,
        type: 'tree',
        workstation: 'grootDesk'
    },
    fin: {
        name: 'Fin',
        description: 'The Strategist - Sharp mind, sharper style',
        color: 0x2C3E50,
        secondaryColor: 0xF5F5DC,
        position: OFFICE_ZONES.finDesk,
        scale: 1,
        type: 'human',
        workstation: 'finDesk'
    },
    betty: {
        name: 'Betty',
        description: 'The Creative - Pink pixels and endless imagination',
        color: 0xFF69B4,
        secondaryColor: 0xFFB6C1,
        position: OFFICE_ZONES.bettyDesk,
        scale: 0.9,
        type: 'voxel',
        workstation: 'bettyDesk'
    }
};

// Material library for consistent office look
const MATERIALS = {
    wood: new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 0.7, metalness: 0.1 }),
    darkWood: new THREE.MeshStandardMaterial({ color: 0x4A3728, roughness: 0.8, metalness: 0.1 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x2C3E50, roughness: 0.3, metalness: 0.8 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xC0C0C0, roughness: 0.1, metalness: 0.9 }),
    glass: new THREE.MeshPhysicalMaterial({ 
        color: 0xFFFFFF, 
        metalness: 0, 
        roughness: 0, 
        transmission: 0.9, 
        transparent: true,
        opacity: 0.3
    }),
    plastic: new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.1 }),
    whitePlastic: new THREE.MeshStandardMaterial({ color: 0xF5F5F5, roughness: 0.4, metalness: 0.1 }),
    fabric: new THREE.MeshStandardMaterial({ color: 0x34495E, roughness: 0.9, metalness: 0 }),
    carpet: new THREE.MeshStandardMaterial({ color: 0x2C3E50, roughness: 1, metalness: 0 }),
    plantGreen: new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.8 }),
    potClay: new THREE.MeshStandardMaterial({ color: 0xD2691E, roughness: 0.9 }),
    screen: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, emissive: 0x001133, emissiveIntensity: 0.2 }),
    screenOn: new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.2, emissive: 0x3366FF, emissiveIntensity: 0.5 })
};

// Initialize the application
function init() {
    console.log('Starting init...');
    
    if (typeof THREE === 'undefined') {
        throw new Error('Three.js not loaded');
    }
    console.log('Three.js available');

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 20, 80);

    // Camera setup
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 12, 25);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
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
    controls.maxDistance = 50;
    controls.target.set(0, 2, 0);
    console.log('Controls created');

    // Lighting
    setupLighting();

    // Environment
    createOfficeEnvironment();

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

// Setup comprehensive lighting
function setupLighting() {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Main directional light (sun through windows)
    const sunLight = new THREE.DirectionalLight(0xFFF8DC, 0.6);
    sunLight.position.set(-20, 30, -20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Overhead office lights
    const createCeilingLight = (x, z, color = 0xFFFFFF, intensity = 0.4) => {
        const light = new THREE.PointLight(color, intensity, 20);
        light.position.set(x, 12, z);
        light.castShadow = true;
        light.shadow.bias = -0.0001;
        scene.add(light);
        
        // Light fixture visual
        const fixtureGeo = new THREE.BoxGeometry(2, 0.1, 0.5);
        const fixtureMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: color, emissiveIntensity: 0.3 });
        const fixture = new THREE.Mesh(fixtureGeo, fixtureMat);
        fixture.position.set(x, 11.9, z);
        scene.add(fixture);
    };

    // Grid of ceiling lights
    for (let x = -15; x <= 15; x += 10) {
        for (let z = -10; z <= 10; z += 10) {
            createCeilingLight(x, z);
        }
    }

    // Accent lights for atmosphere
    const greenAccent = new THREE.PointLight(0x90EE90, 0.3, 15);
    greenAccent.position.set(-12, 5, -8);
    scene.add(greenAccent);

    const pinkAccent = new THREE.PointLight(0xFF69B4, 0.2, 15);
    pinkAccent.position.set(12, 5, -8);
    scene.add(pinkAccent);

    // Window light (blue-ish for city view)
    const windowLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
    windowLight.position.set(0, 10, 30);
    scene.add(windowLight);
}

// Create the comprehensive office environment
function createOfficeEnvironment() {
    // Floor with carpet material
    const floorGeometry = new THREE.PlaneGeometry(60, 60);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2C3E50,
        roughness: 0.9,
        metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.name = 'floor';
    scene.add(floor);

    // Ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(60, 60);
    const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0xF5F5F5 });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 12;
    scene.add(ceiling);

    // Walls
    createWalls();

    // Windows with city view
    createWindows();

    // Workstations
    createGrootWorkstation();
    createFinWorkstation();
    createBettyWorkstation();

    // Conference room
    createConferenceRoom();

    // Lounge area
    createLoungeArea();

    // Coffee station
    createCoffeeStation();

    // Plants and decorations
    createPlants();
    createDecorations();

    // Floating particles for atmosphere
    createParticles();
}

// Create walls
function createWalls() {
    const wallHeight = 12;
    const wallThickness = 0.5;
    
    // Back wall
    const backWallGeo = new THREE.BoxGeometry(60, wallHeight, wallThickness);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xE8E8E8, roughness: 0.8 });
    const backWall = new THREE.Mesh(backWallGeo, wallMaterial);
    backWall.position.set(0, wallHeight/2, -30);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Side walls (partial - for open office feel)
    const sideWallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, 40);
    
    const leftWall = new THREE.Mesh(sideWallGeo, wallMaterial);
    leftWall.position.set(-30, wallHeight/2, 10);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeo, wallMaterial);
    rightWall.position.set(30, wallHeight/2, 10);
    rightWall.receiveShadow = true;
    scene.add(rightWall);
}

// Create windows with city view backdrop
function createWindows() {
    // Large windows on the front side (facing camera)
    const windowWidth = 8;
    const windowHeight = 6;
    const windowY = 6;
    
    const windowPositions = [
        { x: -15, z: 30 },
        { x: 0, z: 30 },
        { x: 15, z: 30 }
    ];

    windowPositions.forEach(pos => {
        // Window frame
        const frameGeo = new THREE.BoxGeometry(windowWidth + 0.5, windowHeight + 0.5, 0.3);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x2C3E50 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.set(pos.x, windowY, pos.z);
        scene.add(frame);

        // Glass
        const glassGeo = new THREE.PlaneGeometry(windowWidth, windowHeight);
        const glass = new THREE.Mesh(glassGeo, MATERIALS.glass);
        glass.position.set(pos.x, windowY, pos.z - 0.1);
        scene.add(glass);

        // Window sill
        const sillGeo = new THREE.BoxGeometry(windowWidth + 1, 0.2, 1);
        const sillMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const sill = new THREE.Mesh(sillGeo, sillMat);
        sill.position.set(pos.x, windowY - windowHeight/2, pos.z + 0.3);
        sill.castShadow = true;
        scene.add(sill);
    });

    // City view backdrop (simplified buildings)
    createCityView();
}

// Create simplified city view outside windows
function createCityView() {
    const cityGroup = new THREE.Group();
    
    for (let i = 0; i < 30; i++) {
        const height = 10 + Math.random() * 30;
        const width = 3 + Math.random() * 5;
        const depth = 3 + Math.random() * 5;
        
        const buildingGeo = new THREE.BoxGeometry(width, height, depth);
        const buildingMat = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color().setHSL(0.6, 0.2, 0.2 + Math.random() * 0.3)
        });
        const building = new THREE.Mesh(buildingGeo, buildingMat);
        
        const x = (Math.random() - 0.5) * 80;
        const z = 40 + Math.random() * 30;
        building.position.set(x, height/2, z);
        cityGroup.add(building);

        // Add some lit windows
        if (Math.random() > 0.5) {
            const windowGeo = new THREE.PlaneGeometry(width * 0.8, height * 0.8);
            const windowMat = new THREE.MeshBasicMaterial({ 
                color: 0xFFEE88, 
                transparent: true, 
                opacity: 0.3 
            });
            const windows = new THREE.Mesh(windowGeo, windowMat);
            windows.position.set(x, height/2, z - depth/2 - 0.1);
            cityGroup.add(windows);
        }
    }

    scene.add(cityGroup);
}

// Create Groot's workstation (near plant/window)
function createGrootWorkstation() {
    const group = new THREE.Group();
    group.name = 'grootDesk';
    group.userData = { type: 'desk', agent: 'groot', clickable: true };

    // Desk
    const deskGeo = new THREE.BoxGeometry(3, 0.1, 1.5);
    const desk = new THREE.Mesh(deskGeo, MATERIALS.wood);
    desk.position.y = 1.5;
    desk.castShadow = true;
    desk.receiveShadow = true;
    group.add(desk);

    // Desk legs
    const legGeo = new THREE.BoxGeometry(0.1, 1.5, 0.1);
    const legPositions = [[-1.3, 0.75, -0.6], [1.3, 0.75, -0.6], [-1.3, 0.75, 0.6], [1.3, 0.75, 0.6]];
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, MATERIALS.metal);
        leg.position.set(...pos);
        leg.castShadow = true;
        group.add(leg);
    });

    // Computer monitor
    const monitorGeo = new THREE.BoxGeometry(1.2, 0.8, 0.05);
    const monitor = new THREE.Mesh(monitorGeo, MATERIALS.screen);
    monitor.position.set(0, 2.2, -0.5);
    monitor.castShadow = true;
    group.add(monitor);

    // Monitor stand
    const standGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4);
    const stand = new THREE.Mesh(standGeo, MATERIALS.metal);
    stand.position.set(0, 1.9, -0.5);
    group.add(stand);

    // Keyboard
    const kbGeo = new THREE.BoxGeometry(0.8, 0.05, 0.3);
    const keyboard = new THREE.Mesh(kbGeo, MATERIALS.plastic);
    keyboard.position.set(0, 1.55, 0.2);
    group.add(keyboard);

    // Mouse
    const mouseGeo = new THREE.BoxGeometry(0.1, 0.05, 0.15);
    const mouse = new THREE.Mesh(mouseGeo, MATERIALS.plastic);
    mouse.position.set(0.6, 1.55, 0.2);
    group.add(mouse);

    // Plant on desk
    const potGeo = new THREE.CylinderGeometry(0.15, 0.1, 0.3, 8);
    const pot = new THREE.Mesh(potGeo, MATERIALS.potClay);
    pot.position.set(-1, 1.65, 0.3);
    pot.castShadow = true;
    group.add(pot);

    const plantGeo = new THREE.SphereGeometry(0.25, 8, 8);
    const plant = new THREE.Mesh(plantGeo, MATERIALS.plantGreen);
    plant.position.set(-1, 2, 0.3);
    group.add(plant);

    // Position the desk
    group.position.set(-8, 0, -6);
    group.rotation.y = Math.PI / 4;
    
    scene.add(group);
    officeItems.grootDesk = group;
}

// Create Fin's trading desk (multiple monitors)
function createFinWorkstation() {
    const group = new THREE.Group();
    group.name = 'finDesk';
    group.userData = { type: 'desk', agent: 'fin', clickable: true };

    // Large trading desk
    const deskGeo = new THREE.BoxGeometry(4, 0.1, 2);
    const desk = new THREE.Mesh(deskGeo, MATERIALS.darkWood);
    desk.position.y = 1.5;
    desk.castShadow = true;
    desk.receiveShadow = true;
    group.add(desk);

    // Desk legs (modern style)
    const legGeo = new THREE.BoxGeometry(0.15, 1.5, 1.8);
    const leftLeg = new THREE.Mesh(legGeo, MATERIALS.metal);
    leftLeg.position.set(-1.8, 0.75, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, MATERIALS.metal);
    rightLeg.position.set(1.8, 0.75, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // Multiple monitors (trading setup)
    const monitorGeo = new THREE.BoxGeometry(1, 0.7, 0.05);
    
    // Center monitor
    const centerMonitor = new THREE.Mesh(monitorGeo, MATERIALS.screenOn);
    centerMonitor.position.set(0, 2.3, -0.8);
    centerMonitor.castShadow = true;
    group.add(centerMonitor);

    // Left monitor
    const leftMonitor = new THREE.Mesh(monitorGeo, MATERIALS.screen);
    leftMonitor.position.set(-1.2, 2.3, -0.8);
    leftMonitor.rotation.y = 0.2;
    leftMonitor.castShadow = true;
    group.add(leftMonitor);

    // Right monitor
    const rightMonitor = new THREE.Mesh(monitorGeo, MATERIALS.screen);
    rightMonitor.position.set(1.2, 2.3, -0.8);
    rightMonitor.rotation.y = -0.2;
    rightMonitor.castShadow = true;
    group.add(rightMonitor);

    // Monitor stands
    const standGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5);
    [-1.2, 0, 1.2].forEach(x => {
        const stand = new THREE.Mesh(standGeo, MATERIALS.metal);
        stand.position.set(x, 2, -0.8);
        group.add(stand);
    });

    // Keyboard
    const kbGeo = new THREE.BoxGeometry(1, 0.05, 0.35);
    const keyboard = new THREE.Mesh(kbGeo, MATERIALS.plastic);
    keyboard.position.set(0, 1.55, 0.3);
    group.add(keyboard);

    // Trading books/stack
    const bookGeo = new THREE.BoxGeometry(0.4, 0.05, 0.6);
    const bookMat = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
    const book = new THREE.Mesh(bookGeo, bookMat);
    book.position.set(1.5, 1.55, 0.5);
    book.castShadow = true;
    group.add(book);

    // Coffee cup
    const cupGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.15, 12);
    const cupMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.position.set(-1.5, 1.58, 0.5);
    cup.castShadow = true;
    group.add(cup);

    // Position the desk
    group.position.set(0, 0, -8);
    
    scene.add(group);
    officeItems.finDesk = group;
}

// Create Betty's dev station (creative setup)
function createBettyWorkstation() {
    const group = new THREE.Group();
    group.name = 'bettyDesk';
    group.userData = { type: 'desk', agent: 'betty', clickable: true };

    // Standing desk (creative type)
    const deskGeo = new THREE.BoxGeometry(3, 0.1, 1.5);
    const desk = new THREE.Mesh(deskGeo, MATERIALS.whitePlastic);
    desk.position.y = 2.2;
    desk.castShadow = true;
    desk.receiveShadow = true;
    group.add(desk);

    // Desk legs (tall)
    const legGeo = new THREE.BoxGeometry(0.1, 2.2, 0.1);
    const legPositions = [[-1.3, 1.1, -0.6], [1.3, 1.1, -0.6], [-1.3, 1.1, 0.6], [1.3, 1.1, 0.6]];
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, MATERIALS.chrome);
        leg.position.set(...pos);
        leg.castShadow = true;
        group.add(leg);
    });

    // Large creative monitor
    const monitorGeo = new THREE.BoxGeometry(1.5, 0.9, 0.05);
    const monitor = new THREE.Mesh(monitorGeo, MATERIALS.screenOn);
    monitor.position.set(0, 3, -0.5);
    monitor.castShadow = true;
    group.add(monitor);

    // Monitor stand
    const standGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
    const stand = new THREE.Mesh(standGeo, MATERIALS.chrome);
    stand.position.set(0, 2.65, -0.5);
    group.add(stand);

    // Drawing tablet
    const tabletGeo = new THREE.BoxGeometry(0.8, 0.02, 0.6);
    const tabletMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const tablet = new THREE.Mesh(tabletGeo, tabletMat);
    tablet.position.set(-0.8, 2.22, 0.2);
    group.add(tablet);

    // Stylus
    const stylusGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.15);
    const stylusMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const stylus = new THREE.Mesh(stylusGeo, stylusMat);
    stylus.rotation.z = Math.PI / 2;
    stylus.position.set(-0.8, 2.25, 0.2);
    group.add(stylus);

    // Color swatches (decorative)
    const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF];
    colors.forEach((color, i) => {
        const swatchGeo = new THREE.BoxGeometry(0.1, 0.02, 0.1);
        const swatchMat = new THREE.MeshStandardMaterial({ color: color });
        const swatch = new THREE.Mesh(swatchGeo, swatchMat);
        swatch.position.set(1, 2.22 + i * 0.02, 0.4);
        group.add(swatch);
    });

    // Position the desk
    group.position.set(8, 0, -6);
    group.rotation.y = -Math.PI / 4;
    
    scene.add(group);
    officeItems.bettyDesk = group;
}

// Create conference room with big table
function createConferenceRoom() {
    const group = new THREE.Group();
    group.name = 'conferenceRoom';
    group.userData = { type: 'meeting', clickable: true };

    // Large conference table
    const tableTopGeo = new THREE.BoxGeometry(10, 0.15, 4);
    const tableTop = new THREE.Mesh(tableTopGeo, MATERIALS.darkWood);
    tableTop.position.y = 1.2;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    group.add(tableTop);

    // Table legs
    const legGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.2);
    const legPositions = [[-4, 0.6, -1.5], [4, 0.6, -1.5], [-4, 0.6, 1.5], [4, 0.6, 1.5]];
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, MATERIALS.metal);
        leg.position.set(...pos);
        leg.castShadow = true;
        group.add(leg);
    });

    // Conference chairs (8 chairs)
    const chairPositions = [
        { x: -5.5, z: 0, rot: Math.PI / 2 },
        { x: 5.5, z: 0, rot: -Math.PI / 2 },
        { x: -3, z: -3, rot: 0 },
        { x: 0, z: -3, rot: 0 },
        { x: 3, z: -3, rot: 0 },
        { x: -3, z: 3, rot: Math.PI },
        { x: 0, z: 3, rot: Math.PI },
        { x: 3, z: 3, rot: Math.PI }
    ];

    chairPositions.forEach(pos => {
        const chair = createOfficeChair();
        chair.position.set(pos.x, 0, pos.z);
        chair.rotation.y = pos.rot;
        group.add(chair);
    });

    // Conference phone
    const phoneGeo = new THREE.BoxGeometry(0.3, 0.1, 0.4);
    const phoneMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const phone = new THREE.Mesh(phoneGeo, phoneMat);
    phone.position.set(0, 1.28, 0);
    group.add(phone);

    // Notepads
    const padGeo = new THREE.BoxGeometry(0.4, 0.02, 0.5);
    const padMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    [-3, 0, 3].forEach(x => {
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.position.set(x, 1.28, -1.5);
        group.add(pad);
    });

    // Whiteboard on wall
    const boardGeo = new THREE.BoxGeometry(8, 2, 0.1);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 4, -29.4);
    board.receiveShadow = true;
    scene.add(board);

    // Board frame
    const frameGeo = new THREE.BoxGeometry(8.2, 2.2, 0.05);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 4, -29.45);
    scene.add(frame);

    group.position.set(0, 0, 5);
    scene.add(group);
    officeItems.conferenceRoom = group;
}

// Create office chair
function createOfficeChair() {
    const chairGroup = new THREE.Group();

    // Seat
    const seatGeo = new THREE.BoxGeometry(1, 0.15, 1);
    const seat = new THREE.Mesh(seatGeo, MATERIALS.fabric);
    seat.position.y = 1;
    seat.castShadow = true;
    chairGroup.add(seat);

    // Back
    const backGeo = new THREE.BoxGeometry(1, 1.2, 0.1);
    const back = new THREE.Mesh(backGeo, MATERIALS.fabric);
    back.position.set(0, 1.6, -0.45);
    back.castShadow = true;
    chairGroup.add(back);

    // Armrests
    const armGeo = new THREE.BoxGeometry(0.1, 0.05, 0.8);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.55, 1.4, 0);
    chairGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.55, 1.4, 0);
    chairGroup.add(rightArm);

    // Base
    const baseGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 5);
    const base = new THREE.Mesh(baseGeo, MATERIALS.metal);
    base.position.y = 0.3;
    chairGroup.add(base);

    // Stem
    const stemGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7);
    const stem = new THREE.Mesh(stemGeo, MATERIALS.metal);
    stem.position.y = 0.65;
    chairGroup.add(stem);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(Math.cos(angle) * 0.4, 0.08, Math.sin(angle) * 0.4);
        chairGroup.add(wheel);
    }

    return chairGroup;
}

// Create lounge area with couches
function createLoungeArea() {
    const group = new THREE.Group();
    group.name = 'lounge';
    group.userData = { type: 'lounge', clickable: true };

    // Large L-shaped couch
    // Main section
    const couchMainGeo = new THREE.BoxGeometry(4, 0.6, 1.2);
    const couchMain = new THREE.Mesh(couchMainGeo, new THREE.MeshStandardMaterial({ color: 0x2C3E50, roughness: 0.9 }));
    couchMain.position.set(0, 0.3, 0);
    couchMain.castShadow = true;
    couchMain.receiveShadow = true;
    group.add(couchMain);

    // Backrest
    const backrestGeo = new THREE.BoxGeometry(4, 0.8, 0.2);
    const backrest = new THREE.Mesh(backrestGeo, new THREE.MeshStandardMaterial({ color: 0x34495E, roughness: 0.9 }));
    backrest.position.set(0, 0.7, -0.5);
    backrest.castShadow = true;
    group.add(backrest);

    // Armrests
    const armGeo = new THREE.BoxGeometry(0.2, 0.6, 1.2);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x34495E, roughness: 0.9 });
    
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-2.1, 0.6, 0);
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(2.1, 0.6, 0);
    rightArm.castShadow = true;
    group.add(rightArm);

    // Coffee table
    const tableGeo = new THREE.CylinderGeometry(1, 1, 0.4, 32);
    const table = new THREE.Mesh(tableGeo, MATERIALS.glass);
    table.position.set(0, 0.2, 2);
    table.castShadow = true;
    group.add(table);

    // Table legs
    const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4);
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const leg = new THREE.Mesh(legGeo, MATERIALS.metal);
        leg.position.set(Math.cos(angle) * 0.6, 0.2, 2 + Math.sin(angle) * 0.6);
        group.add(leg);
    }

    // Magazines on table
    const magGeo = new THREE.BoxGeometry(0.4, 0.02, 0.5);
    const magMat = new THREE.MeshStandardMaterial({ color: 0xFF6B6B });
    const mag = new THREE.Mesh(magGeo, magMat);
    mag.position.set(0.2, 0.42, 2);
    mag.rotation.y = 0.3;
    group.add(mag);

    group.position.set(-10, 0, 8);
    group.rotation.y = Math.PI / 2;
    scene.add(group);
    officeItems.lounge = group;
}

// Create coffee station
function createCoffeeStation() {
    const group = new THREE.Group();
    group.name = 'coffeeStation';
    group.userData = { type: 'coffee', clickable: true };

    // Counter
    const counterGeo = new THREE.BoxGeometry(3, 1.2, 1);
    const counter = new THREE.Mesh(counterGeo, MATERIALS.wood);
    counter.position.y = 0.6;
    counter.castShadow = true;
    counter.receiveShadow = true;
    group.add(counter);

    // Countertop
    const topGeo = new THREE.BoxGeometry(3.2, 0.05, 1.2);
    const top = new THREE.Mesh(topGeo, MATERIALS.whitePlastic);
    top.position.y = 1.22;
    top.castShadow = true;
    group.add(top);

    // Coffee machine
    const machineGeo = new THREE.BoxGeometry(0.8, 0.6, 0.5);
    const machineMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.5, roughness: 0.3 });
    const machine = new THREE.Mesh(machineGeo, machineMat);
    machine.position.set(-0.8, 1.55, 0);
    machine.castShadow = true;
    group.add(machine);

    // Machine display
    const displayGeo = new THREE.PlaneGeometry(0.4, 0.2);
    const displayMat = new THREE.MeshStandardMaterial({ color: 0x00FF00, emissive: 0x00FF00, emissiveIntensity: 0.3 });
    const display = new THREE.Mesh(displayGeo, displayMat);
    display.position.set(-0.8, 1.7, 0.26);
    group.add(display);

    // Mug tree
    const treeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4);
    const tree = new THREE.Mesh(treeGeo, MATERIALS.chrome);
    tree.position.set(0.5, 1.45, 0);
    group.add(tree);

    // Mugs
    const mugGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.12, 12);
    const mugColors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3];
    mugColors.forEach((color, i) => {
        const mugMat = new THREE.MeshStandardMaterial({ color: color });
        const mug = new THREE.Mesh(mugGeo, mugMat);
        const angle = (i / 4) * Math.PI * 2;
        mug.position.set(0.5 + Math.cos(angle) * 0.15, 1.35 + (i % 2) * 0.15, Math.sin(angle) * 0.15);
        mug.castShadow = true;
        group.add(mug);
    });

    // Pastry box
    const boxGeo = new THREE.BoxGeometry(0.5, 0.1, 0.4);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xD2691E });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 1.3, 0.3);
    box.castShadow = true;
    group.add(box);

    group.position.set(10, 0, 8);
    group.rotation.y = -Math.PI / 2;
    scene.add(group);
    officeItems.coffeeStation = group;
}

// Create plants and decorations
function createPlants() {
    const plantPositions = [
        { x: -12, z: -10, scale: 1.5 },
        { x: 12, z: -10, scale: 1.2 },
        { x: -12, z: 10, scale: 1.3 },
        { x: 12, z: 10, scale: 1.4 },
        { x: -5, z: -12, scale: 1 },
        { x: 5, z: -12, scale: 1 }
    ];

    plantPositions.forEach((pos, i) => {
        const plant = createDetailedPlant(pos.scale);
        plant.position.set(pos.x, 0, pos.z);
        plant.name = `plant${i}`;
        scene.add(plant);
    });
}

function createDetailedPlant(scale = 1) {
    const group = new THREE.Group();

    // Pot
    const potGeo = new THREE.CylinderGeometry(0.5 * scale, 0.35 * scale, 0.8 * scale, 12);
    const pot = new THREE.Mesh(potGeo, MATERIALS.potClay);
    pot.position.y = 0.4 * scale;
    pot.castShadow = true;
    group.add(pot);

    // Plant stem
    const stemGeo = new THREE.CylinderGeometry(0.05 * scale, 0.08 * scale, 1.5 * scale, 8);
    const stem = new THREE.Mesh(stemGeo, MATERIALS.plantGreen);
    stem.position.y = 1.2 * scale;
    stem.castShadow = true;
    group.add(stem);

    // Leaves
    const leafGeo = new THREE.SphereGeometry(0.3 * scale, 8, 8);
    const leafPositions = [
        { x: 0, y: 1.8, z: 0, s: 1 },
        { x: 0.3, y: 1.6, z: 0.2, s: 0.8 },
        { x: -0.3, y: 1.7, z: -0.1, s: 0.9 },
        { x: 0.1, y: 2, z: 0.3, s: 0.7 },
        { x: -0.2, y: 1.5, z: 0.3, s: 0.6 }
    ];

    leafPositions.forEach(pos => {
        const leaf = new THREE.Mesh(leafGeo, MATERIALS.plantGreen);
        leaf.position.set(pos.x * scale, pos.y * scale, pos.z * scale);
        leaf.scale.setScalar(pos.s);
        leaf.castShadow = true;
        group.add(leaf);
    });

    return group;
}

// Create ambient decorations
function createDecorations() {
    // Wall art frames
    const framePositions = [
        { x: -20, y: 6, z: 0, rot: Math.PI / 2 },
        { x: 20, y: 6, z: 0, rot: -Math.PI / 2 }
    ];

    framePositions.forEach(pos => {
        const frameGroup = new THREE.Group();
        
        // Frame
        const frameGeo = new THREE.BoxGeometry(0.2, 3, 4);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frameGroup.add(frame);

        // Canvas
        const canvasGeo = new THREE.PlaneGeometry(3.6, 2.6);
        const canvasMat = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5)
        });
        const canvas = new THREE.Mesh(canvasGeo, canvasMat);
        canvas.rotation.y = pos.rot > 0 ? 0 : Math.PI;
        canvas.position.x = pos.rot > 0 ? -0.11 : 0.11;
        frameGroup.add(canvas);

        frameGroup.position.set(pos.x, pos.y, pos.z);
        frameGroup.rotation.y = pos.rot;
        scene.add(frameGroup);
    });

    // Cables under desks (visual detail)
    [-8, 0, 8].forEach(x => {
        const cableGeo = new THREE.CylinderGeometry(0.02, 0.02, 2);
        const cableMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const cable = new THREE.Mesh(cableGeo, cableMat);
        cable.position.set(x, 0.1, -6);
        cable.rotation.z = Math.PI / 2;
        cable.rotation.y = Math.random() * 0.5;
        scene.add(cable);
    });
}

// Create floating particles
function createParticles() {
    const particleCount = 150;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 50;
        positions[i + 1] = Math.random() * 12;
        positions[i + 2] = (Math.random() - 0.5) * 50;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0x90EE90,
        size: 0.08,
        transparent: true,
        opacity: 0.6
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    particles.userData = { speeds: Array(particleCount).fill(0).map(() => Math.random() * 0.02 + 0.01) };
    
    function animateParticles() {
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 1] += particles.userData.speeds[i];
            if (positions[i * 3 + 1] > 12) {
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
        agent.rotation.y = config.position.rot;
        agent.scale.setScalar(config.scale);
        agent.userData = { 
            id: key, 
            config: config,
            originalY: config.position.y,
            walkOffset: Math.random() * Math.PI * 2,
            targetPosition: null,
            isWalking: false
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

    // Head
    const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const headMaterial = new THREE.MeshStandardMaterial({ color: config.secondaryColor });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.2;
    head.castShadow = true;
    group.add(head);

    // Hair
    const hairGeometry = new THREE.BoxGeometry(0.65, 0.3, 0.65);
    const hairMaterial = new THREE.MeshStandardMaterial({ color: 0xFFB6C1 });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 2.55;
    group.add(hair);

    // Glasses
    const glassesGeometry = new THREE.BoxGeometry(0.62, 0.2, 0.62);
    const glassesMaterial = new THREE.MeshStandardMaterial({ color: 0x222 });
    const glasses = new THREE.Mesh(glassesGeometry, glassesMaterial);
    glasses.position.y = 2.25;
    group.add(glasses);

    // Arms
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

    // Legs
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

// Move agent to a specific zone
function moveAgentToZone(agentId, zoneName) {
    const agent = agents[agentId];
    const zone = OFFICE_ZONES[zoneName];
    
    if (!agent || !zone) return;
    
    agent.userData.targetPosition = { ...zone };
    agent.userData.isWalking = true;
    agent.userData.action = 'walk';
}

// Meeting mode - all agents gather at conference table
function toggleMeetingMode() {
    isMeetingMode = !isMeetingMode;
    
    if (isMeetingMode) {
        // Move all agents to conference table
        moveAgentToZone('groot', 'conferenceTable');
        moveAgentToZone('fin', 'conferenceTable');
        moveAgentToZone('betty', 'conferenceTable');
        
        // Adjust positions for meeting
        setTimeout(() => {
            agents.groot.position.set(-2, 0, 5);
            agents.groot.rotation.y = 0;
            agents.fin.position.set(0, 0, 5);
            agents.fin.rotation.y = 0;
            agents.betty.position.set(2, 0, 5);
            agents.betty.rotation.y = 0;
            
            Object.values(agents).forEach(agent => {
                agent.userData.isWalking = false;
                agent.userData.action = null;
            });
        }, 2000);
    } else {
        // Return to workstations
        Object.keys(AGENT_CONFIGS).forEach(key => {
            moveAgentToZone(key, AGENT_CONFIGS[key].workstation);
        });
        
        setTimeout(() => {
            Object.keys(agents).forEach(key => {
                const config = AGENT_CONFIGS[key];
                agents[key].position.set(config.position.x, config.position.y, config.position.z);
                agents[key].rotation.y = config.position.rot;
                agents[key].userData.isWalking = false;
                agents[key].userData.action = null;
            });
        }, 2000);
    }
}

// Animation functions
function animateWalk(agent, time) {
    const walkSpeed = 5;
    const walkRange = 0.4;
    
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
    agent.rotation.y = agent.userData.config.position.rot;
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
    
    // Check for agent clicks
    const agentMeshes = Object.values(agents).map(agent => {
        return agent.children.filter(child => child.type === 'Mesh');
    }).flat();
    
    const intersects = raycaster.intersectObjects(agentMeshes, true);
    
    if (intersects.length > 0) {
        let clickedObject = intersects[0].object;
        while (clickedObject.parent && !clickedObject.parent.userData.id) {
            clickedObject = clickedObject.parent;
        }
        
        if (clickedObject.parent && clickedObject.parent.userData.id) {
            selectAgent(clickedObject.parent.userData.id);
            return;
        }
    }
    
    // Check for office item clicks
    const officeMeshes = Object.values(officeItems).map(item => {
        return item.children.filter(child => child.type === 'Mesh');
    }).flat();
    
    const officeIntersects = raycaster.intersectObjects(officeMeshes, true);
    
    if (officeIntersects.length > 0) {
        let clickedObject = officeIntersects[0].object;
        while (clickedObject.parent && !clickedObject.parent.userData.clickable) {
            clickedObject = clickedObject.parent;
        }
        
        if (clickedObject.parent && clickedObject.parent.userData.clickable) {
            const itemData = clickedObject.parent.userData;
            handleOfficeItemClick(itemData);
        }
    }
}

function handleOfficeItemClick(itemData) {
    const panel = document.getElementById('interaction-panel');
    const nameEl = document.getElementById('selected-agent-name');
    const descEl = document.getElementById('selected-agent-desc');
    
    panel.style.display = 'block';
    selectedAgent = null;
    
    document.querySelectorAll('.agent-card').forEach(card => {
        card.classList.remove('active');
    });
    
    switch(itemData.type) {
        case 'desk':
            nameEl.textContent = `${AGENT_CONFIGS[itemData.agent].name}'s Desk`;
            descEl.textContent = `Click "Go to Desk" to move ${AGENT_CONFIGS[itemData.agent].name} here`;
            break;
        case 'meeting':
            nameEl.textContent = 'Conference Room';
            descEl.textContent = 'Click "Meeting Mode" to gather all agents here';
            break;
        case 'lounge':
            nameEl.textContent = 'Lounge Area';
            descEl.textContent = 'A cozy spot for breaks and casual chats';
            break;
        case 'coffee':
            nameEl.textContent = 'Coffee Station';
            descEl.textContent = 'Fuel for the team. ☕';
            break;
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
    
    const startPos = camera.position.clone();
    const endPos = new THREE.Vector3(
        targetPos.x + 4,
        targetPos.y + 3,
        targetPos.z + 6
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
            // Walk to a random zone
            const zones = Object.keys(OFFICE_ZONES);
            const randomZone = zones[Math.floor(Math.random() * zones.length)];
            moveAgentToZone(selectedAgent, randomZone);
        }
    });
    
    document.getElementById('btn-reset').addEventListener('click', () => {
        if (selectedAgent) {
            // Return to workstation
            moveAgentToZone(selectedAgent, AGENT_CONFIGS[selectedAgent].workstation);
        } else {
            // Reset all
            toggleMeetingMode();
            if (isMeetingMode) {
                isMeetingMode = false;
            }
        }
    });

    // Meeting mode button
    const meetingBtn = document.getElementById('btn-meeting');
    if (meetingBtn) {
        meetingBtn.addEventListener('click', () => {
            toggleMeetingMode();
            meetingBtn.textContent = isMeetingMode ? '🔙 Return to Work' : '📅 Meeting Mode';
        });
    }
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
        
        // Handle walking to target
        if (agent.userData.isWalking && agent.userData.targetPosition) {
            const target = agent.userData.targetPosition;
            const current = agent.position;
            const speed = 3 * delta;
            
            const dx = target.x - current.x;
            const dz = target.z - current.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance > 0.1) {
                current.x += (dx / distance) * speed;
                current.z += (dz / distance) * speed;
                
                // Face direction of movement
                agent.rotation.y = Math.atan2(dx, dz);
                
                animateWalk(agent, time);
            } else {
                agent.userData.isWalking = false;
                agent.userData.action = null;
                agent.rotation.y = target.rot;
            }
        } else if (action === 'wave') {
            animateWave(agent, time);
        } else if (action === 'dance') {
            animateDance(agent, time);
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