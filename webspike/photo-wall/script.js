class PhotoWall {
    constructor() {
        this.photoWall = document.getElementById('photoWall');
        this.randomizeBtn = document.getElementById('randomizeBtn');
        this.photos = [];
        this.currentLayout = 0;
        this.backgroundImages = [
            'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=800',
            'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800',
            'https://images.unsplash.com/photo-1487621167305-5d248087c724?w=800',
            'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
            'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800'
        ];

        this.init();
    }

    async init() {
        await this.loadPhotos();
        this.setRandomBackground();
        this.createLayout();
        this.setupEventListeners();
    }

    async loadPhotos() {
        // 获取img文件夹中的所有图片文件
        const imageFiles = [
            'image_1750826025242.jpg',
            'IMG_20221004_093149.jpg',
            'IMG_20230120_192431.jpg',
            'IMG_20230402_142545.jpg',
            'IMG_20230607_130038.jpg',
            'IMG_20231008_130251.jpg',
            'mmexport1653448353137.jpg',
            'Screenshot_20241012_171414_com.tencent.mm.jpg',
            'screenshot_20250328_214259.jpg'
        ];

        // 随机选择8张图片
        const selectedImages = this.getRandomItems(imageFiles, 8);
        
        this.photos = selectedImages.map(filename => ({
            src: `img/${filename}`,
            rotation: this.getRandomRotation()
        }));
    }

    getRandomItems(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    getRandomRotation() {
        return (Math.random() * 20 - 10); // -10到10度之间的随机旋转
    }

    setRandomBackground() {
        const randomBg = this.backgroundImages[Math.floor(Math.random() * this.backgroundImages.length)];
        document.documentElement.style.setProperty('--bg-image', `url('${randomBg}')`);
    }

    createLayout() {
        this.photoWall.innerHTML = '';
        
        const layoutFunction = this.getLayoutFunction();
        layoutFunction();
    }

    getLayoutFunction() {
        const layouts = [
            this.createSpiralLayout.bind(this),
            this.createGridLayout.bind(this),
            this.createCircleLayout.bind(this),
            this.createRandomLayout.bind(this),
            this.createCascadeLayout.bind(this)
        ];

        return layouts[this.currentLayout];
    }

    createSpiralLayout() {
        const centerX = this.photoWall.offsetWidth / 2;
        const centerY = this.photoWall.offsetHeight / 2;
        const radius = 150;
        const angleStep = (2 * Math.PI) / this.photos.length;

        this.photos.forEach((photo, index) => {
            const angle = index * angleStep;
            const x = centerX + radius * Math.cos(angle) * (index / this.photos.length + 0.5);
            const y = centerY + radius * Math.sin(angle) * (index / this.photos.length + 0.5);
            
            this.createPhotoElement(photo, x, y);
        });
    }

    createGridLayout() {
        const cols = 3;
        const rows = 3;
        const spacing = 30;
        const photoWidth = 200;
        const photoHeight = 200;

        this.photos.forEach((photo, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = col * (photoWidth + spacing) + spacing;
            const y = row * (photoHeight + spacing) + spacing;
            
            this.createPhotoElement(photo, x, y);
        });
    }

    createCircleLayout() {
        const centerX = this.photoWall.offsetWidth / 2;
        const centerY = this.photoWall.offsetHeight / 2;
        const radius = 200;
        const angleStep = (2 * Math.PI) / this.photos.length;

        this.photos.forEach((photo, index) => {
            const angle = index * angleStep;
            const x = centerX + radius * Math.cos(angle) - 100;
            const y = centerY + radius * Math.sin(angle) - 100;
            
            this.createPhotoElement(photo, x, y);
        });
    }

    createRandomLayout() {
        const wallWidth = this.photoWall.offsetWidth;
        const wallHeight = this.photoWall.offsetHeight;

        this.photos.forEach((photo) => {
            const x = Math.random() * (wallWidth - 250);
            const y = Math.random() * (wallHeight - 250);
            
            this.createPhotoElement(photo, x, y);
        });
    }

    createCascadeLayout() {
        const startX = 100;
        const startY = 100;
        const offset = 30;

        this.photos.forEach((photo, index) => {
            const x = startX + index * offset;
            const y = startY + index * offset;
            
            this.createPhotoElement(photo, x, y);
        });
    }

    createPhotoElement(photo, x, y) {
        const photoElement = document.createElement('div');
        photoElement.className = 'photo-item';
        photoElement.style.left = `${x}px`;
        photoElement.style.top = `${y}px`;
        photoElement.style.setProperty('--rotation', `${photo.rotation}deg`);
        photoElement.style.transform = `rotate(${photo.rotation}deg)`;

        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = 'Photo';
        img.loading = 'lazy';

        photoElement.appendChild(img);
        this.photoWall.appendChild(photoElement);
    }

    setupEventListeners() {
        this.randomizeBtn.addEventListener('click', () => {
            this.randomizeLayout();
        });

        // 添加键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.randomizeLayout();
            }
        });
    }

    randomizeLayout() {
        // 循环切换布局
        this.currentLayout = (this.currentLayout + 1) % 5;
        
        // 为每张照片重新生成随机旋转
        this.photos.forEach(photo => {
            photo.rotation = this.getRandomRotation();
        });

        // 设置新的随机背景
        this.setRandomBackground();

        // 创建新布局
        this.createLayout();

        // 添加按钮点击动画
        this.randomizeBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.randomizeBtn.style.transform = 'scale(1)';
        }, 150);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new PhotoWall();
});

// 添加加载状态提示
window.addEventListener('load', () => {
    console.log('照片墙加载完成！');
});
