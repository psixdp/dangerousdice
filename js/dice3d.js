// 3D 骰子类 - 使用 Three.js 实现真实的 3D 骰子滚动效果

export class Dice3D {
    constructor(container, value, index = 0) {
        this.container = container;
        this.value = value;
        this.index = index;
        this.isRolling = false;
        this.init();
    }

    init() {
        // 创建场景
        this.scene = new THREE.Scene();

        // 创建相机 - 扩大视野以支持骰子移动
        this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        this.camera.position.z = 5.5;

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

    // Box-Muller 变换生成正态分布随机数
    normalDistribution(mean = 0, stdDev = 1) {
        let u1 = Math.random();
        let u2 = Math.random();
        while (u1 === 0) u1 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + z0 * stdDev;
    }

    // 缓动函数 - 惯性效果
    easeOutQuad(t) {
        return t * (2 - t);
    }

    // 缓动函数 - 弹跳效果
    easeOutBounce(t) {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
    }

    async roll(targetValue) {
        if (this.isRolling) return Promise.resolve();
        this.isRolling = true;

        const startTime = Date.now();
        const duration = 800;

        // 起始位置 - 基于骰子索引的抛出方向，确保每个骰子抛出方向不同
        // 使用基于索引的固定偏移，避免随机性导致的混乱
        const offsetAngle = this.index * 0.8;  // 每个骰子间隔约 0.8 弧度
        const startAngle = offsetAngle + Math.random() * 0.3 - 0.15;  // 固定方向加轻微随机
        const startRadius = 2.2;  // 抛出距离
        const startPos = {
            x: Math.cos(startAngle) * startRadius,
            y: Math.sin(startAngle) * startRadius * 0.4 + 0.6,  // 稍微向上
            z: 0
        };

        // 目标位置 - 正态分布在中心 (0, 0) 附近
        const targetPos = {
            x: this.normalDistribution(0, 0.3),  // 水平偏移，标准差 0.3
            y: this.normalDistribution(0, 0.25), // 垂直偏移，标准差 0.25
            z: 0
        };

        // 初始旋转速度
        let rotSpeed = {
            x: 0.15 + Math.random() * 0.1,
            y: 0.2 + Math.random() * 0.15,
            z: 0.1 + Math.random() * 0.08
        };

        // 设置起始位置
        this.cube.position.set(startPos.x, startPos.y, startPos.z);

        return new Promise(resolve => {
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                if (progress < 1) {
                    // 位置动画 - 使用 easeOutQuad 产生惯性效果
                    const easedProgress = this.easeOutQuad(progress);

                    this.cube.position.x = startPos.x + (targetPos.x - startPos.x) * easedProgress;
                    this.cube.position.y = startPos.y + (targetPos.y - startPos.y) * easedProgress;
                    this.cube.position.z = startPos.z;

                    // 添加高度弹跳效果
                    if (progress < 0.7) {
                        const bounceHeight = 1.5 * this.easeOutBounce(progress / 0.7);
                        this.cube.position.y += bounceHeight;
                    }

                    // 旋转动画 - 速度随时间减慢（惯性）
                    const speedFactor = 1 - progress * 0.8;
                    this.cube.rotation.x += rotSpeed.x * speedFactor;
                    this.cube.rotation.y += rotSpeed.y * speedFactor;
                    this.cube.rotation.z += rotSpeed.z * speedFactor;

                    this.render();
                    requestAnimationFrame(animate);
                } else {
                    // 完成滚动
                    this.cube.position.set(targetPos.x, targetPos.y, targetPos.z);
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
