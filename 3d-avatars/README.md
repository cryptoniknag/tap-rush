# 🌳 Agent Avatar World

A 3D interactive world featuring stylized avatars of the Tap Rush agents: Groot, Fin, and Betty.

## 🎮 Live Demo

**URL:** https://cryptoniknag.github.io/tap-rush/3d-avatars/

## ✨ Features

- **3D Environment**: Modern office/conference room setting with furniture, plants, and atmospheric lighting
- **Three Unique Avatars**:
  - 🌳 **Groot** - The Digital Ent (tree-like avatar with wooden texture and foliage)
  - 👔 **Fin** - The Strategist (low-poly human avatar with glasses and brown jacket)
  - 💗 **Betty** - The Creative (voxel-style pink avatar)
- **Animations**:
  - Walking animations with arm/leg movement
  - Idle breathing animations
  - Interactive actions: Wave, Dance, Follow
- **Camera Controls**:
  - Orbit controls (drag to rotate)
  - Zoom (scroll)
  - WASD keyboard movement
- **Interactive Elements**:
  - Click agents to select them
  - UI panel to trigger actions
  - Smooth camera transitions

## 🚀 How to Use

### Viewing the World

1. **Open the URL** in any modern web browser (Chrome, Firefox, Safari, Edge)
2. **Wait for loading** - The 3D scene will initialize
3. **Navigate**:
   - **Mouse drag**: Rotate camera around the scene
   - **Scroll**: Zoom in/out
   - **WASD keys**: Move camera position

### Interacting with Agents

1. **Click on any agent** to select them
2. **Use the action buttons** in the right panel:
   - 👋 **Wave**: Agent waves at you
   - 💃 **Dance**: Agent performs a dance animation
   - 🚶 **Follow**: Agent walks in a circle
   - ↩️ **Reset**: Return to idle state

### Agent Cards

Click the agent cards in the top-right to:
- Focus the camera on that agent
- See their details
- Access their action buttons

## 🛠️ Technical Details

### Built With

- **Three.js** - 3D graphics library
- **HTML5 Canvas** - UI elements
- **CSS3** - Styling and animations
- **Vanilla JavaScript** - Application logic

### Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires WebGL support.

### File Structure

```
3d-avatar-world/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Styling
├── js/
│   └── avatar-world.js # Three.js application
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Pages deployment
└── README.md           # This file
```

## 🎨 Avatar Design

The avatars are procedurally generated using Three.js primitives, styled to match the reference photos:

- **Groot**: Cylinders and spheres with wood-brown material and green foliage
- **Fin**: Box geometries with low-poly aesthetic, glasses, and business attire
- **Betty**: Voxel-style construction with pink color scheme

## 🔮 Future Enhancements

- [ ] Integration with ReadyPlayerMe or Avaturn for photo-realistic avatars
- [ ] Multiplayer support for real-time agent interactions
- [ ] Voice chat integration
- [ ] Custom environment themes
- [ ] Mobile VR support

## 📝 License

This project is created for Tap Rush internal use.

## 🙏 Credits

Created for the Tap Rush agent team: Groot, Fin, and Betty.