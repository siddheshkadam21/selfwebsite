document.addEventListener('DOMContentLoaded', () => {
  // --- Header Scroll Effect ---
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- Mobile Navigation Toggle ---
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-links a');

  mobileToggle.addEventListener('click', () => {
    const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    mobileToggle.setAttribute('aria-expanded', !isExpanded);
    mobileToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close mobile menu when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // --- Intersection Observer for Scroll Reveals ---
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // If it's a skill card in view, animate its progress bar
        const progressBars = entry.target.querySelectorAll('.skill-progress');
        progressBars.forEach(bar => {
          bar.style.width = bar.getAttribute('data-level');
        });
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // --- Skills Filter and Progress Bar Animation ---
  const tabButtons = document.querySelectorAll('.skills-tab-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Toggle active class on buttons
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filter = button.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          // Trigger progress bar animation
          const progress = card.querySelector('.skill-progress');
          if (progress) {
            // Short timeout to ensure display: flex is rendered before animation starts
            setTimeout(() => {
              progress.style.width = progress.getAttribute('data-level');
            }, 50);
          }
        } else {
          card.style.display = 'none';
          const progress = card.querySelector('.skill-progress');
          if (progress) {
            progress.style.width = '0';
          }
        }
      });
    });
  });



  // --- Interactive Data Pipeline Simulation (Concept A) ---
  const pipelineContainer = document.querySelector('.pipeline-container');
  const canvas = document.getElementById('pipeline-canvas');
  if (pipelineContainer && canvas) {
    const ctx = canvas.getContext('2d');
    const nodes = document.querySelectorAll('.pipeline-node');
    let pathPoints = [];
    let particles = [];
    let speedFactor = 1.0;

    // Resolve CSS colors dynamically
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#3366CC';
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-secondary').trim() || '#33A6B8';

    // Set canvas dimensions based on container bounding client rect
    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const rect = pipelineContainer.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      calculateNodePositions();
    }

    // Calculate center coordinates of each node icon relative to the container
    function calculateNodePositions() {
      const containerRect = pipelineContainer.getBoundingClientRect();
      pathPoints = Array.from(nodes).map(node => {
        const icon = node.querySelector('.node-icon');
        const iconRect = icon.getBoundingClientRect();
        return {
          x: iconRect.left - containerRect.left + iconRect.width / 2,
          y: iconRect.top - containerRect.top + iconRect.height / 2
        };
      });
    }

    // Generate a new particle
    function createParticle(segment = 0) {
      return {
        segment: segment,
        progress: 0,
        speed: 0.007 + Math.random() * 0.008,
        size: 2.2 + Math.random() * 1.8,
        color: Math.random() > 0.4 ? primaryColor : secondaryColor,
        opacity: 0.6 + Math.random() * 0.4
      };
    }

    // Pre-populate particles along path
    for (let i = 0; i < 10; i++) {
      const segment = Math.floor(Math.random() * (nodes.length - 1));
      const p = createParticle(segment);
      p.progress = Math.random();
      particles.push(p);
    }

    // Listen to node hovers to speed up/spawn particles
    nodes.forEach(node => {
      node.addEventListener('mouseenter', () => {
        speedFactor = 2.4;
        // Spawn additional particles at start
        for (let i = 0; i < 3; i++) {
          particles.push(createParticle(0));
        }
      });

      node.addEventListener('mouseleave', () => {
        speedFactor = 1.0;
      });
    });

    window.addEventListener('resize', resizeCanvas);

    // Animation Loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (pathPoints.length >= 2) {
        // Draw the background connection lines
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(51, 102, 204, 0.12)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
        for (let i = 1; i < pathPoints.length; i++) {
          ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];

          // Increment progress along segment
          p.progress += p.speed * speedFactor;

          if (p.progress >= 1) {
            p.progress = 0;
            p.segment++;

            // If particle reaches the end, recycle it or delete if overflow
            if (p.segment >= pathPoints.length - 1) {
              if (particles.length > 15) {
                particles.splice(i, 1);
                continue;
              } else {
                p.segment = 0;
                p.speed = 0.007 + Math.random() * 0.008;
              }
            }
          }

          // Draw active particle
          const start = pathPoints[p.segment];
          const end = pathPoints[p.segment + 1];

          if (start && end) {
            const x = start.x + (end.x - start.x) * p.progress;
            const y = start.y + (end.y - start.y) * p.progress;

            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 6;
            ctx.shadowColor = p.color;
            ctx.globalAlpha = p.opacity;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0; // Reset shadow
          }
        }
      }

      requestAnimationFrame(animate);
    }

    // Let layouts calculate first, then init
    setTimeout(() => {
      resizeCanvas();
      requestAnimationFrame(animate);
    }, 200);
  }
});
