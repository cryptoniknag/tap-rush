// Define positions
const POSITIONS = {
    kanban: { x: 18, z: 19 },
    desks: {
        groot: { x: -8, z: -5 },
        fin: { x: -8, z: 0 },
        betty: { x: -8, z: 5 },
        smith: { x: -8, z: 10 }
    },
    conference: { x: 0, z: 8 },
    gym: { x: 0, z: 18 }
};

async function startRoutine() {
    if (!window.agents) {
        console.error('Agents not ready');
        alert('Agents not ready yet, please wait');
        return;
    }

    // Phase 1: Kanban (already there)
    console.log('Phase 1: Kanban Standup');
    await moveToKanban();
    await wait(3000);
    
    // Phase 2: Desks
    console.log('Phase 2: Working at desks');
    await moveToDesks();
    await wait(5000);
    
    // Phase 3: Conference
    console.log('Phase 3: Conference meeting');
    await moveToConference();
    await wait(4000);
    
    // Phase 4: Gym
    console.log('Phase 4: Gym workout');
    await moveToGym();
    await wait(4000);
    
    // Phase 5: Return to desks
    console.log('Phase 5: Return to desks');
    await moveToDesks();
}

async function moveToKanban() {
    const agents = window.agents;
    const standX = POSITIONS.kanban.x;
    const standZ = POSITIONS.kanban.z;
    
    const promises = Object.keys(agents).map((key, i) => {
        const agent = agents[key];
        // Spread in front of Kanban
        const targetX = standX + (i - 1.5) * 2;
        const targetZ = standZ;
        return moveAgentTo(agent, targetX, targetZ, 2000);
    });
    
    await Promise.all(promises);
}

// Test function for debugging
window.testDeskMovement = function() {
    console.log('=== TEST DESK MOVEMENT ===');
    console.log('Testing desk movement...');
    console.log('Agents:', Object.keys(window.agents || {}));
    
    const deskPositions = {
        groot: { x: -8, z: -5 },
        fin: { x: -8, z: 0 },
        betty: { x: -8, z: 5 },
        smith: { x: -8, z: 10 }
    };
    
    Object.keys(window.agents || {}).forEach((key, i) => {
        const agent = window.agents[key];
        console.log(`Agent ${key} at:`, agent.position.x, agent.position.z);
        
        // Direct position change (no animation)
        const pos = deskPositions[key];
        if (pos) {
            agent.position.x = pos.x;
            agent.position.z = pos.z;
            console.log(`Moved ${key} to desk at ${pos.x}, ${pos.z}`);
        }
    });
    console.log('=== END TEST ===');
};

async function moveToDesks() {
    if (!window.agents) {
        console.error('No agents found');
        return;
    }
    
    const deskPositions = {
        groot: { x: -8, z: -5 },
        fin: { x: -8, z: 0 },
        betty: { x: -8, z: 5 },
        smith: { x: -8, z: 10 }
    };
    
    console.log('=== MOVING TO DESKS ===');
    console.log('Agent keys:', Object.keys(window.agents));
    
    // Move each agent with animation
    Object.keys(window.agents).forEach(key => {
        const agent = window.agents[key];
        const pos = deskPositions[key];
        if (pos && agent) {
            console.log(`Moving ${key} to desk at ${pos.x}, ${pos.z}`);
            moveAgentTo(agent, pos.x, pos.z, 2000);
        } else {
            console.warn(`No desk position or agent found for: ${key}`);
        }
    });
    
    // Wait for all to complete
    await wait(2500);
    console.log('=== DESK MOVEMENT COMPLETE ===');
}

async function moveToConference() {
    const agents = window.agents;
    const agentKeys = Object.keys(agents);
    
    // Position around conference table (0, 8)
    const promises = agentKeys.map((key, i) => {
        const agent = agents[key];
        // Spread around table: left, right, front, back
        const angle = (i / agentKeys.length) * Math.PI * 2;
        const tableX = 0;
        const tableZ = 8;
        const radius = 3; // Distance from table center
        
        const targetX = tableX + Math.cos(angle) * radius;
        const targetZ = tableZ + Math.sin(angle) * radius;
        
        return moveAgentTo(agent, targetX, targetZ, 2000);
    });
    
    await Promise.all(promises);
}

async function moveToGym() {
    const agents = window.agents;
    const gymX = POSITIONS.gym.x;
    const gymZ = POSITIONS.gym.z;
    
    const promises = Object.keys(agents).map((key, i) => {
        const agent = agents[key];
        // Spread in gym area
        const targetX = gymX + (i - 1.5) * 2;
        const targetZ = gymZ;
        return moveAgentTo(agent, targetX, targetZ, 2000);
    });
    
    await Promise.all(promises);
}

function moveAgentTo(agent, targetX, targetZ, duration = 2000) {
    return new Promise(resolve => {
        const startX = agent.position.x;
        const startZ = agent.position.z;
        const startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            agent.position.x = startX + (targetX - startX) * progress;
            agent.position.z = startZ + (targetZ - startZ) * progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        }
        animate();
    });
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.startRoutine = startRoutine;
console.log('daily-routine.js loaded, startRoutine defined');
