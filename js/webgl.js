// ═══════════════════════════════════════════
// THREE.JS PARTICLE MESH — Purple Squirrel Media
// ═══════════════════════════════════════════
(function() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    function makeParticleTexture() {
        const c = document.createElement('canvas');
        c.width = 64; c.height = 64;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.2, 'rgba(255,255,255,0.7)');
        g.addColorStop(0.5, 'rgba(255,255,255,0.15)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
    }

    const icoGeo = new THREE.IcosahedronGeometry(3.5, 1);
    const icoMat = new THREE.MeshBasicMaterial({ color: 0x7C3AED, wireframe: true, transparent: true, opacity: 0.12 });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    scene.add(ico);

    const ringGeo = new THREE.TorusGeometry(5, 0.015, 16, 120);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xA855F7, transparent: true, opacity: 0.08 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI * 0.5;
    scene.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo.clone(), ringMat.clone());
    ring2.rotation.x = Math.PI * 0.35;
    ring2.rotation.z = Math.PI * 0.3;
    ring2.material.opacity = 0.05;
    scene.add(ring2);

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 180 : 380;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = [];

    const purple1 = new THREE.Color(0x7C3AED);
    const purple2 = new THREE.Color(0xE879F9);
    const purple3 = new THREE.Color(0xC084FC);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 3 + Math.random() * 12;
        positions[i3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = r * Math.cos(phi) * 0.5;

        const mixColor = new THREE.Color().copy(purple1).lerp(Math.random() > 0.5 ? purple2 : purple3, Math.random());
        colors[i3] = mixColor.r;
        colors[i3 + 1] = mixColor.g;
        colors[i3 + 2] = mixColor.b;

        sizes[i] = Math.random() * 4 + 1;
        velocities.push({ x: (Math.random() - 0.5) * 0.008, y: (Math.random() - 0.5) * 0.008, z: (Math.random() - 0.5) * 0.004 });
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMat = new THREE.ShaderMaterial({
        uniforms: {
            uTexture: { value: makeParticleTexture() },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
        },
        vertexShader: 'attribute float size; varying vec3 vColor; uniform float uPixelRatio; void main() { vColor = color; vec4 mvPos = modelViewMatrix * vec4(position, 1.0); gl_PointSize = size * uPixelRatio * (280.0 / -mvPos.z); gl_Position = projectionMatrix * mvPos; }',
        fragmentShader: 'uniform sampler2D uTexture; varying vec3 vColor; void main() { vec4 tex = texture2D(uTexture, gl_PointCoord); gl_FragColor = vec4(vColor, tex.a * 0.75); }',
        vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const maxConn = isMobile ? 800 : 1600;
    const linePos = new Float32Array(maxConn * 6);
    const lineCol = new Float32Array(maxConn * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineCol, 3));

    const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    const mouse = { x: 0, y: 0, active: false };
    const mouseWorld = new THREE.Vector3();

    document.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        mouse.active = true;
        mouseWorld.set(mouse.x * 14, mouse.y * 10, 0);
    });
    document.addEventListener('mouseleave', () => { mouse.active = false; });

    let scrollY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        particleMat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    });

    const connectionDist = isMobile ? 2.8 : 3.2;
    const connectionDistSq = connectionDist * connectionDist;

    function animate(time) {
        requestAnimationFrame(animate);
        const t = time * 0.001;

        ico.rotation.x = t * 0.08;
        ico.rotation.y = t * 0.12;
        ring1.rotation.z = t * 0.04;
        ring2.rotation.y = t * 0.06;

        const pos = particleGeo.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const px = pos[i3], py = pos[i3 + 1];
            const dist2d = Math.sqrt(px * px + py * py);
            if (dist2d > 0.5) {
                const orbitalSpeed = 0.0004 / Math.max(dist2d * 0.1, 0.5);
                const angle = Math.atan2(py, px);
                pos[i3]     += Math.cos(angle + Math.PI * 0.5) * orbitalSpeed * dist2d;
                pos[i3 + 1] += Math.sin(angle + Math.PI * 0.5) * orbitalSpeed * dist2d;
            }
            pos[i3]     += velocities[i].x;
            pos[i3 + 1] += velocities[i].y;
            pos[i3 + 2] += velocities[i].z;
            pos[i3 + 1] += Math.sin(t * 0.3 + pos[i3] * 0.2) * 0.003;

            if (mouse.active) {
                const dx = mouseWorld.x - pos[i3];
                const dy = mouseWorld.y - pos[i3 + 1];
                const md = Math.sqrt(dx * dx + dy * dy);
                if (md < 6) {
                    const force = (6 - md) * 0.0015;
                    pos[i3]     += dx * force;
                    pos[i3 + 1] += dy * force;
                }
            }

            const bound = 16;
            if (Math.abs(pos[i3]) > bound) velocities[i].x *= -1;
            if (Math.abs(pos[i3 + 1]) > bound) velocities[i].y *= -1;
            if (Math.abs(pos[i3 + 2]) > 8) velocities[i].z *= -1;
        }
        particleGeo.attributes.position.needsUpdate = true;

        let connCount = 0;
        for (let i = 0; i < particleCount && connCount < maxConn; i++) {
            const i3 = i * 3;
            for (let j = i + 1; j < particleCount && connCount < maxConn; j++) {
                const j3 = j * 3;
                const dx = pos[i3] - pos[j3], dy = pos[i3+1] - pos[j3+1], dz = pos[i3+2] - pos[j3+2];
                const dSq = dx*dx + dy*dy + dz*dz;
                if (dSq < connectionDistSq) {
                    const c6 = connCount * 6;
                    linePos[c6]=pos[i3]; linePos[c6+1]=pos[i3+1]; linePos[c6+2]=pos[i3+2];
                    linePos[c6+3]=pos[j3]; linePos[c6+4]=pos[j3+1]; linePos[c6+5]=pos[j3+2];
                    const alpha = (1 - Math.sqrt(dSq) / connectionDist) * 0.6;
                    lineCol[c6]=0.486*alpha; lineCol[c6+1]=0.227*alpha; lineCol[c6+2]=0.929*alpha;
                    lineCol[c6+3]=0.659*alpha; lineCol[c6+4]=0.333*alpha; lineCol[c6+5]=0.969*alpha;
                    connCount++;
                }
            }
        }
        for (let k = connCount * 6; k < maxConn * 6; k++) { linePos[k] = 0; lineCol[k] = 0; }
        lineGeo.setDrawRange(0, connCount * 2);
        lineGeo.attributes.position.needsUpdate = true;
        lineGeo.attributes.color.needsUpdate = true;

        camera.position.y = -scrollY * 0.004;
        camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.02;
        camera.rotation.x = scrollY * 0.0005 * 0.15;

        const scrollOpacity = Math.max(0, 1 - scrollY * 0.0003);
        particleMat.opacity = scrollOpacity;
        lineMat.opacity = 0.35 * scrollOpacity;
        icoMat.opacity = 0.12 * scrollOpacity;

        renderer.render(scene, camera);
    }

    animate(0);
})();
