/**
 * Daily Routine Feature for Agent Avatar World
 * Scripted daily routine with 5 phases and animated interactions
 */

// Daily Routine State
const DailyRoutine = {
    isRunning: false,
    currentPhase: 0,
    phaseStartTime: 0,
    phases: [
        { name: 'Stand-up at Kanban', duration: 120, id: 'standup' },
        { name: 'Return to Desks', duration: 60, id: 'returndesks' },
        { name: 'Conference Room Meeting', duration: 180, id: 'meeting' },
        { name: 'Coffee Break', duration: 120, id: 'coffee' },
        { name: 'Back to Work', duration: 30, id: 'work' }
    ],
    speechBubbles: [],
    steamParticles: [],
    typingEffects: [],
    phaseTimer: null,
    uiPanel: null
};

// Stand-up messages for each agent
const STANDUP_MESSAGES = {
    groot: [
        "Working on tree optimization 🌳",
        "Root system upgraded!",
        "Growing new branches...",
        "Photosynthesis efficiency +15%",
        "I am Groot! 🌱"
    ],
    fin: [
        "Analyzing market data 📊",
        "Q3 projections look strong",
        "New strategy drafted",
        "ROI up 23% this quarter",
        "Time to pivot! 📈"
    ],
    betty: [
        "Building new game level 🎮",
        "Pixel art looking cute!",
        "Testing collision detection",
        "Added 50 new sprites ✨",
        "Beta launch next week! 🚀"
    ]
};

// Coffee chat messages
const COFFEE_CHATS = [
    "Great coffee today! ☕",
    "Did you see the new update?",
    "Weekend plans? 🌟",
    "That meeting was productive",
    "Love this new espresso blend",
    "The weather's nice outside",
    "Anyone up for lunch? 🍕"
];

// Meeting discussion topics
const MEETING_TOPICS = [
    { speaker: 'fin', message: "Welcome to our daily sync! 📊" },
    { speaker: 'groot', message: "I am Groot! 🌳" },
    { speaker: 'betty', message: "The new level designs are ready! 🎮" },
    { speaker: 'fin', message: "Market analysis shows strong growth 📈" },
    { speaker: 'groot', message: "Tree optimization complete! 🌿" },
    { speaker: 'betty', message: "Beta testing starts tomorrow 🚀" },
    { speaker: 'fin', message: "Let's crush Q3 goals! 💪" }
];

/**
 * Initialize the Daily Routine feature
 */
function initDailyRoutine() {
    createDailyRoutineUI();
    console.log('Daily Routine feature initialized');
}

/**
 * Create the Daily Routine UI Panel
 */
function createDailyRoutineUI() {
    const container = document.getElementById('ui-container');
    
    // Create Daily Routine panel
    const panel = document.createElement('div');
    panel.className = 'daily-routine-panel';
    panel.id = 'daily-routine-panel';
    panel.innerHTML = `
        <h3>📅 Daily Routine</h3>
        <div class="routine-status">
            <div class="phase-indicator" id="routine-phase">Ready to start</div>
            <div class="progress-container">
                <div class="progress-bar" id="routine-progress" style="width: 0%"></div>
            </div>
            <div class="time-remaining" id="routine-timer">--:--</div>
        </div>
        <div class="routine-controls">
            <button id="btn-start-routine" class="routine-btn primary">▶️ Start Daily Routine</button>
            <button id="btn-skip-phase" class="routine-btn secondary" style="display: none;">⏭️ Skip Phase</button>
            <button id="btn-stop-routine" class="routine-btn danger" style="display: none;">⏹️ Stop</button>
        </div>
        <div class="routine-phases">
            <div class="phase-item" data-phase="0">📋 Stand-up</div>
            <div class="phase-item" data-phase="1">💻 To Desks</div>
            <div class="phase-item" data-phase="2">🏢 Meeting</div>
            <div class="phase-item" data-phase="3">☕ Coffee</div>
            <div class="phase-item" data-phase="4">🔙 Work</div>
        </div>
    `;
    
    container.appendChild(panel);
    DailyRoutine.uiPanel = panel;
    
    // Add event listeners
    document.getElementById('btn-start-routine').addEventListener('click', startDailyRoutine);
    document.getElementById('btn-skip-phase').addEventListener('click', skipToNextPhase);
    document.getElementById('btn-stop-routine').addEventListener('click', stopDailyRoutine);
}

/**
 * Start the Daily Routine
 */
function startDailyRoutine() {
    if (DailyRoutine.isRunning) return;
    
    DailyRoutine.isRunning = true;
    DailyRoutine.currentPhase = 0;
    
    // Update UI
    updateRoutineUI('start');
    
    // Start first phase
    runPhase(0);
    
    console.log('Daily Routine started');
}

/**
 * Stop the Daily Routine
 */
function stopDailyRoutine() {
    if (!DailyRoutine.isRunning) return;
    
    DailyRoutine.isRunning = false;
    
    // Clear timers
    if (DailyRoutine.phaseTimer) {
        clearTimeout(DailyRoutine.phaseTimer);
    }
    
    // Clean up all effects
    clearAllEffects();
    
    // Return agents to their desks
    returnAgentsToDesks();
    
    // Update UI
    updateRoutineUI('stop');
    
    console.log('Daily Routine stopped');
}

/**
 * Skip to the next phase
 */
function skipToNextPhase() {
    if (!DailyRoutine.isRunning) return;
    
    // Clear current phase timer
    if (DailyRoutine.phaseTimer) {
        clearTimeout(DailyRoutine.phaseTimer);
    }
    
    // Move to next phase
    DailyRoutine.currentPhase++;
    
    if (DailyRoutine.currentPhase >= DailyRoutine.phases.length) {
        stopDailyRoutine();
        return;
    }
    
    // Clear effects from previous phase
    clearAllEffects();
    
    // Run next phase
    runPhase(DailyRoutine.currentPhase);
}

/**
 * Run a specific phase of the routine
 */
function runPhase(phaseIndex) {
    const phase = DailyRoutine.phases[phaseIndex];
    DailyRoutine.phaseStartTime = Date.now();
    
    // Update UI
    updatePhaseUI(phaseIndex);
    
    // Execute phase-specific logic
    switch(phase.id) {
        case 'standup':
            runStandupPhase();
            break;
        case 'returndesks':
            runReturnDesksPhase();
            break;
        case 'meeting':
            runMeetingPhase();
            break;
        case 'coffee':
            runCoffeePhase();
            break;
        case 'work':
            runWorkPhase();
            break;
    }
    
    // Start progress update
    updateProgressBar(phase.duration);
    
    // Schedule next phase
    DailyRoutine.phaseTimer = setTimeout(() => {
        if (DailyRoutine.isRunning) {
            DailyRoutine.currentPhase++;
            if (DailyRoutine.currentPhase < DailyRoutine.phases.length) {
                clearAllEffects();
                runPhase(DailyRoutine.currentPhase);
            } else {
                stopDailyRoutine();
            }
        }
    }, phase.duration * 1000);
}

/**
 * Phase 1: Stand-up at Kanban
 */
function runStandupPhase() {
    console.log('Phase: Stand-up at Kanban');
    console.log('Agents:', Object.keys(agents));
    
    // Move all agents to kanban board in a semi-circle
    const kanbanPositions = [
        { x: 13, z: -18, rot: -Math.PI / 2 },
        { x: 15, z: -19, rot: -Math.PI / 2 },
        { x: 17, z: -18, rot: -Math.PI / 2 }
    ];
    
    const agentKeys = Object.keys(agents);
    agentKeys.forEach((key, i) => {
        const agent = agents[key];
        const pos = kanbanPositions[i];
        moveAgentToPosition(agent, pos.x, pos.z, pos.rot);
    });
    
    // Show speech bubbles after agents arrive
    setTimeout(() => {
        showStandupSpeechBubbles();
    }, 2500);
    
    // Continue showing speech bubbles throughout the phase
    const bubbleInterval = setInterval(() => {
        if (!DailyRoutine.isRunning || DailyRoutine.currentPhase !== 0) {
            clearInterval(bubbleInterval);
            return;
        }
        showStandupSpeechBubbles();
    }, 4000);
}

/**
 * Show stand-up speech bubbles
 */
function showStandupSpeechBubbles() {
    if (!DailyRoutine.isRunning || DailyRoutine.currentPhase !== 0) return;
    
    Object.keys(agents).forEach((key, i) => {
        setTimeout(() => {
            if (!DailyRoutine.isRunning || DailyRoutine.currentPhase !== 0) return;
            
            const messages = STANDUP_MESSAGES[key];
            const message = messages[Math.floor(Math.random() * messages.length)];
            showSpeechBubble(agents[key], message, 3000);
        }, i * 600);
    });
}

/**
 * Phase 2: Return to Desks
 */
function runReturnDesksPhase() {
    console.log('Phase: Return to Desks');
    
    // Move each agent to their desk
    Object.keys(AGENT_CONFIGS).forEach((key, i) => {
        setTimeout(() => {
            const config = AGENT_CONFIGS[key];
            const agent = agents[key];
            moveAgentToPosition(agent, config.position.x, config.position.z, config.position.rot);
        }, i * 500);
    });
    
    // After arriving, start typing animations
    setTimeout(() => {
        if (DailyRoutine.isRunning && DailyRoutine.currentPhase === 1) {
            Object.keys(agents).forEach(key => {
                startTypingAnimation(agents[key]);
            });
        }
    }, 3000);
}

/**
 * Phase 3: Conference Room Meeting
 */
function runMeetingPhase() {
    console.log('Phase: Conference Room Meeting');
    
    // Move agents to conference table positions
    const meetingPositions = [
        { x: -3, z: 8, rot: 0 },
        { x: 0, z: 8, rot: 0 },
        { x: 3, z: 8, rot: 0 }
    ];
    
    const agentKeys = Object.keys(agents);
    agentKeys.forEach((key, i) => {
        const agent = agents[key];
        const pos = meetingPositions[i];
        moveAgentToPosition(agent, pos.x, pos.z, pos.rot);
    });
    
    // After arriving, start discussion
    setTimeout(() => {
        runMeetingDiscussion();
    }, 2500);
    
    // Show charts on whiteboard
    showWhiteboardCharts(true);
}

/**
 * Run meeting discussion with gestures and speech bubbles
 */
function runMeetingDiscussion() {
    if (!DailyRoutine.isRunning || DailyRoutine.currentPhase !== 2) return;
    
    let topicIndex = 0;
    
    const discussionInterval = setInterval(() => {
        if (!DailyRoutine.isRunning || DailyRoutine.currentPhase !== 2) {
            clearInterval(discussionInterval);
            return;
        }
        
        const topic = MEETING_TOPICS[topicIndex % MEETING_TOPICS.length];
        const agent = agents[topic.speaker];
        
        // Show speech bubble
        showSpeechBubble(agent, topic.message, 3000);
        
        // Gesture animation
        animateAgentGesture(agent);
        
        topicIndex++;
    }, 2500);
}

/**
 * Animate agent gesturing
 */
function animateAgentGesture(agent) {
    if (!agent.userData.rightArm) return;
    
    const originalRot = agent.userData.rightArm.rotation.z;
    let gestureCount = 0;
    
    const gestureInterval = setInterval(() => {
        if (gestureCount > 8) {
            clearInterval(gestureInterval);
            if (agent.userData.rightArm) {
                agent.userData.rightArm.rotation.z = originalRot;
            }
            return;
        }
        
        if (agent.userData.rightArm) {
            agent.userData.rightArm.rotation.z = originalRot + Math.sin(gestureCount * 0.5) * 0.4;
        }
        gestureCount++;
    }, 150);
}

/**
 * Phase 4: Coffee Break
 */
function runCoffeePhase() {
    console.log('Phase: Coffee Break');
    
    // Move agents to coffee station
    const coffeePositions = [
        { x: 13, z: 11, rot: -Math.PI / 2 },
        { x: 15, z: 10, rot: -Math.PI / 2 },
        { x: 14, z: 12, rot: -Math.PI / 2 }
    ];
    
    const agentKeys = Object.keys(agents);
    agentKeys.forEach((key, i) => {
        const agent = agents[key];
        const pos = coffeePositions[i];
        moveAgentToPosition(agent, pos.x, pos.z, pos.rot);
    });
    
    // After arriving, show coffee mugs and steam
    setTimeout(() => {
        if (DailyRoutine.isRunning && DailyRoutine.currentPhase === 3) {
            Object.keys(agents).forEach((key, i) => {
                setTimeout(() => {
                    if (!DailyRoutine.isRunning || DailyRoutine.currentPhase !== 3) return;
                    showCoffeeMug(agents[key]);
                    createSteamEffectAtPosition(
                        agents[key].position.x + 0.5,
                        agents[key].position.y + 1.5,
                        agents[key].position.z + 0.3
                    );
                    
                    // Show casual chat
                    const chat = COFFEE_CHATS[Math.floor(Math.random() * COFFEE_CHATS.length)];
                    showSpeechBubble(agents[key], chat, 2500);
                }, i * 800);
            });
        }
    }, 2500);
    
    // Continue casual chatting
    const chatInterval = setInterval(() => {
        if (!DailyRoutine.isRunning || DailyRoutine.currentPhase !== 3) {
            clearInterval(chatInterval);
            return;
        }
        
        const randomAgent = agentKeys[Math.floor(Math.random() * agentKeys.length)];
        const chat = COFFEE_CHATS[Math.floor(Math.random() * COFFEE_CHATS.length)];
        showSpeechBubble(agents[randomAgent], chat, 2000);
    }, 4000);
}

/**
 * Show coffee mug for an agent
 */
function showCoffeeMug(agent) {
    // Create a temporary coffee mug
    const mugGroup = new THREE.Group();
    
    // Mug body
    const mugGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.18, 12);
    const mugMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const mug = new THREE.Mesh(mugGeo, mugMat);
    mugGroup.add(mug);
    
    // Mug handle
    const handleGeo = new THREE.TorusGeometry(0.04, 0.015, 4, 8, Math.PI);
    const handle = new THREE.Mesh(handleGeo, mugMat);
    handle.rotation.z = -Math.PI / 2;
    handle.position.set(-0.08, 0, 0);
    mugGroup.add(handle);
    
    // Position in hand
    mugGroup.position.set(-0.6, 1.0, 0.3);
    mugGroup.name = 'coffeeMug';
    
    // Add to agent's right hand
    if (agent.userData.rightArm) {
        agent.userData.rightArm.add(mugGroup);
    }
}

/**
 * Create steam effect at a position
 */
function createSteamEffectAtPosition(x, y, z) {
    const steamCount = 5;
    const steamGroup = [];
    
    for (let i = 0; i < steamCount; i++) {
        const steamGeo = new THREE.SphereGeometry(0.02 + i * 0.015, 6, 6);
        const steamMat = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF, 
            transparent: true, 
            opacity: 0.4 - i * 0.06 
        });
        const steam = new THREE.Mesh(steamGeo, steamMat);
        steam.position.set(
            x + (Math.random() - 0.5) * 0.05, 
            y + i * 0.08, 
            z + (Math.random() - 0.5) * 0.05
        );
        
        steam.userData = {
            baseY: y + i * 0.08,
            offset: Math.random() * Math.PI * 2,
            speed: 0.8 + Math.random() * 0.5,
            initialX: x,
            initialZ: z
        };
        
        scene.add(steam);
        steamGroup.push(steam);
    }
    
    DailyRoutine.steamParticles.push(...steamGroup);
    return steamGroup;
}

/**
 * Phase 5: Back to Work
 */
function runWorkPhase() {
    console.log('Phase: Back to Work');
    
    // Remove coffee mugs
    Object.values(agents).forEach(agent => {
        if (agent.userData.rightArm) {
            const mug = agent.userData.rightArm.getObjectByName('coffeeMug');
            if (mug) {
                agent.userData.rightArm.remove(mug);
            }
        }
    });
    
    // Move agents back to desks
    Object.keys(AGENT_CONFIGS).forEach((key, i) => {
        setTimeout(() => {
            const config = AGENT_CONFIGS[key];
            const agent = agents[key];
            moveAgentToPosition(agent, config.position.x, config.position.z, config.position.rot);
        }, i * 400);
    });
    
    // Start typing animations after arriving
    setTimeout(() => {
        if (DailyRoutine.isRunning && DailyRoutine.currentPhase === 4) {
            Object.keys(agents).forEach(key => {
                startTypingAnimation(agents[key]);
            });
        }
    }, 2500);
    
    // Auto-end after phase duration
    setTimeout(() => {
        if (DailyRoutine.isRunning) {
            showSpeechBubble(agents.fin, "Back to work! Let's crush it! 💪", 2000);
        }
    }, 5000);
}

/**
 * Move agent to a specific position with walking animation
 */
function moveAgentToPosition(agent, x, z, rot) {
    console.log('Moving agent to:', x, z, rot, 'Current pos:', agent.position);
    agent.userData.targetPosition = { x, y: 0, z, rot };
    agent.userData.isWalking = true;
    agent.userData.action = 'walk';
}

/**
 * Start typing animation for an agent
 */
function startTypingAnimation(agent) {
    if (!agent.userData.leftArm || !agent.userData.rightArm) return;
    
    const typingGroup = {
        agent: agent,
        leftArm: agent.userData.leftArm,
        rightArm: agent.userData.rightArm,
        baseLeftRot: agent.userData.leftArm.rotation.x,
        baseRightRot: agent.userData.rightArm.rotation.x,
        startTime: Date.now()
    };
    
    DailyRoutine.typingEffects.push(typingGroup);
}

/**
 * Animate typing effects
 */
function animateTyping() {
    const now = Date.now();
    
    DailyRoutine.typingEffects = DailyRoutine.typingEffects.filter(typing => {
        const elapsed = (now - typing.startTime) / 1000;
        const speed = 15;
        
        // Random typing motion
        if (typing.leftArm) {
            typing.leftArm.rotation.x = typing.baseLeftRot + Math.sin(elapsed * speed) * 0.1 + (Math.random() - 0.5) * 0.05;
        }
        if (typing.rightArm) {
            typing.rightArm.rotation.x = typing.baseRightRot + Math.cos(elapsed * speed * 1.3) * 0.1 + (Math.random() - 0.5) * 0.05;
        }
        
        // Keep typing if still in relevant phases
        return DailyRoutine.isRunning && (DailyRoutine.currentPhase === 1 || DailyRoutine.currentPhase === 4);
    });
}

/**
 * Show speech bubble above an agent
 */
function showSpeechBubble(agent, text, duration = 3000) {
    // Remove existing speech bubble for this agent
    removeSpeechBubble(agent);
    
    // Create canvas for speech bubble
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Measure text
    const fontSize = 24;
    context.font = `${fontSize}px Arial`;
    const textWidth = context.measureText(text).width;
    const padding = 20;
    const bubbleWidth = Math.max(textWidth + padding * 2, 100);
    const bubbleHeight = fontSize + padding * 2;
    
    canvas.width = bubbleWidth;
    canvas.height = bubbleHeight + 15; // Extra for tail
    
    // Draw bubble
    context.fillStyle = 'rgba(255, 255, 255, 0.95)';
    context.strokeStyle = '#333';
    context.lineWidth = 2;
    
    // Rounded rect
    const radius = 10;
    context.beginPath();
    context.moveTo(radius, 0);
    context.lineTo(bubbleWidth - radius, 0);
    context.quadraticCurveTo(bubbleWidth, 0, bubbleWidth, radius);
    context.lineTo(bubbleWidth, bubbleHeight - radius);
    context.quadraticCurveTo(bubbleWidth, bubbleHeight, bubbleWidth - radius, bubbleHeight);
    context.lineTo(bubbleWidth / 2 + 10, bubbleHeight);
    context.lineTo(bubbleWidth / 2, bubbleHeight + 15);
    context.lineTo(bubbleWidth / 2 - 10, bubbleHeight);
    context.lineTo(radius, bubbleHeight);
    context.quadraticCurveTo(0, bubbleHeight, 0, bubbleHeight - radius);
    context.lineTo(0, radius);
    context.quadraticCurveTo(0, 0, radius, 0);
    context.closePath();
    context.fill();
    context.stroke();
    
    // Draw text
    context.fillStyle = '#333';
    context.font = `${fontSize}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, bubbleWidth / 2, bubbleHeight / 2);
    
    // Create texture and sprite
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    
    sprite.position.set(0, 3.5, 0);
    sprite.scale.set(bubbleWidth / 30, bubbleHeight / 30, 1);
    
    agent.add(sprite);
    
    const bubbleData = { agent, sprite };
    DailyRoutine.speechBubbles.push(bubbleData);
    
    // Auto-remove after duration
    setTimeout(() => {
        removeSpeechBubble(agent);
    }, duration);
}

/**
 * Remove speech bubble from an agent
 */
function removeSpeechBubble(agent) {
    const index = DailyRoutine.speechBubbles.findIndex(b => b.agent === agent);
    if (index >= 0) {
        const bubble = DailyRoutine.speechBubbles[index];
        if (bubble.sprite && bubble.sprite.parent) {
            bubble.sprite.parent.remove(bubble.sprite);
        }
        DailyRoutine.speechBubbles.splice(index, 1);
    }
}

/**
 * Clear all effects
 */
function clearAllEffects() {
    // Clear speech bubbles
    DailyRoutine.speechBubbles.forEach(bubble => {
        if (bubble.sprite && bubble.sprite.parent) {
            bubble.sprite.parent.remove(bubble.sprite);
        }
    });
    DailyRoutine.speechBubbles = [];
    
    // Clear steam particles
    DailyRoutine.steamParticles.forEach(steam => {
        if (steam.parent) {
            steam.parent.remove(steam);
        }
    });
    DailyRoutine.steamParticles = [];
    
    // Clear typing effects
    DailyRoutine.typingEffects.forEach(typing => {
        if (typing.leftArm) {
            typing.leftArm.rotation.x = typing.baseLeftRot || 0;
        }
        if (typing.rightArm) {
            typing.rightArm.rotation.x = typing.baseRightRot || 0;
        }
    });
    DailyRoutine.typingEffects = [];
    
    // Hide whiteboard charts
    showWhiteboardCharts(false);
}

/**
 * Show/hide whiteboard charts
 */
function showWhiteboardCharts(show) {
    // Find or create charts
    let chartsGroup = scene.getObjectByName('whiteboardCharts');
    
    if (!chartsGroup && show) {
        chartsGroup = new THREE.Group();
        chartsGroup.name = 'whiteboardCharts';
        
        // Create some chart visualizations
        const chartPositions = [
            { x: -2, y: 6, color: 0x3498db },
            { x: 0, y: 7, color: 0xe74c3c },
            { x: 2, y: 6.5, color: 0x2ecc71 }
        ];
        
        chartPositions.forEach((pos, i) => {
            const barHeight = 1 + Math.random() * 1.5;
            const barGeo = new THREE.BoxGeometry(0.8, barHeight, 0.05);
            const barMat = new THREE.MeshBasicMaterial({ color: pos.color });
            const bar = new THREE.Mesh(barGeo, barMat);
            bar.position.set(pos.x, pos.y + barHeight / 2 - 0.5, -29.35);
            chartsGroup.add(bar);
        });
        
        scene.add(chartsGroup);
    }
    
    if (chartsGroup) {
        chartsGroup.visible = show;
    }
}

/**
 * Return agents to their desks
 */
function returnAgentsToDesks() {
    Object.keys(AGENT_CONFIGS).forEach(key => {
        const config = AGENT_CONFIGS[key];
        const agent = agents[key];
        
        agent.userData.targetPosition = { ...config.position };
        agent.userData.isWalking = true;
        agent.userData.action = null;
    });
    
    // Reset positions after animation
    setTimeout(() => {
        Object.keys(agents).forEach(key => {
            const config = AGENT_CONFIGS[key];
            agents[key].position.set(config.position.x, config.position.y, config.position.z);
            agents[key].rotation.y = config.position.rot;
            agents[key].userData.isWalking = false;
            resetAgentPose(agents[key]);
        });
    }, 2000);
}

/**
 * Reset agent pose
 */
function resetAgentPose(agent) {
    agent.position.y = agent.userData.originalY || 0;
    
    if (agent.userData.leftArm) {
        agent.userData.leftArm.rotation.set(0, 0, 0);
    }
    if (agent.userData.rightArm) {
        agent.userData.rightArm.rotation.set(0, 0, 0);
    }
    if (agent.userData.leftLeg) {
        agent.userData.leftLeg.rotation.set(0, 0, 0);
    }
    if (agent.userData.rightLeg) {
        agent.userData.rightLeg.rotation.set(0, 0, 0);
    }
}

/**
 * Update Routine UI
 */
function updateRoutineUI(action) {
    const startBtn = document.getElementById('btn-start-routine');
    const skipBtn = document.getElementById('btn-skip-phase');
    const stopBtn = document.getElementById('btn-stop-routine');
    const phaseEl = document.getElementById('routine-phase');
    const progressBar = document.getElementById('routine-progress');
    
    if (action === 'start') {
        startBtn.style.display = 'none';
        skipBtn.style.display = 'inline-block';
        stopBtn.style.display = 'inline-block';
    } else if (action === 'stop') {
        startBtn.style.display = 'inline-block';
        skipBtn.style.display = 'none';
        stopBtn.style.display = 'none';
        phaseEl.textContent = 'Ready to start';
        progressBar.style.width = '0%';
        updateTimerDisplay(0);
        
        // Clear phase highlights
        document.querySelectorAll('.phase-item').forEach(el => {
            el.classList.remove('active', 'completed');
        });
    }
}

/**
 * Update phase UI
 */
function updatePhaseUI(phaseIndex) {
    const phaseEl = document.getElementById('routine-phase');
    const phase = DailyRoutine.phases[phaseIndex];
    
    phaseEl.textContent = `Phase ${phaseIndex + 1}: ${phase.name}`;
    
    // Update phase list
    document.querySelectorAll('.phase-item').forEach((el, i) => {
        el.classList.remove('active');
        if (i < phaseIndex) {
            el.classList.add('completed');
        } else if (i === phaseIndex) {
            el.classList.add('active');
        }
    });
}

/**
 * Update progress bar
 */
function updateProgressBar(duration) {
    const progressBar = document.getElementById('routine-progress');
    const startTime = Date.now();
    const endTime = startTime + (duration * 1000);
    
    function update() {
        if (!DailyRoutine.isRunning) return;
        
        const now = Date.now();
        const elapsed = now - startTime;
        const remaining = endTime - now;
        const progress = Math.min(100, (elapsed / (duration * 1000)) * 100);
        
        progressBar.style.width = `${progress}%`;
        updateTimerDisplay(Math.max(0, Math.ceil(remaining / 1000)));
        
        if (remaining > 0) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

/**
 * Update timer display
 */
function updateTimerDisplay(seconds) {
    const timerEl = document.getElementById('routine-timer');
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Animate steam particles
 */
function animateRoutineSteam() {
    const time = Date.now() * 0.001;
    
    DailyRoutine.steamParticles.forEach(steam => {
        if (!steam.userData) return;
        
        steam.position.y += 0.005 * steam.userData.speed;
        steam.position.x = steam.userData.initialX + Math.sin(time * 2 + steam.userData.offset) * 0.02;
        steam.position.z = steam.userData.initialZ + Math.cos(time * 1.5 + steam.userData.offset) * 0.02;
        
        const height = steam.position.y - steam.userData.baseY;
        steam.material.opacity = Math.max(0, 0.4 - height * 0.5);
        
        if (steam.position.y > steam.userData.baseY + 0.5) {
            steam.position.y = steam.userData.baseY;
            steam.material.opacity = 0.4;
        }
    });
}

/**
 * Update routine animations
 */
function updateDailyRoutineAnimations() {
    if (!DailyRoutine.isRunning) return;
    
    animateTyping();
    animateRoutineSteam();
}

// Export functions for use in main script
window.DailyRoutine = DailyRoutine;
window.initDailyRoutine = initDailyRoutine;
window.updateDailyRoutineAnimations = updateDailyRoutineAnimations;
window.startDailyRoutine = startDailyRoutine;
window.stopDailyRoutine = stopDailyRoutine;
window.skipToNextPhase = skipToNextPhase;