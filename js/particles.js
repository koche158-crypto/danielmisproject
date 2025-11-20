// Particle effect for background
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 60;
        this.maxDistance = 180;
        this.startTime = Date.now();
        this.fadeInDelay = 500; // 0.5 seconds
        this.fadeInDuration = 2000; // 2 seconds
        this.scrollOffset = 0;
        this.parallaxFactor = 0.3; // Particles scroll at 30% of page scroll speed
        
        this.resize();
        this.init();
        this.animate();
        this.handleScroll();
        
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('scroll', () => this.handleScroll());
    }
    
    handleScroll() {
        this.scrollOffset = window.scrollY * this.parallaxFactor;
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        // Make canvas tall enough to cover the entire document
        this.canvas.height = Math.max(window.innerHeight, document.documentElement.scrollHeight);
    }
    
    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                baseY: Math.random() * this.canvas.height, // Base Y position
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate fade-in opacity
        const elapsed = Date.now() - this.startTime;
        let opacity = 0;
        if (elapsed > this.fadeInDelay) {
            const fadeProgress = Math.min((elapsed - this.fadeInDelay) / this.fadeInDuration, 1);
            opacity = fadeProgress;
        }
        
        // Update and draw particles
        this.particles.forEach((particle, i) => {
            particle.x += particle.vx;
            particle.baseY += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.baseY < 0) particle.baseY = this.canvas.height;
            if (particle.baseY > this.canvas.height) particle.baseY = 0;
            
            // Calculate Y position with parallax (particles move slower than page scroll)
            const drawY = particle.baseY - this.scrollOffset;
            
            // Draw particle with fade-in and increased visibility for dark background
            this.ctx.beginPath();
            this.ctx.arc(particle.x, drawY, particle.radius, 0, Math.PI * 2);
            const particleOpacity = 0.35 * opacity; // More visible against dark background
            this.ctx.fillStyle = `rgba(255, 255, 255, ${particleOpacity})`;
            this.ctx.fill();
            
            // Add glow effect to particles
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = `rgba(99, 102, 241, ${0.6 * opacity})`;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            
            // Draw connections
            this.particles.slice(i + 1).forEach(otherParticle => {
                const otherDrawY = otherParticle.baseY - this.scrollOffset;
                const dx = particle.x - otherParticle.x;
                const dy = drawY - otherDrawY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.maxDistance) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, drawY);
                    this.ctx.lineTo(otherParticle.x, otherDrawY);
                    const connectionOpacity = 0.35 * (1 - distance / this.maxDistance) * opacity;
                    this.ctx.strokeStyle = `rgba(99, 102, 241, ${connectionOpacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize particle system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        new ParticleSystem(canvas);
    }
});

