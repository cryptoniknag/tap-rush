/**
 * Chat System - Full-Size Telegram-Style Messaging for 3D Office Agents
 * Features: Agent selection, message threading, task parsing, execution tracking
 */

// Chat System State
const chatState = {
    selectedAgent: null,
    isChatOpen: false,
    messages: [],
    taskHistory: [],
    isTyping: false,
    speechBubbles: {},
    pendingTask: null
};

// Agent configurations with avatars and personalities
const AGENT_PERSONALITIES = {
    groot: {
        name: 'Groot',
        role: 'The Digital Ent',
        avatar: '🌳',
        greeting: "I am Groot! 🌳 Ready to grow with the team!",
        responses: {
            hello: ["I am Groot! 👋", "Groot! 🌿", "I am Groot? *tilts head*"],
            desk: ["I am Groot! *returns to tree station* 🌱", "Groot! *walking to desk*", "Back to my roots! 🌳"],
            kanban: ["I am Groot! *shuffles to board* 📋", "Groot! 🍃 *views tasks*", "Checking the growth board! 🌿"],
            meeting: ["I am Groot! *attends meeting* 📅", "Groot! 🌳 *conference time*", "Meeting time! 🌱"],
            stand: ["I am Groot! *stands tall* 🌲", "Groot! 🌿 *standing*", "Standing strong! 🌳"],
            sit: ["I am Groot! *takes root* 🪑", "Groot! 🌱 *sitting*", "Rooting down! 🌿"],
            wave: ["I am Groot! *waves branches* 👋", "Groot! 🌿 *friendly wave*", "Hello there! 🌳"],
            coffee: ["I am Groot! *needs water* 💧", "Groot! 🌱 *thirsty tree*", "Hydration time! 💦"],
            gym: ["I am Groot! *flexes roots* 💪", "Groot! 🌲 *tree strength*", "Growing stronger! 🌿"],
            lounge: ["I am Groot! *relaxes* 🌿", "Groot! 🍃 *chilling*", "Rest time! 🌳"],
            dance: ["I am Groot! *dances* 💃", "Groot! 🌿 *boogie*", "Tree dance! 🌳"],
            work: ["I am Groot! *codes furiously* 💻", "Groot! 🌱 *working hard*", "Growing the codebase! 🌿"],
            default: ["I am Groot? 🤔", "Groot! 🌿", "*confused tree noises* 🌳"]
        },
        actions: {
            desk: { anim: 'walk', zone: 'grootDesk', duration: 2000 },
            kanban: { anim: 'walk', zone: 'kanbanBoard', duration: 2000 },
            meeting: { anim: 'walk', zone: 'grootChair', duration: 2000, sit: true },
            stand: { anim: 'stand', duration: 1000 },
            sit: { anim: 'sit', duration: 1000 },
            wave: { anim: 'wave', duration: 2000 },
            dance: { anim: 'dance', duration: 4000 },
            gym: { anim: 'walk', zone: 'gymArea', duration: 2500 },
            lounge: { anim: 'walk', zone: 'lounge', duration: 2500 },
            coffee: { anim: 'walk', zone: 'coffeeStation', duration: 2000 }
        },
        color: '#4CAF50'
    },
    fin: {
        name: 'Fin',
        role: 'The Strategist',
        avatar: '📊',
        greeting: "Hey there! Fin here. What's the play? 📊 Ready to strategize!",
        responses: {
            hello: ["Hey! Ready to make some moves? 📈", "Fin here! What's up? 📊", "Yo! Got a strategy to discuss? 🎯"],
            desk: ["Back to the trading desk! 📈", "Time to analyze the markets! 💹", "Heading to my workstation! 🖥️"],
            kanban: ["Let's review those priorities! 📋", "Checking the board! ✅", "Sprint planning time! 🎯"],
            meeting: ["Conference room it is! 📅", "Let's sync up! 🤝", "Meeting time! 📊"],
            stand: ["Standing by! 🫡", "On my feet! 👆", "Ready for action! 💪"],
            sit: ["Taking a seat! 🪑", "Sitting down! 📉", "Resting the legs! 💺"],
            wave: ["Hey there! 👋", "Waving back at ya! ✋", "Hello! 🎯"],
            coffee: ["Coffee time! ☕", "Need that caffeine boost! 📊", "Espresso break! ☕"],
            gym: ["Time for a workout! 💪", "Gym session! 🏋️", "Gotta stay fit! 💹"],
            lounge: ["Time to relax! 🛋️", "Break time! ☕", "Chilling in the lounge! 🎯"],
            dance: ["Let's celebrate! 🎉", "Party time! 🕺", "Dance break! 💃"],
            work: ["Crunching numbers! 📊", "Analyzing data! 📈", "Strategy mode activated! 🎯"],
            default: ["Not sure about that, want me to check the data? 🤔", "Can you clarify? 📊", "Hmm, let me think... 🧮"]
        },
        actions: {
            desk: { anim: 'walk', zone: 'finDesk', duration: 2000 },
            kanban: { anim: 'walk', zone: 'kanbanBoard', duration: 2000 },
            meeting: { anim: 'walk', zone: 'finChair', duration: 2000, sit: true },
            stand: { anim: 'stand', duration: 1000 },
            sit: { anim: 'sit', duration: 1000 },
            wave: { anim: 'wave', duration: 2000 },
            dance: { anim: 'dance', duration: 4000 },
            gym: { anim: 'walk', zone: 'gymArea', duration: 2500 },
            lounge: { anim: 'walk', zone: 'lounge', duration: 2500 },
            coffee: { anim: 'walk', zone: 'coffeeStation', duration: 2000 }
        },
        color: '#1976D2'
    },
    betty: {
        name: 'Betty',
        role: 'The Creative',
        avatar: '🎨',
        greeting: "Hi hi! Betty here! Ready to create something pretty? ✨ Let's make magic!",
        responses: {
            hello: ["Heya! 💕", "Hi there! What's cooking? 🎨", "Hello! Got some design ideas? ✨"],
            desk: ["Back to my creative corner! 🎨", "Time to design! ✏️", "Heading to my pink paradise! 💕"],
            kanban: ["Let's see what we're working on! ✨", "Checking the creative board! 📋", "Task review time! 🎨"],
            meeting: ["Let's collaborate! 🤝", "Meeting time! 💕", "Let's get creative together! ✨"],
            stand: ["Standing up! 💃", "On my feet! 👆", "Ready to go! 💕"],
            sit: ["Taking a seat! 🪑", "Sitting down! 💺", "Getting comfy! ✨"],
            wave: ["Hi hi! 👋", "Waving! ✨", "Hellooooo! 💕"],
            coffee: ["Coffee break! ☕💕", "Time for a latte! ☕", "Caffeine please! ✨"],
            gym: ["Stretch time! 🧘‍♀️", "Yoga session! 🧘", "Staying fit and fab! 💪"],
            lounge: ["Relaxation time! 🛋️", "Break time! ☕", "Chilling in style! 💕"],
            dance: ["Dance party! 💃", "Let's groove! 🎵", "Boogie time! ✨"],
            work: ["Designing something beautiful! 🎨", "Creating magic! ✨", "Pixel perfection! 💕"],
            default: ["Ooh, that's interesting! Tell me more! 💭", "What do you mean? 🤔", "Hmm, not sure I got that! 💕"]
        },
        actions: {
            desk: { anim: 'walk', zone: 'bettyDesk', duration: 2000 },
            kanban: { anim: 'walk', zone: 'kanbanBoard', duration: 2000 },
            meeting: { anim: 'walk', zone: 'bettyChair', duration: 2000, sit: true },
            stand: { anim: 'stand', duration: 1000 },
            sit: { anim: 'sit', duration: 1000 },
            wave: { anim: 'wave', duration: 2000 },
            dance: { anim: 'dance', duration: 4000 },
            gym: { anim: 'walk', zone: 'gymArea', duration: 2500 },
            lounge: { anim: 'walk', zone: 'lounge', duration: 2500 },
            coffee: { anim: 'walk', zone: 'coffeeStation', duration: 2000 }
        },
        color: '#EC407A'
    },
    smith: {
        name: 'Smith',
        role: 'The Coder',
        avatar: '💻',
        greeting: "Smith here. What needs coding? 👨‍💻 Let's ship some features.",
        responses: {
            hello: ["Hey.", "Smith here.", "What's up? Got a bug to fix? 🐛"],
            desk: ["Back to the code mines.", "Time to ship some features.", "Returning to workstation. 💻"],
            kanban: ["Checking the board.", "Sprint status review.", "Task queue analysis. 📋"],
            meeting: ["Attending meeting.", "Syncing with team.", "Conference mode activated. 📅"],
            stand: ["Standing.", "I'm up.", "Ready."],
            sit: ["Sitting.", "Taking a seat.", "Positioned. 🪑"],
            wave: ["Hey.", "*waves*", "Hello. 👋"],
            coffee: ["Coffee acquired.", "Caffeine intake initiated.", "Espresso consumed. ☕"],
            gym: ["Workout time.", "Gym session commencing.", "Physical maintenance required. 💪"],
            lounge: ["Break time.", "Rest mode.", "Chilling. 🛋️"],
            dance: ["Executing dance protocol.", "Dance mode activated.", "Celebration subroutine. 🕺"],
            work: ["Coding...", "Shipping code.", "Debugging... 🐛"],
            default: ["Could you be more specific?", "I don't understand that command.", "Please clarify. 🤔"]
        },
        actions: {
            desk: { anim: 'walk', zone: 'smithDesk', duration: 2000 },
            kanban: { anim: 'walk', zone: 'kanbanBoard', duration: 2000 },
            meeting: { anim: 'walk', zone: 'smithChair', duration: 2000, sit: true },
            stand: { anim: 'stand', duration: 1000 },
            sit: { anim: 'sit', duration: 1000 },
            wave: { anim: 'wave', duration: 2000 },
            dance: { anim: 'dance', duration: 4000 },
            gym: { anim: 'walk', zone: 'gymArea', duration: 2500 },
            lounge: { anim: 'walk', zone: 'lounge', duration: 2500 },
            coffee: { anim: 'walk', zone: 'coffeeStation', duration: 2000 }
        },
        color: '#455A64'
    }
};

// Command keywords mapping
const COMMAND_KEYWORDS = {
    desk: ['desk', 'workstation', 'work', 'seat', 'station', 'office', 'table', 'seat'],
    kanban: ['kanban', 'board', 'tasks', 'sprint', 'todo', 'progress', 'standup'],
    meeting: ['meeting', 'conference', 'sync', 'discuss', 'gather', 'standup'],
    stand: ['stand', 'stand up', 'rise', 'up', 'on feet', 'get up'],
    sit: ['sit', 'sit down', 'take seat', 'chair', 'seat'],
    wave: ['wave', 'hello', 'hi', 'hey', 'greetings'],
    coffee: ['coffee', 'espresso', 'caffeine', 'break', 'drink', 'tea', 'water'],
    gym: ['gym', 'workout', 'exercise', 'fitness', 'treadmill', 'weights'],
    dance: ['dance', 'party', 'celebrate', 'fun', 'boogie', 'disco'],
    lounge: ['lounge', 'relax', 'break', 'rest', 'sofa', 'couch', 'chill'],
    work: ['work', 'code', 'develop', 'program', 'build', 'create']
};

// Initialize Chat System
document.addEventListener('DOMContentLoaded', function() {
    console.log('[ChatSystem] Initializing...');
    
    // Wait for agents to be available
    function waitForAgents(attempts = 0) {
        if (typeof agents !== 'undefined' && Object.keys(agents).length > 0) {
            console.log('[ChatSystem] Agents found, initializing...');
            initChatSystem();
        } else if (attempts < 100) {
            setTimeout(() => waitForAgents(attempts + 1), 100);
        }
    }
    
    waitForAgents();
});

function initChatSystem() {
    console.log('[ChatSystem] Initialized successfully');
    
    // Setup raycaster click handler
    setupAgentClickHandler();
    
    // Start speech bubble animation loop
    animateSpeechBubbles();
}

// Setup click handler for agent selection
function setupAgentClickHandler() {
    const canvas = document.getElementById('canvas-container');
    if (!canvas) {
        console.error('[ChatSystem] Canvas not found!');
        return;
    }
    
    console.log('[ChatSystem] Setting up click handler on canvas');
    
    canvas.addEventListener('click', function(event) {
        console.log('[ChatSystem] Click detected on canvas');
        console.log('[ChatSystem] Event target:', event.target.tagName);
        
        // Check if camera and agents are available
        if (typeof camera === 'undefined') {
            console.error('[ChatSystem] Camera not available!');
            return;
        }
        if (typeof agents === 'undefined' || Object.keys(agents).length === 0) {
            console.error('[ChatSystem] Agents not available!');
            return;
        }
        
        // Calculate mouse position
        const rect = canvas.getBoundingClientRect();
        const mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        console.log('[ChatSystem] Click at screen:', event.clientX, event.clientY);
        console.log('[ChatSystem] Click at NDC:', mouse.x, mouse.y);
        
        // Setup raycaster
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        
        // Get all agent meshes
        const agentMeshes = [];
        Object.values(agents).forEach(agent => {
            console.log('[ChatSystem] Checking agent:', agent.userData?.id || 'unknown');
            agent.traverse(child => {
                if (child.isMesh) {
                    agentMeshes.push(child);
                    console.log('[ChatSystem] Added mesh:', child.name || 'unnamed');
                }
            });
        });
        
        console.log('[ChatSystem] Total meshes to check:', agentMeshes.length);
        
        // Check intersections - recursive to catch all child meshes
        const intersects = raycaster.intersectObjects(agentMeshes, true);
        
        console.log('[ChatSystem] Intersections found:', intersects.length);
        
        if (intersects.length > 0) {
            console.log('[ChatSystem] First intersection:', intersects[0].object.name || 'unnamed', 
                        'distance:', intersects[0].distance,
                        'point:', intersects[0].point);
            
            let clickedObj = intersects[0].object;
            // Traverse up to find agent group with userData.id
            let depth = 0;
            while (clickedObj.parent && !clickedObj.parent.userData?.id && depth < 10) {
                console.log('[ChatSystem] Traversing up, current:', clickedObj.name || 'unnamed');
                clickedObj = clickedObj.parent;
                depth++;
            }
            
            if (clickedObj.parent && clickedObj.parent.userData?.id) {
                const agentId = clickedObj.parent.userData.id;
                console.log('[ChatSystem] Agent clicked:', agentId);
                openChat(agentId);
            } else {
                console.log('[ChatSystem] Could not find agent with id, parent:', clickedObj.parent);
                if (clickedObj.parent) {
                    console.log('[ChatSystem] parent.userData:', clickedObj.parent.userData);
                }
            }
        } else {
            console.log('[ChatSystem] No intersections found');
        }
    });
}

// Open Chat Interface
function openChat(agentId) {
    if (!AGENT_PERSONALITIES[agentId]) return;
    
    chatState.selectedAgent = agentId;
    chatState.isChatOpen = true;
    
    const personality = AGENT_PERSONALITIES[agentId];
    
    // Update header
    const avatarEl = document.getElementById('chat-avatar');
    const nameEl = document.getElementById('chat-agent-name');
    const statusEl = document.getElementById('chat-agent-status');
    
    if (avatarEl) {
        avatarEl.textContent = personality.avatar;
        avatarEl.className = agentId;
    }
    
    if (nameEl) nameEl.textContent = `${personality.name} - ${personality.role}`;
    if (statusEl) {
        statusEl.textContent = 'online';
        statusEl.className = 'online';
    }
    
    // Hide welcome, show messages
    const welcomeEl = document.getElementById('chat-welcome');
    const messagesEl = document.getElementById('chat-messages');
    const inputEl = document.getElementById('chat-input-area');
    const statsEl = document.getElementById('agent-stats');
    
    if (welcomeEl) welcomeEl.style.display = 'none';
    if (messagesEl) {
        messagesEl.style.display = 'flex';
        messagesEl.innerHTML = ''; // Clear previous messages
    }
    if (inputEl) inputEl.style.display = 'block';
    if (statsEl) statsEl.style.display = 'block';
    
    // Add greeting message
    addMessage('agent', personality.greeting);
    showSpeechBubble(agentId, personality.greeting);
    
    // Focus input
    const input = document.getElementById('chat-input');
    if (input) setTimeout(() => input.focus(), 100);
    
    // Update task history
    updateTaskHistory();
    
    // Highlight agent in 3D
    highlightAgent(agentId);
    
    console.log(`[ChatSystem] Chat opened with ${agentId}`);
}

// Close Chat Interface
function closeChat() {
    chatState.isChatOpen = false;
    chatState.selectedAgent = null;
    
    // Reset header
    const avatarEl = document.getElementById('chat-avatar');
    const nameEl = document.getElementById('chat-agent-name');
    const statusEl = document.getElementById('chat-agent-status');
    
    if (avatarEl) {
        avatarEl.textContent = '🤖';
        avatarEl.className = '';
    }
    if (nameEl) nameEl.textContent = 'Select an Agent';
    if (statusEl) {
        statusEl.textContent = 'Click on any agent in the 3D office';
        statusEl.className = '';
    }
    
    // Show welcome, hide messages
    const welcomeEl = document.getElementById('chat-welcome');
    const messagesEl = document.getElementById('chat-messages');
    const inputEl = document.getElementById('chat-input-area');
    const statsEl = document.getElementById('agent-stats');
    
    if (welcomeEl) welcomeEl.style.display = 'flex';
    if (messagesEl) messagesEl.style.display = 'none';
    if (inputEl) inputEl.style.display = 'none';
    if (statsEl) statsEl.style.display = 'none';
    
    // Clear any highlighting
    clearAgentHighlight();
    
    console.log('[ChatSystem] Chat closed');
}

// Add Message to Chat
function addMessage(sender, text, type = 'normal') {
    const messagesEl = document.getElementById('chat-messages');
    if (!messagesEl) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    if (type === 'task-complete') messageDiv.classList.add('task-complete');
    
    const time = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    
    messageDiv.innerHTML = `
        <div class="message-text">${text}</div>
        <div class="message-time">${time}</div>
    `;
    
    messagesEl.appendChild(messageDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    
    // Store in state
    chatState.messages.push({ sender, text, time, type });
}

// Show typing indicator
function showTyping() {
    const messagesEl = document.getElementById('chat-messages');
    if (!messagesEl) return;
    
    // Remove existing typing indicator
    const existing = messagesEl.querySelector('.typing-indicator');
    if (existing) existing.remove();
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    typingDiv.id = 'typing-indicator';
    
    messagesEl.appendChild(typingDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    
    // Update status
    const statusEl = document.getElementById('chat-agent-status');
    if (statusEl) {
        statusEl.textContent = 'typing...';
        statusEl.className = 'typing';
    }
}

// Hide typing indicator
function hideTyping() {
    const typingEl = document.getElementById('typing-indicator');
    if (typingEl) typingEl.remove();
    
    const statusEl = document.getElementById('chat-agent-status');
    if (statusEl) {
        statusEl.textContent = 'online';
        statusEl.className = 'online';
    }
}

// Handle key press in chat input
function handleChatKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
    }
}

// Send Chat Message
function sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input || !chatState.selectedAgent) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    // Add user message
    addMessage('user', message);
    
    // Process command
    processCommand(chatState.selectedAgent, message);
}

// Send Quick Command
function sendQuickCommand(command) {
    if (!chatState.selectedAgent) {
        showNotification('Please select an agent first!');
        return;
    }
    
    // Add user message
    const commandText = command.charAt(0).toUpperCase() + command.slice(1);
    addMessage('user', commandText);
    
    // Process command
    processCommand(chatState.selectedAgent, command);
}

// Process Command and Generate Response
function processCommand(agentId, message) {
    const lowerMessage = message.toLowerCase();
    let command = null;
    
    // Check for command keywords
    for (const [cmd, keywords] of Object.entries(COMMAND_KEYWORDS)) {
        if (keywords.some(kw => lowerMessage.includes(kw))) {
            command = cmd;
            break;
        }
    }
    
    const personality = AGENT_PERSONALITIES[agentId];
    
    // Show typing indicator
    showTyping();
    
    // Simulate agent thinking time
    const thinkTime = 500 + Math.random() * 1000;
    
    setTimeout(() => {
        hideTyping();
        
        let response;
        if (command && personality.responses[command]) {
            const responses = personality.responses[command];
            response = responses[Math.floor(Math.random() * responses.length)];
        } else {
            const defaultResponses = personality.responses.default;
            response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
        }
        
        // Add agent response
        addMessage('agent', response);
        
        // Show speech bubble
        showSpeechBubble(agentId, response);
        
        // Execute action if available
        if (command && personality.actions[command]) {
            const action = personality.actions[command];
            executeAgentAction(agentId, command, action);
            
            // Log task
            logTask(agentId, command);
        }
    }, thinkTime);
}

// Execute Agent Action
function executeAgentAction(agentId, command, action) {
    const agent = agents[agentId];
    if (!agent) return;
    
    console.log(`[ChatSystem] Executing ${action.anim} for ${agentId}`);
    
    switch (action.anim) {
        case 'walk':
            if (action.zone && OFFICE_ZONES[action.zone]) {
                const zone = OFFICE_ZONES[action.zone];
                moveAgentToZone(agentId, action.zone);
                
                // If should sit at destination
                if (action.sit) {
                    setTimeout(() => {
                        agent.userData.isSitting = true;
                        agent.userData.originalY = 0.9; // Sitting height
                    }, action.duration);
                }
            }
            break;
            
        case 'stand':
            agent.userData.isSitting = false;
            agent.userData.originalY = 1.4; // Standing height
            // Trigger stand animation
            agent.userData.action = 'stand';
            setTimeout(() => {
                agent.userData.action = null;
            }, action.duration);
            break;
            
        case 'sit':
            agent.userData.isSitting = true;
            agent.userData.originalY = 0.9; // Sitting height
            agent.userData.action = 'sit';
            setTimeout(() => {
                agent.userData.action = null;
            }, action.duration);
            break;
            
        case 'wave':
            agent.userData.action = 'wave';
            setTimeout(() => {
                agent.userData.action = null;
                resetAnimation(agent);
            }, action.duration);
            break;
            
        case 'dance':
            agent.userData.action = 'dance';
            setTimeout(() => {
                agent.userData.action = null;
                resetAnimation(agent);
            }, action.duration);
            break;
    }
    
    // Add task completion message
    setTimeout(() => {
        const taskMessages = {
            desk: "🏢 Arrived at desk! Ready to work.",
            kanban: "📋 At the kanban board. Tasks updated!",
            meeting: "📅 In the conference room. Let's discuss!",
            stand: "🧍 Standing by for instructions!",
            sit: "🪑 Taking a seat.",
            wave: "👋 Wave complete!",
            coffee: "☕ Got my coffee!",
            gym: "💪 At the gym. Time to work out!",
            lounge: "🛋️ Relaxing in the lounge.",
            dance: "💃 Dance complete!",
            work: "💻 Working now!"
        };
        
        if (taskMessages[command]) {
            addMessage('agent', taskMessages[command], 'task-complete');
        }
    }, action.duration + 500);
}

// Log task to history
function logTask(agentId, command) {
    const taskNames = {
        desk: 'Went to desk',
        kanban: 'Checked kanban board',
        meeting: 'Attended meeting',
        stand: 'Stood up',
        sit: 'Sat down',
        wave: 'Waved',
        coffee: 'Coffee break',
        gym: 'Gym session',
        lounge: 'Lounge break',
        dance: 'Danced',
        work: 'Worked'
    };
    
    const task = {
        agent: AGENT_PERSONALITIES[agentId].name,
        task: taskNames[command] || command,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        completed: true
    };
    
    chatState.taskHistory.push(task);
    updateTaskHistory();
}

// Update task history display
function updateTaskHistory() {
    const historyEl = document.getElementById('task-history');
    if (!historyEl) return;
    
    if (chatState.taskHistory.length === 0) {
        historyEl.innerHTML = '<div style="color: #6b7c8e; font-style: italic;">No tasks yet...</div>';
        return;
    }
    
    // Show last 5 tasks
    const recentTasks = chatState.taskHistory.slice(-5).reverse();
    historyEl.innerHTML = recentTasks.map(task => `
        <div class="history-item completed">
            <span>${task.task}</span>
            <span style="color: #6b7c8e;">${task.time}</span>
        </div>
    `).join('');
}

// Show Speech Bubble above agent
function showSpeechBubble(agentId, text) {
    // Remove existing bubble
    if (chatState.speechBubbles[agentId]) {
        chatState.speechBubbles[agentId].remove();
    }
    
    // Create new bubble
    const bubble = document.createElement('div');
    bubble.className = `speech-bubble ${agentId}`;
    
    // Truncate long text
    const displayText = text.length > 60 ? text.substring(0, 60) + '...' : text;
    bubble.textContent = displayText;
    
    document.body.appendChild(bubble);
    chatState.speechBubbles[agentId] = bubble;
    
    // Position bubble
    updateSpeechBubblePosition(agentId);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (chatState.speechBubbles[agentId] === bubble) {
            bubble.style.opacity = '0';
            bubble.style.transform = 'translate(-50%, -100%) scale(0.8)';
            bubble.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                bubble.remove();
                if (chatState.speechBubbles[agentId] === bubble) {
                    delete chatState.speechBubbles[agentId];
                }
            }, 300);
        }
    }, 4000);
}

// Update Speech Bubble Position
function updateSpeechBubblePosition(agentId) {
    const bubble = chatState.speechBubbles[agentId];
    const agent = agents[agentId];
    
    if (!bubble || !agent || typeof camera === 'undefined') return;
    
    // Get agent position in world space
    const agentPos = agent.position.clone();
    agentPos.y += 3.5; // Above agent head
    
    // Project to screen space
    agentPos.project(camera);
    
    // Check if behind camera
    if (agentPos.z > 1) {
        bubble.style.display = 'none';
        return;
    }
    
    // Convert to CSS coordinates
    const canvasWidth = window.innerWidth * 0.65; // Canvas is 65% width
    const x = (agentPos.x * 0.5 + 0.5) * canvasWidth;
    const y = (-agentPos.y * 0.5 + 0.5) * window.innerHeight;
    
    bubble.style.display = 'block';
    bubble.style.left = x + 'px';
    bubble.style.top = y + 'px';
    bubble.style.transform = 'translate(-50%, -100%)';
}

// Animate Speech Bubbles
function animateSpeechBubbles() {
    function update() {
        Object.keys(chatState.speechBubbles).forEach(agentId => {
            updateSpeechBubblePosition(agentId);
        });
        requestAnimationFrame(update);
    }
    update();
}

// Highlight agent in 3D
function highlightAgent(agentId) {
    clearAgentHighlight();
    
    const agent = agents[agentId];
    if (!agent) return;
    
    // Show selection ring
    if (agent.userData.selectionRing) {
        agent.userData.selectionRing.material.opacity = 0.8;
    }
    
    // Add highlight effect (emissive material change)
    agent.traverse(child => {
        if (child.isMesh && child.material && !child.userData.isHitbox) {
            if (!child.userData.originalEmissive) {
                child.userData.originalEmissive = child.material.emissive ? child.material.emissive.clone() : new THREE.Color(0, 0, 0);
            }
            if (child.material.emissive) {
                child.material.emissive.setHex(0x444444);
            }
        }
    });
}

// Clear agent highlight
function clearAgentHighlight() {
    Object.values(agents).forEach(agent => {
        // Hide selection ring
        if (agent.userData.selectionRing) {
            agent.userData.selectionRing.material.opacity = 0;
        }
        
        // Restore emissive
        agent.traverse(child => {
            if (child.isMesh && child.material && child.userData.originalEmissive) {
                child.material.emissive.copy(child.userData.originalEmissive);
            }
        });
    });
}

// Show notification
function showNotification(text) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        animation: fadeInOut 2.5s ease forwards;
    `;
    notification.textContent = text;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 2500);
}

// Export functions to window
window.openChat = openChat;
window.closeChat = closeChat;
window.sendChatMessage = sendChatMessage;
window.sendQuickCommand = sendQuickCommand;
window.handleChatKeyPress = handleChatKeyPress;
window.selectAgentById = openChat; // Alias for welcome screen
