/**
 * Agent Avatar World - OPTIMIZED Edition
 * Reduced polygon count, simplified geometry for 60fps performance
 */

// Global variables
let scene, camera, renderer, controls;
let agents = {};
let selectedAgent = null;
let raycaster, mouse;
let clock = new THREE.Clock();
let officeItems = {};
let isMeetingMode = false;
let isStandupMode = false;
let kanbanBoard = null;
let standupCircle = null;

// Office zones for agent navigation
const OFFICE_ZONES = {
    grootDesk: { x: -10, y: 0, z: -8, rot: Math.PI / 4 },
    finDesk: { x: 0, y: 0, z: -12, rot: 0 },
    bettyDesk: { x: 10, y: 0, z: -8, rot: -Math.PI / 4 },
    conferenceTable: { x: 0, y: 0, z: 8, rot: 0 },
    grootChair: { x: 0, y: 0, z: 5.5, rot: 0 },
    finChair: { x: -3, y: 0, z: 8, rot: Math.PI / 2 },
    bettyChair: { x: 3, y: 0, z: 8, rot: -Math.PI / 2 },
    lounge: { x: -14, y: 0, z: 10, rot: Math.PI / 2 },
    coffeeStation: { x: -28, y: 0, z: 0, rot: Math.PI / 2 },
    standupCircle: { x: 0, y: 0, z: 1.5, rot: Math.PI },
    kanbanBoard: { x: 0, y: 0, z: -2, rot: 0 },
    gymArea: { x: 10, y: 0, z: -10, rot: 0 },
    treadmill: { x: 8, y: 0, z: -8, rot: -Math.PI / 2 },
    dumbbellRack: { x: 12, y: 0, z: -8, rot: Math.PI / 2 },
    benchPress: { x: 10, y: 0, z: -12, rot: 0 }
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

// OPTIMIZED: Reduced material library - fewer unique materials
const MATERIALS = {
    wood: new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 0.7 }),
    darkWood: new THREE.MeshStandardMaterial({ color: 0x4A3728, roughness: 0.8 }),
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
    plastic: new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 }),
    whitePlastic: new THREE.MeshStandardMaterial({ color: 0xF5F5F5, roughness: 0.4 }),
    fabric: new THREE.MeshStandardMaterial({ color: 0x34495E, roughness: 0.9 }),
    carpet: new THREE.MeshStandardMaterial({ color: 0x2C3E50, roughness: 1 }),
    carpetTile1: new THREE.MeshStandardMaterial({ color: 0x3D5A73, roughness: 1 }),
    carpetTile2: new THREE.MeshStandardMaterial({ color: 0x2E4A5E, roughness: 1 }),
    screen: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, emissive: 0x001133, emissiveIntensity: 0.2 }),
    screenOn: new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.2, emissive: 0x3366FF, emissiveIntensity: 0.5 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xFFFFF0, roughness: 0.8 }),
    yellowSticky: new THREE.MeshStandardMaterial({ color: 0xFFEB3B, roughness: 0.9 }),
    pinkSticky: new THREE.MeshStandardMaterial({ color: 0xFF69B4, roughness: 0.9 }),
    greenSticky: new THREE.MeshStandardMaterial({ color: 0x90EE90, roughness: 0.9 }),
    whiteboard: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.9 }),
    kanbanTodo: new THREE.MeshStandardMaterial({ color: 0xFF6B6B, roughness: 0.9 }),
    kanbanProgress: new THREE.MeshStandardMaterial({ color: 0xFFE66D, roughness: 0.9 }),
    kanbanDone: new THREE.MeshStandardMaterial({ color: 0x4ECDC4, roughness: 0.9 }),
    blackPlastic: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 }),
    ceramic: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2 }),
    gymFloor: new THREE.MeshStandardMaterial({ color: 0x2C5F4E, roughness: 0.8 }),
    weightSilver: new THREE.MeshStandardMaterial({ color: 0xC0C0C0, roughness: 0.3, metalness: 0.8 })
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
    // OPTIMIZED: Reduced fog distance
    scene.fog = new THREE.Fog(0x1a1a2e, 30, 80);

    // Camera setup
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 35);
    camera.lookAt(0, 0, 0);

    // OPTIMIZED: Renderer with reduced settings
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; // Faster than PCFSoftShadowMap
    renderer.outputEncoding = THREE.sRGBEncoding;
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
    }, 1000);

    // Start animation loop
    animate();
}

// OPTIMIZED: Simplified lighting
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xFFF8DC, 1.0);
    sunLight.position.set(-10, 40, -30);
    sunLight.castShadow = true;
    // OPTIMIZED: Reduced shadow map size
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -40;
    sunLight.shadow.camera.right = 40;
    sunLight.shadow.camera.top = 40;
    sunLight.shadow.camera.bottom = -40;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Secondary fill light
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
    fillLight.position.set(30, 20, 20);
    scene.add(fillLight);

    // OPTIMIZED: Fewer ceiling lights
    createCeilingLights();
}

function createCeilingLights() {
    const createCeilingLight = (x, z) => {
        const light = new THREE.PointLight(0xFFFFFF, 0.4, 20);
        light.position.set(x, 11.5, z);
        scene.add(light);
        
        // Simple fixture visual
        const fixtureGeo = new THREE.BoxGeometry(3, 0.2, 0.8);
        const fixture = new THREE.Mesh(fixtureGeo, MATERIALS.whitePlastic);
        fixture.position.set(x, 11.8, z);
        scene.add(fixture);
    };

    // OPTIMIZED: Fewer lights (4 instead of grid)
    createCeilingLight(-15, -10);
    createCeilingLight(15, -10);
    createCeilingLight(-15, 10);
    createCeilingLight(15, 10);
}

// OPTIMIZED: Simplified office environment
function createOfficeEnvironment() {
    // Carpet tiles floor - OPTIMIZED: Larger tiles, fewer of them
    createCarpetTiles();

    // Simple ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(60, 60);
    const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0xF0F0F0 });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 12;
    scene.add(ceiling);

    // Walls
    createWalls();
    
    // Simple windows
    createWindows();

    // Workstations
    createWorkstations();

    // Conference room
    createConferenceRoom();

    // Coffee station
    createCoffeeStation();

    // Kanban Board
    createKanbanBoard();

    // Standup Circle
    createStandupCircle();

    // Gym Area - simplified
    createGymArea();
}

// OPTIMIZED: Larger tiles, fewer objects
function createCarpetTiles() {
    const tileSize = 4; // Larger tiles
    const rows = 12;
    const cols = 12;
    const startX = -(rows * tileSize) / 2;
    const startZ = -(cols * tileSize) / 2;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const tileGeo = new THREE.BoxGeometry(tileSize - 0.05, 0.05, tileSize - 0.05);
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

// OPTIMIZED: Simplified walls
function createWalls() {
    const wallHeight = 12;
    const wallThickness = 0.5;
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xF5F5F5, roughness: 0.9 });
    
    // Back wall (solid)
    const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(60, wallHeight, wallThickness),
        wallMaterial
    );
    backWall.position.set(0, wallHeight/2, -30);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Side walls (simplified - just end caps)
    const sideWallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, 60);
    
    const leftWall = new THREE.Mesh(sideWallGeo, wallMaterial);
    leftWall.position.set(-30, wallHeight/2, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeo, wallMaterial);
    rightWall.position.set(30, wallHeight/2, 0);
    scene.add(rightWall);

    // Front wall sections
    const frontWallGeo = new THREE.BoxGeometry(20, wallHeight, wallThickness);
    const frontLeft = new THREE.Mesh(frontWallGeo, wallMaterial);
    frontLeft.position.set(-20, wallHeight/2, 30);
    scene.add(frontLeft);

    const frontRight = new THREE.Mesh(frontWallGeo, wallMaterial);
    frontRight.position.set(20, wallHeight/2, 30);
    scene.add(frontRight);
}

// OPTIMIZED: Simplified windows
function createWindows() {
    const windowPositions = [
        { x: -10, z: 30, rot: 0 },
        { x: 10, z: 30, rot: 0 },
        { x: -30, z: -10, rot: Math.PI / 2 },
        { x: -30, z: 10, rot: Math.PI / 2 },
        { x: 30, z: -10, rot: -Math.PI / 2 },
        { x: 30, z: 10, rot: -Math.PI / 2 }
    ];

    windowPositions.forEach(pos => {
        const frameGroup = new THREE.Group();
        
        // Simple frame
        const frameGeo = new THREE.BoxGeometry(8, 10, 0.3);
        const frame = new THREE.Mesh(frameGeo, MATERIALS.metal);
        frameGroup.add(frame);

        // Glass
        const glassGeo = new THREE.PlaneGeometry(7.5, 9.5);
        const glass = new THREE.Mesh(glassGeo, MATERIALS.glass);
        glass.position.z = 0.16;
        frameGroup.add(glass);

        frameGroup.position.set(pos.x, 5, pos.z);
        frameGroup.rotation.y = pos.rot;
        scene.add(frameGroup);
    });
}

// OPTIMIZED: Simplified workstations
function createWorkstations() {
    // Create three simple workstations
    createGrootWorkstation();
    createFinWorkstation();
    createBettyWorkstation();
}

// OPTIMIZED: Simple desk
function createSimpleDesk(group, width, depth, color) {
    const deskGroup = new THREE.Group();
    
    // Main surface
    const mainGeo = new THREE.BoxGeometry(width, 0.08, depth);
    const deskMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 });
    const mainDesk = new THREE.Mesh(mainGeo, deskMat);
    mainDesk.castShadow = true;
    mainDesk.receiveShadow = true;
    deskGroup.add(mainDesk);

    // Simple legs
    const legGeo = new THREE.BoxGeometry(0.1, 1.5, 0.1);
    const legMat = MATERIALS.metal;
    
    const positions = [
        [-width * 0.4, -0.75, -depth * 0.4],
        [width * 0.4, -0.75, -depth * 0.4],
        [width * 0.4, -0.75, depth * 0.4],
        [-width * 0.4, -0.75, depth * 0.4]
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

// OPTIMIZED: Simple chair
function createSimpleChair() {
    const chairGroup = new THREE.Group();

    // Seat
    const seatGeo = new THREE.BoxGeometry(1, 0.1, 1);
    const seat = new THREE.Mesh(seatGeo, MATERIALS.fabric);
    seat.position.y = 1;
    seat.castShadow = true;
    chairGroup.add(seat);

    // Backrest
    const backGeo = new THREE.BoxGeometry(1, 1, 0.1);
    const back = new THREE.Mesh(backGeo, MATERIALS.fabric);
    back.position.set(0, 1.5, -0.45);
    back.castShadow = true;
    chairGroup.add(back);

    // Simple legs
    const legGeo = new THREE.BoxGeometry(0.08, 1, 0.08);
    const legMat = MATERIALS.metal;
    
    [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]].forEach(pos => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(pos[0], 0.5, pos[1]);
        chairGroup.add(leg);
    });

    return chairGroup;
}

// OPTIMIZED: Minimal desk items
function createMinimalDeskItems(group, deskX, deskZ) {
    // Keyboard
    const kbGeo = new THREE.BoxGeometry(0.8, 0.03, 0.3);
    const kb = new THREE.Mesh(kbGeo, MATERIALS.blackPlastic);
    kb.position.set(deskX, 1.57, deskZ + 0.3);
    kb.castShadow = true;
    group.add(kb);

    // Mouse
    const mouseGeo = new THREE.BoxGeometry(0.1, 0.05, 0.15);
    const mouse = new THREE.Mesh(mouseGeo, MATERIALS.blackPlastic);
    mouse.position.set(deskX + 0.6, 1.55, deskZ + 0.3);
    group.add(mouse);

    // Simple mug
    const mugGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.15, 8);
    const mug = new THREE.Mesh(mugGeo, MATERIALS.ceramic);
    mug.position.set(deskX - 0.6, 1.6, deskZ + 0.4);
    mug.castShadow = true;
    group.add(mug);
}

function createGrootWorkstation() {
    const group = new THREE.Group();
    group.name = 'grootDesk';
    group.userData = { type: 'desk', agent: 'groot', clickable: true };

    // Simple desk
    createSimpleDesk(group, 2.5, 1.2, 0x8B5A2B);

    // Simple monitor
    const monitorGeo = new THREE.BoxGeometry(1.2, 0.8, 0.05);
    const monitor = new THREE.Mesh(monitorGeo, MATERIALS.screenOn);
    monitor.position.set(0, 2.2, -0.5);
    monitor.castShadow = true;
    group.add(monitor);

    // Simple stand
    const standGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
    const stand = new THREE.Mesh(standGeo, MATERIALS.metal);
    stand.position.set(0, 1.85, -0.5);
    group.add(stand);

    // Desk items
    createMinimalDeskItems(group, 0, 0);

    // Position
    group.position.set(-10, 0, -8);
    group.rotation.y = Math.PI / 4;
    
    // Simple chair
    const chair = createSimpleChair();
    chair.position.set(0, 0, 1.2);
    chair.rotation.y = -Math.PI / 4;
    group.add(chair);
    
    scene.add(group);
    officeItems.grootDesk = group;
}

function createFinWorkstation() {
    const group = new THREE.Group();
    group.name = 'finDesk';
    group.userData = { type: 'desk', agent: 'fin', clickable: true };

    // Simple desk
    createSimpleDesk(group, 2.5, 1.2, 0x4A3728);

    // Single monitor
    const monitorGeo = new THREE.BoxGeometry(1.2, 0.8, 0.05);
    const monitor = new THREE.Mesh(monitorGeo, MATERIALS.screenOn);
    monitor.position.set(0, 2.2, -0.5);
    monitor.castShadow = true;
    group.add(monitor);

    // Stand
    const standGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
    const stand = new THREE.Mesh(standGeo, MATERIALS.metal);
    stand.position.set(0, 1.85, -0.5);
    group.add(stand);

    // Desk items
    createMinimalDeskItems(group, 0, 0);

    // Position
    group.position.set(0, 0, -12);
    
    // Chair
    const chair = createSimpleChair();
    chair.position.set(0, 0, 1.2);
    group.add(chair);
    
    scene.add(group);
    officeItems.finDesk = group;
}

function createBettyWorkstation() {
    const group = new THREE.Group();
    group.name = 'bettyDesk';
    group.userData = { type: 'desk', agent: 'betty', clickable: true };

    // Simple white desk
    createSimpleDesk(group, 2.5, 1.2, 0xFFFFFF);

    // Monitor
    const monitorGeo = new THREE.BoxGeometry(1.2, 0.8, 0.05);
    const monitor = new THREE.Mesh(monitorGeo, MATERIALS.screenOn);
    monitor.position.set(0, 2.2, -0.5);
    monitor.castShadow = true;
    group.add(monitor);

    // Stand
    const standGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
    const stand = new THREE.Mesh(standGeo, MATERIALS.chrome);
    stand.position.set(0, 1.85, -0.5);
    group.add(stand);

    // Desk items
    createMinimalDeskItems(group, 0, 0);

    // Position
    group.position.set(10, 0, -8);
    group.rotation.y = -Math.PI / 4;
    
    // Chair
    const chair = createSimpleChair();
    chair.position.set(0, 0, 1.2);
    chair.rotation.y = Math.PI / 4;
    group.add(chair);
    
    scene.add(group);
    officeItems.bettyDesk = group;
}

// OPTIMIZED: Simple conference chair
function createSimpleConferenceChair() {
    const chairGroup = new THREE.Group();

    // Seat
    const seatGeo = new THREE.BoxGeometry(1, 0.1, 1);
    const seat = new THREE.Mesh(seatGeo, MATERIALS.fabric);
    seat.position.y = 0.8;
    seat.castShadow = true;
    chairGroup.add(seat);

    // Backrest
    const backGeo = new THREE.BoxGeometry(1, 1, 0.1);
    const back = new THREE.Mesh(backGeo, MATERIALS.fabric);
    back.position.set(0, 1.3, -0.45);
    chairGroup.add(back);

    // Simple legs
    const legGeo = new THREE.BoxGeometry(0.06, 0.8, 0.06);
    const legMat = MATERIALS.metal;
    
    [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]].forEach(pos => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(pos[0], 0.4, pos[1]);
        chairGroup.add(leg);
    });

    return chairGroup;
}

// OPTIMIZED: Simplified conference room
function createConferenceRoom() {
    const group = new THREE.Group();
    group.name = 'conferenceRoom';
    group.userData = { type: 'meeting', clickable: true };

    // Simple table
    const tableTopGeo = new THREE.BoxGeometry(8, 0.1, 3);
    const tableTop = new THREE.Mesh(tableTopGeo, MATERIALS.darkWood);
    tableTop.position.y = 1.2;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    group.add(tableTop);

    // Simple legs
    const legGeo = new THREE.BoxGeometry(0.2, 1.2, 0.2);
    const legPositions = [[-3.5, -1], [3.5, -1], [-3.5, 1], [3.5, 1]];
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, MATERIALS.metal);
        leg.position.set(pos[0], 0.6, pos[1]);
        group.add(leg);
    });

    // Chairs
    const chairPositions = [
        { x: 0, z: -2, rot: 0 },
        { x: -2.5, z: 0, rot: Math.PI / 2 },
        { x: 2.5, z: 0, rot: -Math.PI / 2 }
    ];

    chairPositions.forEach(pos => {
        const chair = createSimpleConferenceChair();
        chair.position.set(pos.x, 0, pos.z);
        chair.rotation.y = pos.rot;
        group.add(chair);
    });

    // Simple whiteboard on wall
    const boardGeo = new THREE.BoxGeometry(8, 2.5, 0.1);
    const board = new THREE.Mesh(boardGeo, MATERIALS.whiteboard);
    board.position.set(0, 6, -29.4);
    scene.add(board);

    group.position.set(0, 0, 8);
    scene.add(group);
    officeItems.conferenceRoom = group;
}

// OPTIMIZED: Simplified coffee station
function createCoffeeStation() {
    const group = new THREE.Group();
    group.name = 'coffeeStation';
    group.userData = { type: 'coffee', clickable: true };

    // Simple counter
    const counterGeo = new THREE.BoxGeometry(3, 1.2, 1);
    const counter = new THREE.Mesh(counterGeo, MATERIALS.wood);
    counter.position.y = 0.6;
    counter.castShadow = true;
    group.add(counter);

    // Countertop
    const topGeo = new THREE.BoxGeometry(3.2, 0.05, 1.2);
    const top = new THREE.Mesh(topGeo, MATERIALS.whitePlastic);
    top.position.y = 1.22;
    group.add(top);

    // Simple coffee machine
    const machineGeo = new THREE.BoxGeometry(0.8, 0.6, 0.5);
    const machine = new THREE.Mesh(machineGeo, MATERIALS.blackPlastic);
    machine.position.set(-0.8, 1.55, 0);
    group.add(machine);

    // Simple grinder
    const grinderGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 8);
    const grinder = new THREE.Mesh(grinderGeo, MATERIALS.metal);
    grinder.position.set(0.8, 1.55, 0);
    group.add(grinder);

    // Position
    group.position.set(-28, 0, 0);
    group.rotation.y = Math.PI / 2;
    scene.add(group);
    officeItems.coffeeStation = group;
}

// OPTIMIZED: Simplified kanban board
function createKanbanBoard() {
    const group = new THREE.Group();
    group.name = 'kanbanBoard';
    group.userData = { type: 'kanban', clickable: true };

    const boardWidth = 8;
    const boardHeight = 4.5;
    
    // Main board
    const boardGeo = new THREE.BoxGeometry(boardWidth, boardHeight, 0.1);
    const board = new THREE.Mesh(boardGeo, MATERIALS.whiteboard);
    board.position.y = 4;
    board.castShadow = true;
    group.add(board);

    // Simple frame
    const frameGeo = new THREE.BoxGeometry(boardWidth + 0.2, boardHeight + 0.2, 0.15);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 4;
    group.add(frame);

    // Section dividers
    const dividerGeo = new THREE.BoxGeometry(0.05, boardHeight - 0.4, 0.02);
    const dividerMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
    
    [-boardWidth/3, boardWidth/3].forEach(x => {
        const divider = new THREE.Mesh(dividerGeo, dividerMat);
        divider.position.set(x, 4, 0.06);
        group.add(divider);
    });

    // Simple sticky notes (fewer)
    const stickyColors = [MATERIALS.kanbanTodo, MATERIALS.kanbanProgress, MATERIALS.kanbanDone];
    const columns = [-2.5, 0, 2.5];
    
    columns.forEach((colX, colIndex) => {
        for (let row = 0; row < 3; row++) {
            const stickyGeo = new THREE.BoxGeometry(0.8, 0.6, 0.02);
            const sticky = new THREE.Mesh(stickyGeo, stickyColors[colIndex]);
            sticky.position.set(colX, 5 - row * 0.8, 0.06);
            sticky.rotation.z = (Math.random() - 0.5) * 0.1;
            group.add(sticky);
        }
    });

    // Simple stand legs
    const legGeo = new THREE.BoxGeometry(0.15, 4, 0.15);
    const legMat = MATERIALS.metal;
    
    [-3.5, 3.5].forEach(x => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(x, 2, 0);
        group.add(leg);
    });

    // Base
    const baseGeo = new THREE.BoxGeometry(8, 0.1, 1);
    const base = new THREE.Mesh(baseGeo, legMat);
    base.position.y = 0.05;
    group.add(base);

    group.position.set(0, 0, -2);
    scene.add(group);
    kanbanBoard = group;
    officeItems.kanbanBoard = group;
}

// OPTIMIZED: Simple standup circle
function createStandupCircle() {
    const group = new THREE.Group();
    group.name = 'standupCircle';

    // Simple ring
    const ringGeo = new THREE.RingGeometry(2.5, 3, 32, 1, 0, Math.PI);
    const ringMat = new THREE.MeshStandardMaterial({ 
        color: 0x4ECDC4,
        emissive: 0x4ECDC4,
        emissiveIntensity: 0.3,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.rotation.z = Math.PI;
    ring.position.y = 0.03;
    group.add(ring);

    // Position markers
    const markerGeo = new THREE.CircleGeometry(0.3, 16);
    const markerMat = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        side: THREE.DoubleSide
    });
    
    [-2, 0, 2].forEach(x => {
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.rotation.x = -Math.PI / 2;
        marker.position.set(x, 0.04, 0);
        group.add(marker);
    });

    group.position.set(0, 0, 1.5);
    scene.add(group);
    standupCircle = group;
}

// OPTIMIZED: Simplified gym area
function createGymArea() {
    const group = new THREE.Group();
    group.name = 'gymArea';
    group.userData = { type: 'gym', clickable: true };

    // Simple floor mat
    const matGeo = new THREE.BoxGeometry(6, 0.05, 6);
    const mat = new THREE.Mesh(matGeo, MATERIALS.gymFloor);
    mat.position.y = 0.025;
    mat.receiveShadow = true;
    group.add(mat);

    // Simple treadmill
    const treadGroup = new THREE.Group();
    const treadBase = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.2, 3),
        MATERIALS.blackPlastic
    );
    treadBase.position.y = 0.1;
    treadGroup.add(treadBase);
    
    const treadConsole = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.5, 0.2),
        MATERIALS.blackPlastic
    );
    treadConsole.position.set(0, 0.5, -1.2);
    treadGroup.add(treadConsole);
    
    treadGroup.position.set(-1.5, 0, 0);
    treadGroup.rotation.y = Math.PI / 2;
    group.add(treadGroup);

    // Simple dumbbell rack
    const rackGroup = new THREE.Group();
    const rack = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1, 0.5),
        MATERIALS.metal
    );
    rack.position.y = 0.5;
    rackGroup.add(rack);
    
    // Few dumbbells
    for (let i = 0; i < 3; i++) {
        const dbGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8);
        const db = new THREE.Mesh(dbGeo, MATERIALS.weightSilver);
        db.rotation.z = Math.PI / 2;
        db.position.set(-0.6 + i * 0.6, 0.8, 0);
        rackGroup.add(db);
    }
    
    rackGroup.position.set(1.5, 0, 0);
    group.add(rackGroup);

    // Simple bench
    const bench = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.5, 2.5),
        MATERIALS.blackPlastic
    );
    bench.position.set(0, 0.25, 2);
    group.add(bench);

    group.position.set(10, 0, -10);
    scene.add(group);
    officeItems.gymArea = group;
}

// OPTIMIZED: Simplified agents
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
        console.log(`[AvatarWorld] Created agent ${key}`);
    });
    
    window.agents = agents;
    window.AGENT_CONFIGS = AGENT_CONFIGS;
    window.scene = scene;
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

// OPTIMIZED: Simplified Groot
function createGrootAvatar(group, config) {
    // Simple body
    const bodyGeo = new THREE.CylinderGeometry(0.4, 0.5, 1.8, 6); // Reduced segments
    const bodyMat = new THREE.MeshStandardMaterial({ color: config.color, roughness: 0.9 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.9;
    body.castShadow = true;
    group.add(body);

    // Simple head
    const headGeo = new THREE.CylinderGeometry(0.5, 0.4, 0.8, 6);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.y = 2.2;
    head.castShadow = true;
    group.add(head);

    // Simple eyes
    const eyeGeo = new THREE.SphereGeometry(0.1, 6, 6);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.15, 2.3, 0.4);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.15, 2.3, 0.4);
    group.add(rightEye);

    // Simple arms
    const armGeo = new THREE.CylinderGeometry(0.1, 0.12, 1, 6);
    
    const leftArm = new THREE.Mesh(armGeo, bodyMat);
    leftArm.position.set(-0.6, 1.4, 0);
    leftArm.rotation.z = Math.PI / 4;
    group.add(leftArm);
    group.userData.leftArm = leftArm;
    
    const rightArm = new THREE.Mesh(armGeo, bodyMat);
    rightArm.position.set(0.6, 1.4, 0);
    rightArm.rotation.z = -Math.PI / 4;
    group.add(rightArm);
    group.userData.rightArm = rightArm;

    // Simple leaves
    const leafGeo = new THREE.SphereGeometry(0.2, 4, 4);
    const leafMat = new THREE.MeshStandardMaterial({ color: config.secondaryColor });
    
    for (let i = 0; i < 4; i++) {
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        const angle = (i / 4) * Math.PI * 2;
        leaf.position.set(Math.cos(angle) * 0.3, 2.7, Math.sin(angle) * 0.3);
        leaf.scale.setScalar(0.5);
        group.add(leaf);
    }

    // Simple legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.8, 6);
    
    const leftLeg = new THREE.Mesh(legGeo, bodyMat);
    leftLeg.position.set(-0.25, 0.4, 0);
    group.add(leftLeg);
    group.userData.leftLeg = leftLeg;
    
    const rightLeg = new THREE.Mesh(legGeo, bodyMat);
    rightLeg.position.set(0.25, 0.4, 0);
    group.add(rightLeg);
    group.userData.rightLeg = rightLeg;
}

// OPTIMIZED: Simplified Fin
function createFinAvatar(group, config) {
    // Simple body
    const bodyGeo = new THREE.BoxGeometry(0.7, 1.2, 0.35);
    const bodyMat = new THREE.MeshStandardMaterial({ color: config.color });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.4;
    body.castShadow = true;
    group.add(body);

    // Simple head
    const headGeo = new THREE.BoxGeometry(0.5, 0.6, 0.5);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xFFDBAC });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.3;
    group.add(head);

    // Simple hair
    const hairGeo = new THREE.BoxGeometry(0.55, 0.2, 0.55);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 2.6;
    group.add(hair);

    // Simple arms
    const armGeo = new THREE.BoxGeometry(0.18, 1, 0.18);
    
    const leftArm = new THREE.Mesh(armGeo, bodyMat);
    leftArm.position.set(-0.55, 1.4, 0);
    group.add(leftArm);
    group.userData.leftArm = leftArm;
    
    const rightArm = new THREE.Mesh(armGeo, bodyMat);
    rightArm.position.set(0.55, 1.4, 0);
    group.add(rightArm);
    group.userData.rightArm = rightArm;

    // Simple legs
    const legGeo = new THREE.BoxGeometry(0.22, 1, 0.25);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.18, 0.5, 0);
    group.add(leftLeg);
    group.userData.leftLeg = leftLeg;
    
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.18, 0.5, 0);
    group.add(rightLeg);
    group.userData.rightLeg = rightLeg;
}

// OPTIMIZED: Simplified Betty
function createBettyAvatar(group, config) {
    // Simple body
    const bodyGeo = new THREE.BoxGeometry(0.6, 1, 0.4);
    const bodyMat = new THREE.MeshStandardMaterial({ color: config.color });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.3;
    body.castShadow = true;
    group.add(body);

    // Simple head
    const headGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
    const headMat = new THREE.MeshStandardMaterial({ color: config.secondaryColor });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.2;
    group.add(head);

    // Simple hair
    const hairGeo = new THREE.BoxGeometry(0.6, 0.25, 0.6);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0xFFB6C1 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 2.55;
    group.add(hair);

    // Simple arms
    const armGeo = new THREE.BoxGeometry(0.18, 0.9, 0.18);
    
    const leftArm = new THREE.Mesh(armGeo, bodyMat);
    leftArm.position.set(-0.5, 1.3, 0);
    group.add(leftArm);
    group.userData.leftArm = leftArm;
    
    const rightArm = new THREE.Mesh(armGeo, bodyMat);
    rightArm.position.set(0.5, 1.3, 0);
    group.add(rightArm);
    group.userData.rightArm = rightArm;

    // Simple legs
    const legGeo = new THREE.BoxGeometry(0.2, 0.8, 0.2);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
    
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.15, 0.4, 0);
    group.add(leftLeg);
    group.userData.leftLeg = leftLeg;
    
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.15, 0.4, 0);
    group.add(rightLeg);
    group.userData.rightLeg = rightLeg;
}

function createNameLabel(group, name) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, 256, 64);
    
    context.font = 'bold 32px Arial';
    context.fillStyle = '#90EE90';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(name, 128, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.position.y = 3;
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
        moveAgentToZone('groot', 'grootChair');
        moveAgentToZone('fin', 'finChair');
        moveAgentToZone('betty', 'bettyChair');
        
        setTimeout(() => {
            agents.groot.position.set(0, -0.4, 5.5);
            agents.groot.rotation.y = 0;
            agents.groot.userData.isSitting = true;
            
            agents.fin.position.set(-3, -0.4, 8);
            agents.fin.rotation.y = Math.PI / 2;
            agents.fin.userData.isSitting = true;
            
            agents.betty.position.set(3, -0.4, 8);
            agents.betty.rotation.y = -Math.PI / 2;
            agents.betty.userData.isSitting = true;
            
            Object.values(agents).forEach(agent => {
                agent.userData.isWalking = false;
                agent.userData.action = null;
            });
        }, 2000);
    } else {
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
        isStandupMode = false;
        endStandup();
    } else {
        isStandupMode = true;
        startStandup();
    }
}

function startStandup() {
    const standupPositions = [
        { x: -2, z: 1.5, rot: Math.PI },
        { x: 0, z: 1.2, rot: Math.PI },
        { x: 2, z: 1.5, rot: Math.PI }
    ];

    const agentKeys = Object.keys(agents);
    agentKeys.forEach((key, i) => {
        const pos = standupPositions[i];
        const agent = agents[key];
        agent.userData.targetPosition = { x: pos.x, y: 0, z: pos.z, rot: pos.rot };
        agent.userData.isWalking = true;
    });

    setTimeout(() => {
        agentsDiscuss();
    }, 2500);
}

function endStandup() {
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

function agentsDiscuss() {
    if (!isStandupMode) return;

    Object.keys(agents).forEach((key, i) => {
        const agent = agents[key];
        
        setTimeout(() => {
            if (!isStandupMode) return;
            
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

    setTimeout(() => {
        if (isStandupMode) {
            toggleStandupMode();
            const btn = document.getElementById('btn-standup');
            if (btn) btn.textContent = '📋 Start Stand-up';
        }
    }, 8000);
}

function animateWalk(agent, time) {
    const walkSpeed = 5;
    const walkRange = 0.3;
    
    agent.position.y = agent.userData.originalY + Math.abs(Math.sin(time * walkSpeed)) * 0.1;
    
    if (agent.userData.leftArm) {
        agent.userData.leftArm.rotation.x = Math.sin(time * walkSpeed) * walkRange;
    }
    if (agent.userData.rightArm) {
        agent.userData.rightArm.rotation.x = -Math.sin(time * walkSpeed) * walkRange;
    }
    
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
    
    agent.rotation.y = Math.sin(time * danceSpeed * 0.5) * 0.5;
    agent.position.y = agent.userData.originalY + Math.abs(Math.sin(time * danceSpeed)) * 0.3;
    
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
    
    if (agent.userData.leftArm) agent.userData.leftArm.rotation.set(0, 0, 0);
    if (agent.userData.rightArm) agent.userData.rightArm.rotation.set(0, 0, 0);
    if (agent.userData.leftLeg) agent.userData.leftLeg.rotation.set(0, 0, 0);
    if (agent.userData.rightLeg) agent.userData.rightLeg.rotation.set(0, 0, 0);
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
        case 'kanban':
            nameEl.textContent = 'Kanban Board';
            descEl.textContent = 'Daily stand-up board - TO DO, IN PROGRESS, DONE';
            break;
        case 'meeting':
            nameEl.textContent = 'Conference Room';
            descEl.textContent = 'Click "Meeting Mode" to gather all agents here';
            break;
        case 'coffee':
            nameEl.textContent = 'Coffee Station';
            descEl.textContent = 'Fresh espresso and pastries!';
            break;
        case 'gym':
            nameEl.textContent = 'Gym Zone';
            descEl.textContent = 'Office gym with treadmill and weights';
            break;
    }
}

function selectAgent(agentId) {
    selectedAgent = agentId;
    
    document.querySelectorAll('.agent-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-agent="${agentId}"]`).classList.add('active');
    
    const panel = document.getElementById('interaction-panel');
    panel.style.display = 'block';
    document.getElementById('selected-agent-name').textContent = AGENT_CONFIGS[agentId].name;
    document.getElementById('selected-agent-desc').textContent = AGENT_CONFIGS[agentId].description;
    
    const agent = agents[agentId];
    const targetPos = agent.position.clone();
    
    const startPos = camera.position.clone();
    const endPos = new THREE.Vector3(targetPos.x + 5, targetPos.y + 4, targetPos.z + 8);
    
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
        gymArea: { x: 10, y: 12, z: 5, targetX: 10, targetY: 0, targetZ: -10 }
    };
    
    const loc = locations[locationName];
    if (!loc) return;
    
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const endPos = new THREE.Vector3(loc.x, loc.y, loc.z);
    const endTarget = new THREE.Vector3(loc.targetX, loc.targetY, loc.targetZ);
    
    let progress = 0;
    const duration = 1000;
    const startTime = Date.now();
    
    function animateCamera() {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        
        camera.position.lerpVectors(startPos, endPos, ease);
        controls.target.lerpVectors(startTarget, endTarget, ease);
        controls.update();
        
        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        }
    }
    
    animateCamera();
}

function setupUIEvents() {
    document.querySelectorAll('.agent-card').forEach(card => {
        card.addEventListener('click', () => {
            selectAgent(card.dataset.agent);
        });
    });
    
    document.querySelectorAll('.location-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const location = btn.dataset.location;
            teleportToLocation(location);
        });
    });
    
    const btnWave = document.getElementById('btn-wave');
    if (btnWave) {
        btnWave.addEventListener('click', () => {
            if (selectedAgent) {
                agents[selectedAgent].userData.action = 'wave';
                setTimeout(() => {
                    agents[selectedAgent].userData.action = null;
                    resetAnimation(agents[selectedAgent]);
                }, 2000);
            }
        });
    }
    
    const btnDance = document.getElementById('btn-dance');
    if (btnDance) {
        btnDance.addEventListener('click', () => {
            if (selectedAgent) {
                agents[selectedAgent].userData.action = 'dance';
            }
        });
    }
    
    const btnFollow = document.getElementById('btn-follow');
    if (btnFollow) {
        btnFollow.addEventListener('click', () => {
            if (selectedAgent) {
                const zones = Object.keys(OFFICE_ZONES);
                const randomZone = zones[Math.floor(Math.random() * zones.length)];
                moveAgentToZone(selectedAgent, randomZone);
            }
        });
    }
    
    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (selectedAgent) {
                moveAgentToZone(selectedAgent, AGENT_CONFIGS[selectedAgent].workstation);
            } else {
                toggleMeetingMode();
                if (isMeetingMode) isMeetingMode = false;
            }
        });
    }

    const meetingBtn = document.getElementById('btn-meeting');
    if (meetingBtn) {
        meetingBtn.addEventListener('click', () => {
            toggleMeetingMode();
            meetingBtn.textContent = isMeetingMode ? '🔙 Return to Work' : '📅 Meeting Mode';
        });
    }

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
    
    controls.update();
    
    // Animate agents
    Object.keys(agents).forEach(key => {
        const agent = agents[key];
        const action = agent.userData.action;
        
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
            // Idle
            agent.position.y = agent.userData.originalY + Math.sin(time * 2 + agent.userData.walkOffset) * 0.05;
        }
        
        if (agent.userData.nameLabel) {
            agent.userData.nameLabel.material.rotation = 0;
        }
    });
    
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
            '<div style="color:red;padding:20px;"><h3>Error</h3><p>' + err.message + '</p></div>';
    }
});
