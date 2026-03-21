function startRoutine() {
    console.log('Starting routine...');
    if (!window.agents) {
        console.error('Agents not ready');
        alert('Agents not ready yet, please wait');
        return;
    }
    
    // Kanban position from OFFICE_ZONES
    const kanbanX = 18;
    const kanbanZ = 16;
    
    // Move each agent to Kanban
    Object.keys(window.agents).forEach((key, i) => {
        const agent = window.agents[key];
        const targetX = kanbanX + (i - 1.5) * 2; // Spread around kanban
        const targetZ = kanbanZ;
        
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
