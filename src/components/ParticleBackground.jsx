import { useEffect, useRef } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // 设置画布大小
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 粒子类
    class Particle {
      constructor(area) {
        this.area = area; // 'topRight' or 'bottomLeft'

        if (area === 'topRight') {
          // 右上角区域
          this.x = canvas.width * 0.6 + Math.random() * canvas.width * 0.4;
          this.y = Math.random() * canvas.height * 0.4;
        } else {
          // 左下角区域
          this.x = Math.random() * canvas.width * 0.4;
          this.y = canvas.height * 0.6 + Math.random() * canvas.height * 0.4;
        }

        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // 边界检测 - 保持在各自区域内
        if (this.area === 'topRight') {
          if (this.x > canvas.width) this.x = canvas.width * 0.6;
          if (this.x < canvas.width * 0.6) this.x = canvas.width;
          if (this.y > canvas.height * 0.4) this.y = 0;
          if (this.y < 0) this.y = canvas.height * 0.4;
        } else {
          if (this.x > canvas.width * 0.4) this.x = 0;
          if (this.x < 0) this.x = canvas.width * 0.4;
          if (this.y > canvas.height) this.y = canvas.height * 0.6;
          if (this.y < canvas.height * 0.6) this.y = canvas.height;
        }
      }

      draw() {
        ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 创建粒子
    const createParticles = () => {
      const particleCount = Math.floor((canvas.width * canvas.height) / 30000);
      particles = [];

      // 右上角粒子
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle('topRight'));
      }

      // 左下角粒子
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle('bottomLeft'));
      }
    };

    createParticles();

    // 连接粒子
    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          // 只连接同一区域的粒子
          if (particles[i].area !== particles[j].area) continue;

          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 * (1 - distance / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      connectParticles();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 清理
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default ParticleBackground;