// Full 6-phase daily routine
let routineRunning = false;

// Office zone positions
const OFFICE_ZONES = {
    kanbanBoard: { x: 0, z: -2 },
    conferenceTable: { x: 0, z: 8 },
    gymArea: { x: 0, z: 18 },
    coffeeStation: { x: -28, z: 0 }
};

// Desk positions (will be read from AGENT_CONFIGS)
function getDeskPosition(agentKey) {
    if (typeof AGENT_CONFIGS !== 'undefined' && AGENT_CONFIGS[agentKey]) {
        return {
            x: AGENT_CONFIGS[agentKey].position.x,
            z: AGENT_CONFIGS[agentKey].position.z
        };
    }
    // Fallback positions
    const fallbacks = {
        groot: { x: -8, z: -5 },
        fin: { x: -3, z: -5 },
        betty: { x: 3, z: -5 },
        smith: { x: 8, z: -5 }
    };
    return fallbacks[agentKey] || { x: 0, z: 0 };
}

function initDailyRoutine() {
    console.log('[DailyRoutine] Initializing...');
    
    // Remove existing button if any
    const existing = document.getElementById('routine-btn');
    if (existing) existing.remove();
    
    // Create button
    const btn = document.createElement('button');
    btn.id = 'routine-btn';
    btn.textContent = 'START';
    btn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        padding: 15px 30px;
        font-size: 18px;
        font-weight: bold;
        background: #00ff00;
        color: #000;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    `;
    btn.onclick = startFullRoutine;
    document.body.appendChild(btn);
    
    console.log('[DailyRoutine] Button created');
}

function startFullRoutine() {
    console.log('[DailyRoutine] START clicked!');
    
    if (routineRunning) {
        console.log('[DailyRoutine] Already running');
        return;
    }
    
    if (!window.agents) {
        console.error('[DailyRoutine] No agents found');
        alert('Agents not loaded yet!');
        return;
    }
    
    routineRunning = true;
    const btn = document.getElementById('routine-btn');
    if (btn) {
        btn.textContent = 'RUNNING...';
        btn.style.background = '#ffff00';
        btn.disabled = true;
    }
    
    // Get agent keys
    const agentKeys = Object.keys(window.agents);
    console.log('[DailyRoutine] Starting 6-phase routine with', agentKeys.length, 'agents');
    
    // Phase 1: Kanban board (assemble)
    console.log('[DailyRoutine] Phase 1: Kanban board');
    moveAgentsToZone(agentKeys, OFFICE_ZONES.kanbanBoard, 'kanban');
    
    // Phase 2: Desks (work) - after 5 seconds
    setTimeout(() => {
        console.log('[DailyRoutine] Phase 2: Desks');
        moveAgentsToDesks(agentKeys);
        
        // Phase 3: Conference room (sit) - after 5 seconds
        setTimeout(() => {
            console.log('[DailyRoutine] Phase 3: Conference room');
            moveAgentsToZone(agentKeys, OFFICE_ZONES.conferenceTable, 'conference');
            
            // Phase 4: Gym (workout) - after 5 seconds
            setTimeout(() => {
                console.log('[DailyRoutine] Phase 4: Gym');
                moveAgentsToZone(agentKeys, OFFICE_ZONES.gymArea, 'gym');
                
                // Phase 5: Coffee station (break) - after 5 seconds
                setTimeout(() => {
                    console.log('[DailyRoutine] Phase 5: Coffee station');
                    moveAgentsToZone(agentKeys, OFFICE_ZONES.coffeeStation, 'coffee');
                    
                    // Phase 6: Back to desks - after 5 seconds
                    setTimeout(() => {
                        console.log('[DailyRoutine] Phase 6: Back to desks');
                        moveAgentsToDesks(agentKeys);
                        
                        // Reset button after movement completes
                        setTimeout(() => {
                            routineRunning = false;
                            if (btn) {
                                btn.textContent = 'START';
                                btn.style.background = '#00ff00';
                                btn.disabled = false;
                            }
                            console.log('[DailyRoutine] Complete!');
                        }, 2000);
                        
                    }, 5000);
                }, 5000);
            }, 5000);
        }, 5000);
    }, 5000);
}

function moveAgentsToZone(agentKeys, zonePos, zoneName) {
    agentKeys.forEach((key, index) => {
        const agent = window.agents[key];
        if (!agent) return;
        
        // Spread agents at the zone
        const offsetX = (index - (agentKeys.length - 1) / 2) * 2;
        const targetX = zonePos.x + offsetX;
        const targetZ = zonePos.z;
        
        // Animate movement
        animateAgent(agent, targetX, targetZ, key);
    });
}

function moveAgentsToDesks(agentKeys) {
    agentKeys.forEach(key => {
        const agent = window.agents[key];
        if (!agent) return;
        
        const deskPos = getDeskPosition(key);
        animateAgent(agent, deskPos.x, deskPos.z, key);
    });
}

function animateAgent(agent, targetX, targetZ, name) {
    const startX = agent.position.x;
    const startZ = agent.position.z;
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    
    console.log(`[DailyRoutine] ${name}: (${startX.toFixed(1)}, ${startZ.toFixed(1)}) -> (${targetX.toFixed(1)}, ${targetZ.toFixed(1)})`);
    
    function step() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out
        const ease = 1 - Math.pow(1 - progress, 2);
        
        agent.position.x = startX + (targetX - startX) * ease;
        agent.position.z = startZ + (targetZ - startZ) * ease;
        
        // Face movement direction
        const dx = targetX - startX;
        const dz = targetZ - startZ;
        if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
            agent.rotation.y = Math.atan2(dx, dz);
        }
        
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            console.log(`[DailyRoutine] ${name} arrived!`);
        }
    }
    
    requestAnimationFrame(step);
}

// Export for global access
window.initDailyRoutine = initDailyRoutine;
window.startFullRoutine = startFullRoutine;

console.log('[DailyRoutine] Module loaded - FULL 6-PHASE VERSION');
