(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const updateScrollProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--scroll-progress', max > 0 ? Math.min(100, scrollY / max * 100) : 0);
  };
  updateScrollProgress();
  addEventListener('scroll', updateScrollProgress, { passive: true });

  if (!reducedMotion) {
    document.documentElement.classList.add('motion-ready');
    document.querySelectorAll('.blue-stage, .decision-card, .how-card').forEach((surface) => {
      surface.addEventListener('pointermove', (event) => {
        const rect = surface.getBoundingClientRect();
        surface.style.setProperty('--mx', `${(event.clientX - rect.left) / rect.width * 100}%`);
        surface.style.setProperty('--my', `${(event.clientY - rect.top) / rect.height * 100}%`);
      });
    });
    const motionItems = [...document.querySelectorAll('.decision-card, .how-card')];
    const motionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-in'); motionObserver.unobserve(entry.target); } });
    }, { threshold: 0.16 });
    motionItems.forEach((item, index) => { item.style.setProperty('--delay', `${index % 3 * 90}ms`); motionObserver.observe(item); });
  }

  const search = document.querySelector('#app-search');
  const rows = [...document.querySelectorAll('.app-row')];
  const chips = [...document.querySelectorAll('.chip')];
  const scopeChips = [...document.querySelectorAll('.scope-chip')];
  const sort = document.querySelector('#directory-sort');
  const list = document.querySelector('#app-list');
  let category = 'all';
  let scope = 'all';
  const filter = () => {
    const query = (search?.value || '').trim().toLowerCase();
    let visible = 0;
    const orderedRows = list ? [...list.querySelectorAll('.app-row')] : rows;
    orderedRows.forEach((row) => {
      const matchesText = !query || row.dataset.name.includes(query) || row.dataset.category.includes(query);
      const matchesCategory = category === 'all' || row.dataset.category === category;
      const matchesScope = scope === 'all' || row.dataset.scope === scope;
      row.hidden = !(matchesText && matchesCategory && matchesScope);
      if (!row.hidden) {
        visible++;
        const rank = row.querySelector('.rank');
        if (rank) rank.textContent = String(visible).padStart(2, '0');
      }
    });
    const empty = document.querySelector('#empty-state');
    if (empty) empty.style.display = visible ? 'none' : 'block';
    const count = document.querySelector('#result-count');
    if (count) count.textContent = String(visible);
  };
  const sortRows = () => {
    if (!sort || !list) return;
    const scopeOrder = { yes: 0, kinda: 1, no: 2 };
    const sorted = [...rows].sort((a, b) => {
      if (sort.value === 'name') return a.dataset.name.localeCompare(b.dataset.name);
      if (sort.value === 'price-low') return Number(a.dataset.price) - Number(b.dataset.price);
      if (sort.value === 'price-high') return Number(b.dataset.price) - Number(a.dataset.price);
      if (sort.value === 'scope') return scopeOrder[a.dataset.scope] - scopeOrder[b.dataset.scope] || a.dataset.name.localeCompare(b.dataset.name);
      return Number(b.dataset.votes) - Number(a.dataset.votes) || Number(a.dataset.order) - Number(b.dataset.order);
    });
    sorted.forEach((row) => list.appendChild(row));
    filter();
  };
  search?.addEventListener('input', filter);
  chips.forEach((chip) => chip.addEventListener('click', () => {
    category = chip.dataset.category;
    chips.forEach((item) => item.classList.toggle('active', item === chip));
    filter();
  }));
  scopeChips.forEach((chip) => chip.addEventListener('click', () => {
    scope = chip.dataset.scope;
    scopeChips.forEach((item) => item.classList.toggle('active', item === chip));
    filter();
  }));
  sort?.addEventListener('change', sortRows);
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && search) { event.preventDefault(); search.focus(); }
    if (event.key === 'Escape' && document.activeElement === search) { search.value = ''; search.blur(); filter(); }
  });
  const params = new URLSearchParams(location.search);
  if (search && params.get('q')) { search.value = params.get('q'); filter(); }

  const odometer = document.querySelector('.odometer');
  if (odometer && !reducedMotion) {
    const target = Number(odometer.dataset.value || 0);
    const started = performance.now();
    const roll = (now) => {
      const progress = Math.min(1, (now - started) / 1100);
      const eased = 1 - Math.pow(1 - progress, 4);
      odometer.textContent = Math.floor(target * eased).toLocaleString('en-US');
      if (progress < 1) requestAnimationFrame(roll);
    };
    requestAnimationFrame(roll);
  }

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
  }, { threshold: 0.08 }) : null;
  document.querySelectorAll('.reveal').forEach((el) => observer ? observer.observe(el) : el.classList.add('visible'));

  const waitlist = document.querySelector('#waitlist-form');
  waitlist?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = waitlist.querySelector('button');
    const note = document.querySelector('#waitlist-note');
    button.disabled = true; button.textContent = 'TRANSMITTING…';
    try {
      const response = await fetch('/api/waitlist', { method: 'POST', body: new FormData(waitlist) });
      const data = await response.json();
      note.textContent = data.message || data.error;
      if (response.ok) waitlist.reset();
    } catch { note.textContent = 'SIGNAL LOST. TRY AGAIN.'; }
    finally { button.disabled = false; button.textContent = 'JOIN QUEUE ↗'; }
  });

  const agentPrefixes = {
    claude: 'Use Claude Code in the current repository. Inspect the workspace first, choose sensible defaults without asking unnecessary questions, implement the complete app, run it, test the critical flows, and fix any failures.\n\n',
    codex: 'Work autonomously in the current workspace. Build the complete product described below, preserve existing work, use server-rendered defaults where practical, run checks and tests, and continue until the core flows work.\n\n',
    cursor: 'In Cursor Agent mode, inspect the repository and implement this request end to end. Create and edit the necessary files, run the app and its checks, resolve errors, and deliver a polished working result.\n\n',
  };
  document.querySelectorAll('.copy-button').forEach((button) => button.addEventListener('click', async () => {
    const original = button.textContent;
    try {
      await navigator.clipboard.writeText(agentPrefixes[button.dataset.agent] + button.dataset.prompt);
      button.textContent = '✓ COPIED TO CLIPBOARD'; button.classList.add('copied');
    } catch { button.textContent = 'COPY FAILED. SELECT PROMPT'; }
    setTimeout(() => { button.textContent = original; button.classList.remove('copied'); }, 1800);
  }));

  const voteButton = document.querySelector('[data-vote]');
  voteButton?.addEventListener('click', async () => {
    voteButton.disabled = true;
    const note = document.querySelector('[data-vote-note]');
    try {
      const response = await fetch(`/api/vote/${voteButton.dataset.vote}`, { method: 'POST' });
      const data = await response.json();
      voteButton.querySelector('span').textContent = data.count;
      note.textContent = data.message;
      voteButton.classList.toggle('voted', data.added);
    } catch { note.textContent = 'The vote could not be saved. Please try again.'; }
    finally { voteButton.disabled = false; }
  });

  document.querySelector('[data-share]')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    const share = `https://x.com/intent/post?text=${encodeURIComponent(button.dataset.text)}&url=${encodeURIComponent(button.dataset.url)}`;
    window.open(share, '_blank', 'noopener,noreferrer,width=700,height=520');
  });
})();
