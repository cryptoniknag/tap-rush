/**
 * Agent Avatar World - Ultra Realistic Office Edition
 * A 3D world featuring stylized avatars in a photorealistic modern office environment
 */

// Global variables
let scene, camera, renderer, controls;
let agents = {};
let selectedAgent = null;
let raycaster, mouse;
let clock = new THREE.Clock();
let mixer;
let animations = {};
let officeItems = {};
let isMeetingMode = false;
let isStandupMode = false;
let steamParticles = [];
let blinds = [];
let clockMesh = null;
let clockHands = {};
let kanbanBoard = null;
let standupCircle = null;

// Office zones for agent navigation
const OFFICE_ZONES = {
    grootDesk: { x: -10, y: 0, z: -8, rot: Math.PI / 4 },
    finDesk: { x: 0, y: 0, z: -12, rot: 0 },
    bettyDesk: { x: 10, y: 0, z: -8, rot: -Math.PI / 4 },
    // Conference table with sitting positions - Groot at head, Fin and Betty opposite
    conferenceTable: { x: 0, y: 0, z: 8, rot: 0 },
    grootChair: { x: 0, y: 0, z: 5.5, rot: 0 },      // Groot at head
    finChair: { x: -3, y: 0, z: 8, rot: Math.PI / 2 },     // Fin on left
    bettyChair: { x: 3, y: 0, z: 8, rot: -Math.PI / 2 },   // Betty on right, opposite Fin
    lounge: { x: -14, y: 0, z: 10, rot: Math.PI / 2 },
    coffeeStation: { x: -28, y: 0, z: 0, rot: Math.PI / 2 },  // EDGE of room (left side)
    waterCooler: { x: 8, y: 0, z: 12, rot: 0 },
    whiteboard: { x: -5, y: 0, z: 8, rot: Math.PI / 2 },
    standupCircle: { x: 0, y: 0, z: 1.5, rot: Math.PI },      // In front of kanban board
    kanbanBoard: { x: 0, y: 0, z: -2, rot: 0 },           // Freestanding at z: -2
    // Gym area - moved closer to center for visibility
    gymArea: { x: 10, y: 0, z: -10, rot: 0 },
    treadmill: { x: 8, y: 0, z: -8, rot: -Math.PI / 2 },
    dumbbellRack: { x: 12, y: 0, z: -8, rot: Math.PI / 2 },
    benchPress: { x: 10, y: 0, z: -12, rot: 0 },
    exerciseMat: { x: 13, y: 0, z: -12, rot: Math.PI / 4 },
    waterFountain: { x: 6, y: 0, z: -10, rot: Math.PI / 2 }
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
    lightWood: new THREE.MeshStandardMaterial({ color: 0xDEB887, roughness: 0.6, metalness: 0.1 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x2C3E50, roughness: 0.3, metalness: 0.8 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xC0C0C0, roughness: 0.1, metalness: 0.9 }),
    brushedMetal: new THREE.MeshStandardMaterial({ color: 0x8899A6, roughness: 0.4, metalness: 0.7 }),
    glass: new THREE.MeshPhysicalMaterial({ 
        color: 0xFFFFFF, 
        metalness: 0, 
        roughness: 0, 
        transmission: 0.9, 
        transparent: true,
        opacity: 0.3
    }),
    frostedGlass: new THREE.MeshPhysicalMaterial({ 
        color: 0xEEEEEE, 
        metalness: 0, 
        roughness: 0.2, 
        transmission: 0.7, 
        transparent: true,
        opacity: 0.5
    }),
    plastic: new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.1 }),
    whitePlastic: new THREE.MeshStandardMaterial({ color: 0xF5F5F5, roughness: 0.4, metalness: 0.1 }),
    fabric: new THREE.MeshStandardMaterial({ color: 0x34495E, roughness: 0.9, metalness: 0 }),
    fabricBlue: new THREE.MeshStandardMaterial({ color: 0x1E3A5F, roughness: 0.9, metalness: 0 }),
    fabricGrey: new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9, metalness: 0 }),
    carpet: new THREE.MeshStandardMaterial({ color: 0x2C3E50, roughness: 1, metalness: 0 }),
    carpetTile1: new THREE.MeshStandardMaterial({ color: 0x3D5A73, roughness: 1, metalness: 0 }),
    carpetTile2: new THREE.MeshStandardMaterial({ color: 0x2E4A5E, roughness: 1, metalness: 0 }),
    plantGreen: new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.8 }),
    potClay: new THREE.MeshStandardMaterial({ color: 0xD2691E, roughness: 0.9 }),
    screen: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, emissive: 0x001133, emissiveIntensity: 0.2 }),
    screenOn: new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.2, emissive: 0x3366FF, emissiveIntensity: 0.5 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xFFFFF0, roughness: 0.8 }),
    yellowSticky: new THREE.MeshStandardMaterial({ color: 0xFFEB3B, roughness: 0.9 }),
    pinkSticky: new THREE.MeshStandardMaterial({ color: 0xFF69B4, roughness: 0.9 }),
    greenSticky: new THREE.MeshStandardMaterial({ color: 0x90EE90, roughness: 0.9 }),
    whiteboard: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.9 }),
    kanbanBoard: new THREE.MeshStandardMaterial({ color: 0xF5F5F5, roughness: 0.8 }),
    kanbanTodo: new THREE.MeshStandardMaterial({ color: 0xFF6B6B, roughness: 0.9 }),
    kanbanProgress: new THREE.MeshStandardMaterial({ color: 0xFFE66D, roughness: 0.9 }),
    kanbanDone: new THREE.MeshStandardMaterial({ color: 0x4ECDC4, roughness: 0.9 }),
    blackPlastic: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4, metalness: 0.2 }),
    bluePlastic: new THREE.MeshStandardMaterial({ color: 0x0066CC, roughness: 0.4 }),
    redPlastic: new THREE.MeshStandardMaterial({ color: 0xCC0000, roughness: 0.4 }),
    ceramic: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2, metalness: 0.1 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 }),
    leatherBlack: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.2, metalness: 0.8 }),
    // Gym materials
    gymFloor: new THREE.MeshStandardMaterial({ color: 0x2C5F4E, roughness: 0.8, metalness: 0.1 }), // Dark green rubber
    gymFloorDark: new THREE.MeshStandardMaterial({ color: 0x1E3D32, roughness: 0.8, metalness: 0.1 }),
    mirror: new THREE.MeshStandardMaterial({ color: 0xDDDDDD, roughness: 0.0, metalness: 0.9 }),
    treadmillBelt: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }),
    treadmillFrame: new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.6 }),
    weightSilver: new THREE.MeshStandardMaterial({ color: 0xC0C0C0, roughness: 0.3, metalness: 0.8 }),
    weightBlack: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4, metalness: 0.5 }),
    gymMat: new THREE.MeshStandardMaterial({ color: 0x4A90A4, roughness: 0.9 }),
    towel: new THREE.MeshStandardMaterial({ color: 0xF5F5F5, roughness: 0.9 }),
    neonGreen: new THREE.MeshStandardMaterial({ color: 0x39FF14, emissive: 0x39FF14, emissiveIntensity: 0.3 })
};

// Initialize the application
function init() {
    console.log('Starting init...');
    
    if (typeof THREE === 'undefined') {
        throw new Error('Three.js not loaded');
    }

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 25, 100);

    // Camera setup
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 35);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 8;
    controls.maxDistance = 60;
    controls.target.set(0, 3, 0);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    // Main directional light (sun through windows) - natural light
    const sunLight = new THREE.DirectionalLight(0xFFF8DC, 1.2);
    sunLight.position.set(-10, 40, -30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.camera.left = -40;
    sunLight.shadow.camera.right = 40;
    sunLight.shadow.camera.top = 40;
    sunLight.shadow.camera.bottom = -40;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    // Secondary sun for fill
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.4);
    fillLight.position.set(30, 20, 20);
    scene.add(fillLight);

    // Office fluorescent lights
    createFluorescentLights();

    // Accent lights
    const greenAccent = new THREE.PointLight(0x90EE90, 0.4, 15);
    greenAccent.position.set(-12, 5, -8);
    scene.add(greenAccent);

    const pinkAccent = new THREE.PointLight(0xFF69B4, 0.3, 15);
    pinkAccent.position.set(12, 5, -8);
    scene.add(pinkAccent);
}

function createFluorescentLights() {
    const createCeilingLight = (x, z, color = 0xFFFFFF, intensity = 0.5) => {
        // Main light source
        const light = new THREE.PointLight(color, intensity, 25);
        light.position.set(x, 11.5, z);
        light.castShadow = true;
        light.shadow.bias = -0.0001;
        scene.add(light);
        
        // Light fixture visual - fluorescent tube
        const fixtureGroup = new THREE.Group();
        
        // Housing
        const housingGeo = new THREE.BoxGeometry(4, 0.3, 1);
        const housingMat = new THREE.MeshStandardMaterial({ color: 0xEEEEEE });
        const housing = new THREE.Mesh(housingGeo, housingMat);
        fixtureGroup.add(housing);
        
        // Light tube
        const tubeGeo = new THREE.BoxGeometry(3.8, 0.05, 0.8);
        const tubeMat = new THREE.MeshStandardMaterial({ 
            color: color, 
            emissive: color, 
            emissiveIntensity: 0.5 
        });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        tube.position.y = -0.1;
        fixtureGroup.add(tube);
        
        fixtureGroup.position.set(x, 11.8, z);
        scene.add(fixtureGroup);
    };

    // Grid of ceiling lights
    for (let x = -15; x <= 15; x += 10) {
        for (let z = -12; z <= 12; z += 10) {
            createCeilingLight(x, z);
        }
    }
}

// Create the comprehensive office environment
function createOfficeEnvironment() {
    // Carpet tiles floor
    createCarpetTiles();

    // Ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(60, 60);
    const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0xF0F0F0 });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 12;
    scene.add(ceiling);

    // Walls with multiple windows
    createWalls();
    
    // Floor-to-ceiling windows with blinds
    createFloorToCeilingWindows();

    // Glass office door
    createOfficeDoor();

    // Workstations in cubicles
    createWorkstations();

    // Conference room
    createConferenceRoom();

    // Lounge area
    createLoungeArea();

    // Coffee station
    createCoffeeStation();

    // Water cooler
    createWaterCooler();

    // Whiteboards
    createWhiteboards();

    // Kanban Board
    createKanbanBoard();

    // Standup Circle
    createStandupCircle();

    // Gym Area
    createGymArea();

    // Filing cabinets
    createFilingCabinets();

    // Wall clock
    createWallClock();

    // Plants and decorations
    createPlants();
    createDecorations();

    // Floating particles for atmosphere
    createParticles();
}

function createCarpetTiles() {
    const tileSize = 2;
    const rows = 24;
    const cols = 24;
    const startX = -(rows * tileSize) / 2;
    const startZ = -(cols * tileSize) / 2;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const tileGeo = new THREE.BoxGeometry(tileSize - 0.02, 0.05, tileSize - 0.02);
            // Checkerboard pattern with subtle variation
            const isAlternate = (i + j) % 2 === 0;
            const material = isAlternate ? MATERIALS.carpetTile1 : MATERIALS.carpetTile2;
            
            const tile = new THREE.Mesh(tileGeo, material);
            tile.position.set(startX + i * tileSize + tileSize/2, 0.025, startZ + j * tileSize + tileSize/2);
            tile.receiveShadow = true;
            tile.name = 'floor';
            scene.add(tile);
        }
    }
}

function createWalls() {
    const wallHeight = 12;
    const wallThickness = 0.5;
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xF5F5F5, roughness: 0.9 });
    
    // Back wall (solid)
    const backWallGeo = new THREE.BoxGeometry(60, wallHeight, wallThickness);
    const backWall = new THREE.Mesh(backWallGeo, wallMaterial);
    backWall.position.set(0, wallHeight/2, -30);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Left wall (partial - with windows)
    const leftWallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, 15);
    const leftWall1 = new THREE.Mesh(leftWallGeo, wallMaterial);
    leftWall1.position.set(-30, wallHeight/2, -22.5);
    leftWall1.receiveShadow = true;
    scene.add(leftWall1);

    const leftWall2 = new THREE.Mesh(leftWallGeo, wallMaterial);
    leftWall2.position.set(-30, wallHeight/2, 22.5);
    leftWall2.receiveShadow = true;
    scene.add(leftWall2);

    // Right wall (partial)
    const rightWall1 = new THREE.Mesh(leftWallGeo, wallMaterial);
    rightWall1.position.set(30, wallHeight/2, -22.5);
    rightWall1.receiveShadow = true;
    scene.add(rightWall1);

    const rightWall2 = new THREE.Mesh(leftWallGeo, wallMaterial);
    rightWall2.position.set(30, wallHeight/2, 22.5);
    rightWall2.receiveShadow = true;
    scene.add(rightWall2);

    // Front wall sections (around door and windows)
    const frontWallGeo = new THREE.BoxGeometry(20, wallHeight, wallThickness);
    const frontLeft = new THREE.Mesh(frontWallGeo, wallMaterial);
    frontLeft.position.set(-20, wallHeight/2, 30);
    frontLeft.receiveShadow = true;
    scene.add(frontLeft);

    const frontRight = new THREE.Mesh(frontWallGeo, wallMaterial);
    frontRight.position.set(20, wallHeight/2, 30);
    frontRight.receiveShadow = true;
    scene.add(frontRight);
}

function createFloorToCeilingWindows() {
    const windowWidth = 8;
    const windowHeight = 10;
    const windowY = 5;
    
    // Windows on front wall
    const frontWindowPositions = [
        { x: -10, z: 30 },
        { x: 10, z: 30 }
    ];

    // Windows on side walls
    const sideWindowPositions = [
        { x: -30, z: -10, rot: Math.PI / 2 },
        { x: -30, z: 10, rot: Math.PI / 2 },
        { x: 30, z: -10, rot: -Math.PI / 2 },
        { x: 30, z: 10, rot: -Math.PI / 2 }
    ];

    // Front windows
    frontWindowPositions.forEach(pos => {
        createWindowWithFrame(pos.x, windowY, pos.z, windowWidth, windowHeight, 0, false);
    });

    // Side windows
    sideWindowPositions.forEach(pos => {
        createWindowWithFrame(pos.x, windowY, pos.z, windowWidth, windowHeight, pos.rot, false);
    });

    // City view backdrop
    createCityView();
}

function createWindowWithFrame(x, y, z, width, height, rotation, hasBlind = true) {
    const frameThickness = 0.3;
    const frameDepth = 0.5;
    
    const frameGroup = new THREE.Group();
    
    // Window frame
    const frameGeo = new THREE.BoxGeometry(width + frameThickness, height + frameThickness, frameDepth);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x2C3E50, roughness: 0.3 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frameGroup.add(frame);

    // Glass
    const glassGeo = new THREE.PlaneGeometry(width - 0.2, height - 0.2);
    const glass = new THREE.Mesh(glassGeo, MATERIALS.glass);
    glass.position.z = frameDepth / 2 + 0.01;
    frameGroup.add(glass);

    // Window sill
    const sillGeo = new THREE.BoxGeometry(width + 1, 0.3, 1);
    const sillMat = new THREE.MeshStandardMaterial({ color: 0xEEEEEE });
    const sill = new THREE.Mesh(sillGeo, sillMat);
    sill.position.set(0, -(height + frameThickness) / 2 + 0.15, 0.3);
    sill.castShadow = true;
    frameGroup.add(sill);

    // Venetian blinds
    if (hasBlind) {
        const blindGroup = createVenetianBlinds(width - 0.5, height - 0.5, frameDepth / 2 + 0.1);
        blinds.push(blindGroup);
        frameGroup.add(blindGroup);
    }

    // Position
    frameGroup.position.set(x, y, z);
    frameGroup.rotation.y = rotation;
    
    scene.add(frameGroup);
}

function createVenetianBlinds(width, height, depth) {
    const group = new THREE.Group();
    const slatCount = 20;
    const slatHeight = height / slatCount;
    const slatGeo = new THREE.BoxGeometry(width, slatHeight * 0.15, 0.02);
    const slatMat = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF, 
        roughness: 0.5 
    });

    const slats = [];
    for (let i = 0; i < slatCount; i++) {
        const slat = new THREE.Mesh(slatGeo, slatMat);
        slat.position.y = (height / 2) - (i + 0.5) * slatHeight;
        slat.position.z = depth;
        group.add(slat);
        slats.push(slat);
    }

    // Control cords
    const cordGeo = new THREE.CylinderGeometry(0.005, 0.005, height);
    const cordMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const cord1 = new THREE.Mesh(cordGeo, cordMat);
    cord1.position.set(-width * 0.4, 0, depth + 0.05);
    group.add(cord1);
    
    const cord2 = new THREE.Mesh(cordGeo, cordMat);
    cord2.position.set(width * 0.4, 0, depth + 0.05);
    group.add(cord2);

    // Control wand
    const wandGeo = new THREE.CylinderGeometry(0.01, 0.01, height * 0.8);
    const wandMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const wand = new THREE.Mesh(wandGeo, wandMat);
    wand.position.set(width * 0.45, -height * 0.1, depth + 0.05);
    group.add(wand);

    group.userData = { slats: slats, open: true, angle: 0 };
    return group;
}

function createOfficeDoor() {
    const doorGroup = new THREE.Group();
    doorGroup.name = 'officeDoor';
    
    // Door frame
    const frameWidth = 4.5;
    const frameHeight = 10;
    const frameDepth = 0.4;
    
    const frameGeo = new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x2C3E50, roughness: 0.3 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    doorGroup.add(frame);

    // Glass door
    const doorGeo = new THREE.BoxGeometry(3.8, 9, 0.1);
    const door = new THREE.Mesh(doorGeo, MATERIALS.frostedGlass);
    door.position.y = -0.2;
    door.castShadow = true;
    doorGroup.add(door);

    // Door handle
    const handleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4);
    const handleMat = MATERIALS.chrome;
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(1.5, -0.2, 0.15);
    doorGroup.add(handle);

    // Door plate/name
    const plateGeo = new THREE.PlaneGeometry(1.5, 0.4);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.5 });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(0, 3.5, frameDepth / 2 + 0.01);
    doorGroup.add(plate);

    doorGroup.position.set(0, 5, 30);
    scene.add(doorGroup);
    officeItems.officeDoor = doorGroup;
}

function createCityView() {
    const cityGroup = new THREE.Group();
    
    for (let i = 0; i < 40; i++) {
        const height = 15 + Math.random() * 40;
        const width = 4 + Math.random() * 6;
        const depth = 4 + Math.random() * 6;
        
        const buildingGeo = new THREE.BoxGeometry(width, height, depth);
        const buildingMat = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color().setHSL(0.6, 0.1, 0.15 + Math.random() * 0.25)
        });
        const building = new THREE.Mesh(buildingGeo, buildingMat);
        
        const x = (Math.random() - 0.5) * 100;
        const z = 50 + Math.random() * 50;
        building.position.set(x, height/2, z);
        cityGroup.add(building);

        // Lit windows
        if (Math.random() > 0.4) {
            const windowGeo = new THREE.PlaneGeometry(width * 0.8, height * 0.8);
            const windowMat = new THREE.MeshBasicMaterial({ 
                color: 0xFFEE88, 
                transparent: true, 
                opacity: 0.25 
            });
            const windows = new THREE.Mesh(windowGeo, windowMat);
            windows.position.set(x, height/2, z - depth/2 - 0.1);
            cityGroup.add(windows);
        }
    }

    scene.add(cityGroup);
}

function createWorkstations() {
    // Create cubicle partitions
    createCubiclePartitions();
    
    // Create three workstations
    createGrootWorkstation();
    createFinWorkstation();
    createBettyWorkstation();
}

function createCubiclePartitions() {
    const partitionHeight = 5;
    const partitionThickness = 0.1;
    const partitionMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xD3D3D3, 
        roughness: 0.9 
    });

    // Groot's cubicle (left)
    const grootLeft = new THREE.Mesh(
        new THREE.BoxGeometry(partitionThickness, partitionHeight, 8),
        partitionMaterial
    );
    grootLeft.position.set(-14, partitionHeight/2, -6);
    grootLeft.castShadow = true;
    scene.add(grootLeft);

    const grootFront = new THREE.Mesh(
        new THREE.BoxGeometry(8, partitionHeight, partitionThickness),
        partitionMaterial
    );
    grootFront.position.set(-10, partitionHeight/2, -2);
    grootFront.castShadow = true;
    scene.add(grootFront);

    // Fin's cubicle (center)
    const finLeft = new THREE.Mesh(
        new THREE.BoxGeometry(partitionThickness, partitionHeight, 8),
        partitionMaterial
    );
    finLeft.position.set(-4, partitionHeight/2, -10);
    finLeft.castShadow = true;
    scene.add(finLeft);

    const finRight = new THREE.Mesh(
        new THREE.BoxGeometry(partitionThickness, partitionHeight, 8),
        partitionMaterial
    );
    finRight.position.set(4, partitionHeight/2, -10);
    finRight.castShadow = true;
    scene.add(finRight);

    // Betty's cubicle (right)
    const bettyRight = new THREE.Mesh(
        new THREE.BoxGeometry(partitionThickness, partitionHeight, 8),
        partitionMaterial
    );
    bettyRight.position.set(14, partitionHeight/2, -6);
    bettyRight.castShadow = true;
    scene.add(bettyRight);

    const bettyFront = new THREE.Mesh(
        new THREE.BoxGeometry(8, partitionHeight, partitionThickness),
        partitionMaterial
    );
    bettyFront.position.set(10, partitionHeight/2, -2);
    bettyFront.castShadow = true;
    scene.add(bettyFront);
}

function createLShapedDesk(group, width, depth, color) {
    const deskGroup = new THREE.Group();
    
    // Main desk surface
    const mainGeo = new THREE.BoxGeometry(width, 0.08, depth);
    const deskMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 });
    const mainDesk = new THREE.Mesh(mainGeo, deskMat);
    mainDesk.castShadow = true;
    mainDesk.receiveShadow = true;
    deskGroup.add(mainDesk);

    // Return desk (L-shape)
    const returnGeo = new THREE.BoxGeometry(depth * 0.8, 0.08, width * 0.4);
    const returnDesk = new THREE.Mesh(returnGeo, deskMat);
    returnDesk.position.set(-width * 0.3, 0, depth * 0.7);
    returnDesk.castShadow = true;
    returnDesk.receiveShadow = true;
    deskGroup.add(returnDesk);

    // Desk drawers
    const drawerGeo = new THREE.BoxGeometry(depth * 0.75, 1.2, width * 0.38);
    const drawerMat = new THREE.MeshStandardMaterial({ color: color * 0.9, roughness: 0.7 });
    const drawers = new THREE.Mesh(drawerGeo, drawerMat);
    drawers.position.set(-width * 0.3, -0.6, depth * 0.7);
    drawers.castShadow = true;
    deskGroup.add(drawers);

    // Drawer handles
    for (let i = 0; i < 3; i++) {
        const handleGeo = new THREE.BoxGeometry(0.02, 0.05, 0.3);
        const handleMat = MATERIALS.chrome;
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.position.set(-width * 0.3 + depth * 0.35, -0.3 - i * 0.35, depth * 0.7);
        deskGroup.add(handle);
    }

    // Desk legs/supports
    const legGeo = new THREE.BoxGeometry(0.15, 1.5, 0.15);
    const legMat = MATERIALS.metal;
    
    const positions = [
        [-width * 0.4, -0.75, -depth * 0.4],
        [width * 0.4, -0.75, -depth * 0.4],
        [width * 0.4, -0.75, depth * 0.4]
    ];
    
    positions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(...pos);
        leg.castShadow = true;
        deskGroup.add(leg);
    });

    deskGroup.position.y = 1.5;
    group.add(deskGroup);
    return deskGroup;
}

function createErgonomicChair() {
    const chairGroup = new THREE.Group();

    // Seat cushion
    const seatGeo = new THREE.BoxGeometry(1.2, 0.2, 1.2);
    const seatMat = MATERIALS.fabricGrey;
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.y = 1.1;
    seat.castShadow = true;
    chairGroup.add(seat);

    // Seat base
    const seatBaseGeo = new THREE.BoxGeometry(1.1, 0.1, 1.1);
    const seatBase = new THREE.Mesh(seatBaseGeo, MATERIALS.plastic);
    seatBase.position.y = 1.0;
    chairGroup.add(seatBase);

    // Backrest
    const backGeo = new THREE.BoxGeometry(1.2, 1.5, 0.15);
    const backMat = MATERIALS.fabricBlue;
    const back = new THREE.Mesh(backGeo, backMat);
    back.position.set(0, 1.8, -0.55);
    back.castShadow = true;
    chairGroup.add(back);

    // Lumbar support
    const lumbarGeo = new THREE.BoxGeometry(1.0, 0.4, 0.05);
    const lumbar = new THREE.Mesh(lumbarGeo, MATERIALS.fabricGrey);
    lumbar.position.set(0, 1.6, -0.48);
    chairGroup.add(lumbar);

    // Headrest
    const headGeo = new THREE.BoxGeometry(0.8, 0.3, 0.1);
    const head = new THREE.Mesh(headGeo, backMat);
    head.position.set(0, 2.7, -0.55);
    chairGroup.add(head);

    // Armrests (adjustable)
    const armSupportGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.6);
    const armPadGeo = new THREE.BoxGeometry(0.15, 0.05, 0.8);
    const armPadMat = MATERIALS.blackPlastic;
    
    // Left arm
    const leftSupport = new THREE.Mesh(armSupportGeo, MATERIALS.metal);
    leftSupport.position.set(-0.7, 1.4, 0);
    chairGroup.add(leftSupport);
    
    const leftPad = new THREE.Mesh(armPadGeo, armPadMat);
    leftPad.position.set(-0.7, 1.7, 0);
    chairGroup.add(leftPad);

    // Right arm
    const rightSupport = new THREE.Mesh(armSupportGeo, MATERIALS.metal);
    rightSupport.position.set(0.7, 1.4, 0);
    chairGroup.add(rightSupport);
    
    const rightPad = new THREE.Mesh(armPadGeo, armPadMat);
    rightPad.position.set(0.7, 1.7, 0);
    chairGroup.add(rightPad);

    // Gas lift (height adjustable)
    const gasLiftGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5);
    const gasLift = new THREE.Mesh(gasLiftGeo, MATERIALS.chrome);
    gasLift.position.y = 0.75;
    chairGroup.add(gasLift);

    // Base mechanism
    const baseMechGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1);
    const baseMech = new THREE.Mesh(baseMechGeo, MATERIALS.blackPlastic);
    baseMech.position.y = 0.5;
    chairGroup.add(baseMech);

    // Five-star base
    const starBaseGeo = new THREE.CylinderGeometry(0.05, 0.05, 3.5, 5);
    const starBase = new THREE.Mesh(starBaseGeo, MATERIALS.metal);
    starBase.rotation.x = Math.PI / 2;
    starBase.position.y = 0.25;
    chairGroup.add(starBase);

    // Casters (wheels)
    const wheelGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08);
    const wheelMat = MATERIALS.rubber;
    
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(Math.cos(angle) * 1.4, 0.06, Math.sin(angle) * 1.4);
        chairGroup.add(wheel);
        
        // Wheel mount
        const mountGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.2);
        const mount = new THREE.Mesh(mountGeo, MATERIALS.metal);
        mount.rotation.z = angle + Math.PI / 2;
        mount.position.set(Math.cos(angle) * 0.7, 0.18, Math.sin(angle) * 0.7);
        chairGroup.add(mount);
    }

    return chairGroup;
}

function createDeskItems(group, deskX, deskZ, agentType) {
    // Keyboard
    const kbGeo = new THREE.BoxGeometry(0.9, 0.03, 0.35);
    const kb = new THREE.Mesh(kbGeo, MATERIALS.blackPlastic);
    kb.position.set(deskX, 1.57, deskZ + 0.3);
    kb.castShadow = true;
    group.add(kb);

    // Mouse
    const mouseGeo = new THREE.SphereGeometry(0.06, 8, 8);
    mouseGeo.scale(1, 0.6, 1.4);
    const mouse = new THREE.Mesh(mouseGeo, MATERIALS.blackPlastic);
    mouse.position.set(deskX + 0.6, 1.55, deskZ + 0.3);
    mouse.castShadow = true;
    group.add(mouse);

    // Mouse pad
    const padGeo = new THREE.BoxGeometry(0.4, 0.01, 0.5);
    const pad = new THREE.Mesh(padGeo, MATERIALS.bluePlastic);
    pad.position.set(deskX + 0.6, 1.53, deskZ + 0.3);
    group.add(pad);

    // Notepad
    const noteGeo = new THREE.BoxGeometry(0.5, 0.02, 0.7);
    const note = new THREE.Mesh(noteGeo, MATERIALS.paper);
    note.position.set(deskX - 0.6, 1.57, deskZ + 0.4);
    note.castShadow = true;
    group.add(note);

    // Pen
    const penGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25);
    const penMat = MATERIALS.bluePlastic;
    const pen = new THREE.Mesh(penGeo, penMat);
    pen.rotation.z = Math.PI / 2;
    pen.rotation.y = 0.3;
    pen.position.set(deskX - 0.6, 1.58, deskZ + 0.4);
    group.add(pen);

    // Office phone
    const phoneBaseGeo = new THREE.BoxGeometry(0.25, 0.05, 0.35);
    const phone = new THREE.Mesh(phoneBaseGeo, MATERIALS.blackPlastic);
    phone.position.set(deskX + 0.8, 1.55, deskZ - 0.3);
    phone.castShadow = true;
    group.add(phone);

    const phoneHandsetGeo = new THREE.BoxGeometry(0.2, 0.08, 0.25);
    const handset = new THREE.Mesh(phoneHandsetGeo, MATERIALS.blackPlastic);
    handset.position.set(deskX + 0.8, 1.62, deskZ - 0.3);
    handset.castShadow = true;
    group.add(handset);

    // Sticky notes on monitor
    const stickyColors = [MATERIALS.yellowSticky, MATERIALS.pinkSticky, MATERIALS.greenSticky];
    const stickyPositions = [
        { x: deskX - 0.3, y: 2.2, z: deskZ - 0.5 },
        { x: deskX + 0.2, y: 2.3, z: deskZ - 0.5 }
    ];
    
    stickyPositions.forEach((pos, i) => {
        const stickyGeo = new THREE.BoxGeometry(0.12, 0.12, 0.01);
        const sticky = new THREE.Mesh(stickyGeo, stickyColors[i % stickyColors.length]);
        sticky.position.set(pos.x, pos.y, pos.z);
        sticky.rotation.x = -0.1;
        sticky.rotation.y = (Math.random() - 0.5) * 0.3;
        group.add(sticky);
    });

    // Coffee mug with steam
    const mugGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.18, 12);
    const mug = new THREE.Mesh(mugGeo, MATERIALS.ceramic);
    mug.position.set(deskX - 0.8, 1.6, deskZ + 0.5);
    mug.castShadow = true;
    group.add(mug);

    // Mug handle
    const handleGeo = new THREE.TorusGeometry(0.04, 0.015, 4, 8, Math.PI);
    const handle = new THREE.Mesh(handleGeo, MATERIALS.ceramic);
    handle.rotation.z = -Math.PI / 2;
    handle.position.set(deskX - 0.88, 1.6, deskZ + 0.5);
    group.add(handle);

    // Coffee liquid
    const coffeeGeo = new THREE.CircleGeometry(0.06, 12);
    const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x3D2314 });
    const coffee = new THREE.Mesh(coffeeGeo, coffeeMat);
    coffee.rotation.x = -Math.PI / 2;
    coffee.position.set(deskX - 0.8, 1.68, deskZ + 0.5);
    group.add(coffee);

    // Steam particles system
    createSteamEffect(group, deskX - 0.8, 1.75, deskZ + 0.5);
}

function createSteamEffect(group, x, y, z) {
    const steamCount = 3;
    for (let i = 0; i < steamCount; i++) {
        const steamGeo = new THREE.SphereGeometry(0.02 + i * 0.01, 6, 6);
        const steamMat = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF, 
            transparent: true, 
            opacity: 0.3 - i * 0.05 
        });
        const steam = new THREE.Mesh(steamGeo, steamMat);
        steam.position.set(x + (Math.random() - 0.5) * 0.05, y + i * 0.1, z + (Math.random() - 0.5) * 0.05);
        steam.userData = { 
            baseY: y + i * 0.1, 
            offset: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 0.5
        };
        group.add(steam);
        steamParticles.push(steam);
    }
}

function createGrootWorkstation() {
    const group = new THREE.Group();
    group.name = 'grootDesk';
    group.userData = { type: 'desk', agent: 'groot', clickable: true };

    // L-shaped desk
    createLShapedDesk(group, 3, 1.5, 0x8B5A2B);

    // Monitor
    const monitorGeo = new THREE.BoxGeometry(1.4, 0.9, 0.05);
    const monitor = new THREE.Mesh(monitorGeo, MATERIALS.screenOn);
    monitor.position.set(0, 2.3, -0.6);
    monitor.castShadow = true;
    group.add(monitor);

    // Monitor stand
    const standGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5);
    const stand = new THREE.Mesh(standGeo, MATERIALS.metal);
    stand.position.set(0, 1.95, -0.6);
    group.add(stand);

    const standBaseGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.05);
    const standBase = new THREE.Mesh(standBaseGeo, MATERIALS.metal);
    standBase.position.set(0, 1.7, -0.6);
    group.add(standBase);

    // Desk items
    createDeskItems(group, 0, 0, 'tree');

    // Plant on desk
    const potGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.25, 8);
    const pot = new THREE.Mesh(potGeo, MATERIALS.potClay);
    pot.position.set(-1.2, 1.65, 0.5);
    pot.castShadow = true;
    group.add(pot);

    const plantGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const plant = new THREE.Mesh(plantGeo, MATERIALS.plantGreen);
    plant.position.set(-1.2, 2, 0.5);
    group.add(plant);

    // Position the desk
    group.position.set(-10, 0, -8);
    group.rotation.y = Math.PI / 4;
    
    // Ergonomic chair
    const chair = createErgonomicChair();
    chair.position.set(0, 0, 1.5);
    chair.rotation.y = -Math.PI / 4;
    group.add(chair);
    
    scene.add(group);
    officeItems.grootDesk = group;
}

function createFinWorkstation() {
    const group = new THREE.Group();
    group.name = 'finDesk';
    group.userData = { type: 'desk', agent: 'fin', clickable: true };

    // Large L-shaped trading desk
    createLShapedDesk(group, 4, 2, 0x4A3728);

    // Multiple monitors (trading setup)
    const monitorGeo = new THREE.BoxGeometry(1.3, 0.8, 0.05);
    
    // Center monitor
    const centerMonitor = new THREE.Mesh(monitorGeo, MATERIALS.screenOn);
    centerMonitor.position.set(0, 2.4, -0.9);
    centerMonitor.castShadow = true;
    group.add(centerMonitor);

    // Left monitor
    const leftMonitor = new THREE.Mesh(monitorGeo, MATERIALS.screenOn);
    leftMonitor.position.set(-1.5, 2.4, -0.9);
    leftMonitor.rotation.y = 0.15;
    leftMonitor.castShadow = true;
    group.add(leftMonitor);

    // Right monitor
    const rightMonitor = new THREE.Mesh(monitorGeo, MATERIALS.screenOn);
    rightMonitor.position.set(1.5, 2.4, -0.9);
    rightMonitor.rotation.y = -0.15;
    rightMonitor.castShadow = true;
    group.add(rightMonitor);

    // Monitor stands
    [-1.5, 0, 1.5].forEach(x => {
        const standGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
        const stand = new THREE.Mesh(standGeo, MATERIALS.metal);
        stand.position.set(x, 2.05, -0.9);
        group.add(stand);
        
        const baseGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.05);
        const base = new THREE.Mesh(baseGeo, MATERIALS.metal);
        base.position.set(x, 1.8, -0.9);
        group.add(base);
    });

    // Desk items
    createDeskItems(group, 0, 0, 'human');

    // Trading books
    const bookStackGeo = new THREE.BoxGeometry(0.5, 0.08, 0.7);
    const bookColors = [0x8B0000, 0x000080, 0x006400];
    bookColors.forEach((color, i) => {
        const bookMat = new THREE.MeshStandardMaterial({ color: color });
        const book = new THREE.Mesh(bookStackGeo, bookMat);
        book.position.set(1.8, 1.56 + i * 0.08, 0.5);
        book.rotation.y = 0.2;
        book.castShadow = true;
        group.add(book);
    });

    // Position the desk
    group.position.set(0, 0, -12);
    
    // Ergonomic chair
    const chair = createErgonomicChair();
    chair.position.set(0, 0, 1.5);
    group.add(chair);
    
    scene.add(group);
    officeItems.finDesk = group;
}

function createBettyWorkstation() {
    const group = new THREE.Group();
    group.name = 'bettyDesk';
    group.userData = { type: 'desk', agent: 'betty', clickable: true };

    // White L-shaped desk (creative style)
    createLShapedDesk(group, 3, 1.5, 0xFFFFFF);

    // Large creative monitor
    const monitorGeo = new THREE.BoxGeometry(1.6, 1.0, 0.05);
    const monitor = new THREE.Mesh(monitorGeo, MATERIALS.screenOn);
    monitor.position.set(0, 2.4, -0.6);
    monitor.castShadow = true;
    group.add(monitor);

    // Monitor stand
    const standGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.6);
    const stand = new THREE.Mesh(standGeo, MATERIALS.chrome);
    stand.position.set(0, 2.05, -0.6);
    group.add(stand);

    const standBaseGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.05);
    const standBase = new THREE.Mesh(standBaseGeo, MATERIALS.chrome);
    standBase.position.set(0, 1.75, -0.6);
    group.add(standBase);

    // Desk items
    createDeskItems(group, 0, 0, 'voxel');

    // Drawing tablet
    const tabletGeo = new THREE.BoxGeometry(0.9, 0.02, 0.7);
    const tabletMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const tablet = new THREE.Mesh(tabletGeo, tabletMat);
    tablet.position.set(-0.8, 1.53, 0.3);
    group.add(tablet);

    // Stylus
    const stylusGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.18);
    const stylusMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const stylus = new THREE.Mesh(stylusGeo, stylusMat);
    stylus.rotation.z = Math.PI / 2;
    stylus.rotation.y = 0.4;
    stylus.position.set(-0.8, 1.56, 0.3);
    group.add(stylus);

    // Color swatches
    const swatchColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF];
    swatchColors.forEach((color, i) => {
        const swatchGeo = new THREE.BoxGeometry(0.15, 0.02, 0.15);
        const swatchMat = new THREE.MeshStandardMaterial({ color: color });
        const swatch = new THREE.Mesh(swatchGeo, swatchMat);
        swatch.position.set(1, 1.54 + i * 0.015, 0.4 - i * 0.08);
        group.add(swatch);
    });

    // Position the desk
    group.position.set(10, 0, -8);
    group.rotation.y = -Math.PI / 4;
    
    // Ergonomic chair
    const chair = createErgonomicChair();
    chair.position.set(0, 0, 1.5);
    chair.rotation.y = Math.PI / 4;
    group.add(chair);
    
    scene.add(group);
    officeItems.bettyDesk = group;
}

function createConferenceChair() {
    const chairGroup = new THREE.Group();

    // Seat cushion (lower for sitting)
    const seatGeo = new THREE.BoxGeometry(1.2, 0.15, 1.2);
    const seatMat = MATERIALS.fabricGrey;
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.y = 0.85;
    seat.castShadow = true;
    chairGroup.add(seat);

    // Seat base
    const seatBaseGeo = new THREE.BoxGeometry(1.1, 0.1, 1.1);
    const seatBase = new THREE.Mesh(seatBaseGeo, MATERIALS.plastic);
    seatBase.position.y = 0.8;
    chairGroup.add(seatBase);

    // Backrest
    const backGeo = new THREE.BoxGeometry(1.2, 1.2, 0.15);
    const backMat = MATERIALS.fabricBlue;
    const back = new THREE.Mesh(backGeo, backMat);
    back.position.set(0, 1.5, -0.55);
    back.castShadow = true;
    chairGroup.add(back);

    // Chair legs (fixed conference chair style)
    const legGeo = new THREE.BoxGeometry(0.08, 0.8, 0.08);
    const legMat = MATERIALS.metal;
    
    const positions = [
        [-0.5, 0.4, -0.5],
        [0.5, 0.4, -0.5],
        [-0.5, 0.4, 0.5],
        [0.5, 0.4, 0.5]
    ];
    
    positions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(...pos);
        leg.castShadow = true;
        chairGroup.add(leg);
    });

    return chairGroup;
}

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
    const legGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.2);
    const legPositions = [[-4, 0.6, -1.5], [4, 0.6, -1.5], [-4, 0.6, 1.5], [4, 0.6, 1.5]];
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, MATERIALS.metal);
        leg.position.set(...pos);
        leg.castShadow = true;
        group.add(leg);
    });

    // Conference chairs - arranged OPPOSITE each other with Groot at head
    // Chair positions for sitting agents:
    // Groot at head (x:0, z:-2.5, facing table/center)
    // Fin at one side (x:-3, z:0, facing right/across)
    // Betty opposite Fin (x:3, z:0, facing left/across)
    const agentChairPositions = [
        { x: 0, z: -2.5, rot: 0, agent: 'groot' },      // Groot at head, facing center
        { x: -3, z: 0, rot: Math.PI / 2, agent: 'fin' },  // Fin on left side
        { x: 3, z: 0, rot: -Math.PI / 2, agent: 'betty' }  // Betty on right side, opposite Fin
    ];

    // Store chair positions for agent sitting
    group.userData.agentChairs = {};

    agentChairPositions.forEach(pos => {
        const chair = createConferenceChair();
        chair.position.set(pos.x, 0, pos.z);
        chair.rotation.y = pos.rot;
        chair.name = `chair_${pos.agent}`;
        group.add(chair);
        group.userData.agentChairs[pos.agent] = { x: pos.x, z: pos.z, rot: pos.rot };
    });

    // Additional chairs for other attendees
    const extraChairPositions = [
        { x: -6, z: 0, rot: Math.PI / 2 },
        { x: 6, z: 0, rot: -Math.PI / 2 },
        { x: 0, z: 3, rot: Math.PI }
    ];

    extraChairPositions.forEach((pos, i) => {
        const chair = createConferenceChair();
        chair.position.set(pos.x, 0, pos.z);
        chair.rotation.y = pos.rot;
        group.add(chair);
    });

    // Conference phone
    const phoneBaseGeo = new THREE.BoxGeometry(0.4, 0.08, 0.5);
    const phone = new THREE.Mesh(phoneBaseGeo, MATERIALS.blackPlastic);
    phone.position.set(0, 1.32, 0);
    group.add(phone);

    // Notepads and pens
    const padPositions = [[-3, 0], [3, 0], [0, -1.5]];
    padPositions.forEach(pos => {
        const padGeo = new THREE.BoxGeometry(0.5, 0.02, 0.7);
        const pad = new THREE.Mesh(padGeo, MATERIALS.paper);
        pad.position.set(pos[0], 1.29, pos[1]);
        group.add(pad);
        
        const penGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.28);
        const penMat = MATERIALS.bluePlastic;
        const pen = new THREE.Mesh(penGeo, penMat);
        pen.rotation.z = Math.PI / 2;
        pen.rotation.y = Math.random() * 0.5;
        pen.position.set(pos[0] + 0.1, 1.3, pos[1]);
        group.add(pen);
    });

    // Wall-mounted whiteboard
    const boardGeo = new THREE.BoxGeometry(10, 3, 0.1);
    const board = new THREE.Mesh(boardGeo, MATERIALS.whiteboard);
    board.position.set(0, 6, -29.4);
    board.receiveShadow = true;
    scene.add(board);

    // Board frame
    const frameGeo = new THREE.BoxGeometry(10.2, 3.2, 0.15);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 6, -29.42);
    scene.add(frame);

    // Board tray
    const trayGeo = new THREE.BoxGeometry(10.2, 0.1, 0.3);
    const tray = new THREE.Mesh(trayGeo, frameMat);
    tray.position.set(0, 4.3, -29.35);
    scene.add(tray);

    // Markers on tray
    const markerColors = [0x000000, 0x0000FF, 0xFF0000, 0x008000];
    markerColors.forEach((color, i) => {
        const markerGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25);
        const markerMat = new THREE.MeshStandardMaterial({ color: color });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.rotation.z = Math.PI / 2;
        marker.position.set(-4 + i * 0.3, 4.4, -29.3);
        scene.add(marker);
    });

    group.position.set(0, 0, 8);
    scene.add(group);
    officeItems.conferenceRoom = group;
}

function createLoungeArea() {
    const group = new THREE.Group();
    group.name = 'lounge';
    group.userData = { type: 'lounge', clickable: true };

    // Large L-shaped couch
    // Main section
    const couchMainGeo = new THREE.BoxGeometry(5, 0.6, 1.4);
    const couchMat = new THREE.MeshStandardMaterial({ color: 0x2C3E50, roughness: 0.9 });
    const couchMain = new THREE.Mesh(couchMainGeo, couchMat);
    couchMain.position.set(0, 0.3, 0);
    couchMain.castShadow = true;
    couchMain.receiveShadow = true;
    group.add(couchMain);

    // Couch return
    const couchReturnGeo = new THREE.BoxGeometry(1.4, 0.6, 3);
    const couchReturn = new THREE.Mesh(couchReturnGeo, couchMat);
    couchReturn.position.set(-2.2, 0.3, 1.8);
    couchReturn.castShadow = true;
    couchReturn.receiveShadow = true;
    group.add(couchReturn);

    // Backrests
    const backGeo = new THREE.BoxGeometry(5, 1, 0.2);
    const backMat = new THREE.MeshStandardMaterial({ color: 0x34495E, roughness: 0.9 });
    
    const back1 = new THREE.Mesh(backGeo, backMat);
    back1.position.set(0, 0.8, -0.6);
    back1.castShadow = true;
    group.add(back1);

    const back2Geo = new THREE.BoxGeometry(0.2, 1, 3);
    const back2 = new THREE.Mesh(back2Geo, backMat);
    back2.position.set(-2.8, 0.8, 1.8);
    back2.castShadow = true;
    group.add(back2);

    // Cushions
    const cushionGeo = new THREE.BoxGeometry(0.8, 0.15, 0.8);
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0x3D566E, roughness: 0.9 });
    for (let i = -1.5; i <= 1.5; i += 1) {
        const cushion = new THREE.Mesh(cushionGeo, cushionMat);
        cushion.position.set(i, 0.7, 0);
        group.add(cushion);
    }

    // Coffee table
    const tableGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.4, 32);
    const table = new THREE.Mesh(tableGeo, MATERIALS.glass);
    table.position.set(0, 0.2, 3);
    table.castShadow = true;
    group.add(table);

    // Table legs
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4);
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const leg = new THREE.Mesh(legGeo, MATERIALS.chrome);
        leg.position.set(Math.cos(angle) * 0.8, 0.2, 3 + Math.sin(angle) * 0.8);
        group.add(leg);
    }

    // Magazines on table
    const magGeo = new THREE.BoxGeometry(0.5, 0.03, 0.7);
    const magColors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D];
    magColors.forEach((color, i) => {
        const magMat = new THREE.MeshStandardMaterial({ color: color });
        const mag = new THREE.Mesh(magGeo, magMat);
        mag.position.set(0.1 + i * 0.05, 0.43 + i * 0.03, 3 + i * 0.1);
        mag.rotation.y = 0.2 + i * 0.1;
        group.add(mag);
    });

    // Floor lamp
    const lampBaseGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.1);
    const lampBase = new THREE.Mesh(lampBaseGeo, MATERIALS.metal);
    lampBase.position.set(3, 0.05, 3);
    group.add(lampBase);

    const lampPoleGeo = new THREE.CylinderGeometry(0.05, 0.05, 4);
    const lampPole = new THREE.Mesh(lampPoleGeo, MATERIALS.metal);
    lampPole.position.set(3, 2, 3);
    group.add(lampPole);

    const lampShadeGeo = new THREE.ConeGeometry(0.8, 1.2, 32, 1, true);
    const lampShadeMat = new THREE.MeshStandardMaterial({ 
        color: 0xFFFAF0, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
    });
    const lampShade = new THREE.Mesh(lampShadeGeo, lampShadeMat);
    lampShade.position.set(3, 4, 3);
    group.add(lampShade);

    // Lamp light
    const lampLight = new THREE.PointLight(0xFFFAF0, 0.5, 10);
    lampLight.position.set(3, 3.5, 3);
    group.add(lampLight);

    group.position.set(-14, 0, 10);
    group.rotation.y = Math.PI / 2;
    scene.add(group);
    officeItems.lounge = group;
}

function createCoffeeStation() {
    const group = new THREE.Group();
    group.name = 'coffeeStation';
    group.userData = { type: 'coffee', clickable: true };

    // Counter
    const counterGeo = new THREE.BoxGeometry(4, 1.2, 1.2);
    const counter = new THREE.Mesh(counterGeo, MATERIALS.wood);
    counter.position.y = 0.6;
    counter.castShadow = true;
    counter.receiveShadow = true;
    group.add(counter);

    // Countertop
    const topGeo = new THREE.BoxGeometry(4.2, 0.08, 1.4);
    const top = new THREE.Mesh(topGeo, MATERIALS.whitePlastic);
    top.position.y = 1.24;
    top.castShadow = true;
    group.add(top);

    // Espresso machine
    const machineGeo = new THREE.BoxGeometry(1, 0.7, 0.7);
    const machineMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.3, roughness: 0.4 });
    const machine = new THREE.Mesh(machineGeo, machineMat);
    machine.position.set(-1, 1.6, 0);
    machine.castShadow = true;
    group.add(machine);

    // Machine group head
    const groupHeadGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.2);
    const groupHead = new THREE.Mesh(groupHeadGeo, MATERIALS.chrome);
    groupHead.position.set(-1, 1.4, 0.25);
    group.add(groupHead);

    // Portafilter
    const portafilterGeo = new THREE.CylinderGeometry(0.06, 0.04, 0.3);
    const portafilter = new THREE.Mesh(portafilterGeo, MATERIALS.blackPlastic);
    portafilter.rotation.x = Math.PI / 2;
    portafilter.position.set(-1, 1.3, 0.35);
    group.add(portafilter);

    // Machine display
    const displayGeo = new THREE.PlaneGeometry(0.6, 0.25);
    const displayMat = new THREE.MeshStandardMaterial({ color: 0x00FF00, emissive: 0x00FF00, emissiveIntensity: 0.3 });
    const display = new THREE.Mesh(displayGeo, displayMat);
    display.position.set(-1, 1.7, 0.36);
    group.add(display);

    // Grinder
    const grinderGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.8);
    const grinderMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.2 });
    const grinder = new THREE.Mesh(grinderGeo, grinderMat);
    grinder.position.set(1, 1.6, 0);
    group.add(grinder);

    const grinderHopperGeo = new THREE.ConeGeometry(0.3, 0.4, 32, 1, true);
    const hopperMat = new THREE.MeshStandardMaterial({ color: 0x111111, transparent: true, opacity: 0.8 });
    const hopper = new THREE.Mesh(grinderHopperGeo, hopperMat);
    hopper.position.set(1, 2.1, 0);
    group.add(hopper);

    // Coffee beans (visible in hopper)
    const beansGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.1);
    const beansMat = new THREE.MeshStandardMaterial({ color: 0x3D2314 });
    const beans = new THREE.Mesh(beansGeo, beansMat);
    beans.position.set(1, 2.05, 0);
    group.add(beans);

    // Mug tree
    const treeGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5);
    const tree = new THREE.Mesh(treeGeo, MATERIALS.chrome);
    tree.position.set(0, 1.55, 0.3);
    group.add(tree);

    // Mugs on tree
    const mugGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.14, 12);
    const mugColors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xFF69B4, 0x90EE90];
    mugColors.forEach((color, i) => {
        const mugMat = new THREE.MeshStandardMaterial({ color: color });
        const mug = new THREE.Mesh(mugGeo, mugMat);
        const angle = (i / 6) * Math.PI * 2;
        const radius = 0.12;
        mug.position.set(
            Math.cos(angle) * radius,
            1.35 + (i % 2) * 0.15,
            0.3 + Math.sin(angle) * radius
        );
        mug.castShadow = true;
        group.add(mug);
    });

    // Pastry box
    const boxGeo = new THREE.BoxGeometry(0.6, 0.12, 0.5);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xD2691E });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 1.34, -0.3);
    box.castShadow = true;
    group.add(box);

    // Box lid
    const lidGeo = new THREE.BoxGeometry(0.62, 0.02, 0.52);
    const lid = new THREE.Mesh(lidGeo, MATERIALS.whitePlastic);
    lid.position.set(0, 1.42, -0.3);
    lid.rotation.x = 0.1;
    group.add(lid);

    // Napkin holder
    const holderGeo = new THREE.BoxGeometry(0.3, 0.15, 0.1);
    const holder = new THREE.Mesh(holderGeo, MATERIALS.chrome);
    holder.position.set(-1.5, 1.35, 0.4);
    group.add(holder);

    // Napkins
    const napkinGeo = new THREE.BoxGeometry(0.25, 0.02, 0.08);
    const napkin = new THREE.Mesh(napkinGeo, MATERIALS.paper);
    napkin.position.set(-1.5, 1.38, 0.4);
    group.add(napkin);

    // Position at EDGE of room (left side, near wall)
    group.position.set(-28, 0, 0);
    group.rotation.y = Math.PI / 2;
    scene.add(group);
    officeItems.coffeeStation = group;
}

function createWaterCooler() {
    const group = new THREE.Group();
    group.name = 'waterCooler';
    group.userData = { type: 'water', clickable: true };

    // Base cabinet
    const baseGeo = new THREE.BoxGeometry(1.2, 2.5, 1.2);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.3 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 1.25;
    base.castShadow = true;
    group.add(base);

    // Base trim
    const trimGeo = new THREE.BoxGeometry(1.22, 0.1, 1.22);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.y = 0.05;
    group.add(trim);

    // Drip tray area
    const dripGeo = new THREE.BoxGeometry(0.8, 0.05, 0.4);
    const dripMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC });
    const drip = new THREE.Mesh(dripGeo, dripMat);
    drip.position.set(0, 1.8, 0.62);
    group.add(drip);

    // Dispensing area indent
    const indentGeo = new THREE.BoxGeometry(0.7, 0.8, 0.1);
    const indent = new THREE.Mesh(indentGeo, new THREE.MeshStandardMaterial({ color: 0x111111 }));
    indent.position.set(0, 1.9, 0.56);
    group.add(indent);

    // Taps
    const tapGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.15);
    const tapMat = MATERIALS.plastic;
    
    const hotTap = new THREE.Mesh(tapGeo, new THREE.MeshStandardMaterial({ color: 0xFF0000 }));
    hotTap.position.set(-0.15, 2.1, 0.6);
    group.add(hotTap);

    const coldTap = new THREE.Mesh(tapGeo, new THREE.MeshStandardMaterial({ color: 0x0000FF }));
    coldTap.position.set(0.15, 2.1, 0.6);
    group.add(coldTap);

    // Tap labels
    const labelGeo = new THREE.CircleGeometry(0.04, 16);
    const hotLabel = new THREE.Mesh(labelGeo, new THREE.MeshStandardMaterial({ color: 0xFF0000 }));
    hotLabel.position.set(-0.15, 1.95, 0.61);
    group.add(hotLabel);

    const coldLabel = new THREE.Mesh(labelGeo, new THREE.MeshStandardMaterial({ color: 0x0000FF }));
    coldLabel.position.set(0.15, 1.95, 0.61);
    group.add(coldLabel);

    // Water bottle
    const bottleGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.8, 16);
    const bottleMat = new THREE.MeshStandardMaterial({ 
        color: 0x87CEEB, 
        transparent: true, 
        opacity: 0.3,
        roughness: 0.1
    });
    const bottle = new THREE.Mesh(bottleGeo, bottleMat);
    bottle.position.y = 3.4;
    bottle.castShadow = true;
    group.add(bottle);

    // Water level
    const waterGeo = new THREE.CylinderGeometry(0.33, 0.33, 1.4, 16);
    const waterMat = new THREE.MeshStandardMaterial({ 
        color: 0xADD8E6, 
        transparent: true, 
        opacity: 0.6 
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 3.2;
    group.add(water);

    // Bottle neck
    const neckGeo = new THREE.CylinderGeometry(0.15, 0.35, 0.3);
    const neck = new THREE.Mesh(neckGeo, bottleMat);
    neck.position.y = 4.35;
    group.add(neck);

    // Cap
    const capGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.08);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 4.54;
    group.add(cap);

    // Small cup nearby
    const cupGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.1, 8);
    const cup = new THREE.Mesh(cupGeo, MATERIALS.ceramic);
    cup.position.set(0.8, 0.05, 0.3);
    group.add(cup);

    group.position.set(8, 0, 12);
    scene.add(group);
    officeItems.waterCooler = group;
}

function createWhiteboards() {
    // Wall-mounted whiteboard (already in conference room)
    
    // Mobile whiteboard on wheels
    const mobileGroup = new THREE.Group();
    mobileGroup.name = 'mobileWhiteboard';

    // Board
    const boardGeo = new THREE.BoxGeometry(3, 2, 0.08);
    const board = new THREE.Mesh(boardGeo, MATERIALS.whiteboard);
    board.position.y = 3;
    board.castShadow = true;
    mobileGroup.add(board);

    // Board frame
    const frameGeo = new THREE.BoxGeometry(3.1, 2.1, 0.1);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 3;
    mobileGroup.add(frame);

    // Marker tray
    const trayGeo = new THREE.BoxGeometry(3, 0.08, 0.2);
    const tray = new THREE.Mesh(trayGeo, frameMat);
    tray.position.set(0, 1.95, 0.1);
    mobileGroup.add(tray);

    // Stand legs
    const legGeo = new THREE.BoxGeometry(0.1, 3, 0.1);
    const legMat = MATERIALS.metal;
    
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-1.2, 1.5, -0.2);
    mobileGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(1.2, 1.5, -0.2);
    mobileGroup.add(rightLeg);

    // Crossbar
    const crossGeo = new THREE.BoxGeometry(2.5, 0.08, 0.08);
    const cross = new THREE.Mesh(crossGeo, legMat);
    cross.position.set(0, 0.5, -0.2);
    mobileGroup.add(cross);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.05);
    const wheelMat = MATERIALS.rubber;
    
    [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(pos[0], 0.06, pos[1]);
        mobileGroup.add(wheel);
    });

    // Markers on tray
    const markerColors = [0x000000, 0x0000FF, 0xFF0000];
    markerColors.forEach((color, i) => {
        const markerGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.2);
        const markerMat = new THREE.MeshStandardMaterial({ color: color });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.rotation.z = Math.PI / 2;
        marker.position.set(-1 + i * 0.15, 2.02, 0.15);
        mobileGroup.add(marker);
    });

    // Eraser
    const eraserGeo = new THREE.BoxGeometry(0.15, 0.05, 0.08);
    const eraser = new THREE.Mesh(eraserGeo, new THREE.MeshStandardMaterial({ color: 0xFFFFFF }));
    eraser.position.set(1, 2.02, 0.15);
    mobileGroup.add(eraser);

    mobileGroup.position.set(-8, 0, 12);
    mobileGroup.rotation.y = 0.3;
    scene.add(mobileGroup);
}

function createKanbanBoard() {
    console.log('>>> CREATEKANBANBOARD() CALLED - STARTING CREATION <<<');
    
    const group = new THREE.Group();
    group.name = 'kanbanBoard';
    group.userData = { type: 'kanban', clickable: true };

    // Board dimensions - MAKE IT LARGER
    const boardWidth = 10;  // Was 8
    const boardHeight = 6;  // Was 4.5
    
    // Main whiteboard surface - positioned as freestanding
    const boardGeo = new THREE.BoxGeometry(boardWidth, boardHeight, 0.15);
    const board = new THREE.Mesh(boardGeo, MATERIALS.kanbanBoard);
    board.position.y = 5.5;
    board.castShadow = true;
    board.receiveShadow = true;
    group.add(board);

    // Board frame - BRIGHT RED so it's VISIBLE
    const frameThickness = 0.5;  // Thicker
    const frameDepth = 0.5;
    const frameGeo = new THREE.BoxGeometry(boardWidth + frameThickness * 2, boardHeight + frameThickness * 2, frameDepth);
    // BRIGHT RED FRAME - impossible to miss
    const frameMat = new THREE.MeshStandardMaterial({ 
        color: 0xFF0000,  // BRIGHT RED
        roughness: 0.3,
        metalness: 0.2,
        emissive: 0xFF0000,
        emissiveIntensity: 0.3
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 5.5;
    frame.castShadow = true;
    group.add(frame);
    
    console.log('Kanban board frame created with RED color');

    // Section dividers (dark gray lines) - adjusted for new size
    const dividerGeo = new THREE.BoxGeometry(0.08, boardHeight - 0.8, 0.02);
    const dividerMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
    
    // Left divider
    const leftDivider = new THREE.Mesh(dividerGeo, dividerMat);
    leftDivider.position.set(-boardWidth/3, 5.4, 0.08);
    group.add(leftDivider);

    // Right divider
    const rightDivider = new THREE.Mesh(dividerGeo, dividerMat);
    rightDivider.position.set(boardWidth/3, 5.4, 0.08);
    group.add(rightDivider);

    // Horizontal header line
    const headerLineGeo = new THREE.BoxGeometry(boardWidth - 0.2, 0.05, 0.02);
    const headerLine = new THREE.Mesh(headerLineGeo, dividerMat);
    headerLine.position.set(0, 7.8, 0.08);
    group.add(headerLine);
    
    // VISIBLE LABEL ABOVE BOARD
    const labelCanvas = document.createElement('canvas');
    const labelCtx = labelCanvas.getContext('2d');
    labelCanvas.width = 512;
    labelCanvas.height = 128;
    labelCtx.fillStyle = '#FF0000';
    labelCtx.fillRect(0, 0, 512, 128);
    labelCtx.fillStyle = '#FFFFFF';
    labelCtx.font = 'bold 64px Arial';
    labelCtx.textAlign = 'center';
    labelCtx.textBaseline = 'middle';
    labelCtx.fillText('KANBAN BOARD', 256, 64);
    
    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    const labelMat = new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true });
    const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), labelMat);
    labelMesh.position.set(0, 10, 0);
    group.add(labelMesh);
    
    console.log('Kanban dividers and label added');

    // Section headers with proper text
    const headerLabels = ['TO DO', 'IN PROGRESS', 'DONE'];
    const headerPositions = [-boardWidth/3, 0, boardWidth/3];
    
    headerLabels.forEach((label, i) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        // Clear background
        context.fillStyle = 'rgba(240, 240, 240, 0.9)';
        context.fillRect(0, 0, 512, 128);
        
        // Draw border
        context.strokeStyle = '#999999';
        context.lineWidth = 4;
        context.strokeRect(2, 2, 508, 124);
        
        context.font = 'bold 48px Arial, sans-serif';
        context.fillStyle = '#333333';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(label, 256, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true
        });
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.55), material);
        plane.position.set(headerPositions[i], 8.3, 0.09);
        group.add(plane);
    });
    
    console.log('Kanban headers added');

    // Task cards with text labels - adjusted for larger board
    const taskCards = [
        // TO DO column (red/pink sticky notes)
        { col: -3.3, row: 0, color: MATERIALS.kanbanTodo, text: 'Bug Fix' },
        { col: -3.3, row: 1, color: MATERIALS.kanbanTodo, text: 'Review' },
        { col: -3.3, row: 2, color: MATERIALS.kanbanTodo, text: 'Test' },
        { col: -3.3, row: 3, color: MATERIALS.kanbanTodo, text: 'Deploy' },
        
        // IN PROGRESS column (yellow sticky notes)
        { col: 0, row: 0, color: MATERIALS.kanbanProgress, text: 'Feature' },
        { col: 0, row: 1, color: MATERIALS.kanbanProgress, text: 'Code' },
        { col: 0, row: 2, color: MATERIALS.kanbanProgress, text: 'Design' },
        
        // DONE column (green sticky notes)
        { col: 3.3, row: 0, color: MATERIALS.kanbanDone, text: 'Done!' },
        { col: 3.3, row: 1, color: MATERIALS.kanbanDone, text: 'Ship' },
        { col: 3.3, row: 2, color: MATERIALS.kanbanDone, text: 'Merge' },
        { col: 3.3, row: 3, color: MATERIALS.kanbanDone, text: 'Fix' },
        { col: 3.3, row: 4, color: MATERIALS.kanbanDone, text: 'Test' }
    ];

    taskCards.forEach((card, i) => {
        const cardGroup = new THREE.Group();
        
        // Sticky note base
        const stickyGeo = new THREE.BoxGeometry(1.0, 0.9, 0.03);
        const sticky = new THREE.Mesh(stickyGeo, card.color);
        sticky.castShadow = true;
        cardGroup.add(sticky);
        
        // Text on sticky note
        const textCanvas = document.createElement('canvas');
        const textCtx = textCanvas.getContext('2d');
        textCanvas.width = 256;
        textCanvas.height = 128;
        
        textCtx.fillStyle = 'transparent';
        textCtx.fillRect(0, 0, 256, 128);
        
        textCtx.font = 'bold 32px Arial, sans-serif';
        // Choose text color based on background
        const textColor = (card.text === 'Bug Fix' || card.text === 'Review') ? '#FFFFFF' : '#333333';
        textCtx.fillStyle = textColor;
        textCtx.textAlign = 'center';
        textCtx.textBaseline = 'middle';
        textCtx.fillText(card.text, 128, 64);
        
        const textTexture = new THREE.CanvasTexture(textCanvas);
        const textMat = new THREE.MeshBasicMaterial({ 
            map: textTexture, 
            transparent: true 
        });
        const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), textMat);
        textPlane.position.set(0, 0, 0.02);
        cardGroup.add(textPlane);
        
        // Position within column - adjusted for taller board
        const yPos = 7.0 - (card.row * 1.1);
        cardGroup.position.set(card.col, yPos, 0.09);
        
        // Slight random rotation for natural look
        cardGroup.rotation.z = (Math.random() - 0.5) * 0.15;
        
        group.add(cardGroup);
    });

    // Stand legs (freestanding A-frame style) - ADJUSTED for wider board
    const legThickness = 0.25;
    const legHeight = 5;
    const legSpread = 1.0;
    const legX = boardWidth / 2 + 0.5;  // Position legs outside the board width
    
    const legMat = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        roughness: 0.4,
        metalness: 0.6
    });
    
    // Left side legs (A-frame)
    const leftLeg1Geo = new THREE.BoxGeometry(legThickness, legHeight, legThickness);
    const leftLeg1 = new THREE.Mesh(leftLeg1Geo, legMat);
    leftLeg1.position.set(-legX, 2.5, legSpread);
    leftLeg1.rotation.x = -0.15;
    group.add(leftLeg1);
    
    const leftLeg2 = new THREE.Mesh(leftLeg1Geo, legMat);
    leftLeg2.position.set(-legX, 2.5, -legSpread);
    leftLeg2.rotation.x = 0.15;
    group.add(leftLeg2);
    
    // Right side legs (A-frame)
    const rightLeg1 = new THREE.Mesh(leftLeg1Geo, legMat);
    rightLeg1.position.set(legX, 2.5, legSpread);
    rightLeg1.rotation.x = -0.15;
    group.add(rightLeg1);
    
    const rightLeg2 = new THREE.Mesh(leftLeg1Geo, legMat);
    rightLeg2.position.set(legX, 2.5, -legSpread);
    rightLeg2.rotation.x = 0.15;
    group.add(rightLeg2);

    // Crossbar support - adjusted width
    const crossbarGeo = new THREE.BoxGeometry(boardWidth + 1, 0.15, 0.15);
    const crossbar = new THREE.Mesh(crossbarGeo, legMat);
    crossbar.position.set(0, 1.5, 0);
    group.add(crossbar);

    // Support feet (wider base for stability)
    const footGeo = new THREE.BoxGeometry(1.5, 0.15, 2.5);
    const footMat = new THREE.MeshStandardMaterial({ 
        color: 0x222222,
        roughness: 0.5
    });
    
    const leftFoot = new THREE.Mesh(footGeo, footMat);
    leftFoot.position.set(-legX, 0.075, 0);
    leftFoot.castShadow = true;
    group.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeo, footMat);
    rightFoot.position.set(legX, 0.075, 0);
    rightFoot.castShadow = true;
    group.add(rightFoot);
    
    console.log('Kanban legs positioned at x:', legX);

    // Position: Outside conference room, near entrance, good lighting
    // Conference room is at z:8, place kanban between desks and conference
    group.position.set(0, 0, -2);
    group.rotation.y = 0;
    
    scene.add(group);
    kanbanBoard = group;
    officeItems.kanbanBoard = group;
    
    console.log('[AvatarWorld] Kanban board created at position:', group.position);
}

function createStandupCircle() {
    console.log('>>> CREATESTANDUPCIRCLE() CALLED <<<');
    
    const group = new THREE.Group();
    group.name = 'standupCircle';

    // Main standup area - semi-circle in front of kanban board
    // Board is at z: -2, standup area should be in front (positive z direction)
    
    // Outer ring - BRIGHTER so it's VISIBLE
    const ringGeo = new THREE.RingGeometry(3, 3.5, 32, 1, 0, Math.PI);
    const ringMat = new THREE.MeshStandardMaterial({ 
        color: 0xFF00FF,  // MAGENTA - very visible
        emissive: 0xFF00FF,
        emissiveIntensity: 0.5,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.rotation.z = Math.PI; // Face the kanban board
    ring.position.y = 0.03;
    group.add(ring);

    // Inner fill area - also more visible
    const fillGeo = new THREE.RingGeometry(0, 3, 32, 1, 0, Math.PI);
    const fillMat = new THREE.MeshStandardMaterial({ 
        color: 0x00FFFF,  // CYAN
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide
    });
    const fill = new THREE.Mesh(fillGeo, fillMat);
    fill.rotation.x = -Math.PI / 2;
    fill.rotation.z = Math.PI;
    fill.position.y = 0.02;
    group.add(fill);

    // Position markers for 3 agents (standing positions)
    const agentPositions = [
        { x: -2.5, z: 0.5 },   // Left position
        { x: 0, z: 0 },        // Center position  
        { x: 2.5, z: 0.5 }     // Right position
    ];
    
    agentPositions.forEach((pos, i) => {
        const markerGeo = new THREE.CircleGeometry(0.4, 16);
        const markerMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFFF,
            emissive: 0xFFFFFF,
            emissiveIntensity: 0.4,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.rotation.x = -Math.PI / 2;
        marker.position.set(pos.x, 0.04, pos.z);
        group.add(marker);
    });

    // "STAND UP" text on floor
    const textCanvas = document.createElement('canvas');
    const ctx = textCanvas.getContext('2d');
    textCanvas.width = 512;
    textCanvas.height = 128;
    
    ctx.fillStyle = 'rgba(78, 205, 196, 0.3)';
    ctx.fillRect(0, 0, 512, 128);
    
    ctx.font = 'bold 60px Arial, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DAILY STANDUP', 256, 64);
    
    const textTexture = new THREE.CanvasTexture(textCanvas);
    const textMat = new THREE.MeshBasicMaterial({ 
        map: textTexture, 
        transparent: true,
        opacity: 0.6
    });
    const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(4, 1), textMat);
    textPlane.rotation.x = -Math.PI / 2;
    textPlane.position.set(0, 0.05, 2.5);
    group.add(textPlane);

    // Position: In front of kanban board (board at z: -2, standup at z: 1.5)
    // This gives 3.5 units of space between board and standup positions
    group.position.set(0, 0, 1.5);
    
    scene.add(group);
    standupCircle = group;

    // Update the standup zone position - agents face the board (rot: Math.PI)
    OFFICE_ZONES.standupCircle = { x: 0, y: 0, z: 1.5, rot: Math.PI };
    OFFICE_ZONES.kanbanBoard = { x: 0, y: 0, z: -2, rot: 0 };
    
    console.log('[AvatarWorld] Standup circle created at position:', group.position);
}

function createGymArea() {
    console.log('>>> CREATEGYMAREA() CALLED - Creating Office Gym <<<');
    console.log('[GYM] Starting gym creation...');
    
    const gymGroup = new THREE.Group();
    gymGroup.name = 'gymArea';
    gymGroup.userData = { type: 'gym', clickable: true };

    // Gym floor area - BRIGHT CHECKERBOARD pattern for visibility
    const floorSize = 8;
    const tileSize = 2;
    const tilesPerRow = floorSize / tileSize;
    
    // Bright red and yellow materials for checkerboard
    const brightRedMat = new THREE.MeshStandardMaterial({ 
        color: 0xFF0000, 
        roughness: 0.8, 
        metalness: 0.1,
        emissive: 0xFF0000,
        emissiveIntensity: 0.1
    });
    const brightYellowMat = new THREE.MeshStandardMaterial({ 
        color: 0xFFFF00, 
        roughness: 0.8, 
        metalness: 0.1,
        emissive: 0xFFFF00,
        emissiveIntensity: 0.1
    });
    
    for (let i = 0; i < tilesPerRow; i++) {
        for (let j = 0; j < tilesPerRow; j++) {
            const tileGeo = new THREE.BoxGeometry(tileSize - 0.05, 0.08, tileSize - 0.05);
            const isAlternate = (i + j) % 2 === 0;
            const tile = new THREE.Mesh(tileGeo, isAlternate ? brightRedMat : brightYellowMat);
            tile.position.set(
                (i - tilesPerRow/2 + 0.5) * tileSize,
                0.04,
                (j - tilesPerRow/2 + 0.5) * tileSize
            );
            tile.receiveShadow = true;
            gymGroup.add(tile);
        }
    }
    console.log('[GYM] Checkerboard floor created');

    // === FLOATING NEON "GYM HERE" SIGN ===
    const signCanvas = document.createElement('canvas');
    const signCtx = signCanvas.getContext('2d');
    signCanvas.width = 512;
    signCanvas.height = 128;
    
    // Neon glow background
    signCtx.fillStyle = '#000000';
    signCtx.fillRect(0, 0, 512, 128);
    
    // Neon border
    signCtx.strokeStyle = '#FF00FF';
    signCtx.lineWidth = 8;
    signCtx.strokeRect(4, 4, 504, 120);
    
    // Neon text
    signCtx.fillStyle = '#FF00FF';
    signCtx.font = 'bold 80px Arial';
    signCtx.textAlign = 'center';
    signCtx.textBaseline = 'middle';
    signCtx.fillText('GYM HERE', 256, 64);
    
    // Add glow effect
    signCtx.shadowColor = '#FF00FF';
    signCtx.shadowBlur = 20;
    signCtx.fillText('GYM HERE', 256, 64);
    
    const neonTexture = new THREE.CanvasTexture(signCanvas);
    const neonMat = new THREE.MeshBasicMaterial({ 
        map: neonTexture,
        transparent: true,
        side: THREE.DoubleSide
    });
    const neonSign = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), neonMat);
    neonSign.position.set(0, 10, 0);
    neonSign.name = 'gymNeonSign';
    gymGroup.add(neonSign);
    console.log('[GYM] Neon sign created at y=10');

    // === SPOTLIGHTS POINTING TO GYM ===
    // Spotlight 1 - from above
    const spotLight1 = new THREE.SpotLight(0xFF00FF, 2, 30, Math.PI / 6, 0.5, 1);
    spotLight1.position.set(-5, 15, -5);
    spotLight1.target.position.set(0, 0, 0);
    spotLight1.castShadow = true;
    gymGroup.add(spotLight1);
    gymGroup.add(spotLight1.target);
    
    // Spotlight 2 - from other side
    const spotLight2 = new THREE.SpotLight(0x00FFFF, 2, 30, Math.PI / 6, 0.5, 1);
    spotLight2.position.set(5, 15, 5);
    spotLight2.target.position.set(0, 0, 0);
    spotLight2.castShadow = true;
    gymGroup.add(spotLight2);
    gymGroup.add(spotLight2.target);
    
    // Spotlight 3 - from front
    const spotLight3 = new THREE.SpotLight(0xFFFF00, 1.5, 25, Math.PI / 5, 0.3, 1);
    spotLight3.position.set(0, 12, 8);
    spotLight3.target.position.set(0, 0, 0);
    gymGroup.add(spotLight3);
    gymGroup.add(spotLight3.target);
    
    console.log('[GYM] 3 spotlights added');

    // Mirrors on back wall
    const mirrorGeo = new THREE.PlaneGeometry(6, 3);
    const mirror1 = new THREE.Mesh(mirrorGeo, MATERIALS.mirror);
    mirror1.position.set(-2, 4, -3.9);
    mirror1.rotation.y = Math.PI;
    gymGroup.add(mirror1);
    
    const mirror2 = new THREE.Mesh(mirrorGeo, MATERIALS.mirror);
    mirror2.position.set(2, 4, -3.9);
    mirror2.rotation.y = Math.PI;
    gymGroup.add(mirror2);

    // Mirror frames
    const frameGeo = new THREE.BoxGeometry(6.2, 3.2, 0.1);
    const frame1 = new THREE.Mesh(frameGeo, MATERIALS.metal);
    frame1.position.set(-2, 4, -3.95);
    gymGroup.add(frame1);
    
    const frame2 = new THREE.Mesh(frameGeo, MATERIALS.metal);
    frame2.position.set(2, 4, -3.95);
    gymGroup.add(frame2);

    // === TREADMILL ===
    const treadmillGroup = new THREE.Group();
    treadmillGroup.name = 'treadmill';
    
    // Base platform - BRIGHT ORANGE
    const treadBaseGeo = new THREE.BoxGeometry(1.8, 0.3, 3.5);
    const brightOrangeMat = new THREE.MeshStandardMaterial({ 
        color: 0xFF6600, 
        roughness: 0.3, 
        metalness: 0.4 
    });
    const treadBase = new THREE.Mesh(treadBaseGeo, brightOrangeMat);
    treadBase.position.y = 0.15;
    treadBase.castShadow = true;
    treadmillGroup.add(treadBase);
    
    // Running belt - BRIGHT BLUE
    const beltGeo = new THREE.BoxGeometry(1.4, 0.05, 3);
    const brightBlueMat = new THREE.MeshStandardMaterial({ 
        color: 0x00CCFF, 
        roughness: 0.9 
    });
    const belt = new THREE.Mesh(beltGeo, brightBlueMat);
    belt.position.set(0, 0.32, 0);
    treadmillGroup.add(belt);
    
    // Side rails - BRIGHT GREEN
    const railGeo = new THREE.BoxGeometry(0.15, 0.1, 3);
    const brightGreenMat = new THREE.MeshStandardMaterial({ 
        color: 0x00FF00, 
        roughness: 0.3, 
        metalness: 0.6 
    });
    const leftRail = new THREE.Mesh(railGeo, brightGreenMat);
    leftRail.position.set(-0.8, 0.35, 0);
    treadmillGroup.add(leftRail);
    
    const rightRail = new THREE.Mesh(railGeo, brightGreenMat);
    rightRail.position.set(0.8, 0.35, 0);
    treadmillGroup.add(rightRail);
    
    // Console/Display
    const consolePoleGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.2);
    const consolePole = new THREE.Mesh(consolePoleGeo, MATERIALS.treadmillFrame);
    consolePole.position.set(0, 0.9, -1.4);
    treadmillGroup.add(consolePole);
    
    const displayGeo = new THREE.BoxGeometry(1, 0.6, 0.3);
    const display = new THREE.Mesh(displayGeo, MATERIALS.blackPlastic);
    display.position.set(0, 1.5, -1.4);
    treadmillGroup.add(display);
    
    // Screen
    const screenGeo = new THREE.PlaneGeometry(0.8, 0.4);
    const screenMat = new THREE.MeshStandardMaterial({ 
        color: 0x00FF00, 
        emissive: 0x00FF00, 
        emissiveIntensity: 0.3 
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 1.5, -1.25);
    treadmillGroup.add(screen);
    
    // Handrails
    const handrailGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.5);
    const leftHandrail = new THREE.Mesh(handrailGeo, MATERIALS.treadmillFrame);
    leftHandrail.rotation.x = Math.PI / 2;
    leftHandrail.position.set(-0.8, 1.2, -0.2);
    treadmillGroup.add(leftHandrail);
    
    const rightHandrail = new THREE.Mesh(handrailGeo, MATERIALS.treadmillFrame);
    rightHandrail.rotation.x = Math.PI / 2;
    rightHandrail.position.set(0.8, 1.2, -0.2);
    treadmillGroup.add(rightHandrail);
    
    treadmillGroup.position.set(-2, 0, 0);
    treadmillGroup.rotation.y = Math.PI / 2;
    gymGroup.add(treadmillGroup);

    // === DUMBBELL RACK ===
    const rackGroup = new THREE.Group();
    rackGroup.name = 'dumbbellRack';
    
    // Rack frame - BRIGHT PURPLE
    const rackFrameGeo = new THREE.BoxGeometry(2.5, 1.5, 0.8);
    const brightPurpleMat = new THREE.MeshStandardMaterial({ 
        color: 0x9900FF, 
        roughness: 0.4, 
        metalness: 0.3 
    });
    const rackFrame = new THREE.Mesh(rackFrameGeo, brightPurpleMat);
    rackFrame.position.y = 0.75;
    rackFrame.castShadow = true;
    rackGroup.add(rackFrame);
    
    // Shelves - BRIGHT PINK
    const shelfGeo = new THREE.BoxGeometry(2.3, 0.05, 0.7);
    const brightPinkMat = new THREE.MeshStandardMaterial({ 
        color: 0xFF0099, 
        roughness: 0.4 
    });
    
    for (let i = 0; i < 3; i++) {
        const shelf = new THREE.Mesh(shelfGeo, brightPinkMat);
        shelf.position.set(0, 0.4 + i * 0.5, 0);
        rackGroup.add(shelf);
        
        // Dumbbells on each shelf - BRIGHT COLORS
        const dumbbellColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00]; // Red, Green, Blue, Yellow
        const numDumbbells = 4;
        
        for (let j = 0; j < numDumbbells; j++) {
            const dbGroup = new THREE.Group();
            
            // Handle - SILVER
            const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4);
            const handle = new THREE.Mesh(handleGeo, MATERIALS.chrome);
            handle.rotation.z = Math.PI / 2;
            dbGroup.add(handle);
            
            // Weights - BRIGHT COLORS
            const weightRadius = 0.08 + (j * 0.015);
            const weightGeo = new THREE.CylinderGeometry(weightRadius, weightRadius, 0.15, 12);
            const weightMat = new THREE.MeshStandardMaterial({ 
                color: dumbbellColors[j],
                emissive: dumbbellColors[j],
                emissiveIntensity: 0.2
            });
            
            const leftWeight = new THREE.Mesh(weightGeo, weightMat);
            leftWeight.rotation.z = Math.PI / 2;
            leftWeight.position.x = -0.25;
            dbGroup.add(leftWeight);
            
            const rightWeight = new THREE.Mesh(weightGeo, weightMat);
            rightWeight.rotation.z = Math.PI / 2;
            rightWeight.position.x = 0.25;
            dbGroup.add(rightWeight);
            
            dbGroup.position.set(
                -0.8 + j * 0.55,
                0.4 + i * 0.5 + weightRadius,
                0
            );
            rackGroup.add(dbGroup);
        }
    }
    
    rackGroup.position.set(2, 0, -1);
    rackGroup.rotation.y = -Math.PI / 2;
    gymGroup.add(rackGroup);

    // === BENCH PRESS ===
    const benchGroup = new THREE.Group();
    benchGroup.name = 'benchPress';
    
    // Bench pad - BRIGHT RED
    const benchPadGeo = new THREE.BoxGeometry(1.2, 0.15, 2.5);
    const brightRedMat = new THREE.MeshStandardMaterial({ 
        color: 0xFF0000,
        roughness: 0.7 
    });
    const benchPad = new THREE.Mesh(benchPadGeo, brightRedMat);
    benchPad.position.y = 0.5;
    benchPad.castShadow = true;
    benchGroup.add(benchPad);
    
    // Bench legs - BRIGHT YELLOW
    const benchLegGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.5);
    const brightYellowMat = new THREE.MeshStandardMaterial({ 
        color: 0xFFFF00,
        roughness: 0.3,
        metalness: 0.5
    });
    const legPositions = [[-0.5, -1], [0.5, -1], [-0.5, 1], [0.5, 1]];
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(benchLegGeo, brightYellowMat);
        leg.position.set(pos[0], 0.25, pos[1]);
        benchGroup.add(leg);
    });
    
    // Barbell rack (uprights) - BRIGHT CYAN
    const uprightGeo = new THREE.BoxGeometry(0.1, 1.8, 0.1);
    const brightCyanMat = new THREE.MeshStandardMaterial({ 
        color: 0x00FFFF,
        roughness: 0.3,
        metalness: 0.6
    });
    const leftUpright = new THREE.Mesh(uprightGeo, brightCyanMat);
    leftUpright.position.set(-0.7, 0.9, -1.2);
    benchGroup.add(leftUpright);
    
    const rightUpright = new THREE.Mesh(uprightGeo, brightCyanMat);
    rightUpright.position.set(0.7, 0.9, -1.2);
    benchGroup.add(rightUpright);
    
    // Barbell hooks - BRIGHT ORANGE
    const hookGeo = new THREE.BoxGeometry(0.15, 0.05, 0.2);
    const brightOrangeMat2 = new THREE.MeshStandardMaterial({ 
        color: 0xFF6600,
        roughness: 0.3,
        metalness: 0.5
    });
    const leftHook = new THREE.Mesh(hookGeo, brightOrangeMat2);
    leftHook.position.set(-0.7, 1.5, -1.1);
    benchGroup.add(leftHook);
    
    const rightHook = new THREE.Mesh(hookGeo, brightOrangeMat2);
    rightHook.position.set(0.7, 1.5, -1.1);
    benchGroup.add(rightHook);
    
    // Barbell - BRIGHT SILVER/CHROME
    const barGeo = new THREE.CylinderGeometry(0.025, 0.025, 2.2);
    const bar = new THREE.Mesh(barGeo, MATERIALS.chrome);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 1.55, -1.2);
    benchGroup.add(bar);
    
    // Weight plates on barbell - RAINBOW COLORS
    const plateColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00];
    const plateGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16);
    const platePositions = [-0.9, -0.8, 0.8, 0.9];
    platePositions.forEach((x, i) => {
        const plateMat = new THREE.MeshStandardMaterial({ 
            color: plateColors[i],
            emissive: plateColors[i],
            emissiveIntensity: 0.2
        });
        const plate = new THREE.Mesh(plateGeo, plateMat);
        plate.rotation.z = Math.PI / 2;
        plate.position.set(x, 1.55, -1.2);
        benchGroup.add(plate);
    });
    
    benchGroup.position.set(0, 0, 2);
    gymGroup.add(benchGroup);

    // === EXERCISE MAT ===
    const matGroup = new THREE.Group();
    matGroup.name = 'exerciseMat';
    
    // Main mat - BRIGHT LIME GREEN
    const matGeo = new THREE.BoxGeometry(1.5, 0.03, 2.5);
    const brightLimeMat = new THREE.MeshStandardMaterial({ 
        color: 0x00FF00,
        roughness: 0.9 
    });
    const mat = new THREE.Mesh(matGeo, brightLimeMat);
    mat.position.y = 0.015;
    mat.receiveShadow = true;
    matGroup.add(mat);
    
    // Rolled mat in corner - BRIGHT PINK
    const rolledMatGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.5);
    const brightPinkMat2 = new THREE.MeshStandardMaterial({ 
        color: 0xFF00FF,
        roughness: 0.9 
    });
    const rolledMat = new THREE.Mesh(rolledMatGeo, brightPinkMat2);
    rolledMat.rotation.z = Math.PI / 2;
    rolledMat.position.set(1.2, 0.08, -0.8);
    matGroup.add(rolledMat);
    
    // Yoga block - BRIGHT ORANGE
    const blockGeo = new THREE.BoxGeometry(0.2, 0.15, 0.35);
    const brightOrangeMat3 = new THREE.MeshStandardMaterial({ 
        color: 0xFF6600 
    });
    const block = new THREE.Mesh(blockGeo, brightOrangeMat3);
    block.position.set(-0.5, 0.075, 0.5);
    matGroup.add(block);
    
    matGroup.position.set(2.5, 0, 2);
    matGroup.rotation.y = Math.PI / 4;
    gymGroup.add(matGroup);

    // === WATER FOUNTAIN ===
    const fountainGroup = new THREE.Group();
    fountainGroup.name = 'waterFountain';
    fountainGroup.userData = { type: 'waterFountain', clickable: true };
    
    // Base
    const fountainBaseGeo = new THREE.BoxGeometry(0.8, 1.2, 0.6);
    const fountainBase = new THREE.Mesh(fountainBaseGeo, MATERIALS.whitePlastic);
    fountainBase.position.y = 0.6;
    fountainBase.castShadow = true;
    fountainGroup.add(fountainBase);
    
    // Basin
    const basinGeo = new THREE.BoxGeometry(0.6, 0.15, 0.4);
    const basin = new THREE.Mesh(basinGeo, MATERIALS.ceramic);
    basin.position.set(0, 1.1, 0.1);
    fountainGroup.add(basin);
    
    // Spout
    const spoutGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.15);
    const spout = new THREE.Mesh(spoutGeo, MATERIALS.chrome);
    spout.position.set(0, 1.25, 0.1);
    fountainGroup.add(spout);
    
    // Push button
    const buttonGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.05);
    const button = new THREE.Mesh(buttonGeo, MATERIALS.bluePlastic);
    button.position.set(0.15, 1.15, 0.25);
    fountainGroup.add(button);
    
    // Water stream (animated)
    const waterStreamGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.1);
    const waterStreamMat = new THREE.MeshStandardMaterial({ 
        color: 0x87CEEB, 
        transparent: true, 
        opacity: 0.7 
    });
    const waterStream = new THREE.Mesh(waterStreamGeo, waterStreamMat);
    waterStream.position.set(0, 1.18, 0.1);
    waterStream.visible = false;
    waterStream.name = 'waterStream';
    fountainGroup.add(waterStream);
    
    fountainGroup.position.set(-3, 0, 0);
    fountainGroup.rotation.y = Math.PI / 2;
    gymGroup.add(fountainGroup);

    // === TOWEL RACK ===
    const towelRackGroup = new THREE.Group();
    
    // Rack frame
    const rackPoleGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.8);
    const leftPole = new THREE.Mesh(rackPoleGeo, MATERIALS.chrome);
    leftPole.position.set(-0.4, 0.9, 0);
    towelRackGroup.add(leftPole);
    
    const rightPole = new THREE.Mesh(rackPoleGeo, MATERIALS.chrome);
    rightPole.position.set(0.4, 0.9, 0);
    towelRackGroup.add(rightPole);
    
    // Crossbar
    const crossBarGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.9);
    const crossBar = new THREE.Mesh(crossBarGeo, MATERIALS.chrome);
    crossBar.rotation.z = Math.PI / 2;
    crossBar.position.set(0, 1.7, 0);
    towelRackGroup.add(crossBar);
    
    // Towels
    for (let i = 0; i < 3; i++) {
        const towelGeo = new THREE.BoxGeometry(0.15, 0.4, 0.05);
        const towel = new THREE.Mesh(towelGeo, MATERIALS.towel);
        towel.position.set(-0.25 + i * 0.25, 1.5, 0);
        towel.rotation.z = (Math.random() - 0.5) * 0.2;
        towelRackGroup.add(towel);
    }
    
    towelRackGroup.position.set(3, 0, 2.5);
    towelRackGroup.rotation.y = -Math.PI / 4;
    gymGroup.add(towelRackGroup);

    // === SMALL TV ON WALL ===
    const tvGroup = new THREE.Group();
    
    // TV frame
    const tvFrameGeo = new THREE.BoxGeometry(2, 1.2, 0.08);
    const tvFrame = new THREE.Mesh(tvFrameGeo, MATERIALS.blackPlastic);
    tvFrame.position.set(0, 5, -3.9);
    gymGroup.add(tvFrame);
    
    // TV screen
    const tvScreenGeo = new THREE.PlaneGeometry(1.8, 1);
    const tvScreenMat = new THREE.MeshStandardMaterial({ 
        color: 0x111111,
        emissive: 0x3366FF,
        emissiveIntensity: 0.2
    });
    const tvScreen = new THREE.Mesh(tvScreenGeo, tvScreenMat);
    tvScreen.position.set(0, 5, -3.85);
    gymGroup.add(tvScreen);
    
    // TV mount
    const mountGeo = new THREE.BoxGeometry(0.3, 0.3, 0.2);
    const mount = new THREE.Mesh(mountGeo, MATERIALS.metal);
    mount.position.set(0, 5, -3.95);
    gymGroup.add(mount);

    // === "GYM ZONE" SIGN ===
    const signCanvas = document.createElement('canvas');
    const signCtx = signCanvas.getContext('2d');
    signCanvas.width = 512;
    signCanvas.height = 128;
    
    // Background
    signCtx.fillStyle = '#1a1a1a';
    signCtx.fillRect(0, 0, 512, 128);
    
    // Border
    signCtx.strokeStyle = '#39FF14';
    signCtx.lineWidth = 8;
    signCtx.strokeRect(4, 4, 504, 120);
    
    // Text
    signCtx.fillStyle = '#39FF14';
    signCtx.font = 'bold 72px Arial';
    signCtx.textAlign = 'center';
    signCtx.textBaseline = 'middle';
    signCtx.fillText('GYM ZONE', 256, 64);
    
    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.75), signMat);
    signMesh.position.set(0, 7, -3.9);
    gymGroup.add(signMesh);

    // Position gym in a MORE VISIBLE location (closer to center)
    // Changed from (20, 0, -20) to (10, 0, -10) to be in camera view
    gymGroup.position.set(10, 0, -10);
    
    scene.add(gymGroup);
    officeItems.gymArea = gymGroup;
    
    console.log('[AvatarWorld] Gym area created at position:', gymGroup.position);
    console.log('[GYM] Gym is now at (10, 0, -10) - closer to center for visibility');
    console.log('[GYM] Features: checkerboard floor, neon sign, spotlights, bright equipment');
}

function createFilingCabinets() {
    // Create multiple filing cabinets
    const cabinetPositions = [
        { x: -25, z: -15, rot: Math.PI / 2 },
        { x: 25, z: -15, rot: -Math.PI / 2 }
    ];

    cabinetPositions.forEach((pos, index) => {
        const group = new THREE.Group();
        group.name = `filingCabinet${index}`;

        // Cabinet body
        const bodyGeo = new THREE.BoxGeometry(1.5, 3.5, 2);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: 0x4A5568,
            roughness: 0.4,
            metalness: 0.3
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.75;
        body.castShadow = true;
        group.add(body);

        // Drawers
        const drawerGeo = new THREE.BoxGeometry(1.4, 0.65, 0.05);
        const drawerMat = new THREE.MeshStandardMaterial({ 
            color: 0x5A6578,
            roughness: 0.5
        });

        for (let i = 0; i < 4; i++) {
            const drawer = new THREE.Mesh(drawerGeo, drawerMat);
            drawer.position.set(0, 3 - i * 0.8, 1.03);
            group.add(drawer);

            // Label holder
            const labelGeo = new THREE.BoxGeometry(0.4, 0.15, 0.02);
            const label = new THREE.Mesh(labelGeo, new THREE.MeshStandardMaterial({ color: 0xFFFFFF }));
            label.position.set(0, 3 - i * 0.8, 1.08);
            group.add(label);

            // Handle
            const handleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3);
            const handle = new THREE.Mesh(handleGeo, MATERIALS.chrome);
            handle.rotation.x = Math.PI / 2;
            handle.position.set(0, 3 - i * 0.8, 1.12);
            group.add(handle);
        }

        // Casters
        const casterGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.08);
        const casterMat = MATERIALS.rubber;
        [[-0.6, -0.8], [0.6, -0.8], [-0.6, 0.8], [0.6, 0.8]].forEach(casterPos => {
            const caster = new THREE.Mesh(casterGeo, casterMat);
            caster.position.set(casterPos[0], 0.04, casterPos[1]);
            group.add(caster);
        });

        group.position.set(pos.x, 0, pos.z);
        group.rotation.y = pos.rot;
        scene.add(group);
    });
}

function createWallClock() {
    const group = new THREE.Group();
    group.name = 'wallClock';

    // Clock frame
    const frameGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.15, 32);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.rotation.x = Math.PI / 2;
    group.add(frame);

    // Clock face
    const faceGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.02, 32);
    const faceMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.rotation.x = Math.PI / 2;
    face.position.z = 0.08;
    group.add(face);

    // Hour markers
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const markerGeo = new THREE.BoxGeometry(0.08, 0.15, 0.02);
        const marker = new THREE.Mesh(markerGeo, MATERIALS.blackPlastic);
        marker.position.set(
            Math.sin(angle) * 0.9,
            Math.cos(angle) * 0.9,
            0.09
        );
        marker.rotation.z = -angle;
        group.add(marker);
    }

    // Digital display area
    const digitalGeo = new THREE.PlaneGeometry(0.8, 0.25);
    const digitalMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const digital = new THREE.Mesh(digitalGeo, digitalMat);
    digital.position.set(0, -0.4, 0.09);
    group.add(digital);

    // Hour hand
    const hourGeo = new THREE.BoxGeometry(0.06, 0.5, 0.03);
    const hourHand = new THREE.Mesh(hourGeo, MATERIALS.blackPlastic);
    hourHand.position.set(0, 0.25, 0.1);
    hourHand.geometry.translate(0, -0.25, 0);
    group.add(hourHand);

    // Minute hand
    const minGeo = new THREE.BoxGeometry(0.04, 0.8, 0.02);
    const minHand = new THREE.Mesh(minGeo, MATERIALS.blackPlastic);
    minHand.position.set(0, 0.4, 0.12);
    minHand.geometry.translate(0, -0.4, 0);
    group.add(minHand);

    // Second hand
    const secGeo = new THREE.BoxGeometry(0.02, 0.9, 0.01);
    const secHand = new THREE.Mesh(secGeo, new THREE.MeshStandardMaterial({ color: 0xFF0000 }));
    secHand.position.set(0, 0.45, 0.14);
    secHand.geometry.translate(0, -0.45, 0);
    group.add(secHand);

    // Center cap
    const capGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05);
    const cap = new THREE.Mesh(capGeo, MATERIALS.chrome);
    cap.rotation.x = Math.PI / 2;
    cap.position.z = 0.15;
    group.add(cap);

    // Store references for animation
    clockHands = { hour: hourHand, minute: minHand, second: secHand };
    clockMesh = group;

    group.position.set(0, 8, -29.6);
    scene.add(group);
}

function updateClock() {
    if (!clockHands.hour) return;
    
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    
    const secondAngle = ((seconds + milliseconds / 1000) / 60) * Math.PI * 2;
    const minuteAngle = ((minutes + seconds / 60) / 60) * Math.PI * 2;
    const hourAngle = ((hours + minutes / 60) / 12) * Math.PI * 2;
    
    clockHands.second.rotation.z = -secondAngle;
    clockHands.minute.rotation.z = -minuteAngle;
    clockHands.hour.rotation.z = -hourAngle;
}

function createPlants() {
    const plantPositions = [
        { x: -12, z: -15, scale: 1.8 },
        { x: 12, z: -15, scale: 1.5 },
        { x: -26, z: 0, scale: 2.0 },
        { x: 26, z: 0, scale: 1.8 },
        { x: -12, z: 15, scale: 1.6 },
        { x: 12, z: 15, scale: 1.5 }
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

    // Decorative pot
    const potGeo = new THREE.CylinderGeometry(0.6 * scale, 0.45 * scale, 1 * scale, 12);
    const pot = new THREE.Mesh(potGeo, MATERIALS.potClay);
    pot.position.y = 0.5 * scale;
    pot.castShadow = true;
    group.add(pot);

    // Pot rim
    const rimGeo = new THREE.TorusGeometry(0.6 * scale, 0.05 * scale, 8, 12);
    const rim = new THREE.Mesh(rimGeo, MATERIALS.potClay);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1 * scale;
    group.add(rim);

    // Soil
    const soilGeo = new THREE.CircleGeometry(0.55 * scale, 12);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x3D2314 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.rotation.x = -Math.PI / 2;
    soil.position.y = 0.95 * scale;
    group.add(soil);

    // Main stem/trunk
    const stemGeo = new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 2.5 * scale, 8);
    const stem = new THREE.Mesh(stemGeo, new THREE.MeshStandardMaterial({ color: 0x4A3728, roughness: 0.9 }));
    stem.position.y = 2 * scale;
    stem.castShadow = true;
    group.add(stem);

    // Multiple branches with leaves
    const branchPositions = [
        { x: 0, y: 3, z: 0, s: 1 },
        { x: 0.5, y: 2.8, z: 0.3, s: 0.9 },
        { x: -0.4, y: 2.6, z: -0.2, s: 0.85 },
        { x: 0.3, y: 2.4, z: -0.4, s: 0.8 },
        { x: -0.3, y: 3.2, z: 0.2, s: 0.75 }
    ];

    branchPositions.forEach(pos => {
        // Branch
        const branchGeo = new THREE.CylinderGeometry(0.04 * scale, 0.06 * scale, 0.8 * scale * pos.s, 6);
        const branch = new THREE.Mesh(branchGeo, new THREE.MeshStandardMaterial({ color: 0x5A4738 }));
        branch.position.set(pos.x * scale, pos.y * scale, pos.z * scale);
        branch.rotation.z = (Math.random() - 0.5) * 0.8;
        branch.rotation.x = (Math.random() - 0.5) * 0.8;
        group.add(branch);

        // Leaves cluster
        const leafGeo = new THREE.SphereGeometry(0.35 * scale * pos.s, 8, 8);
        const leafMat = new THREE.MeshStandardMaterial({ 
            color: 0x228B22, 
            roughness: 0.8 
        });
        
        for (let j = 0; j < 3; j++) {
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.set(
                pos.x * scale + (Math.random() - 0.5) * 0.3 * scale,
                pos.y * scale + 0.4 * scale + Math.random() * 0.2 * scale,
                pos.z * scale + (Math.random() - 0.5) * 0.3 * scale
            );
            leaf.scale.setScalar(0.6 + Math.random() * 0.4);
            leaf.castShadow = true;
            group.add(leaf);
        }
    });

    return group;
}

function createDecorations() {
    // Wall art frames
    const framePositions = [
        { x: -29.7, y: 7, z: -5, rot: Math.PI / 2 },
        { x: -29.7, y: 7, z: 5, rot: Math.PI / 2 },
        { x: 29.7, y: 7, z: -5, rot: -Math.PI / 2 },
        { x: 29.7, y: 7, z: 5, rot: -Math.PI / 2 }
    ];

    framePositions.forEach((pos, i) => {
        const frameGroup = new THREE.Group();
        
        // Frame
        const frameGeo = new THREE.BoxGeometry(0.2, 3.5, 3);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frameGroup.add(frame);

        // Canvas with abstract art
        const canvasGeo = new THREE.PlaneGeometry(2.6, 3.1);
        const canvasMat = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color().setHSL(i * 0.25, 0.6, 0.5)
        });
        const canvas = new THREE.Mesh(canvasGeo, canvasMat);
        canvas.rotation.y = pos.rot > 0 ? 0 : Math.PI;
        canvas.position.x = pos.rot > 0 ? -0.11 : 0.11;
        frameGroup.add(canvas);

        frameGroup.position.set(pos.x, pos.y, pos.z);
        frameGroup.rotation.y = pos.rot;
        scene.add(frameGroup);
    });

    // Cable management under desks
    [-10, 0, 10].forEach(x => {
        const cableGeo = new THREE.CylinderGeometry(0.015, 0.015, 3);
        const cableMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const cable = new THREE.Mesh(cableGeo, cableMat);
        cable.rotation.z = Math.PI / 2;
        cable.position.set(x, 0.1, -6);
        cable.rotation.y = Math.random() * 0.3;
        scene.add(cable);
    });

    // Trash bins
    const binPositions = [
        { x: -6, z: -4 },
        { x: 6, z: -4 }
    ];
    
    binPositions.forEach(pos => {
        const binGeo = new THREE.CylinderGeometry(0.3, 0.25, 0.8, 16);
        const binMat = new THREE.MeshStandardMaterial({ color: 0x2C3E50 });
        const bin = new THREE.Mesh(binGeo, binMat);
        bin.position.set(pos.x, 0.4, pos.z);
        bin.castShadow = true;
        scene.add(bin);

        // Liner
        const linerGeo = new THREE.CylinderGeometry(0.28, 0.23, 0.1);
        const liner = new THREE.Mesh(linerGeo, new THREE.MeshStandardMaterial({ color: 0x111111 }));
        liner.position.set(pos.x, 0.75, pos.z);
        scene.add(liner);
    });
}

function createParticles() {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 60;
        positions[i + 1] = Math.random() * 12;
        positions[i + 2] = (Math.random() - 0.5) * 60;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0x90EE90,
        size: 0.08,
        transparent: true,
        opacity: 0.5
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    particles.userData = { speeds: Array(particleCount).fill(0).map(() => Math.random() * 0.02 + 0.005) };
    
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

function createAgents() {
    console.log('[AvatarWorld] Creating agents...');
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
        console.log(`[AvatarWorld] Created agent ${key} at (${config.position.x}, ${config.position.z})`);
    });
    
    // Export to global scope for daily routine
    window.agents = agents;
    window.AGENT_CONFIGS = AGENT_CONFIGS;
    window.scene = scene;
    console.log('[AvatarWorld] Agents exported to window.agents:', Object.keys(window.agents));
}

function createAgent(config) {
    const group = new THREE.Group();

    if (config.type === 'tree') {
        createGrootAvatar(group, config);
    } else if (config.type === 'voxel') {
        createBettyAvatar(group, config);
    } else {
        createFinAvatar(group, config);
    }

    createNameLabel(group, config.name);
    return group;
}

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

    // Bark texture details
    for (let i = 0; i < 8; i++) {
        const barkGeo = new THREE.BoxGeometry(0.05, 0.3, 0.52);
        const bark = new THREE.Mesh(barkGeo, new THREE.MeshStandardMaterial({ color: config.color * 0.8 }));
        bark.position.y = 0.5 + i * 0.2;
        bark.rotation.y = i * 0.7;
        group.add(bark);
    }

    // Head
    const headGeometry = new THREE.CylinderGeometry(0.5, 0.4, 0.8, 8);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.y = 2.2;
    head.castShadow = true;
    group.add(head);

    // Face features
    const eyeGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x000000, emissiveIntensity: 0.2 });
    
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

    // Small branches on arms
    const branchGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.4);
    const branchMat = new THREE.MeshStandardMaterial({ color: config.color });
    
    [-0.7, 0.7].forEach(x => {
        const branch = new THREE.Mesh(branchGeo, branchMat);
        branch.position.set(x, 1.8, 0.3);
        branch.rotation.x = -Math.PI / 4;
        group.add(branch);
    });

    // Leaves on head
    const leavesGeometry = new THREE.SphereGeometry(0.3, 6, 6);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: config.secondaryColor });
    
    for (let i = 0; i < 7; i++) {
        const leaf = new THREE.Mesh(leavesGeometry, leavesMaterial);
        const angle = (i / 7) * Math.PI * 2;
        leaf.position.set(
            Math.cos(angle) * 0.35,
            2.7 + Math.random() * 0.2,
            Math.sin(angle) * 0.35
        );
        leaf.scale.setScalar(0.4 + Math.random() * 0.3);
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

    // Tie
    const tieGeo = new THREE.BoxGeometry(0.15, 0.7, 0.43);
    const tieMat = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.y = 1.5;
    group.add(tie);

    // Head
    const headGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.5);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFDBAC });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.3;
    head.castShadow = true;
    group.add(head);

    // Hair
    const hairGeometry = new THREE.BoxGeometry(0.55, 0.2, 0.55);
    const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 2.6;
    group.add(hair);

    // Glasses
    const glassesGeometry = new THREE.BoxGeometry(0.52, 0.15, 0.52);
    const glassesMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
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
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
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

    // Shoes
    const shoeGeo = new THREE.BoxGeometry(0.28, 0.15, 0.5);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(-0.2, 0.075, 0.1);
    group.add(leftShoe);
    
    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0.2, 0.075, 0.1);
    group.add(rightShoe);
}

function createBettyAvatar(group, config) {
    // Main body block
    const bodyGeometry = new THREE.BoxGeometry(0.7, 1, 0.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: config.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.3;
    body.castShadow = true;
    group.add(body);

    // Detail - pocket
    const pocketGeo = new THREE.BoxGeometry(0.15, 0.2, 0.02);
    const pocket = new THREE.Mesh(pocketGeo, new THREE.MeshStandardMaterial({ color: config.secondaryColor }));
    pocket.position.set(-0.2, 1.4, 0.26);
    group.add(pocket);

    // Badge/Detail
    const badgeGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.52);
    const badgeMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
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

    // Hair - more detailed
    const hairGeometry = new THREE.BoxGeometry(0.65, 0.3, 0.65);
    const hairMaterial = new THREE.MeshStandardMaterial({ color: 0xFFB6C1 });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 2.55;
    group.add(hair);

    // Side hair
    const sideHairGeo = new THREE.BoxGeometry(0.1, 0.5, 0.62);
    const leftSide = new THREE.Mesh(sideHairGeo, hairMaterial);
    leftSide.position.set(-0.35, 2.3, 0);
    group.add(leftSide);
    
    const rightSide = new THREE.Mesh(sideHairGeo, hairMaterial);
    rightSide.position.set(0.35, 2.3, 0);
    group.add(rightSide);

    // Glasses
    const glassesGeometry = new THREE.BoxGeometry(0.62, 0.2, 0.62);
    const glassesMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
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
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    
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

    // Shoes
    const shoeGeo = new THREE.BoxGeometry(0.24, 0.12, 0.35);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xFF69B4 });
    
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(-0.18, 0.06, 0.05);
    group.add(leftShoe);
    
    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0.18, 0.06, 0.05);
    group.add(rightShoe);
}

function createNameLabel(group, name) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.beginPath();
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

function moveAgentToZone(agentId, zoneName) {
    const agent = agents[agentId];
    const zone = OFFICE_ZONES[zoneName];
    
    if (!agent || !zone) return;
    
    agent.userData.targetPosition = { ...zone };
    agent.userData.isWalking = true;
    agent.userData.action = 'walk';
}

function toggleMeetingMode() {
    isMeetingMode = !isMeetingMode;
    
    if (isMeetingMode) {
        // Move all agents to conference table with sitting positions
        // Groot at head, Fin and Betty opposite each other
        moveAgentToZone('groot', 'grootChair');
        moveAgentToZone('fin', 'finChair');
        moveAgentToZone('betty', 'bettyChair');
        
        setTimeout(() => {
            // Groot at head (facing table center)
            agents.groot.position.set(0, -0.4, 5.5);
            agents.groot.rotation.y = 0;
            agents.groot.userData.isSitting = true;
            
            // Fin on left side (facing right/across)
            agents.fin.position.set(-3, -0.4, 8);
            agents.fin.rotation.y = Math.PI / 2;
            agents.fin.userData.isSitting = true;
            
            // Betty on right side, opposite Fin (facing left)
            agents.betty.position.set(3, -0.4, 8);
            agents.betty.rotation.y = -Math.PI / 2;
            agents.betty.userData.isSitting = true;
            
            Object.values(agents).forEach(agent => {
                agent.userData.isWalking = false;
                agent.userData.action = null;
            });
        }, 2000);
    } else {
        // Return to workstations - standing up
        Object.keys(AGENT_CONFIGS).forEach(key => {
            agents[key].userData.isSitting = false;
            moveAgentToZone(key, AGENT_CONFIGS[key].workstation);
        });
        
        setTimeout(() => {
            Object.keys(agents).forEach(key => {
                const config = AGENT_CONFIGS[key];
                agents[key].position.set(config.position.x, config.position.y, config.position.z);
                agents[key].rotation.y = config.position.rot;
                agents[key].userData.isWalking = false;
                agents[key].userData.action = null;
                agents[key].userData.isSitting = false;
            });
        }, 2000);
    }
}

function toggleStandupMode() {
    if (isStandupMode) {
        // End standup - return to desks
        isStandupMode = false;
        endStandup();
    } else {
        // Start standup - move to circle
        isStandupMode = true;
        startStandup();
    }
}

function startStandup() {
    // Move all agents to standup positions IN FRONT OF the Kanban board
    // Kanban board is at z: -2, standup circle at z: 1.5
    // Agents face the board (rot: Math.PI means facing negative Z, toward the board)
    const standupPositions = [
        { x: -2.5, z: 2.0, rot: Math.PI },   // Groot - left position, facing board
        { x: 0, z: 1.5, rot: Math.PI },      // Fin - center position, facing board
        { x: 2.5, z: 2.0, rot: Math.PI }     // Betty - right position, facing board
    ];

    const agentKeys = Object.keys(agents);
    agentKeys.forEach((key, i) => {
        const pos = standupPositions[i];
        const agent = agents[key];
        agent.userData.targetPosition = { x: pos.x, y: 0, z: pos.z, rot: pos.rot };
        agent.userData.isWalking = true;
        console.log(`[Standup] Moving ${key} to standup position:`, pos);
    });

    // Animate standup circle to show it's active
    if (standupCircle) {
        const ring = standupCircle.children[0];
        if (ring && ring.material) {
            ring.material.emissiveIntensity = 0.6;
        }
    }

    // Show discussion after agents arrive
    setTimeout(() => {
        agentsDiscuss();
    }, 2500);
}

function endStandup() {
    // Return all agents to workstations
    Object.keys(AGENT_CONFIGS).forEach(key => {
        moveAgentToZone(key, AGENT_CONFIGS[key].workstation);
    });

    // Reset standup circle
    if (standupCircle) {
        const ring = standupCircle.children[0];
        if (ring && ring.material) {
            ring.material.emissiveIntensity = 0.3;
        }
    }

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

function agentsDiscuss() {
    if (!isStandupMode) return;

    // Make agents gesture while "discussing"
    Object.keys(agents).forEach((key, i) => {
        const agent = agents[key];
        
        // Each agent gestures at different times
        setTimeout(() => {
            if (!isStandupMode) return;
            
            // Simple talking animation - arm movement
            if (agent.userData.rightArm) {
                const originalRot = agent.userData.rightArm.rotation.z;
                let gestureCount = 0;
                const gestureInterval = setInterval(() => {
                    if (!isStandupMode || gestureCount > 6) {
                        clearInterval(gestureInterval);
                        agent.userData.rightArm.rotation.z = originalRot;
                        return;
                    }
                    agent.userData.rightArm.rotation.z = originalRot + Math.sin(gestureCount) * 0.3;
                    gestureCount++;
                }, 300);
            }
        }, i * 800);
    });

    // End discussion after 8 seconds
    setTimeout(() => {
        if (isStandupMode) {
            toggleStandupMode();
            // Update button text
            const btn = document.getElementById('btn-standup');
            if (btn) btn.textContent = '📋 Start Stand-up';
        }
    }, 8000);
}

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

function animateSteam() {
    steamParticles.forEach(steam => {
        steam.position.y += 0.002 * steam.userData.speed;
        steam.position.x += Math.sin(Date.now() * 0.001 + steam.userData.offset) * 0.0005;
        
        if (steam.position.y > steam.userData.baseY + 0.3) {
            steam.position.y = steam.userData.baseY;
            steam.material.opacity = 0.3;
        } else {
            steam.material.opacity = Math.max(0, 0.3 - (steam.position.y - steam.userData.baseY));
        }
    });
}

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

    // Check for window blind clicks
    blinds.forEach(blind => {
        const slatIntersects = raycaster.intersectObjects(blind.userData.slats);
        if (slatIntersects.length > 0) {
            toggleBlinds(blind);
        }
    });
}

function toggleBlinds(blindGroup) {
    blindGroup.userData.open = !blindGroup.userData.open;
    const targetAngle = blindGroup.userData.open ? 0 : Math.PI / 3;
    
    blindGroup.userData.slats.forEach((slat, i) => {
        setTimeout(() => {
            slat.rotation.x = targetAngle;
        }, i * 20);
    });
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
        case 'kanban':
            nameEl.textContent = 'Kanban Board';
            descEl.textContent = 'Daily stand-up board - TO DO, IN PROGRESS, DONE 📝';
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
            descEl.textContent = 'Fresh espresso and pastries! ☕';
            break;
        case 'water':
            nameEl.textContent = 'Water Cooler';
            descEl.textContent = 'Stay hydrated! Chat spot.';
            break;
        case 'door':
            nameEl.textContent = 'Office Entrance';
            descEl.textContent = 'Welcome to Tap Rush HQ!';
            break;
        case 'gym':
            nameEl.textContent = 'Gym Zone 💪';
            descEl.textContent = 'Office gym with treadmill, weights, bench press, and yoga mats. Stay fit!';
            break;
        case 'waterFountain':
            nameEl.textContent = 'Water Fountain';
            descEl.textContent = 'Stay hydrated during your workout!';
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
        targetPos.x + 5,
        targetPos.y + 4,
        targetPos.z + 8
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

function teleportToLocation(locationName) {
    console.log('[TELEPORT] Moving camera to:', locationName);
    
    const locations = {
        grootDesk: { x: -10, y: 8, z: 5, targetX: -10, targetY: 0, targetZ: -8 },
        finDesk: { x: 0, y: 8, z: 5, targetX: 0, targetY: 0, targetZ: -12 },
        bettyDesk: { x: 10, y: 8, z: 5, targetX: 10, targetY: 0, targetZ: -8 },
        conferenceRoom: { x: 0, y: 12, z: 20, targetX: 0, targetY: 0, targetZ: 8 },
        kanbanBoard: { x: 0, y: 10, z: 8, targetX: 0, targetY: 0, targetZ: -2 },
        coffeeStation: { x: -20, y: 10, z: 10, targetX: -28, targetY: 0, targetZ: 0 },
        lounge: { x: -10, y: 10, z: 20, targetX: -14, targetY: 0, targetZ: 10 },
        gymArea: { x: 10, y: 12, z: 5, targetX: 10, targetY: 0, targetZ: -10 }
    };
    
    const loc = locations[locationName];
    if (!loc) {
        console.error('[TELEPORT] Unknown location:', locationName);
        return;
    }
    
    // Animate camera to location
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const endPos = new THREE.Vector3(loc.x, loc.y, loc.z);
    const endTarget = new THREE.Vector3(loc.targetX, loc.targetY, loc.targetZ);
    
    let progress = 0;
    const duration = 1000; // ms
    const startTime = Date.now();
    
    function animateCamera() {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const ease = 1 - Math.pow(1 - progress, 3);
        
        camera.position.lerpVectors(startPos, endPos, ease);
        controls.target.lerpVectors(startTarget, endTarget, ease);
        controls.update();
        
        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        } else {
            console.log('[TELEPORT] Arrived at', locationName);
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
    
    // Location buttons - teleport camera to locations
    document.querySelectorAll('.location-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const location = btn.dataset.location;
            teleportToLocation(location);
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
            const zones = Object.keys(OFFICE_ZONES);
            const randomZone = zones[Math.floor(Math.random() * zones.length)];
            moveAgentToZone(selectedAgent, randomZone);
        }
    });
    
    document.getElementById('btn-reset').addEventListener('click', () => {
        if (selectedAgent) {
            moveAgentToZone(selectedAgent, AGENT_CONFIGS[selectedAgent].workstation);
        } else {
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

    // Standup button
    const standupBtn = document.getElementById('btn-standup');
    if (standupBtn) {
        standupBtn.addEventListener('click', () => {
            toggleStandupMode();
            standupBtn.textContent = isStandupMode ? '🔙 End Stand-up' : '📋 Start Stand-up';
        });
    }
}

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
    
    // Animate steam from coffee mugs
    animateSteam();
    
    // Update Daily Routine animations
    if (typeof updateDailyRoutineAnimations === 'function') {
        updateDailyRoutineAnimations();
    }
    
    // Update wall clock
    updateClock();
    
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
        
        // Initialize Daily Routine feature
        if (typeof initDailyRoutine === 'function') {
            initDailyRoutine();
        }
        
        console.log('Init completed');
    } catch (err) {
        console.error('Init failed:', err);
        document.getElementById('loading-screen').innerHTML = 
            '<div style="color:red;padding:20px;"><h3>Error</h3><p>' + err.message + '</p><pre>' + err.stack + '</pre></div>';
    }
});
