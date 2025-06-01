const particles = ref([])
const particleCount = 80 // 增加粒子数量
const maxSpeed = 0.8 // 增加最大速度
const particleSize = 2.5 // 增加粒子大小
const connectionDistance = 150 // 增加连接距离
const connectionOpacity = 0.15 // 增加连接线透明度
const particleOpacity = 0.6 // 增加粒子透明度

// 创建粒子
const createParticles = () => {
  particles.value = []
  for (let i = 0; i < particleCount; i++) {
    particles.value.push({
      x: Math.random() * canvasWidth.value,
      y: Math.random() * canvasHeight.value,
      vx: (Math.random() - 0.5) * maxSpeed,
      vy: (Math.random() - 0.5) * maxSpeed,
      size: particleSize,
      opacity: particleOpacity
    })
  }
}

// 更新粒子位置
const updateParticles = () => {
  particles.value.forEach(particle => {
    particle.x += particle.vx
    particle.y += particle.vy

    // 边界检查
    if (particle.x < 0 || particle.x > canvasWidth.value) particle.vx *= -1
    if (particle.y < 0 || particle.y > canvasHeight.value) particle.vy *= -1
  })
}

// 绘制粒子
const drawParticles = () => {
  if (!ctx.value) return

  ctx.value.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

  // 绘制连接线
  particles.value.forEach((particle, i) => {
    for (let j = i + 1; j < particles.value.length; j++) {
      const dx = particle.x - particles.value[j].x
      const dy = particle.y - particles.value[j].y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < connectionDistance) {
        const opacity = (1 - distance / connectionDistance) * connectionOpacity
        ctx.value.beginPath()
        ctx.value.strokeStyle = `rgba(100, 181, 246, ${opacity})`
        ctx.value.lineWidth = 1
        ctx.value.moveTo(particle.x, particle.y)
        ctx.value.lineTo(particles.value[j].x, particles.value[j].y)
        ctx.value.stroke()
      }
    }
  })

  // 绘制粒子
  particles.value.forEach(particle => {
    ctx.value.beginPath()
    ctx.value.fillStyle = `rgba(100, 181, 246, ${particle.opacity})`
    ctx.value.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    ctx.value.fill()
  })
} 