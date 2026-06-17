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

  // --- Contact Form Handling & Validation ---
  const contactForm = document.getElementById('contact-form');
  const successToast = document.getElementById('success-toast');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let isFormValid = true;

    // Validate Name
    const nameInput = document.getElementById('contact-name');
    const nameGroup = document.getElementById('group-name');
    if (!nameInput.value.trim()) {
      nameGroup.classList.add('error');
      isFormValid = false;
    } else {
      nameGroup.classList.remove('error');
    }

    // Validate Email
    const emailInput = document.getElementById('contact-email');
    const emailGroup = document.getElementById('group-email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailPattern.test(emailInput.value.trim())) {
      emailGroup.classList.add('error');
      isFormValid = false;
    } else {
      emailGroup.classList.remove('error');
    }

    // Validate Subject
    const subjectInput = document.getElementById('contact-subject');
    const subjectGroup = document.getElementById('group-subject');
    if (!subjectInput.value.trim()) {
      subjectGroup.classList.add('error');
      isFormValid = false;
    } else {
      subjectGroup.classList.remove('error');
    }

    // Validate Message
    const messageInput = document.getElementById('contact-message');
    const messageGroup = document.getElementById('group-message');
    if (!messageInput.value.trim()) {
      messageGroup.classList.add('error');
      isFormValid = false;
    } else {
      messageGroup.classList.remove('error');
    }

    // If form is valid, submit
    if (isFormValid) {
      // Simulate form submission
      const submitButton = document.getElementById('contact-submit');
      const originalBtnText = submitButton.innerHTML;
      
      submitButton.disabled = true;
      submitButton.innerHTML = `Sending... <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`;

      setTimeout(() => {
        // Show success toast
        successToast.classList.add('show');
        
        // Reset Form
        contactForm.reset();
        
        // Restore button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalBtnText;

        // Hide success toast after 4 seconds
        setTimeout(() => {
          successToast.classList.remove('show');
        }, 4000);
      }, 1500);
    }
  });

  // Real-time input error removal
  const formInputs = contactForm.querySelectorAll('.form-control');
  formInputs.forEach(input => {
    input.addEventListener('input', () => {
      const group = input.closest('.form-group');
      if (input.value.trim()) {
        if (input.type === 'email') {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailPattern.test(input.value.trim())) {
            group.classList.remove('error');
          }
        } else {
          group.classList.remove('error');
        }
      }
    });
  });

  // Add spinning styling for spinner SVG
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `;
  document.head.appendChild(style);
});
