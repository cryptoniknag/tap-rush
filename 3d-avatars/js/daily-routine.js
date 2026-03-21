function startRoutine() {
    console.log('Starting routine...');
    if (!window.agents) {
        console.error('Agents not ready');
        alert('Agents not ready yet, please wait');
        return;
    }
    
    // Stand to the LEFT of the Kanban board, not right at it
    // Kanban is at (18, 16), so agents stand at (10, 16) - to the left side
    const standX = 10;  // To the left of kanban
    const standZ = 16;  // Same Z as kanban
    
    // Move each agent to stand LEFT of the Kanban board
    Object.keys(window.agents).forEach((key, i) => {
        const agent = window.agents[key];
        // Spread agents out in front of the board, not at it
        const targetX = standX; 
        const targetZ = standZ + (i - 1) * 2; // Spread along Z axis in front
        
        const startX = agent.position.x;
        const startZ = agent.position.z;
        let progress = 0;
        
        function animate() {
            progress += 0.02;
            if (progress >= 1) progress = 1;
            
            agent.position.x = startX + (targetX - startX) * progress;
            agent.position.z = startZ + (targetZ - startZ) * progress;
            
            if (progress < 1) requestAnimationFrame(animate);
        }
        animate();
    });
}

window.startRoutine = startRoutine;
console.log('daily-routine.js loaded, startRoutine defined');
