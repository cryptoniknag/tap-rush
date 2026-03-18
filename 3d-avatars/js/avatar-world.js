// MINIMAL VERSION
let scene, camera, renderer;

function init() {
    console.log('INIT STARTED');
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    
    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    scene.add(light);
    
    // Simple floor
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),
        new THREE.MeshStandardMaterial({color: 0x333333})
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    
    // Simple cube (test object)
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshStandardMaterial({color: 0x00ff00})
    );
    cube.position.y = 1;
    scene.add(cube);
    
    // Animation
    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
    
    console.log('INIT COMPLETE');
    document.getElementById('loading-screen').style.display = 'none';
}
