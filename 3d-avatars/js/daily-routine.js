/**
 * Daily Routine System for 3D Office
 * 6-phase automated routine for all 4 agents
 */

// Daily Routine State
let dailyRoutine = {
    isActive: false,
    currentPhase: 0,
    phaseStartTime: 0,
    agents: ['groot', 'fin', 'betty', 'smith'],
    phaseDuration: 150000, // 2.5 minutes per phase (in ms)
    checkInterval: null,
    isPaused: false
};

// Phase Definitions
const DAILY_PHASES = [
    {
        name: 'Morning Standup',
        description: 'All agents assemble at Kanban board',
        locations: {
            groot: { zone: 'kanbanBoard', offset: { x: -2, z: 2 }, rot: Math.PI },
            fin: { zone: 'kanbanBoard', offset: { x: 0, z: 2.5 }, rot: Math.PI },
            betty: { zone: 'kanbanBoard', offset: { x: 2, z: 2 }, rot: Math.PI },
            smith: { zone: 'kanbanBoard', offset: { x: 0, z: 3.5 }, rot: Math.PI }
        },
        action: 'stand',
        duration: 150000 // 2.5 minutes
    },
    {
        name: 'Desk Work',
        description: 'Agents go to their individual desks',
        locations: {
            groot: { zone: 'grootDesk', offset: { x: 0, z: 1.5 }, rot: null }, // Use zone rot
            fin: { zone: 'finDesk', offset: { x: 0, z: 1.5 }, rot: null },
            betty: { zone: 'bettyDesk', offset: { x: 0, z: 1.5 }, rot: null },
            smith: { zone: 'smithDesk', offset: { x: 0, z: 1.5 }, rot: null }
        },
        action: 'sit',
        duration: 150000
    },
    {
        name: 'Team Meeting',
        description: 'Conference room - sitting around table',
        locations: {
            groot: { zone: 'grootChair', offset: { x: 0, z: 0 }, rot: null },
            fin: { zone: 'finChair', offset: { x: 0, z: 0 }, rot: null },
            betty: { zone: 'bettyChair', offset: { x: 0, z: 0 }, rot: null },
            smith: { zone: 'conferenceTable', offset: { x: 2, z: 0 }, rot: -Math.PI / 2 }
        },
        action: 'sit',
        duration: 180000 // 3 minutes
    },
    {
        name: 'Gym Session',
        description: 'Workout time at the gym',
        locations: {
            groot: { zone: 'treadmill', offset: { x: 0, z: 0 }, rot: -Math.PI / 2 },
            fin: { zone: 'dumbbellRack', offset: { x: 0.5, z: 0 }, rot: -Math.PI / 2 },
            betty: { zone: 'exerciseMat', offset: { x: 0, z: 0 }, rot: Math.PI / 4 },
            smith: { zone: 'benchPress', offset: { x: 0, z: 1 }, rot: 0 }
        },
        action: 'exercise',
        duration: 150000
    },
    {
        name: 'Coffee Break',
        description: 'Coffee station refreshment',
        locations: {
            groot: { zone: 'coffeeStation', offset: { x: -1, z: 0.5 }, rot: Math.PI / 2 },
            fin: { zone: 'coffeeStation', offset: { x: 0, z: 0.5 }, rot: Math.PI / 2 },
            betty: { zone: 'coffeeStation', offset: { x: 1, z: 0.5 }, rot: Math.PI / 2 },
            smith: { zone: 'waterCooler', offset: { x: 0, z: 0.5 }, rot: 0 }
        },
        action: 'stand',
        duration: 120000 // 2 minutes
    },
    {
        name: 'Back to Work',
        description: 'Return to desks',
        locations: {
            groot: { zone: 'grootDesk', offset: { x: 0, z: 1.5 }, rot: null },
            fin: { zone: 'finDesk', offset: { x: 0, z: 1.5 }, rot: null },
            betty: { zone: 'bettyDesk', offset: { x: 0, z: 1.5 }, rot: null },
            smith: { zone: 'smithDesk', offset: { x: 0, z: 1.5 }, rot: null }
        },
        action: 'sit',
        duration: 150000
    }
];

// Agent state tracking for routine
let routineAgentStates = {};

/**
 * Initialize Daily Routine system
 */
function initDailyRoutine() {
    console.log('[DailyRoutine] Initializing...');
    
    // Initialize agent states
    dailyRoutine.agents.forEach(agentId => {
        routineAgentStates[agentId] = {
            isMoving: false,
            targetPos: null,
            startPos: null,
            moveProgress: 0,
            moveSpeed: 0,
            currentAction: null,
            sitProgress: 0,
            standProgress: 0,
            exercisePhase: 0
        };
    });
    
    // Create UI panel
    createRoutinePanel();
    
    // Start animation loop integration
    console.log('[DailyRoutine] Initialized successfully');
}

/**
 * Create the routine control panel
 */
function createRoutinePanel() {
    const panel = document.createElement('div');
    panel.id = 'routine-panel';
    panel.innerHTML = `
        <div class="routine-header">
            <span class="routine-icon">📅</span>
            <span class="routine-title">Daily Routine</span>
        </div>
        <div class="routine-status">
            <div class="phase-indicator">
                <span class="phase-label">Phase:</span>
                <span class="phase-name" id="routine-phase-name">Not Started</span>
            </div>
            <div class="phase-progress">
                <div class="progress-bar" id="routine-progress-bar"></div>
            </div>
            <div class="time-remaining" id="routine-time-remaining">--:--</div>
        </div>
        <div class="routine-controls">
            <button id="btn-start-routine" class="routine-btn primary">▶️ Start Daily Routine</button>
            <button id="btn-pause-routine" class="routine-btn" disabled>⏸️ Pause</button>
            <button id="btn-skip-phase" class="routine-btn" disabled>⏭️ Skip Phase</button>
            <button id="btn-stop-routine" class="routine-btn danger" disabled>⏹️ Stop</button>
        </div>
        <div class="phase-list">
            <div class="phase-item" data-phase="0">1. Morning Standup</div>
            <div class="phase-item" data-phase="1">2. Desk Work</div>
            <div class="phase-item" data-phase="2">3. Team Meeting</div>
            <div class="phase-item" data-phase="3">4. Gym Session</div>
            <div class="phase-item" data-phase="4">5. Coffee Break</div>
            <div class="phase-item" data-phase="5">6. Back to Work</div>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        #routine-panel {
            position: fixed;
            top: 10px;
            right: 10px;
            width: 280px;
            background: rgba(26, 26, 46, 0.95);
            border: 2px solid #90EE90;
            border-radius: 12px;
            padding: 15px;
            color: #eee;
            font-family: 'Courier New', monospace;
            z-index: 10000 !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        .routine-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #333;
        }
        .routine-icon {
            font-size: 24px;
        }
        .routine-title {
            font-size: 16px;
            font-weight: bold;
            color: #90EE90;
        }
        .routine-status {
            margin-bottom: 15px;
        }
        .phase-indicator {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .phase-label {
            color: #888;
        }
        .phase-name {
            color: #90EE90;
            font-weight: bold;
        }
        .phase-progress {
            height: 6px;
            background: #333;
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 8px;
        }
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #90EE90, #00FF00);
            width: 0%;
            transition: width 0.3s ease;
        }
        .time-remaining {
            text-align: center;
            font-size: 14px;
            color: #888;
        }
        .routine-controls {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 15px;
        }
        .routine-btn {
            flex: 1;
            min-width: 120px;
            padding: 8px 12px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-family: inherit;
            transition: all 0.2s;
        }
        .routine-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .routine-btn.primary {
            background: linear-gradient(135deg, #90EE90, #228B22);
            color: #000;
            font-weight: bold;
        }
        .routine-btn.primary:hover:not(:disabled) {
            background: linear-gradient(135deg, #a0FFA0, #32A052);
        }
        .routine-btn.danger {
            background: linear-gradient(135deg, #FF6B6B, #CC0000);
            color: #fff;
        }
        .routine-btn:not(.primary):not(.danger) {
            background: #444;
            color: #eee;
        }
        .routine-btn:not(.primary):not(.danger):hover:not(:disabled) {
            background: #555;
        }
        .phase-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .phase-item {
            padding: 6px 10px;
            background: #2a2a3e;
            border-radius: 4px;
            font-size: 11px;
            color: #888;
            transition: all 0.3s;
        }
        .phase-item.active {
            background: linear-gradient(90deg, #90EE90, #228B22);
            color: #000;
            font-weight: bold;
        }
        .phase-item.completed {
            color: #90EE90;
            border-left: 3px solid #90EE90;
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(panel);
    
    // Add event listeners
    document.getElementById('btn-start-routine').addEventListener('click', startDailyRoutine);
    document.getElementById('btn-pause-routine').addEventListener('click', pauseDailyRoutine);
    document.getElementById('btn-skip-phase').addEventListener('click', skipCurrentPhase);
    document.getElementById('btn-stop-routine').addEventListener('click', stopDailyRoutine);
    
    console.log('[DailyRoutine] Panel created and added to DOM');
}

/**
 * Start the daily routine
 */
function startDailyRoutine() {
    if (dailyRoutine.isActive) return;
    
    console.log('[DailyRoutine] Starting daily routine...');
    dailyRoutine.isActive = true;
    dailyRoutine.currentPhase = 0;
    dailyRoutine.isPaused = false;
    
    // Update UI
    updateRoutineUI('start');
    
    // Begin first phase
    startPhase(0);
    
    // Start the check loop
    dailyRoutine.checkInterval = setInterval(checkRoutineProgress, 100);
}

/**
 * Start a specific phase
 */
function startPhase(phaseIndex) {
    if (phaseIndex >= DAILY_PHASES.length) {
        // Routine complete - loop back to start
        dailyRoutine.currentPhase = 0;
        phaseIndex = 0;
    }
    
    const phase = DAILY_PHASES[phaseIndex];
    dailyRoutine.currentPhase = phaseIndex;
    dailyRoutine.phaseStartTime = Date.now();
    
    console.log(`[DailyRoutine] Starting Phase ${phaseIndex + 1}: ${phase.name}`);
    
    // Update UI
    document.getElementById('routine-phase-name').textContent = phase.name;
    updatePhaseList(phaseIndex);
    
    // Move agents to their positions
    dailyRoutine.agents.forEach(agentId => {
        const locConfig = phase.locations[agentId];
        if (locConfig) {
            const zone = OFFICE_ZONES[locConfig.zone];
            if (zone) {
                const targetPos = {
                    x: zone.x + locConfig.offset.x,
                    y: zone.y,
                    z: zone.z + locConfig.offset.z,
                    rot: locConfig.rot !== null ? locConfig.rot : zone.rot
                };
                
                // Start movement
                startAgentMovement(agentId, targetPos, phase.action);
            }
        }
    });
    
    // Camera focus on the main activity area
    focusCameraOnPhase(phaseIndex);
}

/**
 * Start agent movement with walking animation
 */
function startAgentMovement(agentId, targetPos, action) {
    const agent = agents[agentId];
    if (!agent) return;
    
    const state = routineAgentStates[agentId];
    state.startPos = agent.position.clone();
    state.targetPos = targetPos;
    state.isMoving = true;
    state.moveProgress = 0;
    state.currentAction = action;
    
    // Calculate distance for speed
    const dx = targetPos.x - state.startPos.x;
    const dz = targetPos.z - state.startPos.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    // Speed: units per second (agents walk at ~3 units/sec)
    state.moveSpeed = 3 / distance; // Progress per second
    
    console.log(`[DailyRoutine] Moving ${agentId} to ${targetPos.x}, ${targetPos.z} for ${action}`);
}

/**
 * Check routine progress and advance phases
 */
function checkRoutineProgress() {
    if (!dailyRoutine.isActive || dailyRoutine.isPaused) return;
    
    const now = Date.now();
    const phase = DAILY_PHASES[dailyRoutine.currentPhase];
    const elapsed = now - dailyRoutine.phaseStartTime;
    const progress = Math.min(elapsed / phase.duration, 1);
    
    // Update progress bar
    document.getElementById('routine-progress-bar').style.width = `${progress * 100}%`;
    
    // Update time remaining
    const remaining = Math.max(0, phase.duration - elapsed);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    document.getElementById('routine-time-remaining').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Check if phase is complete
    if (elapsed >= phase.duration) {
        // Check if all agents have finished moving
        const allReady = dailyRoutine.agents.every(agentId => {
            const state = routineAgentStates[agentId];
            return !state.isMoving;
        });
        
        if (allReady) {
            // Advance to next phase
            const nextPhase = dailyRoutine.currentPhase + 1;
            if (nextPhase >= DAILY_PHASES.length) {
                // Complete - restart loop
                console.log('[DailyRoutine] Routine complete - restarting loop');
                startPhase(0);
            } else {
                startPhase(nextPhase);
            }
        }
    }
}

/**
 * Update animations for daily routine
 * Called from main animation loop
 */
function updateDailyRoutineAnimations() {
    if (!dailyRoutine.isActive) return;
    
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();
    const phase = DAILY_PHASES[dailyRoutine.currentPhase];
    
    dailyRoutine.agents.forEach(agentId => {
        const agent = agents[agentId];
        const state = routineAgentStates[agentId];
        if (!agent || !state) return;
        
        // Handle movement
        if (state.isMoving && state.targetPos) {
            state.moveProgress += state.moveSpeed * delta;
            
            if (state.moveProgress >= 1) {
                // Arrived at destination
                state.moveProgress = 1;
                state.isMoving = false;
                agent.position.set(
                    state.targetPos.x,
                    state.targetPos.y,
                    state.targetPos.z
                );
                agent.rotation.y = state.targetPos.rot;
                
                // Start action (sit/stand/exercise)
                if (state.currentAction === 'sit') {
                    startSitting(agent, agentId);
                } else if (state.currentAction === 'stand') {
                    startStanding(agent, agentId);
                } else if (state.currentAction === 'exercise') {
                    startExercising(agent, agentId);
                }
            } else {
                // Interpolate position
                const t = easeInOutCubic(state.moveProgress);
                agent.position.x = lerp(state.startPos.x, state.targetPos.x, t);
                agent.position.z = lerp(state.startPos.z, state.targetPos.z, t);
                
                // Face direction of movement
                const dx = state.targetPos.x - state.startPos.x;
                const dz = state.targetPos.z - state.startPos.z;
                agent.rotation.y = Math.atan2(dx, dz);
                
                // Walking animation
                animateAgentWalking(agent, time, agentId);
            }
        } else {
            // Handle current action animation
            switch (state.currentAction) {
                case 'sit':
                    animateSitting(agent, agentId, delta);
                    break;
                case 'stand':
                    animateStanding(agent, agentId, delta);
                    break;
                case 'exercise':
                    animateExercising(agent, agentId, time, delta);
                    break;
                default:
                    // Idle animation
                    animateIdle(agent, time, agentId);
            }
        }
    });
}

/**
 * Animate agent walking
 */
function animateAgentWalking(agent, time, agentId) {
    const walkSpeed = 8;
    const walkRange = 0.4;
    const agentOffset = agent.userData.walkOffset || 0;
    
    // Bobbing motion
    agent.position.y = agent.userData.originalY + Math.abs(Math.sin((time + agentOffset) * walkSpeed)) * 0.15;
    
    // Arm swinging
    if (agent.userData.leftArm) {
        agent.userData.leftArm.rotation.x = Math.sin((time + agentOffset) * walkSpeed) * walkRange;
    }
    if (agent.userData.rightArm) {
        agent.userData.rightArm.rotation.x = -Math.sin((time + agentOffset) * walkSpeed) * walkRange;
    }
    
    // Leg movement
    if (agent.userData.leftLeg) {
        agent.userData.leftLeg.rotation.x = -Math.sin((time + agentOffset) * walkSpeed) * walkRange * 0.5;
    }
    if (agent.userData.rightLeg) {
        agent.userData.rightLeg.rotation.x = Math.sin((time + agentOffset) * walkSpeed) * walkRange * 0.5;
    }
}

/**
 * Start sitting transition
 */
function startSitting(agent, agentId) {
    const state = routineAgentStates[agentId];
    state.sitProgress = 0;
    agent.userData.isSitting = true;
    console.log(`[DailyRoutine] ${agentId} starting to sit`);
}

/**
 * Animate sitting transition
 */
function animateSitting(agent, agentId, delta) {
    const state = routineAgentStates[agentId];
    
    if (state.sitProgress < 1) {
        state.sitProgress += delta * 2; // 0.5 seconds to sit
        const t = easeInOutCubic(Math.min(state.sitProgress, 1));
        
        // Lower position
        const sitHeight = -0.4;
        agent.position.y = lerp(agent.userData.originalY, agent.userData.originalY + sitHeight, t);
        
        // Adjust arms
        if (agent.userData.leftArm) {
            agent.userData.leftArm.rotation.z = lerp(0, 0.2, t);
        }
        if (agent.userData.rightArm) {
            agent.userData.rightArm.rotation.z = lerp(0, -0.2, t);
        }
    } else {
        // Fully seated - subtle idle
        agent.position.y = agent.userData.originalY - 0.4 + Math.sin(clock.getElapsedTime() * 2) * 0.02;
    }
}

/**
 * Start standing transition
 */
function startStanding(agent, agentId) {
    const state = routineAgentStates[agentId];
    state.standProgress = 0;
    agent.userData.isSitting = false;
    
    // Reset position if was sitting
    agent.position.y = agent.userData.originalY;
    console.log(`[DailyRoutine] ${agentId} standing up`);
}

/**
 * Animate standing transition
 */
function animateStanding(agent, agentId, delta) {
    const state = routineAgentStates[agentId];
    
    if (state.standProgress < 1) {
        state.standProgress += delta * 2;
        const t = easeInOutCubic(Math.min(state.standProgress, 1));
        
        // Raise from sitting
        const standHeight = agent.userData.originalY;
        agent.position.y = lerp(agent.userData.originalY - 0.4, standHeight, t);
        
        // Reset arms
        if (agent.userData.leftArm) {
            agent.userData.leftArm.rotation.z = lerp(0.2, 0, t);
        }
        if (agent.userData.rightArm) {
            agent.userData.rightArm.rotation.z = lerp(-0.2, 0, t);
        }
    } else {
        // Standing idle
        animateIdle(agent, clock.getElapsedTime(), agentId);
    }
}

/**
 * Start exercising
 */
function startExercising(agent, agentId) {
    const state = routineAgentStates[agentId];
    state.exercisePhase = 0;
    agent.userData.isExercising = true;
    console.log(`[DailyRoutine] ${agentId} starting exercise`);
}

/**
 * Animate exercising at gym
 */
function animateExercising(agent, agentId, time, delta) {
    const state = routineAgentStates[agentId];
    const exerciseType = getAgentExerciseType(agentId);
    
    switch (exerciseType) {
        case 'treadmill':
            // Running in place
            const runSpeed = 12;
            agent.position.y = agent.userData.originalY + Math.abs(Math.sin(time * runSpeed)) * 0.1;
            if (agent.userData.leftArm) {
                agent.userData.leftArm.rotation.x = Math.sin(time * runSpeed) * 0.8;
            }
            if (agent.userData.rightArm) {
                agent.userData.rightArm.rotation.x = -Math.sin(time * runSpeed) * 0.8;
            }
            if (agent.userData.leftLeg) {
                agent.userData.leftLeg.rotation.x = -Math.sin(time * runSpeed) * 0.6;
            }
            if (agent.userData.rightLeg) {
                agent.userData.rightLeg.rotation.x = Math.sin(time * runSpeed) * 0.6;
            }
            break;
            
        case 'dumbbells':
            // Lifting dumbbells
            const liftSpeed = 2;
            const liftPhase = (time * liftSpeed) % (Math.PI * 2);
            if (agent.userData.leftArm) {
                agent.userData.leftArm.rotation.z = Math.PI * 0.7 + Math.sin(liftPhase) * 0.3;
            }
            if (agent.userData.rightArm) {
                agent.userData.rightArm.rotation.z = -Math.PI * 0.7 - Math.sin(liftPhase) * 0.3;
            }
            break;
            
        case 'yoga':
            // Stretching/yoga poses
            const yogaSpeed = 0.5;
            if (agent.userData.leftArm) {
                agent.userData.leftArm.rotation.z = Math.sin(time * yogaSpeed) * 0.5;
            }
            if (agent.userData.rightArm) {
                agent.userData.rightArm.rotation.z = -Math.sin(time * yogaSpeed) * 0.5;
            }
            // Breathing motion
            agent.scale.y = 1 + Math.sin(time * 2) * 0.02;
            break;
            
        case 'bench':
            // Bench press motion
            const pressSpeed = 1.5;
            const pressPhase = (time * pressSpeed) % (Math.PI * 2);
            if (agent.userData.leftArm) {
                agent.userData.leftArm.rotation.x = -Math.abs(Math.sin(pressPhase)) * 0.8;
            }
            if (agent.userData.rightArm) {
                agent.userData.rightArm.rotation.x = -Math.abs(Math.sin(pressPhase)) * 0.8;
            }
            // Lying down
            agent.position.y = agent.userData.originalY + 0.3;
            break;
    }
}

/**
 * Get exercise type for each agent
 */
function getAgentExerciseType(agentId) {
    const types = {
        groot: 'treadmill',
        fin: 'dumbbells',
        betty: 'yoga',
        smith: 'bench'
    };
    return types[agentId] || 'yoga';
}

/**
 * Animate idle standing
 */
function animateIdle(agent, time, agentId) {
    const agentOffset = agent.userData.walkOffset || 0;
    
    // Subtle breathing
    agent.position.y = agent.userData.originalY + Math.sin((time + agentOffset) * 2) * 0.03;
    
    // Slight arm movement
    if (agent.userData.leftArm) {
        agent.userData.leftArm.rotation.z = Math.sin((time + agentOffset) * 1.5) * 0.05;
    }
    if (agent.userData.rightArm) {
        agent.userData.rightArm.rotation.z = -Math.sin((time + agentOffset) * 1.5) * 0.05;
    }
}

/**
 * Focus camera on current phase
 */
function focusCameraOnPhase(phaseIndex) {
    const phase = DAILY_PHASES[phaseIndex];
    const locations = Object.values(phase.locations);
    
    // Calculate average position
    let avgX = 0, avgZ = 0;
    locations.forEach(loc => {
        const zone = OFFICE_ZONES[loc.zone];
        if (zone) {
            avgX += zone.x;
            avgZ += zone.z;
        }
    });
    avgX /= locations.length;
    avgZ /= locations.length;
    
    // Camera position based on phase
    const cameraOffsets = [
        { x: 0, y: 12, z: 12 },    // Standup - behind agents
        { x: 0, y: 15, z: 5 },     // Desks - overhead
        { x: 0, y: 10, z: 18 },    // Meeting - front
        { x: 0, y: 12, z: 8 },     // Gym - angled
        { x: -20, y: 10, z: 8 },  // Coffee - side
        { x: 0, y: 15, z: 5 }      // Desks - overhead
    ];
    
    const offset = cameraOffsets[phaseIndex] || cameraOffsets[0];
    
    // Animate camera (if controls exist)
    if (typeof controls !== 'undefined' && typeof camera !== 'undefined') {
        const targetPos = new THREE.Vector3(avgX + offset.x, offset.y, avgZ + offset.z);
        const lookAtPos = new THREE.Vector3(avgX, 0, avgZ);
        
        // Smooth camera transition could be added here
        controls.target.copy(lookAtPos);
        controls.update();
    }
}

/**
 * Pause the routine
 */
function pauseDailyRoutine() {
    dailyRoutine.isPaused = !dailyRoutine.isPaused;
    const btn = document.getElementById('btn-pause-routine');
    btn.textContent = dailyRoutine.isPaused ? '▶️ Resume' : '⏸️ Pause';
    console.log('[DailyRoutine] Paused:', dailyRoutine.isPaused);
}

/**
 * Skip to next phase
 */
function skipCurrentPhase() {
    const nextPhase = dailyRoutine.currentPhase + 1;
    if (nextPhase >= DAILY_PHASES.length) {
        startPhase(0);
    } else {
        startPhase(nextPhase);
    }
}

/**
 * Stop the routine
 */
function stopDailyRoutine() {
    console.log('[DailyRoutine] Stopping routine');
    dailyRoutine.isActive = false;
    dailyRoutine.isPaused = false;
    
    if (dailyRoutine.checkInterval) {
        clearInterval(dailyRoutine.checkInterval);
        dailyRoutine.checkInterval = null;
    }
    
    // Reset all agents to their desks
    dailyRoutine.agents.forEach(agentId => {
        const config = AGENT_CONFIGS[agentId];
        if (config && agents[agentId]) {
            const agent = agents[agentId];
            agent.position.set(config.position.x, config.position.y, config.position.z);
            agent.rotation.y = config.position.rot;
            agent.userData.isSitting = false;
            agent.userData.isExercising = false;
            
            // Reset animations
            if (agent.userData.leftArm) agent.userData.leftArm.rotation.set(0, 0, 0);
            if (agent.userData.rightArm) agent.userData.rightArm.rotation.set(0, 0, 0);
            if (agent.userData.leftLeg) agent.userData.leftLeg.rotation.set(0, 0, 0);
            if (agent.userData.rightLeg) agent.userData.rightLeg.rotation.set(0, 0, 0);
        }
    });
    
    // Update UI
    updateRoutineUI('stop');
    document.getElementById('routine-phase-name').textContent = 'Not Started';
    document.getElementById('routine-progress-bar').style.width = '0%';
    document.getElementById('routine-time-remaining').textContent = '--:--';
    updatePhaseList(-1);
}

/**
 * Update routine UI buttons
 */
function updateRoutineUI(state) {
    const startBtn = document.getElementById('btn-start-routine');
    const pauseBtn = document.getElementById('btn-pause-routine');
    const skipBtn = document.getElementById('btn-skip-phase');
    const stopBtn = document.getElementById('btn-stop-routine');
    
    if (state === 'start') {
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        skipBtn.disabled = false;
        stopBtn.disabled = false;
        startBtn.textContent = '▶️ Routine Running';
    } else if (state === 'stop') {
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        skipBtn.disabled = true;
        stopBtn.disabled = true;
        startBtn.textContent = '▶️ Start Daily Routine';
        pauseBtn.textContent = '⏸️ Pause';
    }
}

/**
 * Update phase list highlighting
 */
function updatePhaseList(activePhase) {
    document.querySelectorAll('.phase-item').forEach((item, index) => {
        item.classList.remove('active', 'completed');
        if (index === activePhase) {
            item.classList.add('active');
        } else if (index < activePhase) {
            item.classList.add('completed');
        }
    });
}

/**
 * Utility: Linear interpolation
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Utility: Ease in-out cubic
 */
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Export functions for global access
window.initDailyRoutine = initDailyRoutine;
window.updateDailyRoutineAnimations = updateDailyRoutineAnimations;
window.startDailyRoutine = startDailyRoutine;
window.pauseDailyRoutine = pauseDailyRoutine;
window.stopDailyRoutine = stopDailyRoutine;
window.skipCurrentPhase = skipCurrentPhase;

console.log('[DailyRoutine] Module loaded, initDailyRoutine available:', typeof initDailyRoutine);
