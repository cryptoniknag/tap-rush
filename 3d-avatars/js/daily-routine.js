function startRoutine() {
    console.log('Starting routine...');
    if (!window.agents) {
        console.error('Agents not ready');
        alert('Agents not ready yet, please wait');
        return;
    }
    
    // Move to RED BOX position (upper right, near benches)
    const standX = 15;   // Right side
    const standZ = -12;  // Upper/back area
    
    // Move each agent to the red box position, spread out side by side
    Object.keys(window.agents).forEach((key, i) => {
        const agent = window.agents[key];
        // Spread agents out side by side at the red box
        const targetX = standX + (i - 1.5) * 3; // More spacing
        const targetZ = standZ;
        
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
