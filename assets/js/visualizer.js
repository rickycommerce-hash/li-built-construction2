(() => {
  'use strict';

  const form = document.getElementById('visualizer-form');
  if (!form) return;

  const fileInput = document.getElementById('space-photo');
  const uploadZone = document.getElementById('upload-zone');
  const preview = document.getElementById('upload-preview');
  const replaceButton = document.getElementById('replace-photo');
  const spaceInput = document.getElementById('project-space');
  const styleInput = document.getElementById('project-style');
  const visionInput = document.getElementById('project-vision');
  const visionCount = document.getElementById('vision-count');
  const preserveLayout = document.getElementById('preserve-layout');
  const photorealistic = document.getElementById('photorealistic');
  const submitButton = document.getElementById('generate-concept');
  const errorBox = document.getElementById('visualizer-error');
  const placeholder = document.getElementById('result-placeholder');
  const loader = document.getElementById('generation-loader');
  const loaderMessage = document.getElementById('loader-message');
  const loaderStepLabel = document.getElementById('loader-step-label');
  const loaderElapsed = document.getElementById('loader-elapsed');
  const loaderPercent = document.getElementById('loader-percent');
  const loaderProgressBar = document.getElementById('loader-progress-bar');
  const loaderStages = [...document.querySelectorAll('.loader-stage')];
  const generated = document.getElementById('generated-result');
  const originalImage = document.getElementById('concept-before');
  const generatedImage = document.getElementById('concept-after');
  const resetButton = document.getElementById('result-reset');
  const comparison = document.getElementById('concept-comparison');
  const beforeLayer = document.getElementById('concept-before-layer');
  const handle = document.getElementById('concept-handle');
  const promptExamples = [...document.querySelectorAll('.prompt-chip')];
  const featureBuilder = document.getElementById('room-feature-builder');
  const featureGrid = document.getElementById('room-feature-grid');
  const clearFeatures = document.getElementById('clear-room-features');

  let processedImage = '';
  let activePointer = null;
  let loaderTimer = null;
  let loaderProgressTimer = null;
  let loaderElapsedTimer = null;
  let loaderStartTime = 0;

  const loaderPhases = [
    { percent: 8, step: 'Step 1 of 5', message: 'Uploading your image and preparing it for the renovation visualizer.' },
    { percent: 24, step: 'Step 2 of 5', message: 'Analyzing the current room, camera angle, and visible structure.' },
    { percent: 46, step: 'Step 3 of 5', message: 'Applying your requested style, finishes, and renovation goals.' },
    { percent: 72, step: 'Step 4 of 5', message: 'Rendering a realistic concept image based on your uploaded space.' },
    { percent: 92, step: 'Step 5 of 5', message: 'Finalizing the concept and preparing your before-and-after preview.' }
  ];


  const roomFeatureOptions = {
    'Kitchen': ['Add a large center island', 'Add seating at the island', 'Open the kitchen to the living area', 'Add floor-to-ceiling cabinetry', 'Add a walk-in pantry', 'Add premium pendant lighting', 'Add a professional range hood', 'Add a coffee or beverage station', 'Replace flooring', 'Add larger windows or more natural light'],
    'Bathroom': ['Add a walk-in shower', 'Add a freestanding soaking tub', 'Add a double vanity', 'Add heated flooring', 'Add a private water closet', 'Add built-in shower niches', 'Add larger windows or skylight', 'Add custom storage cabinetry', 'Add statement lighting', 'Use large-format stone tile'],
    'Living room': ['Add a fireplace', 'Add built-in shelving', 'Add larger windows', 'Add sliding glass doors', 'Open a wall to an adjacent room', 'Add a coffered or detailed ceiling', 'Add custom millwork', 'Add a media wall', 'Replace flooring', 'Add recessed and accent lighting'],
    'Basement': ['Add a family room', 'Add a home theater', 'Add a wet bar', 'Add a home gym', 'Add a guest bedroom', 'Add a full bathroom', 'Add a home office', 'Add built-in storage', 'Add brighter lighting', 'Create separate activity zones'],
    'Bedroom': ['Add a walk-in closet', 'Add an ensuite bathroom', 'Add larger windows', 'Add a feature wall', 'Add built-in wardrobes', 'Add a sitting area', 'Add ceiling detail', 'Add new flooring', 'Add layered lighting', 'Create a hotel-like primary suite'],
    'Home exterior': ['Replace siding', 'Add stone or brick accents', 'Add a covered front porch', 'Replace windows', 'Add dormers', 'Add landscape lighting', 'Upgrade the front entry', 'Add a new garage door', 'Modernize rooflines', 'Improve landscaping'],
    'Backyard / patio': ['Add an outdoor kitchen', 'Add a covered patio', 'Add a fire pit', 'Add a pergola', 'Add built-in seating', 'Add landscape lighting', 'Add new pavers', 'Add privacy landscaping', 'Add a dining area', 'Add an outdoor fireplace'],
    'Pool area': ['Replace an above-ground pool with an in-ground pool', 'Add a spa', 'Add a sun shelf', 'Add new pool coping and pavers', 'Add an outdoor kitchen', 'Add a pool house', 'Add a pergola or shade structure', 'Add landscape lighting', 'Add privacy landscaping', 'Add a fire feature'],
    'Home addition': ['Add a larger kitchen', 'Add a primary suite', 'Add a family room', 'Add a home office', 'Add a mudroom', 'Add a second story', 'Add larger windows', 'Add sliding doors to the yard', 'Match the existing exterior', 'Create an open-concept connection'],
    'Other area': ['Improve natural light', 'Add custom storage', 'Replace flooring', 'Add architectural detail', 'Upgrade lighting', 'Create a more open layout', 'Add built-in cabinetry', 'Use higher-end finishes']
  };

  const selectedFeatures = () => [...featureGrid.querySelectorAll('input:checked')].map(input => input.value);

  const renderRoomFeatures = (room) => {
    const options = roomFeatureOptions[room] || [];
    featureGrid.innerHTML = options.map((option, index) => `
      <label class="room-feature-option">
        <input type="checkbox" value="${option.replace(/"/g, '&quot;')}">
        <i>✓</i><span>${option}</span>
      </label>`).join('');
    featureBuilder.hidden = options.length === 0;
  };

  spaceInput.addEventListener('change', () => renderRoomFeatures(spaceInput.value));
  clearFeatures?.addEventListener('click', () => {
    featureGrid.querySelectorAll('input').forEach(input => { input.checked = false; });
  });

  const checkBackend = async () => {
    try {
      const response = await fetch('/api/visualizer-health', { cache: 'no-store' });
      if (!response.ok) throw new Error('backend unavailable');
      const data = await response.json();
      if (!data.openaiConfigured) {
        showError('The visualizer backend is deployed, but OPENAI_API_KEY has not been added in Netlify environment variables.');
      }
    } catch {
      const warning = document.createElement('div');
      warning.className = 'visualizer-backend-warning';
      warning.innerHTML = '<strong>AI backend not deployed</strong>This site was likely uploaded with Netlify drag-and-drop. The AI visualizer requires a Git-based Netlify deployment or Netlify CLI deployment so the Functions are built and published.';
      form.prepend(warning);
    }
  };
  checkBackend();

  const showError = (message) => {
    errorBox.textContent = message;
    errorBox.hidden = !message;
  };

  const formatElapsed = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs} elapsed`;
  };

  const updateLoaderPhase = (index) => {
    const phase = loaderPhases[Math.max(0, Math.min(index, loaderPhases.length - 1))];
    loaderMessage.textContent = phase.message;
    if (loaderStepLabel) loaderStepLabel.textContent = phase.step;
    if (loaderPercent) loaderPercent.textContent = `${phase.percent}%`;
    if (loaderProgressBar) loaderProgressBar.style.width = `${phase.percent}%`;
    loaderStages.forEach((stage, stageIndex) => {
      stage.classList.toggle('is-active', stageIndex === index);
      stage.classList.toggle('is-complete', stageIndex < index);
    });
  };

  const setLoading = (isLoading) => {
    submitButton.disabled = isLoading;
    submitButton.classList.toggle('is-loading', isLoading);
    submitButton.innerHTML = isLoading ? 'Generating... Please wait <span>•</span>' : 'Generate My Renovation Concept <span>↗</span>';
    if (isLoading) {
      placeholder.hidden = true;
      generated.hidden = true;
      loader.hidden = false;
      loaderStartTime = Date.now();
      if (loaderElapsed) loaderElapsed.textContent = '00:00 elapsed';
      updateLoaderPhase(0);
      let phaseIndex = 0;
      window.clearInterval(loaderTimer);
      window.clearInterval(loaderProgressTimer);
      window.clearInterval(loaderElapsedTimer);
      loaderTimer = window.setInterval(() => {
        phaseIndex = Math.min(phaseIndex + 1, loaderPhases.length - 1);
        updateLoaderPhase(phaseIndex);
      }, 5200);
      let simulatedProgress = loaderPhases[0].percent;
      loaderProgressTimer = window.setInterval(() => {
        simulatedProgress = Math.min(95, simulatedProgress + (simulatedProgress < 70 ? 2 : 1));
        if (loaderPercent) loaderPercent.textContent = `${simulatedProgress}%`;
        if (loaderProgressBar) loaderProgressBar.style.width = `${simulatedProgress}%`;
      }, 1400);
      loaderElapsedTimer = window.setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - loaderStartTime) / 1000);
        if (loaderElapsed) loaderElapsed.textContent = formatElapsed(elapsedSeconds);
      }, 1000);
    } else {
      loader.hidden = true;
      window.clearInterval(loaderTimer);
      window.clearInterval(loaderProgressTimer);
      window.clearInterval(loaderElapsedTimer);
    }
  };

  const processImage = (file) => new Promise((resolve, reject) => {
    if (!file || !/^image\/(jpeg|png|webp)$/i.test(file.type)) {
      reject(new Error('Please choose a JPG, PNG, or WebP image.'));
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      reject(new Error('Please choose an image smaller than 12 MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('The selected image is not valid.'));
      image.onload = () => {
        const maxDimension = 1600;
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d', { alpha: false });
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  const loadSelectedFile = async () => {
    showError('');
    try {
      processedImage = await processImage(fileInput.files?.[0]);
      preview.src = processedImage;
      preview.hidden = false;
      replaceButton.hidden = false;
      uploadZone.classList.add('has-image');
    } catch (error) {
      processedImage = '';
      fileInput.value = '';
      showError(error.message);
    }
  };

  fileInput.addEventListener('change', loadSelectedFile);
  replaceButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    fileInput.click();
  });
  visionInput.addEventListener('input', () => {
    visionCount.textContent = String(visionInput.value.length);
  });

  promptExamples.forEach(button => button.addEventListener('click', () => {
    spaceInput.value = button.dataset.space || spaceInput.value;
    renderRoomFeatures(spaceInput.value);
    styleInput.value = button.dataset.style || styleInput.value;
    visionInput.value = button.dataset.prompt || '';
    visionCount.textContent = String(visionInput.value.length);
    promptExamples.forEach(item => item.classList.toggle('is-selected', item === button));
    visionInput.focus();
  }));

  ['dragenter', 'dragover'].forEach(type => uploadZone.addEventListener(type, event => {
    event.preventDefault();
    uploadZone.classList.add('dragging');
  }));
  ['dragleave', 'drop'].forEach(type => uploadZone.addEventListener(type, event => {
    event.preventDefault();
    uploadZone.classList.remove('dragging');
  }));
  uploadZone.addEventListener('drop', event => {
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    fileInput.files = transfer.files;
    loadSelectedFile();
  });

  const setComparison = (percentage) => {
    const safe = Math.max(2, Math.min(98, percentage));
    beforeLayer.style.clipPath = `inset(0 ${100 - safe}% 0 0)`;
    handle.style.left = `${safe}%`;
    handle.setAttribute('aria-valuenow', String(Math.round(safe)));
  };
  const updateComparison = clientX => {
    const rect = comparison.getBoundingClientRect();
    setComparison(((clientX - rect.left) / rect.width) * 100);
  };
  comparison.addEventListener('pointerdown', event => {
    activePointer = event.pointerId;
    comparison.setPointerCapture?.(event.pointerId);
    comparison.classList.add('is-dragging');
    updateComparison(event.clientX);
  });
  comparison.addEventListener('pointermove', event => {
    if (activePointer !== event.pointerId) return;
    updateComparison(event.clientX);
  });
  const stopComparison = event => {
    if (activePointer !== null && (!event || event.pointerId === activePointer)) {
      activePointer = null;
      comparison.classList.remove('is-dragging');
    }
  };
  comparison.addEventListener('pointerup', stopComparison);
  comparison.addEventListener('pointercancel', stopComparison);
  handle.setAttribute('role', 'slider');
  handle.setAttribute('aria-valuemin', '2');
  handle.setAttribute('aria-valuemax', '98');
  handle.setAttribute('aria-valuenow', '50');
  handle.addEventListener('keydown', event => {
    const current = parseFloat(handle.style.left || '50');
    if (event.key === 'ArrowLeft') { event.preventDefault(); setComparison(current - 4); }
    if (event.key === 'ArrowRight') { event.preventDefault(); setComparison(current + 4); }
  });

  const sleep = (ms) => new Promise(resolve => window.setTimeout(resolve, ms));

  const applyServerProgress = (job) => {
    const percent = Math.max(3, Math.min(100, Number(job.percent || 3)));
    if (loaderPercent) loaderPercent.textContent = `${percent}%`;
    if (loaderProgressBar) loaderProgressBar.style.width = `${percent}%`;
    const stageIndex = job.stage === 'preparing' ? 0
      : job.stage === 'analyzing' ? 1
      : job.stage === 'rendering' ? 3
      : job.stage === 'finalizing' ? 4
      : 0;
    if (job.status === 'working') {
      const messagesByStage = {
        preparing: 'Your photo has been received and is being prepared for the AI visualizer.',
        analyzing: 'The AI is analyzing the existing room, structure, and camera viewpoint.',
        rendering: 'The AI is actively rendering your requested renovation concept.',
        finalizing: 'The image is complete and is being prepared for comparison.'
      };
      loaderMessage.textContent = messagesByStage[job.stage] || loaderMessage.textContent;
      if (loaderStepLabel) loaderStepLabel.textContent = `Step ${stageIndex + 1} of 5`;
      loaderStages.forEach((stage, index) => {
        stage.classList.toggle('is-active', index === stageIndex);
        stage.classList.toggle('is-complete', index < stageIndex);
      });
    }
  };

  const pollForResult = async (jobId) => {
    const started = Date.now();
    const maximumWait = 14 * 60 * 1000;
    while (Date.now() - started < maximumWait) {
      await sleep(2200);
      const response = await fetch(`/.netlify/functions/visualize-status?jobId=${encodeURIComponent(jobId)}&t=${Date.now()}`, {
        cache: 'no-store'
      });
      const job = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(job.error || 'The concept status could not be checked.');
      applyServerProgress(job);
      if (job.status === 'complete' && job.imageDataUrl) return job;
      if (job.status === 'error') {
        const details = job.requestId ? ` OpenAI request ID: ${job.requestId}` : '';
        throw new Error(`${job.error || 'The concept could not be generated.'}${details}`);
      }
    }
    throw new Error('The concept is still taking too long. Please try again with a smaller image or lower quality.');
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    showError('');

    if (!processedImage) {
      showError('Please upload a photo of the space you want to transform.');
      uploadZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!spaceInput.value || !styleInput.value || visionInput.value.trim().length < 12) {
      showError('Please select the space and style and describe the renovation you want.');
      return;
    }

    setLoading(true);
    try {
      const jobId = `${Date.now()}-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;
      const response = await fetch('/api/visualize-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          imageDataUrl: processedImage,
          space: spaceInput.value,
          style: styleInput.value,
          vision: visionInput.value.trim(),
          preserveLayout: preserveLayout.checked,
          photorealistic: photorealistic.checked,
          features: selectedFeatures()
        })
      });
      if (!response.ok && response.status !== 202) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `The background visualizer could not start (${response.status}).`);
      }

      const job = await pollForResult(jobId);
      originalImage.src = processedImage;
      generatedImage.src = job.imageDataUrl;
      await Promise.all([originalImage.decode?.().catch(() => {}), generatedImage.decode?.().catch(() => {})]);
      if (loaderStepLabel) loaderStepLabel.textContent = 'Complete';
      if (loaderMessage) loaderMessage.textContent = 'Your renovation concept is ready.';
      if (loaderPercent) loaderPercent.textContent = '100%';
      if (loaderProgressBar) loaderProgressBar.style.width = '100%';
      loaderStages.forEach(stage => { stage.classList.remove('is-active'); stage.classList.add('is-complete'); });
      setLoading(false);
      generated.hidden = false;
      setComparison(50);
      generated.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
      setLoading(false);
      placeholder.hidden = false;
      showError(error.message || 'The concept could not be generated. Please try again.');
    }
  });

  resetButton.addEventListener('click', () => {
    generated.hidden = true;
    placeholder.hidden = false;
    generatedImage.removeAttribute('src');
    setComparison(50);
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
