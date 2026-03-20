// Simple working daily routine
let routineRunning = false;

// Kanban position
const KANBAN_POS = { x: 0, z: 5 };

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
    btn.onclick = startSimpleRoutine;
    document.body.appendChild(btn);
    
    console.log('[DailyRoutine] Button created');
}

function startSimpleRoutine() {
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
    console.log('[DailyRoutine] Moving', agentKeys.length, 'agents to Kanban');
    
    // Move all agents to Kanban (spread out)
    agentKeys.forEach((key, index) => {
        const agent = window.agents[key];
        if (!agent) return;
        
        // Spread agents at Kanban
        const offsetX = (index - (agentKeys.length - 1) / 2) * 2;
        const targetX = KANBAN_POS.x + offsetX;
        const targetZ = KANBAN_POS.z;
        
        // Animate movement
        animateAgent(agent, targetX, targetZ, key);
    });
    
    // After 3 seconds, move back
    setTimeout(() => {
        console.log('[DailyRoutine] Moving agents back to desks');
        
        agentKeys.forEach(key => {
            const agent = window.agents[key];
            if (!agent) return;
            
            const deskPos = getDeskPosition(key);
            animateAgent(agent, deskPos.x, deskPos.z, key);
        });
        
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
        
    }, 3000);
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
window.startSimpleRoutine = startSimpleRoutine;

console.log('[DailyRoutine] Module loaded - SIMPLE VERSION');
