// Particle Animation
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
    this.opacity = Math.random() * 0.5 + 0.2;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
    if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
  }

  draw() {
    ctx.fillStyle = `rgba(0, 123, 255, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const particles = [];
const particleCount = 100;

for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });

  // Draw connections
  particles.forEach((particleA, indexA) => {
    particles.slice(indexA + 1).forEach(particleB => {
      const dx = particleA.x - particleB.x;
      const dy = particleA.y - particleB.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        ctx.strokeStyle = `rgba(0, 123, 255, ${0.15 * (1 - distance / 100)})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particleA.x, particleA.y);
        ctx.lineTo(particleB.x, particleB.y);
        ctx.stroke();
      }
    });
  });

  requestAnimationFrame(animateParticles);
}

animateParticles();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  hamburger.classList.toggle('active');
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
  });
});

// Smooth scroll with offset for fixed navbar
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    const offsetTop = targetSection.offsetTop - 80;
    
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  });
});

// Active nav link on scroll
window.addEventListener('scroll', () => {
  let current = '';
  const sections = document.querySelectorAll('section');
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (scrollY >= sectionTop - 150) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Hero animations
gsap.from('.hero-title', {
  duration: 1,
  y: 50,
  opacity: 0,
  ease: 'power3.out'
});

gsap.from('.hero-subtitle', {
  duration: 1,
  y: 50,
  opacity: 0,
  delay: 0.2,
  ease: 'power3.out'
});

gsap.from('.hero-description', {
  duration: 1,
  y: 50,
  opacity: 0,
  delay: 0.4,
  ease: 'power3.out'
});

gsap.from('.hero-buttons', {
  duration: 1,
  y: 50,
  opacity: 0,
  delay: 0.6,
  ease: 'power3.out'
});

gsap.from('.cube-container', {
  duration: 1.5,
  scale: 0,
  opacity: 0,
  delay: 0.8,
  ease: 'back.out(1.7)'
});

// Section animations
const sections = document.querySelectorAll('section:not(.hero)');

sections.forEach(section => {
  gsap.from(section.querySelector('.section-title'), {
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    duration: 1,
    y: 50,
    opacity: 0,
    ease: 'power3.out'
  });
});

// About cards animation
gsap.from('.about-card', {
  scrollTrigger: {
    trigger: '.about-grid',
    start: 'top 80%',
    toggleActions: 'play none none reverse'
  },
  duration: 0.8,
  y: 50,
  opacity: 0,
  stagger: 0.2,
  ease: 'power3.out'
});

// Stats animation
gsap.from('.stat-card', {
  scrollTrigger: {
    trigger: '.stats-grid',
    start: 'top 80%',
    toggleActions: 'play none none reverse'
  },
  duration: 0.8,
  scale: 0,
  opacity: 0,
  stagger: 0.1,
  ease: 'back.out(1.7)'
});

// Timeline animation
gsap.from('.timeline-item', {
  scrollTrigger: {
    trigger: '.timeline',
    start: 'top 80%',
    toggleActions: 'play none none reverse'
  },
  duration: 0.8,
  x: -50,
  opacity: 0,
  stagger: 0.3,
  ease: 'power3.out'
});

// Education animation
gsap.from('.education-item', {
  scrollTrigger: {
    trigger: '.education-timeline',
    start: 'top 80%',
    toggleActions: 'play none none reverse'
  },
  duration: 0.8,
  x: -50,
  opacity: 0,
  stagger: 0.2,
  ease: 'power3.out'
});

// Skills animation
gsap.from('.skill-category', {
  scrollTrigger: {
    trigger: '.skills-grid',
    start: 'top 80%',
    toggleActions: 'play none none reverse'
  },
  duration: 0.8,
  y: 50,
  opacity: 0,
  stagger: 0.15,
  ease: 'power3.out'
});

// Achievements animation
gsap.from('.achievement-card', {
  scrollTrigger: {
    trigger: '.achievements-grid',
    start: 'top 80%',
    toggleActions: 'play none none reverse'
  },
  duration: 0.8,
  scale: 0,
  opacity: 0,
  stagger: 0.1,
  ease: 'back.out(1.7)'
});

// Hobbies animation
gsap.from('.hobby-card', {
  scrollTrigger: {
    trigger: '.hobbies-grid',
    start: 'top 80%',
    toggleActions: 'play none none reverse'
  },
  duration: 0.8,
  y: 50,
  rotation: -10,
  opacity: 0,
  stagger: 0.15,
  ease: 'back.out(1.7)'
});

// Contact animation
gsap.from('.contact-info, .contact-form-container', {
  scrollTrigger: {
    trigger: '.contact-grid',
    start: 'top 80%',
    toggleActions: 'play none none reverse'
  },
  duration: 0.8,
  y: 50,
  opacity: 0,
  stagger: 0.2,
  ease: 'power3.out'
});

// Counter animation for stats
function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-target'));
  const duration = 2000;
  const increment = target / (duration / 16);
  let current = 0;

  const updateCounter = () => {
    current += increment;
    if (current < target) {
      element.textContent = Math.floor(current);
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target;
    }
  };

  updateCounter();
}

// Trigger counter animation on scroll
ScrollTrigger.create({
  trigger: '.stats-grid',
  start: 'top 80%',
  onEnter: () => {
    document.querySelectorAll('.stat-number').forEach(counter => {
      animateCounter(counter);
    });
  },
  once: true
});

// Expand/Collapse experience details
const expandButtons = document.querySelectorAll('.expand-btn');

expandButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetId = button.getAttribute('data-target');
    const detailsSection = document.getElementById(targetId);
    
    button.classList.toggle('active');
    detailsSection.classList.toggle('expanded');
  });
});

// Form submission
const contactForm = document.querySelector('.contact-form');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Create notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: var(--color-primary);
    color: white;
    padding: 1rem 2rem;
    border-radius: 10px;
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = 'Message sent successfully! (Demo)';
  document.body.appendChild(notification);
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
  
  // Reset form
  contactForm.reset();
});



// Parallax effect on hero
window.addEventListener('mousemove', (e) => {
  const cube = document.querySelector('.cube-container');
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  
  cube.style.transform = `translateX(${x}px) translateY(${y}px)`;
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 100) {
    navbar.style.background = 'rgba(10, 10, 10, 0.95)';
    navbar.style.boxShadow = 'var(--shadow)';
  } else {
    navbar.style.background = 'rgba(10, 10, 10, 0.9)';
    navbar.style.boxShadow = 'none';
  }
});