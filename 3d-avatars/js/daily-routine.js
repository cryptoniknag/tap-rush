function startRoutine() {
    console.log('Starting routine...');
    if (!window.agents) {
        console.error('Agents not ready');
        alert('Agents not ready yet, please wait');
        return;
    }
    
    // Stand at the CENTER of the office where the yellow arrow points
    // Arrow points to center area near the benches
    const standX = 0;   // Center of office
    const standZ = 0;   // Center of office
    
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
