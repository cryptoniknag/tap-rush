/**
 * Simple Daily Routine - Agents move between office locations
 * Completely rewritten for reliability
 */

// Store the agents object reference
let localAgents = {};
let isRunning = false;
let currentPhase = 0;
let phaseTimer = null;

// Movement targets for each phase
const PHASE_TARGETS = {
    0: { // Standup at Kanban Board - agents stand in semi-circle facing the board
        // Kanban board is at z: -2, standup circle at z: 1.5
        // Agents face the board (rot: Math.PI means facing negative Z)
        groot: { x: -2.5, z: 2.0, rot: Math.PI },   // Left position, facing board
        fin:   { x: 0, z: 1.5, rot: Math.PI },      // Center position, facing board  
        betty: { x: 2.5, z: 2.0, rot: Math.PI }    // Right position, facing board
    },
    1: { // Return to desks
        groot: { x: -10, z: -8, rot: Math.PI / 4 },
        fin:   { x: 0, z: -12, rot: 0 },
        betty: { x: 10, z: -8, rot: -Math.PI / 4 }
    },
    2: { // Conference table - agents SIT, arranged opposite each other
        // Groot at head (x:0, z:6.5, facing center), Fin and Betty opposite each other
        groot: { x: 0, z: 6.5, rot: 0 },      // Groot at head, facing table
        fin:   { x: -3, z: 8, rot: Math.PI / 2 },   // Fin on left side, facing right
        betty: { x: 3, z: 8, rot: -Math.PI / 2 }    // Betty on right side, facing left (opposite Fin)
    },
    3: { // Coffee station - at EDGE of room (left side)
        groot: { x: -26, z: -2, rot: Math.PI / 2 },
        fin:   { x: -26, z: 0, rot: Math.PI / 2 },
        betty: { x: -26, z: 2, rot: Math.PI / 2 }
    },
    4: { // Back to desks
        groot: { x: -10, z: -8, rot: Math.PI / 4 },
        fin:   { x: 0, z: -12, rot: 0 },
        betty: { x: 10, z: -8, rot: -Math.PI / 4 }
    }
};

// Simple linear interpolation
function lerp(start, end, t) {
    return start + (end - start) * t;
}

// Get shortest angle difference for rotation
function angleDifference(current, target) {
    let diff = target - current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return diff;
}

/**
 * Initialize the daily routine system
 */
function initDailyRoutine() {
    console.log('[DailyRoutine] Initializing...');
    
    // Wait a moment for agents to be created
    setTimeout(() => {
        localAgents = window.agents || {};
        console.log('[DailyRoutine] Agents loaded:', Object.keys(localAgents));
        
        // Log each agent's position
        Object.entries(localAgents).forEach(([key, agent]) => {
            console.log(`[DailyRoutine] Agent ${key} at:`, {
                x: agent.position.x.toFixed(2),
                z: agent.position.z.toFixed(2)
            });
        });
        
        createUI();
    }, 1000);
}

/**
 * Create simple UI controls
 */
function createUI() {
    const container = document.getElementById('ui-container');
    if (!container) {
        console.error('[DailyRoutine] UI container not found');
        return;
    }
    
    const panel = document.createElement('div');
    panel.className = 'daily-routine-panel';
    panel.style.cssText = `
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 15px;
        border-radius: 8px;
        margin-top: 10px;
        font-family: Arial, sans-serif;
    `;
    
    panel.innerHTML = `
        <h3 style="margin: 0 0 10px 0;">🚶 Daily Routine</h3>
        <div id="routine-status" style="margin-bottom: 10px; color: #aaa;">Ready</div>
        <button id="btn-start-routine" style="
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-right: 5px;
        ">▶️ Start Routine</button>
        <button id="btn-stop-routine" style="
            background: #f44336;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            display: none;
        ">⏹️ Stop</button>
        <div id="phase-list" style="margin-top: 10px; font-size: 12px; color: #888;">
            <div>Phase 1: Kanban Board</div>
            <div>Phase 2: Return to Desks</div>
            <div>Phase 3: Conference Table</div>
            <div>Phase 4: Coffee Station</div>
            <div>Phase 5: Back to Work</div>
        </div>
    `;
    
    container.appendChild(panel);
    
    document.getElementById('btn-start-routine').addEventListener('click', startRoutine);
    document.getElementById('btn-stop-routine').addEventListener('click', stopRoutine);
    
    console.log('[DailyRoutine] UI created');
}

/**
 * Start the daily routine sequence
 */
function startRoutine() {
    if (isRunning) return;
    
    console.log('[DailyRoutine] Starting routine...');
    isRunning = true;
    currentPhase = 0;
    
    // Update UI
    document.getElementById('btn-start-routine').style.display = 'none';
    document.getElementById('btn-stop-routine').style.display = 'inline-block';
    
    // Start phase 1
    runPhase(0);
}

/**
 * Stop the routine
 */
function stopRoutine() {
    console.log('[DailyRoutine] Stopping routine...');
    isRunning = false;
    
    if (phaseTimer) {
        clearTimeout(phaseTimer);
        phaseTimer = null;
    }
    
    // Reset all agents to standing
    Object.values(localAgents).forEach(agent => {
        agent.userData.isSitting = false;
        agent.position.y = 0;
    });
    
    // Return agents to desks
    moveAllAgentsToPhase(1);
    
    // Update UI
    document.getElementById('btn-start-routine').style.display = 'inline-block';
    document.getElementById('btn-stop-routine').style.display = 'none';
    document.getElementById('routine-status').textContent = 'Stopped';
}

/**
 * Run a specific phase
 */
function runPhase(phaseNum) {
    if (!isRunning) return;
    
    currentPhase = phaseNum;
    console.log(`[DailyRoutine] Starting Phase ${phaseNum + 1}`);
    
    const phaseNames = [
        'Moving to Kanban Board',
        'Returning to Desks',
        'Conference Table Meeting',
        'Coffee Break',
        'Back to Work'
    ];
    
    document.getElementById('routine-status').textContent = 
        `Phase ${phaseNum + 1}: ${phaseNames[phaseNum]}`;
    
    // Move agents to their targets for this phase
    moveAllAgentsToPhase(phaseNum);
    
    // Schedule next phase (8 seconds per phase)
    if (phaseNum < 4) {
        phaseTimer = setTimeout(() => {
            if (isRunning) {
                runPhase(phaseNum + 1);
            }
        }, 8000);
    } else {
        // Last phase - auto-stop after delay
        phaseTimer = setTimeout(() => {
            if (isRunning) {
                console.log('[DailyRoutine] Routine complete');
                stopRoutine();
            }
        }, 8000);
    }
}

/**
 * Move all agents to positions for a specific phase
 */
function moveAllAgentsToPhase(phaseNum) {
    const targets = PHASE_TARGETS[phaseNum];
    if (!targets) {
        console.error('[DailyRoutine] No targets for phase', phaseNum);
        return;
    }
    
    // Phase 2 is conference - agents should sit
    const isSitting = phaseNum === 2;
    
    console.log(`[DailyRoutine] Phase ${phaseNum + 1} - Moving agents to:`, targets, `sitting=${isSitting}`);
    
    Object.entries(targets).forEach(([agentKey, target]) => {
        const agent = localAgents[agentKey];
        if (agent) {
            console.log(`[DailyRoutine] Moving ${agentKey} to (${target.x}, ${target.z}), sitting=${isSitting}`);
            moveAgent(agent, target.x, target.z, target.rot, isSitting);
        } else {
            console.warn(`[DailyRoutine] Agent ${agentKey} not found`);
        }
    });
}

/**
 * Move a single agent to a target position
 * If isSitting is true, agent will be positioned at sitting height
 */
function moveAgent(agent, targetX, targetZ, targetRot, isSitting = false) {
    if (!agent) {
        console.error('[DailyRoutine] Cannot move null agent');
        return;
    }
    
    const startX = agent.position.x;
    const startZ = agent.position.z;
    const startRot = agent.rotation.y;
    
    const distance = Math.sqrt(
        Math.pow(targetX - startX, 2) + 
        Math.pow(targetZ - startZ, 2)
    );
    
    // Movement duration based on distance (2 seconds per 10 units)
    const duration = Math.max(2000, distance * 200);
    const startTime = performance.now();
    
    console.log(`[DailyRoutine] Move started: distance=${distance.toFixed(2)}, duration=${duration}ms, sitting=${isSitting}`);
    
    // Store sitting state on agent
    agent.userData.isSitting = isSitting;
    
    function animateMove(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const ease = 1 - Math.pow(1 - progress, 3);
        
        // Update position
        agent.position.x = lerp(startX, targetX, ease);
        agent.position.z = lerp(startZ, targetZ, ease);
        
        // Update rotation
        const rotDiff = angleDifference(startRot, targetRot);
        agent.rotation.y = startRot + rotDiff * ease;
        
        // Add walking bob effect (only when not sitting)
        if (progress < 1) {
            agent.position.y = Math.abs(Math.sin(elapsed * 0.01)) * 0.1;
        } else {
            // Final position - sitting or standing
            agent.position.y = isSitting ? -0.4 : 0; // Lower Y when sitting
        }
        
        if (progress < 1) {
            requestAnimationFrame(animateMove);
        } else {
            console.log(`[DailyRoutine] Move complete - agent now at (${agent.position.x.toFixed(2)}, ${agent.position.z.toFixed(2)}), sitting=${isSitting}`);
        }
    }
    
    requestAnimationFrame(animateMove);
}

/**
 * Set agent to sitting position (lower Y and adjust posture)
 */
function setAgentSitting(agent, isSitting) {
    if (!agent) return;
    
    agent.userData.isSitting = isSitting;
    
    // Smooth transition to sitting height
    const targetY = isSitting ? -0.4 : 0;
    const startY = agent.position.y;
    const startTime = performance.now();
    const duration = 500; // 500ms transition
    
    function animateSit(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        
        agent.position.y = lerp(startY, targetY, ease);
        
        if (progress < 1) {
            requestAnimationFrame(animateSit);
        }
    }
    
    requestAnimationFrame(animateSit);
}

/**
 * Update function called from main animation loop
 */
function updateDailyRoutineAnimations() {
    // Any continuous animations can go here
    // The movement is handled by requestAnimationFrame in moveAgent
}

// Export functions
window.initDailyRoutine = initDailyRoutine;
window.startDailyRoutine = startRoutine;
window.stopDailyRoutine = stopRoutine;
window.updateDailyRoutineAnimations = updateDailyRoutineAnimations;
window.moveAgentToPosition = moveAgent; // For compatibility