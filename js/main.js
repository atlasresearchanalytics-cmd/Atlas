// ============================================================
// Atlas Research Analytics — shared site behavior
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- fixed header height offset ---------- */
  const header = document.querySelector('.site-header');
  function syncHeaderHeight() {
    if (header) {
      document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    }
  }
  syncHeaderHeight();
  window.addEventListener('resize', syncHeaderHeight);

  /* ---------- mobile nav toggle ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- active nav link ---------- */
  const currentPage = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    if (a.dataset.page === currentPage) {
      a.setAttribute('aria-current', 'page');
    }
  });

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    if (!btn || !answer) return;
    btn.addEventListener('click', () => {
      const isOpen = item.getAttribute('aria-expanded') === 'true';
      // close others
      document.querySelectorAll('.faq-item[aria-expanded="true"]').forEach(other => {
        if (other !== item) {
          other.setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      item.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : null;
    });
  });

  /* ---------- testimonial auto-scroll marquee ---------- */
  const track = document.getElementById('testimonialTrack');
  if (track) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduceMotion) {
      const originalCards = Array.from(track.children);
      // duplicate the set once so the loop can scroll seamlessly from -50%
      originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('a, button').forEach(el => el.setAttribute('tabindex', '-1'));
        track.appendChild(clone);
      });

      const pxPerSecond = 45;
      const setDuration = () => {
        const setWidth = track.scrollWidth / 2;
        const duration = Math.max(setWidth / pxPerSecond, 14);
        track.style.animationDuration = duration + 's';
      };
      requestAnimationFrame(setDuration);
      window.addEventListener('resize', () => requestAnimationFrame(setDuration));

      // pause on touch, since :hover doesn't apply on touch devices
      track.addEventListener('touchstart', () => track.classList.add('is-paused'), { passive: true });
      track.addEventListener('touchend', () => track.classList.remove('is-paused'));
    }
  }

  /* ---------- contact form (mailto-based submission) ---------- */
  const form = document.getElementById('inquiryForm');
  const status = document.getElementById('formStatus');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const phone = form.phone.value.trim();
      const need = form.need.value;
      const message = form.message.value.trim();

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!name || !email || !need || !message) {
        showStatus('Please fill in all required fields.', 'err');
        return;
      }
      if (!emailPattern.test(email)) {
        showStatus('Please enter a valid email address.', 'err');
        return;
      }

      const subject = encodeURIComponent(`Project inquiry: ${need} — ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nArea of need: ${need}\n\nProject description:\n${message}`
      );
      const mailtoLink = `mailto:atlasresearchanalytics@gmail.com?subject=${subject}&body=${body}`;

      window.location.href = mailtoLink;
      showStatus('Opening your email app to send this inquiry to Atlas Research Analytics. If nothing opens, email us directly at atlasresearchanalytics@gmail.com.', 'ok');
      form.reset();
    });
  }

  function showStatus(msg, type) {
    if (!status) return;
    status.textContent = msg;
    status.className = `show ${type}`;
  }

  /* ---------- current year in footer ---------- */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

});
