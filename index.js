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

  // ==========================================
  // --- AI & Spatial Playground Sandbox ---
  // ==========================================

  // Tab Switching Logic
  const playgroundTabButtons = document.querySelectorAll('.playground-tab-btn');
  const playgroundPanes = document.querySelectorAll('.playground-pane');

  playgroundTabButtons.forEach(button => {
    button.addEventListener('click', () => {
      playgroundTabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const tabId = button.getAttribute('data-tab');
      playgroundPanes.forEach(pane => {
        if (pane.id === `pane-${tabId}`) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });

      // Trigger canvas resize for the newly shown tab
      if (tabId === 'pipeline') {
        resizeSandboxVisCanvas();
      } else if (tabId === 'spatial') {
        resizeSpatialCanvas();
      }
    });
  });

  // --- Sandbox 1: Data & ML Pipeline Logic ---
  const datasetSelect = document.getElementById('dataset-select');
  const modelSelect = document.getElementById('model-select');
  const lrSlider = document.getElementById('lr-slider');
  const lrVal = document.getElementById('lr-val');
  const btnRunPipeline = document.getElementById('btn-run-pipeline');
  const consoleOutput = document.getElementById('console-output');
  const pipelineStatusTag = document.getElementById('pipeline-status-tag');
  const sandboxVisCanvas = document.getElementById('sandbox-vis-canvas');
  const sandboxOutputOverlay = document.getElementById('sandbox-output-overlay');

  let sandboxVisCtx = null;
  let pipelineRunning = false;
  let pipelineEpoch = 0;
  let pipelineLossHistory = [];
  let pipelineAccHistory = [];
  let pipelineAnimFrameId = null;

  if (sandboxVisCanvas) {
    sandboxVisCtx = sandboxVisCanvas.getContext('2d');
  }

  // Adjust learning rate slider label
  if (lrSlider && lrVal) {
    lrSlider.addEventListener('input', () => {
      lrVal.textContent = parseFloat(lrSlider.value).toFixed(3);
    });
  }

  // Resize Sandbox Vis Canvas
  function resizeSandboxVisCanvas() {
    if (!sandboxVisCanvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = sandboxVisCanvas.parentElement.getBoundingClientRect();
    sandboxVisCanvas.width = rect.width * dpr;
    sandboxVisCanvas.height = rect.height * dpr;
    sandboxVisCtx.scale(dpr, dpr);
    sandboxVisCanvas.style.width = `${rect.width}px`;
    sandboxVisCanvas.style.height = `${rect.height}px`;
  }

  // Neural Network visualizer parameters
  const nnNodes = {
    input: 3,
    hidden1: 4,
    hidden2: 4,
    output: 3
  };
  let nnAnimOffset = 0;

  // Render Idle Neural Net Simulation
  function drawIdleNeuralNet() {
    if (!sandboxVisCtx || pipelineRunning) return;

    const width = sandboxVisCanvas.width / (window.devicePixelRatio || 1);
    const height = sandboxVisCanvas.height / (window.devicePixelRatio || 1);

    sandboxVisCtx.clearRect(0, 0, width, height);

    // Draw background grid pattern
    sandboxVisCtx.strokeStyle = 'rgba(51, 102, 204, 0.03)';
    sandboxVisCtx.lineWidth = 1;
    const gridSize = 20;
    for (let x = 0; x < width; x += gridSize) {
      sandboxVisCtx.beginPath();
      sandboxVisCtx.moveTo(x, 0);
      sandboxVisCtx.lineTo(x, height);
      sandboxVisCtx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      sandboxVisCtx.beginPath();
      sandboxVisCtx.moveTo(0, y);
      sandboxVisCtx.lineTo(width, y);
      sandboxVisCtx.stroke();
    }

    const layers = ['input', 'hidden1', 'hidden2', 'output'];
    const layerCount = layers.length;
    const layerXSpacing = width / (layerCount + 1);

    const layerNodesCoords = [];

    // Calculate coordinates
    layers.forEach((layerName, layerIdx) => {
      const nodeCount = nnNodes[layerName];
      const x = layerXSpacing * (layerIdx + 1);
      const nodeYSpacing = height / (nodeCount + 1);
      const coords = [];

      for (let i = 0; i < nodeCount; i++) {
        coords.push({
          x: x,
          y: nodeYSpacing * (i + 1),
          r: 10 + Math.sin(nnAnimOffset + layerIdx + i) * 2
        });
      }
      layerNodesCoords.push(coords);
    });

    // Draw Connection lines
    for (let l = 0; l < layerCount - 1; l++) {
      const currentLayer = layerNodesCoords[l];
      const nextLayer = layerNodesCoords[l + 1];

      currentLayer.forEach((currNode, currIdx) => {
        nextLayer.forEach((nextNode, nextIdx) => {
          // Glow weight based on cosine
          const pulseWeight = 0.5 + 0.5 * Math.cos(nnAnimOffset * 2 - (currIdx + nextIdx) * 0.5);
          sandboxVisCtx.strokeStyle = `rgba(51, 102, 204, ${0.08 + pulseWeight * 0.15})`;
          sandboxVisCtx.lineWidth = 1 + pulseWeight * 1.5;
          sandboxVisCtx.beginPath();
          sandboxVisCtx.moveTo(currNode.x, currNode.y);
          sandboxVisCtx.lineTo(nextNode.x, nextNode.y);
          sandboxVisCtx.stroke();

          // Animated particle moving along connection
          const particleProgress = (nnAnimOffset * 0.15 + (currIdx * 0.3 + nextIdx * 0.2)) % 1.0;
          const px = currNode.x + (nextNode.x - currNode.x) * particleProgress;
          const py = currNode.y + (nextNode.y - currNode.y) * particleProgress;
          sandboxVisCtx.beginPath();
          sandboxVisCtx.arc(px, py, 2.5, 0, Math.PI * 2);
          sandboxVisCtx.fillStyle = 'rgba(60, 190, 210, 0.6)';
          sandboxVisCtx.fill();
        });
      });
    }

    // Draw Nodes
    layerNodesCoords.forEach((layer, lIdx) => {
      layer.forEach((node, nIdx) => {
        // Color gradient based on layer
        const grad = sandboxVisCtx.createRadialGradient(node.x, node.y, 1, node.x, node.y, node.r);
        if (lIdx === 0) {
          grad.addColorStop(0, '#5C8AE6');
          grad.addColorStop(1, '#3366CC');
        } else if (lIdx === layerCount - 1) {
          grad.addColorStop(0, '#3CBED2');
          grad.addColorStop(1, '#33A6B8');
        } else {
          grad.addColorStop(0, 'rgba(51, 102, 204, 0.4)');
          grad.addColorStop(1, 'rgba(11, 15, 25, 0.8)');
        }

        // Outer glow
        sandboxVisCtx.shadowBlur = 8;
        sandboxVisCtx.shadowColor = lIdx === layerCount - 1 ? '#33A6B8' : '#3366CC';

        sandboxVisCtx.beginPath();
        sandboxVisCtx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        sandboxVisCtx.fillStyle = grad;
        sandboxVisCtx.strokeStyle = lIdx === layerCount - 1 ? '#3CBED2' : '#5C8AE6';
        sandboxVisCtx.lineWidth = 1.5;
        sandboxVisCtx.fill();
        sandboxVisCtx.stroke();

        sandboxVisCtx.shadowBlur = 0; // Reset glow
      });
    });

    nnAnimOffset += 0.03;
    if (!pipelineRunning) {
      pipelineAnimFrameId = requestAnimationFrame(drawIdleNeuralNet);
    }
  }

  // Draw training chart in real-time
  function drawTrainingChart() {
    if (!sandboxVisCtx || !pipelineRunning) return;

    const width = sandboxVisCanvas.width / (window.devicePixelRatio || 1);
    const height = sandboxVisCanvas.height / (window.devicePixelRatio || 1);

    sandboxVisCtx.clearRect(0, 0, width, height);

    // Padding for chart
    const pad = { top: 40, bottom: 40, left: 50, right: 30 };
    const chartW = width - pad.left - pad.right;
    const chartH = height - pad.top - pad.bottom;

    // Draw Axes
    sandboxVisCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    sandboxVisCtx.lineWidth = 1;
    sandboxVisCtx.beginPath();
    // X Axis
    sandboxVisCtx.moveTo(pad.left, height - pad.bottom);
    sandboxVisCtx.lineTo(width - pad.right, height - pad.bottom);
    // Y Axis
    sandboxVisCtx.moveTo(pad.left, pad.top);
    sandboxVisCtx.lineTo(pad.left, height - pad.bottom);
    sandboxVisCtx.stroke();

    // Axis Labels
    sandboxVisCtx.fillStyle = '#9CA3AF';
    sandboxVisCtx.font = '0.75rem sans-serif';
    sandboxVisCtx.fillText('Epoch', width - pad.right - 35, height - pad.bottom + 25);
    sandboxVisCtx.fillText('Value', pad.left - 40, pad.top - 15);

    // Tick lines & dynamic markers
    sandboxVisCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + chartH * (i / 5);
      sandboxVisCtx.beginPath();
      sandboxVisCtx.moveTo(pad.left, y);
      sandboxVisCtx.lineTo(width - pad.right, y);
      sandboxVisCtx.stroke();

      const labelVal = (1.0 - i / 5).toFixed(1);
      sandboxVisCtx.fillText(labelVal, pad.left - 30, y + 4);
    }

    // Chart Label legends
    sandboxVisCtx.fillStyle = '#EF4444'; // Red Loss
    sandboxVisCtx.beginPath();
    sandboxVisCtx.arc(pad.left + 20, pad.top - 10, 4, 0, Math.PI * 2);
    sandboxVisCtx.fill();
    sandboxVisCtx.fillStyle = '#9CA3AF';
    sandboxVisCtx.fillText('Loss', pad.left + 30, pad.top - 7);

    sandboxVisCtx.fillStyle = '#10B981'; // Green Accuracy
    sandboxVisCtx.beginPath();
    sandboxVisCtx.arc(pad.left + 90, pad.top - 10, 4, 0, Math.PI * 2);
    sandboxVisCtx.fill();
    sandboxVisCtx.fillStyle = '#9CA3AF';
    sandboxVisCtx.fillText('Accuracy', pad.left + 100, pad.top - 7);

    // Draw Loss curve line
    if (pipelineLossHistory.length > 1) {
      sandboxVisCtx.strokeStyle = '#EF4444';
      sandboxVisCtx.lineWidth = 2.5;
      sandboxVisCtx.shadowBlur = 6;
      sandboxVisCtx.shadowColor = '#EF4444';
      sandboxVisCtx.beginPath();

      pipelineLossHistory.forEach((loss, idx) => {
        const x = pad.left + chartW * (idx / 19);
        const y = pad.top + chartH * (1.0 - loss); // Assumes loss is 0.0 to 1.0 range
        if (idx === 0) sandboxVisCtx.moveTo(x, y);
        else sandboxVisCtx.lineTo(x, y);
      });
      sandboxVisCtx.stroke();
      sandboxVisCtx.shadowBlur = 0;
    }

    // Draw Accuracy curve line
    if (pipelineAccHistory.length > 1) {
      sandboxVisCtx.strokeStyle = '#10B981';
      sandboxVisCtx.lineWidth = 2.5;
      sandboxVisCtx.shadowBlur = 6;
      sandboxVisCtx.shadowColor = '#10B981';
      sandboxVisCtx.beginPath();

      pipelineAccHistory.forEach((acc, idx) => {
        const x = pad.left + chartW * (idx / 19);
        const y = pad.top + chartH * (1.0 - acc); // Assumes accuracy is 0.0 to 1.0
        if (idx === 0) sandboxVisCtx.moveTo(x, y);
        else sandboxVisCtx.lineTo(x, y);
      });
      sandboxVisCtx.stroke();
      sandboxVisCtx.shadowBlur = 0;
    }
  }

  // Simulating the ML pipeline running
  function runPipeline() {
    if (pipelineRunning) return;

    // Switch state
    pipelineRunning = true;
    btnRunPipeline.disabled = true;
    datasetSelect.disabled = true;
    modelSelect.disabled = true;
    lrSlider.disabled = true;

    pipelineStatusTag.textContent = 'Running';
    pipelineStatusTag.className = 'status-tag running';

    cancelAnimationFrame(pipelineAnimFrameId);

    pipelineEpoch = 0;
    pipelineLossHistory = [1.0];
    pipelineAccHistory = [0.35];

    consoleOutput.innerHTML = '';

    const selectedData = datasetSelect.value;
    const selectedModel = modelSelect.value;
    const learningRate = parseFloat(lrSlider.value);

    // Console logs sequence
    const logs = [
      `[SYS] Initializing Ingestion Pipeline...`,
      `[DAT] Loaded dataset type: '${selectedData.toUpperCase()}'...`,
      `[DAT] Row count: 42,912 records found. Data schema matching standards.`,
      `[SYS] Cleaning null parameters and executing SSIS transforms...`,
      `[SYS] Pipeline normalizations successfully completed.`,
      `[SYS] Formatting splits: Train(80%), Validation(20%)`,
      `[MOD] Loading ML architecture: '${selectedModel.toUpperCase()}'`,
      `[MOD] Weights compiled. Learning rate set to: ${learningRate.toFixed(4)}`,
      `[MOD] Commencing training iteration...`
    ];

    let logIdx = 0;
    function printLogs() {
      if (logIdx < logs.length) {
        consoleOutput.innerHTML += logs[logIdx] + '\n';
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
        logIdx++;
        setTimeout(printLogs, 250);
      } else {
        // Commences Epoch iterations
        setTimeout(trainEpochStep, 200);
      }
    }
    printLogs();

    function trainEpochStep() {
      if (pipelineEpoch < 20) {
        pipelineEpoch++;

        // Simulates decreasing loss and increasing accuracy
        const noise = (Math.random() - 0.5) * 0.05;
        const lossVal = Math.max(0.04, 1.0 * Math.pow(0.85, pipelineEpoch) + noise);

        const accuracyStart = 0.35 + (0.58 * (pipelineEpoch / 20));
        const accVal = Math.min(0.98, accuracyStart + (Math.random() * 0.04));

        pipelineLossHistory.push(lossVal);
        pipelineAccHistory.push(accVal);

        drawTrainingChart();

        consoleOutput.innerHTML += `[TRAIN] Epoch ${pipelineEpoch}/20 - Loss: ${lossVal.toFixed(4)} | Accuracy: ${(accVal * 100).toFixed(2)}%\n`;
        consoleOutput.scrollTop = consoleOutput.scrollHeight;

        setTimeout(trainEpochStep, 100);
      } else {
        completePipeline();
      }
    }

    function completePipeline() {
      pipelineStatusTag.textContent = 'Success';
      pipelineStatusTag.className = 'status-tag success';

      consoleOutput.innerHTML += `[MOD] Training finished. Validation R²: 0.9412 | Accuracy: 97.43%\n`;
      consoleOutput.innerHTML += `[SYS] Serialization successful. Output visual generated.\n`;
      consoleOutput.scrollTop = consoleOutput.scrollHeight;

      // Inject Visual Mockup Overlay inside output vis area
      setTimeout(() => {
        sandboxOutputOverlay.innerHTML = '';

        let overlayContent = '';
        if (selectedModel === 'regression') {
          overlayContent = `
            <div style="text-align: center; color: white; padding: 2rem;">
              <h4 style="color: var(--color-secondary); font-size: 1.25rem; margin-bottom: 0.5rem; font-family: var(--font-display);">Regression Model Outcome</h4>
              <p style="color: #9CA3AF; margin-bottom: 1.5rem; font-size: 0.9rem;">Target regression line fit achieved successfully.</p>
              <div style="font-family: monospace; background: rgba(255,255,255,0.05); padding: 1.2rem; border-radius: var(--border-radius-sm); border: 1px solid rgba(255,255,255,0.1); display: inline-block; text-align: left; font-size: 0.9rem; line-height: 1.5;">
                <span style="color: #10B981;">&bull; R² Score (Accuracy): 0.9412</span><br>
                <span style="color: #F59E0B;">&bull; Mean Squared Error: 0.0214</span><br>
                <span style="color: #3B82F6;">&bull; Computation Time: 2.14 seconds</span>
              </div>
              <button class="btn btn-secondary btn-reset-vis" style="margin-top: 1.5rem; padding: 0.5rem 1.25rem; font-size: 0.85rem; border-color: rgba(255,255,255,0.2); color: white;">
                <span>Reset Visualizer</span>
              </button>
            </div>
          `;
        } else if (selectedModel === 'cnn') {
          overlayContent = `
            <div style="text-align: center; color: white; padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
              <h4 style="color: var(--color-secondary); font-size: 1.25rem; font-family: var(--font-display);">Expression & Emotion Recognition</h4>
              <div style="display: flex; flex-direction: column; gap: 0.6rem; width: 220px; font-size: 0.85rem; text-align: left; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 1rem; border-radius: var(--border-radius-sm);">
                <div style="display: flex; justify-content: space-between;"><span>Focus (Engaged):</span> <strong style="color: #10B981;">97.4%</strong></div>
                <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;"><div style="width: 97.4%; height: 100%; background: #10B981;"></div></div>
                <div style="display: flex; justify-content: space-between; margin-top: 0.25rem;"><span>Joy / Engagement:</span> <strong style="color: #EAB308;">89.2%</strong></div>
                <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;"><div style="width: 89.2%; height: 100%; background: #EAB308;"></div></div>
                <div style="display: flex; justify-content: space-between; margin-top: 0.25rem;"><span>Neutral state:</span> <strong style="color: #3B82F6;">2.1%</strong></div>
                <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;"><div style="width: 2.1%; height: 100%; background: #3B82F6;"></div></div>
              </div>
              <button class="btn btn-secondary btn-reset-vis" style="padding: 0.5rem 1.25rem; font-size: 0.85rem; border-color: rgba(255,255,255,0.2); color: white;">
                <span>Reset Visualizer</span>
              </button>
            </div>
          `;
        } else if (selectedModel === 'opencv') {
          overlayContent = `
            <div style="text-align: center; color: white; padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
              <h4 style="color: var(--color-secondary); font-size: 1.25rem; font-family: var(--font-display);">Cartoon Image Outline Outcome</h4>
              <div style="position: relative; width: 140px; height: 140px; border-radius: 50%; overflow: hidden; border: 3px solid var(--color-primary); background: #1F2937; display: flex; justify-content: center; align-items: center; box-shadow: 0 0 20px rgba(51, 102, 204, 0.4);">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" style="color: #9CA3AF;">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                  <path d="M8 8.5h8" stroke="var(--color-secondary)" stroke-width="2"></path>
                  <circle cx="9.5" cy="8.5" r="1" fill="var(--color-secondary)"></circle>
                  <circle cx="14.5" cy="8.5" r="1" fill="var(--color-secondary)"></circle>
                </svg>
                <div style="position: absolute; bottom: 0; width: 100%; text-align: center; background: rgba(51, 102, 204, 0.8); font-size: 0.65rem; font-weight: 700; color: white; padding: 2px 0;">SK_CARTOON</div>
              </div>
              <p style="font-size: 0.85rem; color: #9CA3AF; max-width: 280px; line-height: 1.4;">Bilateral smoothing filter compiled. Adaptive Canny edges extracted. Stylized portrait rendered!</p>
              <button class="btn btn-secondary btn-reset-vis" style="padding: 0.5rem 1.25rem; font-size: 0.85rem; border-color: rgba(255,255,255,0.2); color: white;">
                <span>Reset Visualizer</span>
              </button>
            </div>
          `;
        }

        sandboxOutputOverlay.innerHTML = overlayContent;
        sandboxOutputOverlay.classList.add('active');

        // Add Reset Visualizer Button listener
        const resetBtn = sandboxOutputOverlay.querySelector('.btn-reset-vis');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            resetPipelineSandbox();
          });
        }
      }, 500);
    }
  }

  function resetPipelineSandbox() {
    pipelineRunning = false;
    sandboxOutputOverlay.classList.remove('active');
    btnRunPipeline.disabled = false;
    datasetSelect.disabled = false;
    modelSelect.disabled = false;
    lrSlider.disabled = false;
    pipelineStatusTag.textContent = 'Idle';
    pipelineStatusTag.className = 'status-tag idle';
    consoleOutput.innerHTML = 'Ready to execute pipeline... Select inputs and click Run.';

    // Restarts neural net visualizer loop
    drawIdleNeuralNet();
  }

  if (btnRunPipeline) {
    btnRunPipeline.addEventListener('click', () => {
      runPipeline();
    });
  }


  // --- Sandbox 2: Spatial EV Optimizer Logic ---
  const spatialCanvas = document.getElementById('spatial-canvas');
  const statCoverage = document.getElementById('stat-coverage');
  const statOverlap = document.getElementById('stat-overlap');
  const statFlow = document.getElementById('stat-flow');
  const btnToggleTraffic = document.getElementById('btn-toggle-traffic');
  const btnResetMap = document.getElementById('btn-reset-map');

  let spatialCtx = null;
  let chargingStations = [];
  let trafficOverlayEnabled = true;
  let spatialAnimFrameId = null;
  let spatialMapVehicles = [];

  if (spatialCanvas) {
    spatialCtx = spatialCanvas.getContext('2d');
  }

  // Resize Spatial Canvas
  function resizeSpatialCanvas() {
    if (!spatialCanvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = spatialCanvas.parentElement.getBoundingClientRect();
    spatialCanvas.width = rect.width * dpr;
    spatialCanvas.height = rect.height * dpr;
    spatialCtx.scale(dpr, dpr);
    spatialCanvas.style.width = `${rect.width}px`;
    spatialCanvas.style.height = `${rect.height}px`;

    // Initialize/Regenerate vehicles on resize
    initializeVehicles();
  }

  // Pre-configured road coordinates representation (Relative grid values)
  // Grid lines: 5 horizontal streets and 5 vertical streets
  const gridIntersectionsCount = 25; // 5x5 grid

  function getRoadGridCoords(width, height) {
    const xIntervals = width / 6;
    const yIntervals = height / 6;
    const roadsX = [];
    const roadsY = [];

    for (let i = 1; i <= 5; i++) {
      roadsX.push(xIntervals * i);
      roadsY.push(yIntervals * i);
    }

    return { roadsX, roadsY };
  }

  function initializeVehicles() {
    if (!spatialCanvas) return;
    const width = spatialCanvas.width / (window.devicePixelRatio || 1);
    const height = spatialCanvas.height / (window.devicePixelRatio || 1);
    const { roadsX, roadsY } = getRoadGridCoords(width, height);

    spatialMapVehicles = [];

    // Create random particles (cars) traveling horizontally and vertically
    for (let i = 0; i < 24; i++) {
      const isHorizontal = Math.random() > 0.5;
      const roadIdx = Math.floor(Math.random() * 5);

      spatialMapVehicles.push({
        isHorizontal: isHorizontal,
        roadVal: isHorizontal ? roadsY[roadIdx] : roadsX[roadIdx],
        pos: Math.random() * (isHorizontal ? width : height),
        speed: 0.6 + Math.random() * 1.2,
        color: Math.random() > 0.4 ? 'rgba(51, 166, 184, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        size: 1.5 + Math.random() * 1.5
      });
    }
  }

  // Draw Spatial City Simulation
  function animateSpatialMap() {
    if (!spatialCtx || !spatialCanvas) return;

    const width = spatialCanvas.width / (window.devicePixelRatio || 1);
    const height = spatialCanvas.height / (window.devicePixelRatio || 1);

    spatialCtx.clearRect(0, 0, width, height);

    // Draw background layout grid
    spatialCtx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    spatialCtx.lineWidth = 1;
    const gSize = 15;
    for (let x = 0; x < width; x += gSize) {
      spatialCtx.beginPath();
      spatialCtx.moveTo(x, 0);
      spatialCtx.lineTo(x, height);
      spatialCtx.stroke();
    }
    for (let y = 0; y < height; y += gSize) {
      spatialCtx.beginPath();
      spatialCtx.moveTo(0, y);
      spatialCtx.lineTo(width, y);
      spatialCtx.stroke();
    }

    const { roadsX, roadsY } = getRoadGridCoords(width, height);

    // Draw Traffic congestion Heatmap glows under intersections if enabled
    if (trafficOverlayEnabled) {
      roadsX.forEach((rx, ri) => {
        roadsY.forEach((ry, rj) => {
          // Glow multiplier based on noise
          const congestionVal = 0.35 + 0.25 * Math.sin(nnAnimOffset - (ri + rj) * 0.4);
          const radGrad = spatialCtx.createRadialGradient(rx, ry, 2, rx, ry, 25);
          radGrad.addColorStop(0, `rgba(239, 68, 68, ${congestionVal * 0.6})`);
          radGrad.addColorStop(0.5, `rgba(239, 68, 68, ${congestionVal * 0.2})`);
          radGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

          spatialCtx.fillStyle = radGrad;
          spatialCtx.beginPath();
          spatialCtx.arc(rx, ry, 25, 0, Math.PI * 2);
          spatialCtx.fill();
        });
      });
    }

    // Draw Road networks lines
    spatialCtx.strokeStyle = 'rgba(51, 102, 204, 0.22)';
    spatialCtx.lineWidth = 4;

    // Horizontal roads
    roadsY.forEach(y => {
      spatialCtx.beginPath();
      spatialCtx.moveTo(0, y);
      spatialCtx.lineTo(width, y);
      spatialCtx.stroke();
    });

    // Vertical roads
    roadsX.forEach(x => {
      spatialCtx.beginPath();
      spatialCtx.moveTo(x, 0);
      spatialCtx.lineTo(x, height);
      spatialCtx.stroke();
    });

    // Update and draw traffic vehicles
    spatialMapVehicles.forEach(v => {
      v.pos += v.speed;

      const boundary = v.isHorizontal ? width : height;
      if (v.pos > boundary) {
        v.pos = 0;
      }

      const vx = v.isHorizontal ? v.pos : v.roadVal;
      const vy = v.isHorizontal ? v.roadVal : v.pos;

      spatialCtx.beginPath();
      spatialCtx.arc(vx, vy, v.size, 0, Math.PI * 2);
      spatialCtx.fillStyle = v.color;
      spatialCtx.shadowBlur = 4;
      spatialCtx.shadowColor = v.color;
      spatialCtx.fill();
      spatialCtx.shadowBlur = 0;
    });

    // Draw EV Charging circles and coverage indicators
    const radius = 60; // Coverage radius in pixels

    // Overlap checks
    let isOverlapDetected = false;

    chargingStations.forEach((station, idx) => {
      // Draw coverage radius circle
      spatialCtx.strokeStyle = 'rgba(234, 179, 8, 0.2)';
      spatialCtx.fillStyle = 'rgba(234, 179, 8, 0.04)';
      spatialCtx.lineWidth = 1.5;

      // If overlap exists with another circle, highlight overlap boundary
      for (let j = idx + 1; j < chargingStations.length; j++) {
        const other = chargingStations[j];
        const dist = Math.hypot(station.x - other.x, station.y - other.y);
        if (dist < 2 * radius) {
          isOverlapDetected = true;
          // Render overlapping warning red lines
          spatialCtx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
          spatialCtx.fillStyle = 'rgba(239, 68, 68, 0.03)';
        }
      }

      spatialCtx.beginPath();
      spatialCtx.arc(station.x, station.y, radius, 0, Math.PI * 2);
      spatialCtx.fill();
      spatialCtx.stroke();

      // Draw Charger station node pin icon
      spatialCtx.fillStyle = '#EAB308';
      spatialCtx.beginPath();
      spatialCtx.arc(station.x, station.y, 6, 0, Math.PI * 2);
      spatialCtx.shadowBlur = 10;
      spatialCtx.shadowColor = '#EAB308';
      spatialCtx.fill();
      spatialCtx.shadowBlur = 0;

      // Draw inner core dot
      spatialCtx.fillStyle = '#FFFFFF';
      spatialCtx.beginPath();
      spatialCtx.arc(station.x, station.y, 2, 0, Math.PI * 2);
      spatialCtx.fill();
    });

    // Update overlaps status label
    if (statOverlap) {
      if (isOverlapDetected) {
        statOverlap.textContent = 'Overlap (Redistribute!)';
        statOverlap.style.color = '#EF4444';
      } else {
        statOverlap.textContent = 'None (Optimal)';
        statOverlap.style.color = '#10B981';
      }
    }

    spatialAnimFrameId = requestAnimationFrame(animateSpatialMap);
  }

  // Calculate Spatial coverage metric dynamically
  function recalculateSpatialStats() {
    if (!spatialCanvas) return;
    const width = spatialCanvas.width / (window.devicePixelRatio || 1);
    const height = spatialCanvas.height / (window.devicePixelRatio || 1);
    const { roadsX, roadsY } = getRoadGridCoords(width, height);
    const radius = 60;

    // Check how many of the 25 intersections fall inside any charging station radius
    let coveredCount = 0;

    roadsX.forEach(rx => {
      roadsY.forEach(ry => {
        let isCovered = false;
        for (let i = 0; i < chargingStations.length; i++) {
          const s = chargingStations[i];
          const dist = Math.hypot(rx - s.x, ry - s.y);
          if (dist <= radius) {
            isCovered = true;
            break;
          }
        }
        if (isCovered) coveredCount++;
      });
    });

    const coveragePercentage = Math.round((coveredCount / gridIntersectionsCount) * 100);

    if (statCoverage) {
      statCoverage.textContent = `${coveragePercentage}%`;
    }

    if (statFlow) {
      if (chargingStations.length === 0) {
        statFlow.textContent = 'No Power Nodes';
        statFlow.style.color = '#9CA3AF';
      } else if (coveragePercentage > 70) {
        statFlow.textContent = 'Excellent';
        statFlow.style.color = '#10B981';
      } else if (coveragePercentage > 40) {
        statFlow.textContent = 'Moderate';
        statFlow.style.color = '#F59E0B';
      } else {
        statFlow.textContent = 'Inefficient';
        statFlow.style.color = '#EF4444';
      }
    }
  }

  // Handle clicks to place nodes
  if (spatialCanvas) {
    spatialCanvas.addEventListener('click', (e) => {
      if (chargingStations.length >= 6) {
        // Limit stations to 6 max
        return;
      }

      const rect = spatialCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      chargingStations.push({
        x: mouseX,
        y: mouseY
      });

      recalculateSpatialStats();
    });
  }

  // Traffic Heatmap toggle button handler
  if (btnToggleTraffic) {
    btnToggleTraffic.addEventListener('click', () => {
      trafficOverlayEnabled = !trafficOverlayEnabled;
      btnToggleTraffic.classList.toggle('active');
    });
  }

  // Reset map button handler
  if (btnResetMap) {
    btnResetMap.addEventListener('click', () => {
      chargingStations = [];
      recalculateSpatialStats();
    });
  }

  // Initialize both
  setTimeout(() => {
    resizeSandboxVisCanvas();
    drawIdleNeuralNet();

    resizeSpatialCanvas();
    animateSpatialMap();
  }, 300);
});
