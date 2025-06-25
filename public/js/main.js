const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 900,
  parent: 'gameContainer',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: {
    preload,
    create,
    update
  }
};

let player;
let cursors;
let buildings = [];
let banner;
let bannerTimeout;
let camera;
let dragging = false;
let dragStart = null;

const SPEED = 220;

const worldWidth = 2400;
const worldHeight = 1800;

const game = new Phaser.Game(config);

function preload() {
  // no assets yet
}

function create() {
  const scene = this;
  camera = scene.cameras.main;

  // Set world bounds for physics and camera
  scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);
  camera.setBounds(0, 0, worldWidth, worldHeight);

  // Draw grid (grass tiles 40px)
  const tileSize = 40;
  const graphics = scene.add.graphics();

  for (let x = 0; x < worldWidth; x += tileSize) {
    for (let y = 0; y < worldHeight; y += tileSize) {
      const shade = (x / tileSize + y / tileSize) % 2 === 0 ? 0x9dbf9e : 0x82a97b;
      graphics.fillStyle(shade, 1);
      graphics.fillRect(x, y, tileSize, tileSize);
    }
  }

  // Paths (stone)
  graphics.fillStyle(0x6b705c, 1);
  graphics.fillRect(500, 0, 160, worldHeight);
  graphics.fillRect(0, 860, worldWidth, 160);

  // Buildings (brownish)
  addBuilding(scene, 400, 300, 280, 180, 0xa97c50, 'Main Hall');
  addBuilding(scene, 800, 300, 220, 220, 0x886633, 'Library');
  addBuilding(scene, 400, 1300, 320, 240, 0x7f5f3f, 'Cafeteria');
  addBuilding(scene, 1300, 860, 440, 280, 0x6b4f2f, 'Gymnasium');

  // Player circle
  player = scene.add.circle(560, 940, 26, 0xd6b45b);
  scene.physics.add.existing(player);
  player.body.setCollideWorldBounds(true);
  player.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 0, worldWidth, worldHeight));

  cursors = scene.input.keyboard.createCursorKeys();

  banner = document.getElementById('banner');

  // Enable drag to move camera
  scene.input.on('pointerdown', (pointer) => {
    dragging = true;
    dragStart = { x: pointer.x, y: pointer.y };
  });

  scene.input.on('pointerup', () => {
    dragging = false;
    dragStart = null;
  });

  scene.input.on('pointermove', (pointer) => {
    if (!dragging) return;
    const dragX = dragStart.x - pointer.x;
    const dragY = dragStart.y - pointer.y;
    dragStart = { x: pointer.x, y: pointer.y };

    camera.scrollX += dragX;
    camera.scrollY += dragY;

    // Clamp camera to world bounds
    camera.scrollX = Phaser.Math.Clamp(camera.scrollX, 0, worldWidth - config.width);
    camera.scrollY = Phaser.Math.Clamp(camera.scrollY, 0, worldHeight - config.height);
  });

  // Sidebar toggle buttons
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggleSidebarBtn');
  const closeBtn = document.getElementById('closeSidebarBtn');

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', () => {
    sidebar.classList.add('hidden');
  });

  // Start camera centered on player
  camera.startFollow(player, true, 0.1, 0.1);
}

function update() {
  let vx = 0;
  let vy = 0;

  if (cursors.left.isDown) vx = -SPEED;
  else if (cursors.right.isDown) vx = SPEED;

  if (cursors.up.isDown) vy = -SPEED;
  else if (cursors.down.isDown) vy = SPEED;

  player.body.setVelocity(vx, vy);

  // No manual camera centering here, camera follows player smoothly via startFollow

  buildings.forEach(({ rect, name }) => {
    const dx = player.x - rect.x;
    const dy = player.y - rect.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100) showBanner(`Near ${name}`);
  });
}

function addBuilding(scene, x, y, w, h, color, name) {
  const rect = scene.add.rectangle(x + w / 2, y + h / 2, w, h, color);
  rect.setStrokeStyle(3, 0x5a4a30);
  rect.setInteractive();
  rect.name = name;
  buildings.push({ rect, name });

  rect.on('pointerdown', () => {
    showBanner(`Clicked on ${name}`);
  });
}

function showBanner(text) {
  banner.textContent = text;
  banner.classList.add('show');
  clearTimeout(bannerTimeout);
  bannerTimeout = setTimeout(() => banner.classList.remove('show'), 3000);
}
