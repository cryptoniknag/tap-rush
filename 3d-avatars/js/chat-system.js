/**
 * Chat System - Interactive Communication for 3D Office Agents
 * Features: Click-to-chat, Speech bubbles, Command parsing, Agent responses
 */

// Chat System State
const chatState = {
    selectedAgent: null,
    isChatOpen: false,
    chatHistory: [],
    speechBubbles: {},
    commandQueue: [],
    isListening: false
};

// Agent Personalities & Responses
const AGENT_PERSONALITIES = {
    groot: {
        greeting: "I am Groot! 🌳",
        responses: {
            hello: ["I am Groot!", "Groot! 🌿", "I am Groot? *tilts head*"],
            desk: ["I am Groot! *returns to tree station*", "Groot! 🌱 *walking to desk*"],
            kanban: ["I am Groot! *shuffles to board*", "Groot! 🍃 *views tasks*"],
            stand: ["I am Groot! *stands tall*", "Groot! 🌲 *standing*"],
            wave: ["I am Groot! *waves branches*", "Groot! 👋 *friendly wave*"],
            coffee: ["I am Groot! *needs water*", "Groot! 💧 *thirsty tree*"],
            meeting: ["I am Groot! *attends meeting*", "Groot! 🌳 *conference time*"],
            gym: ["I am Groot! *flexes roots*", "Groot! 💪 *tree strength*"],
            default: ["I am Groot?", "Groot! 🌿", "*confused tree noises*"]
        },
        actions: {
            desk: { anim: 'walk', duration: 2000 },
            kanban: { anim: 'walk', duration: 2000 },
            stand: { anim: 'stand', duration: 1000 },
            wave: { anim: 'wave', duration: 2000 },
            dance: { anim: 'dance', duration: 4000 }
        }
    },
    fin: {
        greeting: "Hey there! Fin here. What's the play? 📊",
        responses: {
            hello: ["Hey! Ready to make some moves?", "Fin here! What's up?", "Yo! Got a strategy to discuss?"],
            desk: ["Back to the trading desk! 📈", "Time to analyze the markets!", "Heading to my workstation!"],
            kanban: ["Let's review those priorities! 📋", "Checking the board!", "Sprint planning time!"],
            stand: ["Standing by! 🫡", "On my feet!", "Ready for action!"],
            wave: ["Hey there! 👋", "Waving back at ya!", "Hello!"],
            coffee: ["Coffee time! ☕", "Need that caffeine boost!", "Espresso break!"],
            meeting: ["Conference room it is! 📅", "Let's sync up!", "Meeting time!"],
            gym: ["Time for a workout! 💪", "Gym session!", "Gotta stay fit!"],
            default: ["Not sure about that, want me to check the data?", "Can you clarify?", "Hmm, let me think..."]
        },
        actions: {
            desk: { anim: 'walk', duration: 2000 },
            kanban: { anim: 'walk', duration: 2000 },
            stand: { anim: 'stand', duration: 1000 },
            wave: { anim: 'wave', duration: 2000 },
            dance: { anim: 'dance', duration: 4000 }
        }
    },
    betty: {
        greeting: "Hi hi! Betty here! Ready to create something pretty? 🎨",
        responses: {
            hello: ["Heya! 💕", "Hi there! What's cooking?", "Hello! Got some design ideas?"],
            desk: ["Back to my creative corner! 🎨", "Time to design!", "Heading to my pink paradise!"],
            kanban: ["Let's see what we're working on! ✨", "Checking the creative board!", "Task review time!"],
            stand: ["Standing up! 💃", "On my feet!", "Ready to go!"],
            wave: ["Hi hi! 👋", "Waving! ✨", "Hellooooo!"],
            coffee: ["Coffee break! ☕💕", "Time for a latte!", "Caffeine please!"],
            meeting: ["Let's collaborate! 🤝", "Meeting time!", "Let's get creative together!"],
            gym: ["Stretch time! 🧘‍♀️", "Yoga session!", "Staying fit and fab!"],
            default: ["Ooh, that's interesting! Tell me more!", "What do you mean? 💭", "Hmm, not sure I got that!"]
        },
        actions: {
            desk: { anim: 'walk', duration: 2000 },
            kanban: { anim: 'walk', duration: 2000 },
            stand: { anim: 'stand', duration: 1000 },
            wave: { anim: 'wave', duration: 2000 },
            dance: { anim: 'dance', duration: 4000 }
        }
    },
    smith: {
        greeting: "Smith here. What needs coding? 👨‍💻",
        responses: {
            hello: ["Hey.", "Smith here.", "What's up? Got a bug to fix?"],
            desk: ["Back to the code mines.", "Time to ship some features.", "Returning to workstation."],
            kanban: ["Checking the board.", "Sprint status review.", "Task queue analysis."],
            stand: ["Standing.", "I'm up.", "Ready."],
            wave: ["Hey.", "*waves*", "Hello."],
            coffee: ["Coffee acquired.", "Caffeine intake initiated.", "Espresso consumed."],
            meeting: ["Attending meeting.", "Syncing with team.", "Conference mode activated."],
            gym: ["Workout time.", "Gym session commencing.", "Physical maintenance required."],
            default: ["Could you be more specific?", "I don't understand that command.", "Please clarify."]
        },
        actions: {
            desk: { anim: 'walk', duration: 2000 },
            kanban: { anim: 'walk', duration: 2000 },
            stand: { anim: 'stand', duration: 1000 },
            wave: { anim: 'wave', duration: 2000 },
            dance: { anim: 'dance', duration: 4000 }
        }
    }
};

// Command keywords mapping
const COMMAND_KEYWORDS = {
    desk: ['desk', 'workstation', 'work', 'seat', 'station', 'office', 'table'],
    kanban: ['kanban', 'board', 'tasks', 'sprint', 'todo', 'progress', 'standup'],
    stand: ['stand', 'stand up', 'rise', 'up', 'on feet'],
    sit: ['sit', 'sit down', 'take seat', 'chair'],
    wave: ['wave', 'hello', 'hi', 'hey', 'greetings'],
    coffee: ['coffee', 'espresso', 'caffeine', 'break', 'drink'],
    meeting: ['meeting', 'conference', 'sync', 'discuss', 'gather'],
    gym: ['gym', 'workout', 'exercise', 'fitness', 'treadmill', 'weights'],
    dance: ['dance', 'party', 'celebrate', 'fun', 'boogie'],
    lounge: ['lounge', 'relax', 'break', 'rest', 'sofa', 'couch']
};

// Initialize Chat System
function initChatSystem() {
    console.log('[ChatSystem] Initializing...');
    
    // Create UI elements
    createChatUI();
    
    // Setup raycaster click handler for agents
    setupAgentClickHandler();
    
    // Start animation loop for speech bubbles
    animateSpeechBubbles();
    
    console.log('[ChatSystem] Initialized successfully');
}

// Create Chat UI Elements
function createChatUI() {
    // Check if already exists
    if (document.getElementById('chat-interface')) return;
    
    // Chat Container
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chat-interface';
    chatContainer.innerHTML = `
        <div id="chat-header">
            <span id="chat-agent-name">Select an Agent</span>
            <button id="chat-close" onclick="closeChat()">×</button>
        </div>
        <div id="chat-messages"></div>
        <div id="chat-input-area">
            <input type="text" id="chat-input" placeholder="Type a command..." 
                   onkeypress="handleChatKeyPress(event)" autocomplete="off">
            <button id="chat-send" onclick="sendChatMessage()">➤</button>
            <button id="voice-btn" onclick="toggleVoiceCommand()" title="Voice Command">🎤</button>
        </div>
        <div id="quick-commands">
            <button class="quick-cmd" onclick="sendQuickCommand('desk')">Go to Desk</button>
            <button class="quick-cmd" onclick="sendQuickCommand('kanban')">Go to Kanban</button>
            <button class="quick-cmd" onclick="sendQuickCommand('stand')">Stand Up</button>
            <button class="quick-cmd" onclick="sendQuickCommand('wave')">Wave</button>
            <button class="quick-cmd" onclick="sendQuickCommand('meeting')">Meeting</button>
            <button class="quick-cmd" onclick="sendQuickCommand('dance')">Dance</button>
        </div>
    `;
    document.body.appendChild(chatContainer);
    
    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
        #chat-interface {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            background: rgba(26, 26, 46, 0.95);
            border: 2px solid #4CAF50;
            border-radius: 12px;
            display: none;
            flex-direction: column;
            z-index: 10000;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            backdrop-filter: blur(10px);
            font-family: 'Courier New', monospace;
            max-height: 500px;
        }
        
        #chat-header {
            background: linear-gradient(135deg, #4CAF50, #2E7D32);
            padding: 12px 15px;
            border-radius: 10px 10px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        #chat-agent-name {
            color: white;
            font-weight: bold;
            font-size: 16px;
        }
        
        #chat-close {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0 5px;
            line-height: 1;
        }
        
        #chat-close:hover {
            color: #ff4444;
        }
        
        #chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            max-height: 250px;
            min-height: 150px;
        }
        
        .chat-message {
            margin-bottom: 10px;
            padding: 10px;
            border-radius: 8px;
            font-size: 14px;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .chat-message.user {
            background: rgba(76, 175, 80, 0.2);
            border-left: 3px solid #4CAF50;
            margin-left: 20px;
        }
        
        .chat-message.agent {
            background: rgba(255, 255, 255, 0.1);
            border-left: 3px solid #FFD700;
            margin-right: 20px;
        }
        
        .chat-message .sender {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 4px;
            opacity: 0.8;
        }
        
        #chat-input-area {
            display: flex;
            padding: 10px;
            gap: 8px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        
        #chat-input {
            flex: 1;
            padding: 10px;
            border: 1px solid #4CAF50;
            border-radius: 6px;
            background: rgba(0,0,0,0.3);
            color: #fff;
            font-family: inherit;
            font-size: 14px;
        }
        
        #chat-input:focus {
            outline: none;
            border-color: #81C784;
            box-shadow: 0 0 8px rgba(76, 175, 80, 0.3);
        }
        
        #chat-send, #voice-btn {
            padding: 10px 14px;
            background: #4CAF50;
            border: none;
            border-radius: 6px;
            color: white;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s;
        }
        
        #chat-send:hover, #voice-btn:hover {
            background: #45a049;
            transform: scale(1.05);
        }
        
        #voice-btn.listening {
            background: #ff4444;
            animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        #quick-commands {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            padding: 10px;
            border-top: 1px solid rgba(255,255,255,0.1);
            background: rgba(0,0,0,0.2);
            border-radius: 0 0 10px 10px;
        }
        
        .quick-cmd {
            padding: 6px 12px;
            background: rgba(76, 175, 80, 0.3);
            border: 1px solid #4CAF50;
            border-radius: 15px;
            color: #fff;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .quick-cmd:hover {
            background: #4CAF50;
            transform: translateY(-2px);
        }
        
        /* Speech Bubble Styles */
        .speech-bubble {
            position: absolute;
            background: rgba(255, 255, 255, 0.95);
            color: #333;
            padding: 10px 15px;
            border-radius: 15px;
            font-size: 14px;
            font-weight: 500;
            max-width: 200px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            pointer-events: none;
            z-index: 9999;
            animation: bubblePop 0.3s ease;
        }
        
        @keyframes bubblePop {
            0% { transform: scale(0) translateY(10px); opacity: 0; }
            80% { transform: scale(1.1) translateY(-5px); }
            100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        
        .speech-bubble::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            border-width: 10px 10px 0;
            border-style: solid;
            border-color: rgba(255, 255, 255, 0.95) transparent transparent;
        }
        
        .speech-bubble.groot {
            background: #E8F5E9;
            border: 2px solid #4CAF50;
        }
        
        .speech-bubble.groot::after {
            border-color: #E8F5E9 transparent transparent;
        }
        
        .speech-bubble.fin {
            background: #E3F2FD;
            border: 2px solid #1976D2;
        }
        
        .speech-bubble.fin::after {
            border-color: #E3F2FD transparent transparent;
        }
        
        .speech-bubble.betty {
            background: #FCE4EC;
            border: 2px solid #EC407A;
        }
        
        .speech-bubble.betty::after {
            border-color: #FCE4EC transparent transparent;
        }
        
        .speech-bubble.smith {
            background: #ECEFF1;
            border: 2px solid #455A64;
        }
        
        .speech-bubble.smith::after {
            border-color: #ECEFF1 transparent transparent;
        }
        
        /* Agent selection hint */
        .agent-hint {
            position: absolute;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            pointer-events: none;
            z-index: 9998;
            animation: fadeInOut 2s ease;
        }
        
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; }
            20%, 80% { opacity: 1; }
        }
    `;
    document.head.appendChild(styles);
}

// Setup Agent Click Handler
function setupAgentClickHandler() {
    // Override the existing click handler to include chat
    const canvas = document.getElementById('canvas-container');
    if (!canvas) return;
    
    // Add click listener that works with existing raycaster
    canvas.addEventListener('click', function(event) {
        // Small delay to let the existing click handler run first
        setTimeout(() => {
            checkAgentClicked(event);
        }, 10);
    });
}

// Check if agent was clicked and open chat
function checkAgentClicked(event) {
    if (typeof raycaster === 'undefined' || typeof mouse === 'undefined') return;
    
    // Update mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // Check all agent meshes
    const agentMeshes = [];
    Object.values(agents).forEach(agent => {
        agent.traverse(child => {
            if (child.isMesh) agentMeshes.push(child);
        });
    });
    
    const intersects = raycaster.intersectObjects(agentMeshes, false);
    
    if (intersects.length > 0) {
        let clickedObj = intersects[0].object;
        // Traverse up to find agent group
        while (clickedObj.parent && !clickedObj.parent.userData.id) {
            clickedObj = clickedObj.parent;
        }
        
        if (clickedObj.parent && clickedObj.parent.userData.id) {
            const agentId = clickedObj.parent.userData.id;
            openChat(agentId);
            
            // Show click hint
            showClickHint(event.clientX, event.clientY, `Talking to ${AGENT_CONFIGS[agentId].name}...`);
        }
    }
}

// Show click hint animation
function showClickHint(x, y, text) {
    const hint = document.createElement('div');
    hint.className = 'agent-hint';
    hint.textContent = text;
    hint.style.left = x + 'px';
    hint.style.top = (y - 40) + 'px';
    document.body.appendChild(hint);
    
    setTimeout(() => hint.remove(), 2000);
}

// Open Chat Interface
function openChat(agentId) {
    chatState.selectedAgent = agentId;
    chatState.isChatOpen = true;
    
    const chatInterface = document.getElementById('chat-interface');
    const agentName = document.getElementById('chat-agent-name');
    const messages = document.getElementById('chat-messages');
    
    if (chatInterface) {
        chatInterface.style.display = 'flex';
        agentName.textContent = `Chat with ${AGENT_CONFIGS[agentId].name}`;
    }
    
    // Clear messages and add greeting
    if (messages) {
        messages.innerHTML = '';
        addMessage('agent', AGENT_PERSONALITIES[agentId].greeting);
    }
    
    // Focus input
    const input = document.getElementById('chat-input');
    if (input) {
        setTimeout(() => input.focus(), 100);
    }
    
    // Show speech bubble
    showSpeechBubble(agentId, AGENT_PERSONALITIES[agentId].greeting);
    
    console.log(`[ChatSystem] Chat opened with ${agentId}`);
}

// Close Chat Interface
function closeChat() {
    chatState.isChatOpen = false;
    chatState.selectedAgent = null;
    
    const chatInterface = document.getElementById('chat-interface');
    if (chatInterface) {
        chatInterface.style.display = 'none';
    }
    
    console.log('[ChatSystem] Chat closed');
}

// Add Message to Chat
function addMessage(sender, text) {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const senderName = sender === 'user' ? 'You' : AGENT_CONFIGS[chatState.selectedAgent]?.name || 'Agent';
    messageDiv.innerHTML = `<div class="sender">${senderName}</div><div>${text}</div>`;
    
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// Handle Chat Key Press
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

// Send Chat Message
function sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input || !input.value.trim() || !chatState.selectedAgent) return;
    
    const message = input.value.trim();
    input.value = '';
    
    // Add user message
    addMessage('user', message);
    
    // Process command and get response
    processCommand(chatState.selectedAgent, message);
}

// Send Quick Command
function sendQuickCommand(command) {
    if (!chatState.selectedAgent) {
        alert('Please click on an agent first!');
        return;
    }
    
    // Add user message
    addMessage('user', command);
    
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
    
    // Get response based on command
    const personality = AGENT_PERSONALITIES[agentId];
    let response;
    
    if (command && personality.responses[command]) {
        const responses = personality.responses[command];
        response = responses[Math.floor(Math.random() * responses.length)];
    } else {
        const defaultResponses = personality.responses.default;
        response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
    
    // Add delay for natural feel
    setTimeout(() => {
        addMessage('agent', response);
        showSpeechBubble(agentId, response);
        
        // Execute action if available
        if (command && personality.actions[command]) {
            executeAgentAction(agentId, command);
        }
    }, 500 + Math.random() * 500);
}

// Execute Agent Action
function executeAgentAction(agentId, command) {
    const agent = agents[agentId];
    if (!agent) return;
    
    const action = AGENT_PERSONALITIES[agentId].actions[command];
    if (!action) return;
    
    console.log(`[ChatSystem] Executing ${action.anim} for ${agentId}`);
    
    switch (action.anim) {
        case 'walk':
            if (command === 'desk') {
                moveAgentToZone(agentId, AGENT_CONFIGS[agentId].workstation);
            } else if (command === 'kanban') {
                moveAgentToZone(agentId, 'kanbanBoard');
            } else if (command === 'meeting') {
                moveAgentToZone(agentId, 'conferenceTable');
            } else if (command === 'lounge') {
                moveAgentToZone(agentId, 'lounge');
            }
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
            
        case 'stand':
            // Stand up animation
            if (agent.userData.isSitting) {
                agent.userData.isSitting = false;
                agent.userData.originalY = 0; // Standing height
            }
            break;
    }
}

// Show Speech Bubble
function showSpeechBubble(agentId, text) {
    // Remove existing bubble
    if (chatState.speechBubbles[agentId]) {
        chatState.speechBubbles[agentId].remove();
    }
    
    // Create new bubble
    const bubble = document.createElement('div');
    bubble.className = `speech-bubble ${agentId}`;
    
    // Truncate long text
    const displayText = text.length > 100 ? text.substring(0, 100) + '...' : text;
    bubble.textContent = displayText;
    
    document.body.appendChild(bubble);
    chatState.speechBubbles[agentId] = bubble;
    
    // Position bubble
    updateSpeechBubblePosition(agentId);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (chatState.speechBubbles[agentId] === bubble) {
            bubble.style.opacity = '0';
            bubble.style.transform = 'scale(0.8) translateY(-10px)';
            bubble.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                bubble.remove();
                if (chatState.speechBubbles[agentId] === bubble) {
                    delete chatState.speechBubbles[agentId];
                }
            }, 300);
        }
    }, 5000);
}

// Update Speech Bubble Positions
function updateSpeechBubblePosition(agentId) {
    const bubble = chatState.speechBubbles[agentId];
    const agent = agents[agentId];
    
    if (!bubble || !agent || !camera) return;
    
    // Get agent position in world space
    const agentPos = agent.position.clone();
    agentPos.y += 3.5; // Above agent head
    
    // Project to screen space
    agentPos.project(camera);
    
    // Convert to CSS coordinates
    const x = (agentPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-agentPos.y * 0.5 + 0.5) * window.innerHeight;
    
    // Check if behind camera
    if (agentPos.z > 1) {
        bubble.style.display = 'none';
    } else {
        bubble.style.display = 'block';
        bubble.style.left = x + 'px';
        bubble.style.top = y + 'px';
        bubble.style.transform = 'translate(-50%, -100%)';
    }
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

// Voice Command (Web Speech API)
function toggleVoiceCommand() {
    const voiceBtn = document.getElementById('voice-btn');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Voice commands not supported in this browser. Please use Chrome or Edge.');
        return;
    }
    
    if (chatState.isListening) {
        // Stop listening
        chatState.isListening = false;
        if (voiceBtn) {
            voiceBtn.classList.remove('listening');
            voiceBtn.textContent = '🎤';
        }
    } else {
        // Start listening
        chatState.isListening = true;
        if (voiceBtn) {
            voiceBtn.classList.add('listening');
            voiceBtn.textContent = '⏹';
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('[ChatSystem] Voice command:', transcript);
            
            // Add to input and send
            const input = document.getElementById('chat-input');
            if (input) {
                input.value = transcript;
                sendChatMessage();
            }
            
            // Stop listening
            chatState.isListening = false;
            if (voiceBtn) {
                voiceBtn.classList.remove('listening');
                voiceBtn.textContent = '🎤';
            }
        };
        
        recognition.onerror = (event) => {
            console.error('[ChatSystem] Voice error:', event.error);
            chatState.isListening = false;
            if (voiceBtn) {
                voiceBtn.classList.remove('listening');
                voiceBtn.textContent = '🎤';
            }
        };
        
        recognition.onend = () => {
            chatState.isListening = false;
            if (voiceBtn) {
                voiceBtn.classList.remove('listening');
                voiceBtn.textContent = '🎤';
            }
        };
        
        recognition.start();
    }
}

// Broadcast Message to All Agents
function broadcastMessage(message) {
    Object.keys(agents).forEach((agentId, index) => {
        setTimeout(() => {
            showSpeechBubble(agentId, message);
        }, index * 500);
    });
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('[ChatSystem] DOM ready, waiting for agents...');
    
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

// Export functions
typeof window !== 'undefined' && (window.chatSystem = {
    openChat,
    closeChat,
    sendQuickCommand,
    broadcastMessage,
    showSpeechBubble
});
