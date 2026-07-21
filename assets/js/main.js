(() => {
  'use strict';

  const header = document.getElementById('site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');
  const floatingCta = document.querySelector('.floating-cta');

  const handleScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle('scrolled', y > 80);
    floatingCta?.classList.toggle('show', y > 700);
  };
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    menuToggle.classList.toggle('active', !open);
    nav?.classList.toggle('open', !open);
    document.body.classList.toggle('menu-open', !open);
  });

  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.classList.remove('active');
    nav.classList.remove('open');
    document.body.classList.remove('menu-open');
  }));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  const servicePreview = document.getElementById('service-preview');
  if (servicePreview && window.matchMedia('(min-width: 901px)').matches) {
    document.querySelectorAll('.service-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        servicePreview.style.backgroundImage = `url("${item.dataset.image}")`;
        servicePreview.classList.add('visible');
      });
      item.addEventListener('mousemove', (event) => {
        const x = Math.min(event.clientX + 30, window.innerWidth - 350);
        const y = Math.min(event.clientY - 90, window.innerHeight - 250);
        servicePreview.style.left = `${Math.max(20, x)}px`;
        servicePreview.style.top = `${Math.max(20, y)}px`;
      });
      item.addEventListener('mouseleave', () => servicePreview.classList.remove('visible'));
    });
  }

  const filters = document.querySelectorAll('.filter');
  const cards = document.querySelectorAll('.project-card');
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    cards.forEach(card => {
      card.classList.toggle('hidden-card', filter !== 'all' && card.dataset.category !== filter);
    });
  }));

  const projectDetails = {
    pool: {
      summary: 'An older Commack backyard with an above-ground pool was redesigned into a true outdoor retreat with a built-in pool, cleaner lawn lines, and a more finished entertaining environment.',
      scope: ['Outdoor Transformation', 'Pool Construction', 'Hardscape + Site Planning'],
      progress: [
        {
          stage: '01',
          label: 'Original Condition',
          title: 'Above-Ground Pool and Basic Yard',
          img: 'assets/images/pool-before.jpg',
          alt: 'Backyard before construction with an above-ground pool',
          desc: 'The yard started with a simple above-ground pool and minimal design around it.'
        },
        {
          stage: '02',
          label: 'Construction Phase',
          title: 'Excavation and Pool Build Underway',
          img: 'assets/images/pool-progress.jpg',
          alt: 'Backyard during in-ground pool construction',
          desc: 'Excavation, forming, and structural work began to reshape the property into a more integrated outdoor space.'
        },
        {
          stage: '03',
          label: 'Finished Result',
          title: 'Completed In-Ground Backyard Retreat',
          img: 'assets/images/ba-pool-after.jpg',
          alt: 'Backyard after construction with a finished in-ground pool',
          desc: 'The final result feels planned with the home—an in-ground pool, hardscape, and a much more polished Long Island backyard.'
        }
      ]
    },
    bath: {
      summary: 'This Garden City bath went from dated and tired to bright, calm, and tailored with better materials, cleaner lines, and a layout that feels far more current.',
      scope: ['Bathroom Renovation', 'Primary Suite Upgrade', 'Finish Detailing'],
      progress: [
        {
          stage: '01',
          label: 'Original Condition',
          title: 'Older Vanity and Tile Layout',
          img: 'assets/images/bath-before.jpg',
          alt: 'Bathroom before renovation with dated finishes',
          desc: 'The starting point was functional but dated, with aging finishes and a room that felt flat and underdesigned.'
        },
        {
          stage: '02',
          label: 'Construction Phase',
          title: 'Vanity Framing and Finish Prep',
          img: 'assets/images/bath-progress.jpg',
          alt: 'Bathroom renovation in progress',
          desc: 'During construction, the vanity framing, wall prep, plumbing rough-in, and finish groundwork started shaping the new space.'
        },
        {
          stage: '03',
          label: 'Finished Result',
          title: 'Refined Primary Bath Retreat',
          img: 'assets/images/ba-bath-after.jpg',
          alt: 'Finished primary bathroom after renovation',
          desc: 'The completed bathroom feels brighter, more custom, and much more luxurious without losing practicality.'
        }
      ]
    },
    living: {
      summary: 'A compartmentalized main level in Massapequa was reworked into a brighter open-concept living area that connects the seating, dining, and kitchen zones much more naturally.',
      scope: ['Main-Level Reconfiguration', 'Open-Concept Remodel', 'Kitchen + Living Integration'],
      progress: [
        {
          stage: '01',
          label: 'Original Condition',
          title: 'Closed-Off Living and Dining Layout',
          img: 'assets/images/ba-living-before.jpg',
          alt: 'Living room before renovation with older layout',
          desc: 'The home originally felt boxed in, with disconnected rooms and an older layout that limited flow and natural openness.'
        },
        {
          stage: '02',
          label: 'Construction Phase',
          title: 'Opening Walls and Reworking the Layout',
          img: 'assets/images/living-progress.jpg',
          alt: 'Living area during renovation and reconfiguration',
          desc: 'Framing, drywall, and layout changes opened the space up and set the stage for a more functional family area.'
        },
        {
          stage: '03',
          label: 'Finished Result',
          title: 'Open-Concept Family Space',
          img: 'assets/images/ba-living-after.jpg',
          alt: 'Finished open-concept living area after renovation',
          desc: 'The finished space feels lighter, calmer, and much more premium—built for both daily life and entertaining.'
        }
      ]
    },
    basement: {
      summary: 'An unfinished Huntington basement was transformed into a clean, flexible lower level that can serve as a family room, guest area, office, or recreation space.',
      scope: ['Basement Conversion', 'Framing + Electrical', 'Finished Lower Level'],
      progress: [
        {
          stage: '01',
          label: 'Original Condition',
          title: 'Raw Unfinished Basement',
          img: 'assets/images/basement-before.jpg',
          alt: 'Basement before finishing with exposed structure',
          desc: 'The lower level began as a raw utility-style basement with exposed structure, bare concrete, and very limited livability.'
        },
        {
          stage: '02',
          label: 'Construction Phase',
          title: 'Framing, Electrical, and Drywall Underway',
          img: 'assets/images/basement-progress.jpg',
          alt: 'Basement under renovation with framing and drywall',
          desc: 'The build phase introduced framing, electrical, insulation, and drywall to shape a usable finished environment.'
        },
        {
          stage: '03',
          label: 'Finished Result',
          title: 'Completed Lower-Level Living Space',
          img: 'assets/images/ba-basement-after.jpg',
          alt: 'Finished basement after conversion',
          desc: 'The completed basement is bright, flexible, and fully integrated into the value and function of the home.'
        }
      ]
    }
  };

  const modal = document.getElementById('project-modal');
  const modalPanel = modal?.querySelector('.modal-panel');
  const modalImage = document.getElementById('modal-image');
  const modalTitle = document.getElementById('modal-title');
  const modalLocation = document.getElementById('modal-location');
  const modalSummary = document.getElementById('modal-summary');
  const modalScope = document.getElementById('modal-scope');
  const modalProgressGrid = document.getElementById('modal-progress-grid');
  const modalClose = modal?.querySelector('.modal-close');
  let lastFocused = null;

  const buildProgressMarkup = (progress) => progress.map(item => `
    <article class="progress-card">
      <div class="progress-media"><img src="${item.img}" alt="${item.alt}" loading="lazy"></div>
      <div class="progress-body">
        <div class="progress-step"><span>${item.stage}</span><small>${item.label}</small></div>
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
      </div>
    </article>`).join('');

  const openModal = (card) => {
    if (!modal || !modalImage || !modalTitle || !modalLocation || !modalSummary || !modalScope || !modalProgressGrid) return;
    const key = card.dataset.project;
    const detail = projectDetails[key];
    if (!detail) return;
    lastFocused = document.activeElement;
    modalImage.src = card.dataset.image;
    modalImage.alt = card.dataset.title;
    modalTitle.textContent = card.dataset.title;
    modalLocation.textContent = card.dataset.location;
    modalSummary.textContent = detail.summary;
    modalScope.innerHTML = detail.scope.map(item => `<span>${item}</span>`).join('');
    modalProgressGrid.innerHTML = buildProgressMarkup(detail.progress);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modalPanel?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    modalClose?.focus();
  };

  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    lastFocused?.focus?.();
  };

  cards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openModal(card);
      }
    });
  });
  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal && !modal.hidden) closeModal();
  });
  modal?.querySelector('a.button')?.addEventListener('click', closeModal);

  document.querySelectorAll('[data-ba]').forEach((slider) => {
    const handle = slider.querySelector('.ba-handle');
    if (!handle) return;

    let activePointer = null;
    let currentPercent = 50;

    const setPercent = (percent) => {
      currentPercent = Math.max(2, Math.min(98, percent));
      slider.style.setProperty('--ba-position', `${currentPercent}%`);
      handle.setAttribute('aria-valuenow', String(Math.round(currentPercent)));
    };

    const updateFromClientX = (clientX) => {
      const rect = slider.getBoundingClientRect();
      if (!rect.width) return;
      setPercent(((clientX - rect.left) / rect.width) * 100);
    };

    slider.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      activePointer = event.pointerId;
      slider.setPointerCapture?.(event.pointerId);
      slider.classList.add('is-dragging');
      updateFromClientX(event.clientX);
      event.preventDefault();
    });

    slider.addEventListener('pointermove', (event) => {
      if (activePointer !== event.pointerId) return;
      updateFromClientX(event.clientX);
      event.preventDefault();
    });

    const stopDragging = (event) => {
      if (activePointer === null) return;
      if (event?.pointerId !== undefined && event.pointerId !== activePointer) return;
      slider.releasePointerCapture?.(activePointer);
      activePointer = null;
      slider.classList.remove('is-dragging');
    };

    slider.addEventListener('pointerup', stopDragging);
    slider.addEventListener('pointercancel', stopDragging);
    slider.addEventListener('lostpointercapture', stopDragging);

    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', handle.getAttribute('aria-label') || 'Before and after comparison');
    handle.setAttribute('aria-valuemin', '2');
    handle.setAttribute('aria-valuemax', '98');
    handle.setAttribute('aria-orientation', 'horizontal');
    handle.addEventListener('keydown', (event) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'ArrowLeft') setPercent(currentPercent - 4);
      if (event.key === 'ArrowRight') setPercent(currentPercent + 4);
      if (event.key === 'Home') setPercent(2);
      if (event.key === 'End') setPercent(98);
    });

    setPercent(50);
  });

  const planner = document.querySelector('.project-planner');
  const steps = planner ? [...planner.querySelectorAll('.planner-step')] : [];
  const progressFill = document.getElementById('progress-fill');
  let currentStep = 0;

  const showStep = (index) => {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, i) => step.classList.toggle('active', i === currentStep));
    if (progressFill) progressFill.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
    planner?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const stepIsValid = (step) => {
    const required = [...step.querySelectorAll('[required]')];
    let valid = true;
    required.forEach(field => {
      if (!field.checkValidity()) {
        valid = false;
        field.reportValidity();
      }
    });
    return valid;
  };
  planner?.querySelectorAll('.next-step').forEach(button => button.addEventListener('click', () => {
    const step = steps[currentStep];
    if (step && stepIsValid(step)) showStep(currentStep + 1);
  }));
  planner?.querySelectorAll('.back-step').forEach(button => button.addEventListener('click', () => showStep(currentStep - 1)));

  const testimonials = [...document.querySelectorAll('.testimonial')];
  const prev = document.querySelector('.testimonial-nav.prev');
  const next = document.querySelector('.testimonial-nav.next');
  let testimonialIndex = 0;
  const showTestimonial = (index) => {
    if (!testimonials.length) return;
    testimonialIndex = (index + testimonials.length) % testimonials.length;
    testimonials.forEach((item, i) => item.classList.toggle('active', i === testimonialIndex));
  };
  prev?.addEventListener('click', () => showTestimonial(testimonialIndex - 1));
  next?.addEventListener('click', () => showTestimonial(testimonialIndex + 1));
  if (testimonials.length) {
    let testimonialTimer = setInterval(() => showTestimonial(testimonialIndex + 1), 7000);
    document.querySelector('.testimonial-shell')?.addEventListener('mouseenter', () => clearInterval(testimonialTimer));
  }

  document.querySelectorAll('.accordion details').forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      document.querySelectorAll('.accordion details').forEach(other => {
        if (other !== detail) other.open = false;
      });
    });
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
