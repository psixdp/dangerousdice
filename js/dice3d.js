// 3D 骰子类 - 使用 Three.js 实现真实的 3D 骰子滚动效果

export class Dice3D {
    constructor(container, value) {
        this.container = container;
        this.value = value;
        this.isRolling = false;
        this.init();
    }

    init() {
        // 创建场景
        this.scene = new THREE.Scene();

        // 创建相机
        this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        this.camera.position.z = 4.5;

        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(110, 110);
        this.renderer.setClearColor(0x000000, 0);

        // 创建骰子几何体
        const geometry = new THREE.BoxGeometry(1.6, 1.6, 1.6);
        const material = this.createDiceMaterial();
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);

        // 添加光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(2, 2, 5);
        this.scene.add(directionalLight);

        // 添加到容器
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);
        this.container.style.padding = '0';

        // 设置初始值
        if (this.value !== '?') {
            this.setValue(this.value);
        } else {
            // 默认显示 1 点
            this.setValue(1);
        }

        this.render();
    }

    createDiceMaterial() {
        // 为6个面创建不同的材质（点数纹理）
        const materials = [];
        for (let i = 1; i <= 6; i++) {
            materials.push(this.createFaceMaterial(i));
        }
        return materials;
    }

    createFaceMaterial(number) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // 绘制骰子面背景
        ctx.fillStyle = '#314158';
        ctx.fillRect(0, 0, 128, 128);

        // 绘制边框
        ctx.strokeStyle = '#fe9a00';
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, 118, 118);

        // 绘制点数
        ctx.fillStyle = '#ffffff';
        this.drawDots(ctx, number);

        const texture = new THREE.CanvasTexture(canvas);
        return new THREE.MeshLambertMaterial({ map: texture });
    }

    drawDots(ctx, number) {
        const positions = {
            1: [[64, 64]],
            2: [[32, 32], [96, 96]],
            3: [[32, 32], [64, 64], [96, 96]],
            4: [[32, 32], [96, 32], [32, 96], [96, 96]],
            5: [[32, 32], [96, 32], [64, 64], [32, 96], [96, 96]],
            6: [[32, 32], [96, 32], [32, 64], [96, 64], [32, 96], [96, 96]]
        };

        const dots = positions[number];
        dots.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, 14, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    setValue(value) {
        this.value = value;
        this.rotateToFace(value);
    }

    rotateToFace(number) {
        // 根据点数旋转到对应面
        // Three.js BoxGeometry 的面顺序: +x(4), -x(2), +y(3), -y(1), +z(0), -z(5)
        const rotations = {
            1: [0, 0, 0],
            2: [0, -Math.PI / 2, 0],
            3: [0, 0, -Math.PI / 2],
            4: [0, Math.PI / 2, 0],
            5: [-Math.PI / 2, 0, 0],
            6: [Math.PI, 0, 0]
        };
        const [x, y, z] = rotations[number];
        this.cube.rotation.set(x, y, z);
        this.render();
    }

    async roll(targetValue) {
        if (this.isRolling) return Promise.resolve();
        this.isRolling = true;

        const startTime = Date.now();
        const duration = 800;

        // 滚动动画
        return new Promise(resolve => {
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                if (progress < 1) {
                    // 随机旋转模拟滚动
                    this.cube.rotation.x += 0.15 + Math.random() * 0.1;
                    this.cube.rotation.y += 0.2 + Math.random() * 0.15;
                    this.cube.rotation.z += 0.1 + Math.random() * 0.08;
                    this.render();
                    requestAnimationFrame(animate);
                } else {
                    // 完成滚动，旋转到目标面
                    this.isRolling = false;
                    this.setValue(targetValue);
                    resolve();
                }
            };
            animate();
        });
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
