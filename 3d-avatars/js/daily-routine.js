function startRoutine() {
    console.log('Starting routine...');
    if (!window.agents) {
        console.error('Agents not ready');
        alert('Agents not ready yet, please wait');
        return;
    }
    
    // Move to Kanban board position
    const standX = 18;
    const standZ = 16;
    
    // Spread agents in FRONT of Kanban
    Object.keys(window.agents).forEach((key, i) => {
        const agent = window.agents[key];
        // Stand in front of Kanban, spread left-to-right
        const targetX = standX + (i - 1.5) * 2;
        const targetZ = standZ + 3; // 3 units in front of board
        
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
