/**
 * SIMPLE Daily Routine - Just walking from A to B
 * No complex animations, no sitting/standing, just movement
 */

// Simple routine state
let routineState = {
    isActive: false,
    phase: 0, // 0 = going to Kanban, 1 = going to desks
    agents: ['groot', 'fin', 'betty', 'smith'],
    moveSpeed: 2.0 // units per second
};

// Agent movement data
let agentMoves = {};

// Target locations
const TARGETS = {
    kanban: { x: 0, z: 5 },
    desks: {
        groot: { x: -8, z: -5 },
        fin: { x: -3, z: -5 },
        betty: { x: 3, z: -5 },
        smith: { x: 8, z: -5 }
    }
};

/**
 * Initialize - just setup the UI
 */
function initDailyRoutine() {
    console.log('[SimpleRoutine] Initializing...');
    
    if (document.getElementById('simple-routine-panel')) {
        console.log('[SimpleRoutine] Panel already exists');
        return;
    }
    
    createPanel();
    console.log('[SimpleRoutine] Ready!');
}

/**
 * Create simple control panel
 */
function createPanel() {
    const panel = document.createElement('div');
    panel.id = 'simple-routine-panel';
    panel.innerHTML = `
        <div style="background: rgba(0,0,0,0.8); border: 2px solid #0f0; border-radius: 8px; padding: 15px; color: #0f0; font-family: monospace; width: 250px;">
            <div style="font-weight: bold; margin-bottom: 10px; text-align: center;">🚶 SIMPLE ROUTINE</div>
            <div id="routine-status" style="margin-bottom: 10px; color: #888; text-align: center;">Ready</div>
            <button id="btn-start" style="width: 100%; padding: 10px; background: #0f0; color: #000; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-bottom: 5px;">▶ START</button>
            <button id="btn-stop" style="width: 100%; padding: 10px; background: #f00; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;" disabled>⏹ STOP</button>
        </div>
    `;
    
    panel.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 10000;';
    document.body.appendChild(panel);
    
    document.getElementById('btn-start').addEventListener('click', startRoutine);
    document.getElementById('btn-stop').addEventListener('click', stopRoutine);
    
    console.log('[SimpleRoutine] Panel created');
}

/**
 * Start the simple routine
 */
function startRoutine() {
    console.log('[SimpleRoutine] STARTING ROUTINE');
    
    if (routineState.isActive) return;
    
    // Check agents exist
    if (typeof agents === 'undefined' || !agents.groot) {
        console.error('[SimpleRoutine] ERROR: Agents not loaded!');
        alert('Wait for agents to load first!');
        return;
    }
    
    routineState.isActive = true;
    routineState.phase = 0;
    
    // Initialize movement tracking for each agent
    routineState.agents.forEach(agentId => {
        const agent = agents[agentId];
        if (!agent) return;
        
        agentMoves[agentId] = {
            isMoving: false,
            startPos: null,
            targetPos: null,
            progress: 0
        };
        
        console.log(`[SimpleRoutine] ${agentId} at:`, agent.position.x.toFixed(1), agent.position.z.toFixed(1));
    });
    
    // Start Phase 0: Go to Kanban
    startPhase0();
    
    // Update UI
    document.getElementById('btn-start').disabled = true;
    document.getElementById('btn-stop').disabled = false;
    document.getElementById('routine-status').textContent = 'Phase 1: Going to Kanban';
    document.getElementById('routine-status').style.color = '#0f0';
}

/**
 * Phase 0: All agents go to Kanban board
 */
function startPhase0() {
    console.log('[SimpleRoutine] === PHASE 0: Kanban Board ===');
    
    routineState.agents.forEach((agentId, index) => {
        const agent = agents[agentId];
        if (!agent) return;
        
        // Spread them out at Kanban
        const offsetX = (index - 1.5) * 2; // -3, -1, 1, 3
        const targetX = TARGETS.kanban.x + offsetX;
        const targetZ = TARGETS.kanban.z;
        
        moveAgent(agentId, targetX, targetZ);
    });
}

/**
 * Phase 1: All agents go back to desks
 */
function startPhase1() {
    console.log('[SimpleRoutine] === PHASE 1: Back to Desks ===');
    
    routineState.agents.forEach(agentId => {
        const desk = TARGETS.desks[agentId];
        if (desk) {
            moveAgent(agentId, desk.x, desk.z);
        }
    });
}

/**
 * Simple move function - just set target and go
 */
function moveAgent(agentId, targetX, targetZ) {
    const agent = agents[agentId];
    if (!agent) return;
    
    const move = agentMoves[agentId];
    move.startPos = { x: agent.position.x, z: agent.position.z };
    move.targetPos = { x: targetX, z: targetZ };
    move.progress = 0;
    move.isMoving = true;
    
    // Calculate distance for timing
    const dx = targetX - move.startPos.x;
    const dz = targetZ - move.startPos.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    move.duration = distance / routineState.moveSpeed; // seconds
    
    console.log(`[SimpleRoutine] ${agentId} moving to (${targetX.toFixed(1)}, ${targetZ.toFixed(1)}), distance: ${distance.toFixed(1)}`);
}

/**
 * Update called every frame
 */
function updateDailyRoutineAnimations() {
    if (!routineState.isActive) return;
    
    const delta = (typeof clock !== 'undefined') ? clock.getDelta() : 0.016;
    const time = (typeof clock !== 'undefined') ? clock.getElapsedTime() : (Date.now() / 1000);
    
    let allArrived = true;
    
    routineState.agents.forEach(agentId => {
        const agent = agents[agentId];
        const move = agentMoves[agentId];
        
        if (!agent || !move || !move.isMoving) return;
        
        // Update progress
        move.progress += delta / move.duration;
        
        if (move.progress >= 1) {
            // Arrived!
            move.progress = 1;
            move.isMoving = false;
            agent.position.x = move.targetPos.x;
            agent.position.z = move.targetPos.z;
            console.log(`[SimpleRoutine] ${agentId} ARRIVED!`);
        } else {
            // Still moving - lerp position
            allArrived = false;
            const t = move.progress;
            agent.position.x = move.startPos.x + (move.targetPos.x - move.startPos.x) * t;
            agent.position.z = move.startPos.z + (move.targetPos.z - move.startPos.z) * t;
            
            // Face direction of movement
            const dx = move.targetPos.x - move.startPos.x;
            const dz = move.targetPos.z - move.startPos.z;
            agent.rotation.y = Math.atan2(dx, dz);
            
            // Simple bobbing walk animation
            agent.position.y = (agent.userData.originalY || 0) + Math.abs(Math.sin(time * 10)) * 0.1;
        }
    });
    
    // Check phase transitions
    if (allArrived) {
        if (routineState.phase === 0) {
            // Finished going to Kanban, wait a bit then go to desks
            console.log('[SimpleRoutine] All at Kanban! Waiting 3 seconds...');
            routineState.phase = 0.5; // Waiting state
            document.getElementById('routine-status').textContent = 'At Kanban - Waiting';
            
            setTimeout(() => {
                if (routineState.isActive) {
                    routineState.phase = 1;
                    startPhase1();
                    document.getElementById('routine-status').textContent = 'Phase 2: Back to Desks';
                }
            }, 3000);
        } else if (routineState.phase === 1) {
            // Finished going to desks, loop back to Kanban
            console.log('[SimpleRoutine] All at desks! Looping back...');
            routineState.phase = 0;
            startPhase0();
            document.getElementById('routine-status').textContent = 'Phase 1: Going to Kanban';
        }
    }
}

/**
 * Stop the routine
 */
function stopRoutine() {
    console.log('[SimpleRoutine] Stopping...');
    routineState.isActive = false;
    
    // Reset agents to desks
    routineState.agents.forEach(agentId => {
        const desk = TARGETS.desks[agentId];
        const agent = agents[agentId];
        if (desk && agent) {
            agent.position.x = desk.x;
            agent.position.z = desk.z;
            agent.position.y = agent.userData.originalY || 0;
        }
    });
    
    document.getElementById('btn-start').disabled = false;
    document.getElementById('btn-stop').disabled = true;
    document.getElementById('routine-status').textContent = 'Stopped';
    document.getElementById('routine-status').style.color = '#888';
}

// Export for global access
window.initDailyRoutine = initDailyRoutine;
window.updateDailyRoutineAnimations = updateDailyRoutineAnimations;
window.startDailyRoutine = startRoutine;
window.stopDailyRoutine = stopRoutine;

console.log('[SimpleRoutine] Module loaded - SIMPLE VERSION');
