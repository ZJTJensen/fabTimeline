// Scale:
//   era-1  -750→-500  (250 yrs)  3 px/yr
//   era-2  -500→-100  (400 yrs)  3 px/yr
//   era-3  -100→   0  (100 yrs)  8 px/yr
//   era-4     0→ 250  (250 yrs) 20 px/yr
//   era-5   250→ 260  ( 10 yrs) 600 px/yr
const TRACK_OFFSET = 100;
const COLLAPSED_PX = 60;
const collapsedEras = new Set();

function yearToX(year) {
  let x = TRACK_OFFSET;
  for (const era of ERAS) {
    if (year <= era.start) break;
    if (collapsedEras.has(era.id)) {
      if (year >= era.end) { x += COLLAPSED_PX; continue; }
      x += COLLAPSED_PX / 2; break;
    }
    const segs = SEGMENTS.filter(s => s.eraId === era.id);
    if (year >= era.end) {
      segs.forEach(s => { x += (s.end - s.start) * s.pxPerYr; });
    } else {
      for (const seg of segs) {
        if (year <= seg.start) break;
        if (year >= seg.end) x += (seg.end - seg.start) * seg.pxPerYr;
        else                 { x += (year - seg.start) * seg.pxPerYr; break; }
      }
      break;
    }
  }
  return x;
}

function yearToAgeLabel(year) {
  const ages = [
    { start: -750, ageNum: 1 },
    { start: -500, ageNum: 2 },
    { start: -100, ageNum: 3 },
    { start:    0, ageNum: 4 },
  ];
  let currentAge = ages[0];
  for (const age of ages) {
    if (year >= age.start) currentAge = age;
    else break;
  }
  const raw = year - currentAge.start + 1;
  const displayYear = Number.isInteger(year) ? raw : parseFloat(raw.toFixed(1));
  return `${displayYear} ${currentAge.ageNum}A`;
}

function computeTrackWidth() {
  let w = TRACK_OFFSET + 100;
  for (const era of ERAS) {
    if (collapsedEras.has(era.id)) { w += COLLAPSED_PX; continue; }
    SEGMENTS.filter(s => s.eraId === era.id)
            .forEach(s => { w += (s.end - s.start) * s.pxPerYr; });
  }
  return w;
}

let TRACK_WIDTH = computeTrackWidth();

// ─── State ────────────────────────────────────────────────────────────────────
let zoom = 1;
let panX = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartPan = 0;
let visibleHeroes = new Set(HEROES.map(h => h.id));
let activeTooltip = null;
let heroesOverride      = null;
let worldEventsOverride = null;
let ageBoundsOverride   = null;
let setIconsOverride    = null;
let prevZoom            = null;

let heroSVG = null;
const heroLabelData = [];

let eraLabelEls      = [];
let tickLabelEls     = [];
let eventDotEls      = [];
let eventLabelEls    = [];
let convergencePinEls = [];
let setImgEls        = [];
let heroDotData      = [];

const SET_THRESHOLD         = 0.15;
const HERO_THRESHOLD        = 0.5;
const WORLD_EVENT_THRESHOLD = 0.04;
const MAX_ZOOM              = 2.9;
const LANE_SPACING          = 18;
const AXIS_PADDING          = 60;

// ─── Tick marks ───────────────────────────────────────────────────────────────
const TICK_YEARS = [
  -750, -500, -400, -100, -50, 0,
  50, 100, 150, 200, 220, 240, 248, 249,
  250, 250.3, 250.6, 251, 251.3, 251.6, 252, 252.3, 252.6,
  253, 253.3, 253.6, 254, 254.3, 254.6,
];
let TICK_X = TICK_YEARS.map(yearToX);
const TICK_MIN_SCREEN_PX = 50;

function tickMinZoom(i) {
  const left  = i > 0                  ? TICK_X[i] - TICK_X[i - 1] : Infinity;
  const right = i < TICK_X.length - 1 ? TICK_X[i + 1] - TICK_X[i] : Infinity;
  return TICK_MIN_SCREEN_PX / Math.max(left, right);
}

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const viewport       = document.getElementById('viewport');
const track          = document.getElementById('track');
const worldLayer     = document.getElementById('world-layer');
const setLayer       = document.getElementById('set-layer');
const heroLayer      = document.getElementById('hero-layer');
const heroNamesLayer = document.getElementById('hero-names-layer');
const heroDotsScreen = document.getElementById('hero-dots-screen');
const menuOverlay    = document.getElementById('menu-overlay');
const hamburgerBtn   = document.getElementById('hamburger-btn');
const zoomDisplay    = document.getElementById('zoom-display');
const tooltip        = document.getElementById('tooltip');
const btnWE          = document.getElementById('btn-show-world-events');
const btnAB          = document.getElementById('btn-show-age-bounds');
const btnH           = document.getElementById('btn-show-heroes');
const btnSI          = document.getElementById('btn-show-set-icons');

track.style.transformOrigin = '0 0';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function appendTTSection(parent, hdrText, nmsText) {
  const sec = document.createElement('div');
  sec.className = 'tt-section';
  const hdr = document.createElement('div');
  hdr.className = 'tt-section-header';
  hdr.textContent = hdrText;
  const nms = document.createElement('div');
  nms.className = 'tt-hero-names';
  nms.textContent = nmsText;
  sec.append(hdr, nms);
  parent.appendChild(sec);
}

function activateHighlight(matchFn) {
  [heroSVG, heroDotsScreen, heroNamesLayer].forEach(l => {
    l.classList.add('has-highlight');
    l.querySelectorAll('[data-hero]').forEach(el => {
      if (matchFn(el.dataset.hero)) el.classList.add('highlighted');
    });
  });
}

// ─── Build world layer ────────────────────────────────────────────────────────
function buildWorldLayer() {
  const axis = document.createElement('div');
  axis.className = 'axis-line';
  worldLayer.appendChild(axis);

  ERAS.forEach(e => {
    const band = document.createElement('div');
    const collapsed = collapsedEras.has(e.id);
    band.className = 'era-band ' + e.id + (collapsed ? ' era-collapsed' : '');
    const x1 = yearToX(e.start);
    const x2 = collapsed ? x1 + COLLAPSED_PX : yearToX(e.end);
    band.style.left  = x1 + 'px';
    band.style.width = (x2 - x1) + 'px';
    const lbl = document.createElement('span');
    lbl.textContent  = (collapsed ? '▶ ' : '') + e.label;
    lbl.title        = (collapsed ? 'Click to expand ' : 'Click to collapse ') + e.label;
    lbl.style.cursor = 'pointer';
    lbl.addEventListener('click', ev => {
      ev.stopPropagation();
      if (collapsedEras.has(e.id)) collapsedEras.delete(e.id);
      else                          collapsedEras.add(e.id);
      rebuildAll();
    });
    band.appendChild(lbl);
    eraLabelEls.push(lbl);
    worldLayer.appendChild(band);
  });

  TICK_YEARS.forEach((yr, i) => {
    const tick = document.createElement('div');
    tick.className = 'tick';
    tick.style.left = yearToX(yr) + 'px';
    tick.dataset.minZoom = tickMinZoom(i);
    const lbl = document.createElement('span');
    lbl.textContent = yearToAgeLabel(yr);
    tick.appendChild(lbl);
    tickLabelEls.push(lbl);
    worldLayer.appendChild(tick);
  });

  // Auto-alternate non-age world events above/below axis
  const nonAge = WORLD_EVENTS.filter(ev => ev.type !== 'age').sort((a, b) => a.year - b.year);
  nonAge.forEach((ev, i) => { ev._autoBelow = i % 2 !== 0; });
  WORLD_EVENTS.filter(ev => ev.convergence).forEach(ev => { ev._autoBelow = false; });

  // Assign stack indices for same-year events
  const groups = WORLD_EVENTS.reduce((m, ev) => (m.set(ev.year, [...(m.get(ev.year) ?? []), ev]), m), new Map());
  groups.forEach(group => {
    const above = group.filter(ev => !ev._autoBelow);
    const below = group.filter(ev => ev._autoBelow);
    above.sort((a, b) => (a.type === 'age' || a.convergence ? 0 : 1) - (b.type === 'age' || b.convergence ? 0 : 1));
    above.forEach((ev, i) => { ev._stackIdx = i; });
    below.forEach((ev, i) => { ev._stackIdx = i; });
  });

  WORLD_EVENTS.forEach(ev => {
    const inCollapsed = ERAS.some(
      era => collapsedEras.has(era.id) && ev.year >= era.start && ev.year < era.end
    );
    const marker = document.createElement('div');
    marker.className = [
      'world-event',
      ev.type ?? '',
      inCollapsed  ? 'world-event--collapsed' : '',
      ev.convergence ? 'convergence' : '',
      ev._autoBelow  ? 'world-event--below' : '',
    ].filter(Boolean).join(' ');
    marker.style.left = yearToX(ev.year) + 'px';
    marker.dataset.year = ev.year;
    if (ev._stackIdx) marker.dataset.stackIdx = ev._stackIdx;

    const firstUrl = ev.reasoning?.find(r => r.url)?.url ?? '';

    const dot = document.createElement('div');
    dot.className = 'event-dot' + (!ev.convergence && !firstUrl ? ' event-dot--no-url' : '');
    marker.appendChild(dot);
    eventDotEls.push(dot);

    const lbl = document.createElement('div');
    lbl.className = 'event-label';

    const lblText = document.createElement('div');
    lblText.className = 'event-label-text';
    lblText.innerHTML = ev.label.replace(/\n/g, '<br>');
    lblText.addEventListener('click', e => {
      e.stopPropagation();
      if (ev.convergence) showConvergenceTooltip(e, ev);
      else {
        showTooltip(e, ev.label, '');
        if (firstUrl) window.open(firstUrl, '_blank', 'noopener');
      }
    });
    lbl.appendChild(lblText);

    const filledEntries = (ev.reasoning ?? []).filter(r => r.description);
    if (filledEntries.length > 0) {
      const desc = document.createElement('div');
      desc.className = 'event-description';
      desc.addEventListener('click', e => e.stopPropagation());
      filledEntries.forEach(entry => {
        if (entry.url) {
          const a = document.createElement('a');
          a.href = entry.url;
          a.target = '_blank';
          a.rel = 'noopener';
          a.textContent = entry.description;
          a.addEventListener('click', e => e.stopPropagation());
          desc.appendChild(a);
        } else {
          const p = document.createElement('p');
          p.textContent = entry.description;
          desc.appendChild(p);
        }
      });
      lbl.appendChild(desc);
    }
    marker.appendChild(lbl);
    eventLabelEls.push(lbl);

    marker.addEventListener('click', e => {
      if (e.target.closest('.event-label')) return;
      if (ev.convergence) showConvergenceTooltip(e, ev);
      else {
        showTooltip(e, ev.label, '');
        if (firstUrl) window.open(firstUrl, '_blank', 'noopener');
      }
    });
    if (ev.convergence) {
      marker.addEventListener('mouseenter', () => highlightConvergence(ev.year));
      marker.addEventListener('mouseleave', clearHeroHighlight);
    }
    if (ev.type === 'age') {
      marker.addEventListener('mouseenter', () => {
        heroNamesLayer.style.zIndex = '0';
        heroDotsScreen.style.zIndex = '0';
      });
      marker.addEventListener('mouseleave', () => {
        heroNamesLayer.style.zIndex = '';
        heroDotsScreen.style.zIndex = '';
      });
    }
    worldLayer.appendChild(marker);
  });

  // Permanent convergence pins
  WORLD_EVENTS.filter(ev => ev.convergence).forEach(ev => {
    const pin = document.createElement('div');
    pin.className = 'convergence-pin';
    pin.style.left = yearToX(ev.year) + 'px';
    pin.dataset.year = ev.year;
    pin.title = ev.label;
    pin.addEventListener('click', e => showConvergenceTooltip(e, ev));
    pin.addEventListener('mouseenter', () => highlightConvergence(ev.year));
    pin.addEventListener('mouseleave', clearHeroHighlight);
    worldLayer.appendChild(pin);
    convergencePinEls.push(pin);
  });
}

// ─── Build set layer ──────────────────────────────────────────────────────────
function buildSetLayer() {
  const grouped = SETS.reduce((m, s) => {
    const key = s.year.toFixed(2);
    m.set(key, [...(m.get(key) ?? []), s]);
    return m;
  }, new Map());

  grouped.forEach(sets => {
    const col = document.createElement('div');
    col.className = 'set-column';
    col.style.left = yearToX(sets[0].year) + 'px';

    sets.forEach((s, i) => {
      const img = document.createElement('img');
      img.src = s.img;
      img.className = 'set-img';
      img.alt = s.label;
      img.style.top = -(102 + i * 98) + 'px';
      img.addEventListener('error', () => { img.style.display = 'none'; });
      img.addEventListener('click', ev => showTooltip(ev, s.label, yearToAgeLabel(s.year)));
      col.appendChild(img);
      setImgEls.push(img);
    });

    setLayer.appendChild(col);
  });
}

// ─── Build hero fan layer ─────────────────────────────────────────────────────
function buildHeroFanLayer() {
  const dated = HEROES.filter(h => h.events.some(e => e.year !== null));
  const N = dated.length;
  const half = Math.floor(N / 2);
  const laneY = {};
  dated.forEach((hero, i) => {
    laneY[hero.id] = i < half
      ? -(half - i) * LANE_SPACING - AXIS_PADDING
      :  (i - half + 1) * LANE_SPACING + AXIS_PADDING;
  });

  const evtY = id => laneY[id] ?? 0;
  const maxY = Math.max(0, ...Object.values(laneY));
  heroLayer.style.height = (maxY + 100) + 'px';

  heroSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  heroSVG.id = 'hero-svg';
  heroSVG.setAttribute('width', TRACK_WIDTH);
  heroSVG.setAttribute('height', maxY + 100);
  heroLayer.appendChild(heroSVG);

  const convergenceYears = new Set(WORLD_EVENTS.filter(w => w.convergence).map(w => w.year));

  dated.forEach(hero => {
    const evts = hero.events.filter(e => e.year !== null).sort((a, b) => a.year - b.year);
    if (evts.length === 0) return;

    const laneYVal = evtY(hero.id);
    const pts = evts.map(ev => ({
      x:    yearToX(ev.year),
      y:    convergenceYears.has(ev.year) && !ev.noConvergence ? 0 : laneYVal,
      dotY: laneYVal,
      ev,
    }));

    // Bezier path
    if (pts.length >= 2) {
      let d = `M${pts[0].x},${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const cp = (b.x - a.x) / 3;
        d += ` C${a.x + cp},${a.y} ${b.x - cp},${b.y} ${b.x},${b.y}`;
      }
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('stroke', hero.color);
      path.setAttribute('opacity', '0.85');
      path.dataset.hero = hero.id;
      heroSVG.appendChild(path);

      // Wide invisible hit target
      const hitPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      hitPath.setAttribute('d', d);
      hitPath.setAttribute('fill', 'none');
      hitPath.setAttribute('stroke', 'transparent');
      hitPath.setAttribute('stroke-width', '12');
      hitPath.setAttribute('class', 'hero-hit-path');
      hitPath.dataset.hero = hero.id;
      hitPath.addEventListener('click', e => {
        e.stopPropagation();
        if (heroLayer.style.opacity === '0' || !visibleHeroes.has(hero.id)) return;
        jumpToNextEvent(hero);
      });
      heroSVG.appendChild(hitPath);
    }

    // Vertical stub when first event is a convergence year
    if (convergenceYears.has(pts[0].ev.year) && !pts[0].ev.noConvergence) {
      const stub = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      stub.setAttribute('x1', pts[0].x); stub.setAttribute('y1', laneYVal);
      stub.setAttribute('x2', pts[0].x); stub.setAttribute('y2', 0);
      stub.setAttribute('stroke', hero.color);
      stub.setAttribute('stroke-width', '1.5');
      stub.setAttribute('opacity', '0.85');
      stub.dataset.hero = hero.id;
      heroSVG.appendChild(stub);
    }

    // Name label sticky to first event
    const nameLbl = document.createElement('div');
    nameLbl.className = 'hero-start-label';
    nameLbl.dataset.hero = hero.id;
    nameLbl.textContent = hero.name;
    nameLbl.style.cssText = `color:${hero.color};cursor:pointer`;
    nameLbl.title = 'Jump to origin';
    nameLbl.addEventListener('click', e => {
      e.stopPropagation();
      const vw = viewport.clientWidth;
      if (zoom < HERO_THRESHOLD) {
        zoom = Math.min(MAX_ZOOM, HERO_THRESHOLD);
        panX = clampPan(vw / 2 - pts[0].x * zoom, zoom);
        applyTransform();
      } else {
        animatePanTo(clampPan(vw / 2 - pts[0].x * zoom, zoom));
      }
    });
    nameLbl.addEventListener('mouseenter', () => highlightHero(hero.id));
    nameLbl.addEventListener('mouseleave', clearHeroHighlight);
    heroNamesLayer.appendChild(nameLbl);
    heroLabelData.push({ el: nameLbl, heroId: hero.id, firstX: pts[0].x, lastX: pts[pts.length - 1].x, baseX: pts[0].x + 8, dotY: pts[0].dotY });

    // Event dots (skip convergence-year events — path dip is the visual)
    const visiblePts = pts.filter(pt => !convergenceYears.has(pt.ev.year));
    const uniquePositions = new Set(visiblePts.map(p => p.x)).size;
    const actualLastIsConvergence = pts.length > 0 && convergenceYears.has(pts[pts.length - 1].ev.year);

    visiblePts.forEach((pt, ptIdx) => {
      const isFirst = ptIdx === 0 && uniquePositions > 1;
      const isLast  = ptIdx === visiblePts.length - 1 && uniquePositions > 1 && !actualLastIsConvergence;
      const isDeath = !!pt.ev.death;

      const dot = document.createElement('div');
      dot.className = 'hero-dot' + (isDeath ? ' hero-dot--death' : isFirst ? ' hero-dot--first' : isLast ? ' hero-dot--last' : '');
      dot.dataset.hero = hero.id;
      dot.style.left = pt.x + 'px';
      dot.style.top  = pt.dotY + 'px';

      const sharesEndPos = uniquePositions > 1 && !isLast && !actualLastIsConvergence && pt.x === visiblePts[visiblePts.length - 1].x;
      if (isDeath || isFirst || isLast) {
        dot.style.color = hero.color;
      } else if (!sharesEndPos) {
        dot.style.background = hero.color;
        dot.style.boxShadow  = `0 0 8px ${hero.color}`;
      }

      const evLbl = document.createElement('div');
      evLbl.className = 'hero-event-label';
      evLbl.textContent = pt.ev.label;
      evLbl.style.color = hero.color;
      dot.appendChild(evLbl);

      dot.addEventListener('click', e => {
        e.stopPropagation();
        showTooltip(e, pt.ev.label, `${hero.name} · ${yearToAgeLabel(pt.ev.year)}`, hero.color);
        if (pt.ev.url) window.open(pt.ev.url, '_blank', 'noopener');
      });
      dot.addEventListener('mouseenter', () => highlightHero(hero.id));
      dot.addEventListener('mouseleave', clearHeroHighlight);

      heroDotsScreen.appendChild(dot);
      heroDotData.push({ el: dot, heroId: hero.id, trackX: pt.x, dotY: pt.dotY });
    });
  });
}

// ─── Build hero menu ──────────────────────────────────────────────────────────
function buildMenu() {
  const list = document.getElementById('hero-list');

  HEROES.forEach(hero => {
    const item = document.createElement('label');
    item.className = 'menu-item';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = true;
    cb.dataset.hero = hero.id;
    cb.addEventListener('change', () => {
      if (cb.checked) visibleHeroes.add(hero.id);
      else            visibleHeroes.delete(hero.id);
      applyHeroVisibility();
    });

    const dot = document.createElement('span');
    dot.className = 'menu-dot';
    dot.style.background = hero.color;

    const name = document.createElement('span');
    name.textContent = hero.name;
    name.className = 'menu-hero-name';
    name.title = 'Jump to start of timeline';
    name.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const firstEvt = hero.events.filter(ev => ev.year !== null).sort((a, b) => a.year - b.year)[0];
      if (!firstEvt) return;
      menuOverlay.classList.remove('open');
      if (zoom < HERO_THRESHOLD) zoom = Math.min(MAX_ZOOM, HERO_THRESHOLD);
      panX = clampPan(viewport.clientWidth / 2 - yearToX(firstEvt.year) * zoom, zoom);
      applyTransform();
    });

    const cls = document.createElement('span');
    cls.className = 'menu-class';
    cls.textContent = hero.class.join(' / ') + ' · ' + hero.region;

    item.append(cb, dot, name, cls);
    list.appendChild(item);
  });

  ['select-all', 'select-none'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
      const checked = id === 'select-all';
      list.querySelectorAll('input[type=checkbox]').forEach(cb => { cb.checked = checked; });
      visibleHeroes = checked ? new Set(HEROES.map(h => h.id)) : new Set();
      applyHeroVisibility();
    });
  });
}

function applyHeroVisibility() {
  if (!heroSVG) return;
  heroSVG.querySelectorAll('[data-hero]').forEach(el => {
    el.style.display = visibleHeroes.has(el.dataset.hero) ? '' : 'none';
  });
  updateStickyLabels();
}

// ─── Sticky hero name labels ──────────────────────────────────────────────────
function updateStickyLabels() {
  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;
  const visibleLeftTrack  = -panX / zoom;
  const visibleRightTrack = (vw - panX) / zoom;

  heroLabelData.forEach(({ el, heroId, firstX, lastX, baseX, dotY }) => {
    if (!visibleHeroes.has(heroId)) return;
    const inView = firstX <= visibleRightTrack && lastX >= visibleLeftTrack;
    if (!inView) { if (el.style.display !== 'none') el.style.display = 'none'; return; }
    if (el.style.display === 'none') el.style.display = '';
    el.style.left = Math.max(10, panX + baseX * zoom) + 'px';
    el.style.top  = (vh / 2 + dotY - 8) + 'px';
  });

  heroDotData.forEach(({ el, heroId, trackX, dotY }) => {
    if (!visibleHeroes.has(heroId)) { el.style.display = 'none'; return; }
    const screenX = panX + trackX * zoom;
    if (screenX < -20 || screenX > vw + 20) {
      if (el.style.display !== 'none') el.style.display = 'none';
      return;
    }
    if (el.style.display === 'none') el.style.display = '';
    el.style.left = screenX + 'px';
    el.style.top  = (vh / 2 + dotY) + 'px';
  });
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function showTooltip(e, title, sub, color = '#ffffff') {
  tooltip.querySelector('.tt-title').textContent = title;
  tooltip.querySelector('.tt-title').style.color = color;
  tooltip.querySelector('.tt-sub').textContent   = sub;
  tooltip.querySelector('.tt-extra').innerHTML   = '';
  tooltip.style.display = 'block';
  positionTooltip(e.clientX, e.clientY);
  activeTooltip = tooltip;
  e.stopPropagation();
}

function showConvergenceTooltip(e, worldEv) {
  const byLabel = {};
  const lastFor = [];
  const continuesFor = [];

  HEROES.forEach(hero => {
    const evtsAtYear = hero.events.filter(ev => ev.year === worldEv.year && !ev.noConvergence);
    if (evtsAtYear.length === 0) return;

    const maxYear = Math.max(...hero.events.filter(ev => ev.year !== null).map(ev => ev.year));
    evtsAtYear.forEach(ev => {
      if (!byLabel[ev.label]) byLabel[ev.label] = { names: [], url: ev.url || '' };
      if (!byLabel[ev.label].names.includes(hero.name)) byLabel[ev.label].names.push(hero.name);
      if (!byLabel[ev.label].url && ev.url) byLabel[ev.label].url = ev.url;
    });

    if (maxYear === worldEv.year) lastFor.push(hero.name);
    else                          continuesFor.push(hero.name);
  });

  tooltip.querySelector('.tt-title').textContent = worldEv.label;
  tooltip.querySelector('.tt-title').style.color = '#ffffff';
  tooltip.querySelector('.tt-sub').textContent   = '';
  const extra = tooltip.querySelector('.tt-extra');
  extra.innerHTML = '';

  Object.entries(byLabel).forEach(([label, entry]) => {
    const grp = document.createElement('div');
    grp.className = 'tt-story-group';
    const lbl = document.createElement(entry.url ? 'a' : 'div');
    lbl.className = 'tt-story-label';
    lbl.textContent = label;
    if (entry.url) { lbl.href = entry.url; lbl.target = '_blank'; lbl.rel = 'noopener'; }
    const nm = document.createElement('div');
    nm.className = 'tt-hero-names';
    nm.textContent = entry.names.join(', ');
    grp.append(lbl, nm);
    extra.appendChild(grp);
  });

  if (lastFor.length || continuesFor.length) {
    const hr = document.createElement('div');
    hr.className = 'tt-divider';
    extra.appendChild(hr);
  }
  if (lastFor.length)      appendTTSection(extra, 'Last event for:',  lastFor.join(', '));
  if (continuesFor.length) appendTTSection(extra, 'Story continues:', continuesFor.join(', '));

  tooltip.style.display = 'block';
  positionTooltip(e.clientX, e.clientY);
  activeTooltip = tooltip;
  e.stopPropagation();
}

function positionTooltip(cx, cy) {
  const w  = tooltip.offsetWidth  || 220;
  const h  = tooltip.offsetHeight || 60;
  let left = cx + 14;
  let top  = cy - h / 2;
  if (left + w > window.innerWidth  - 10) left = cx - w - 14;
  if (top < 10)                           top  = 10;
  if (top + h > window.innerHeight - 10)  top  = window.innerHeight - h - 10;
  tooltip.style.left = left + 'px';
  tooltip.style.top  = top  + 'px';
}

document.addEventListener('click', () => {
  if (activeTooltip) { activeTooltip.style.display = 'none'; activeTooltip = null; }
});

// ─── Hero highlight ───────────────────────────────────────────────────────────
function clearHeroHighlight() {
  if (!heroSVG) return;
  [heroSVG, heroDotsScreen, heroNamesLayer].forEach(l => {
    l.classList.remove('has-highlight');
    l.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
  });
  worldLayer.querySelectorAll('.hero-event-highlighted').forEach(el => el.classList.remove('hero-event-highlighted'));
}

function highlightHero(heroId) {
  const hero = HEROES.find(h => h.id === heroId);
  if (!hero) return;
  activateHighlight(id => id === heroId);
  const heroYears = new Set(hero.events.filter(e => e.year !== null).map(e => e.year));
  worldLayer.querySelectorAll('.world-event:not(.age), .convergence-pin').forEach(el => {
    if (heroYears.has(Number(el.dataset.year))) el.classList.add('hero-event-highlighted');
  });
}

function highlightConvergence(year) {
  if (!heroSVG) return;
  const heroIds = new Set(
    HEROES.filter(h => h.events.some(e => e.year === year && !e.noConvergence)).map(h => h.id)
  );
  if (heroIds.size === 0) return;
  activateHighlight(id => heroIds.has(id));
}

// ─── Render / transform ───────────────────────────────────────────────────────
let tickEls = null;

function applyTransform() {
  track.style.transform = `translateX(${panX}px) scaleX(${zoom})`;

  const fraction = (600 * zoom) / (TRACK_WIDTH / 5);

  if (zoom !== prevZoom) {
    if (worldEventsOverride === false && fraction > WORLD_EVENT_THRESHOLD) worldEventsOverride = null;
    if (setIconsOverride    === false && fraction > SET_THRESHOLD)         setIconsOverride    = null;
    if (heroesOverride      === false && zoom > HERO_THRESHOLD)            heroesOverride      = null;
    prevZoom = zoom;
  }

  const showSetIcons    = setIconsOverride    !== null ? setIconsOverride    : fraction > SET_THRESHOLD;
  const showHeroes      = heroesOverride      !== null ? heroesOverride      : zoom > HERO_THRESHOLD;
  const showWorldEvents = worldEventsOverride !== null ? worldEventsOverride : fraction > WORLD_EVENT_THRESHOLD;
  const showAgeBounds   = ageBoundsOverride   !== null ? ageBoundsOverride   : true;

  const newSetOpacity = showSetIcons ? '1' : '0';
  if (setLayer.style.opacity !== newSetOpacity) {
    setLayer.style.opacity = newSetOpacity;
    setLayer.style.pointerEvents = showSetIcons ? '' : 'none';
  }

  const newHeroOpacity = showHeroes ? '1' : '0';
  if (heroLayer.style.opacity !== newHeroOpacity) {
    heroLayer.style.opacity = newHeroOpacity;
    heroLayer.style.pointerEvents = showHeroes ? '' : 'none';
    heroLayer.classList.toggle('heroes-hidden', !showHeroes);
    heroNamesLayer.style.opacity = newHeroOpacity;
    heroNamesLayer.style.pointerEvents = showHeroes ? '' : 'none';
    heroDotsScreen.style.opacity = newHeroOpacity;
    heroDotsScreen.style.pointerEvents = showHeroes ? '' : 'none';
  }

  worldLayer.classList.toggle('world-labels-always', !showHeroes);
  worldLayer.classList.toggle('heroes-hidden',        !showHeroes);
  worldLayer.classList.toggle('world-events-hidden',  !showWorldEvents);
  worldLayer.classList.toggle('age-bounds-hidden',    !showAgeBounds);

  [
    [btnWE, showWorldEvents, 'World Events'],
    [btnAB, showAgeBounds,   'Age Boundaries'],
    [btnH,  showHeroes,      'Heroes'],
    [btnSI, showSetIcons,    'Set Icons'],
  ].forEach(([btn, show, lbl]) => {
    if (btn) btn.textContent = (show ? 'Hide ' : 'Show ') + lbl;
  });

  const invZ        = 1 / zoom;
  const scaleX      = `scaleX(${invZ})`;
  const centeredPin = `translate(-50%, -50%) scaleX(${invZ})`;
  track.style.setProperty('--inv-zoom', invZ);
  eraLabelEls.forEach(el       => { el.style.transform = scaleX; });
  tickLabelEls.forEach(el      => { el.style.transform = `scaleX(${invZ}) rotate(-40deg)`; });
  eventDotEls.forEach(el       => { el.style.transform = `scaleX(${invZ}) rotate(45deg)`; });
  eventLabelEls.forEach(el     => { el.style.transform = scaleX; });
  convergencePinEls.forEach(el => { el.style.transform = centeredPin; });
  setImgEls.forEach(el         => { el.style.transform = `translateX(${-45 * invZ}px) scaleX(${invZ})`; });

  if (!tickEls) tickEls = Array.from(worldLayer.querySelectorAll('.tick'));
  tickEls.forEach(tick => {
    const vis = zoom >= parseFloat(tick.dataset.minZoom) ? '' : 'none';
    if (tick.style.display !== vis) tick.style.display = vis;
  });

  zoomDisplay.textContent = zoom < 0.1
    ? zoom.toFixed(3) + '×'
    : zoom < 1
      ? zoom.toFixed(2) + '×'
      : zoom.toFixed(1) + '×';

  updateStickyLabels();
}

function applyPanOnly() {
  track.style.transform = `translateX(${panX}px) scaleX(${zoom})`;
  updateStickyLabels();
}

// ─── Animated pan ─────────────────────────────────────────────────────────────
let panAnimId = null;

function animatePanTo(targetPanX, duration = 500) {
  if (panAnimId) cancelAnimationFrame(panAnimId);
  const startPanX = panX;
  const startTime = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - startTime) / duration);
    panX = startPanX + (targetPanX - startPanX) * (1 - Math.pow(1 - t, 3));
    applyPanOnly();
    panAnimId = t < 1 ? requestAnimationFrame(tick) : null;
  }
  panAnimId = requestAnimationFrame(tick);
}

function jumpToNextEvent(hero) {
  const evts = hero.events.filter(e => e.year !== null).sort((a, b) => a.year - b.year);
  if (evts.length === 0) return;
  const centerTrackX = (viewport.clientWidth / 2 - panX) / zoom;
  const target = evts.find(e => yearToX(e.year) > centerTrackX + 1) ?? evts[0];
  animatePanTo(clampPan(viewport.clientWidth / 2 - yearToX(target.year) * zoom, zoom));
}

// ─── Zoom / pan ───────────────────────────────────────────────────────────────
function zoomAt(clientX, factor) {
  const vpLeft  = viewport.getBoundingClientRect().left;
  const xInTrack = (clientX - vpLeft - panX) / zoom;
  const minZoom  = (viewport.clientWidth - 80) / TRACK_WIDTH;
  const newZoom  = Math.min(MAX_ZOOM, Math.max(minZoom, zoom * factor));
  panX  = clampPan(clientX - vpLeft - xInTrack * newZoom, newZoom);
  zoom  = newZoom;
  applyTransform();
}

function clampPan(p, z) {
  const vw = viewport.clientWidth;
  return Math.min(40, Math.max(vw - TRACK_WIDTH * z - 40, p));
}

function resetView() {
  zoom = (viewport.clientWidth - 80) / TRACK_WIDTH;
  panX = 40;
  applyTransform();
}

// ─── Event listeners ──────────────────────────────────────────────────────────
viewport.addEventListener('wheel', e => {
  e.preventDefault();
  zoomAt(e.clientX, e.deltaY < 0 ? 1.12 : 1 / 1.12);
}, { passive: false });

viewport.addEventListener('mousedown', e => {
  if (e.target.closest('.world-event, .set-marker, .hero-dot, .hero-hit-path, #tooltip, #menu-overlay')) return;
  isDragging   = true;
  dragStartX   = e.clientX;
  dragStartPan = panX;
  viewport.style.cursor = 'grabbing';
});
window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  panX = clampPan(dragStartPan + (e.clientX - dragStartX), zoom);
  applyPanOnly();
});
window.addEventListener('mouseup', () => {
  isDragging = false;
  viewport.style.cursor = '';
});

let lastTouches = null;
viewport.addEventListener('touchstart', e => { lastTouches = e.touches; }, { passive: true });
viewport.addEventListener('touchmove', e => {
  e.preventDefault();
  if (e.touches.length === 2 && lastTouches?.length === 2) {
    const prevDist = Math.hypot(lastTouches[0].clientX - lastTouches[1].clientX, lastTouches[0].clientY - lastTouches[1].clientY);
    const currDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    zoomAt((e.touches[0].clientX + e.touches[1].clientX) / 2, currDist / prevDist);
  } else if (e.touches.length === 1 && lastTouches?.length === 1) {
    panX = clampPan(panX + e.touches[0].clientX - lastTouches[0].clientX, zoom);
    applyPanOnly();
  }
  lastTouches = e.touches;
}, { passive: false });

document.getElementById('btn-zoom-in' ).addEventListener('click', () => zoomAt(viewport.clientWidth / 2, 1.5));
document.getElementById('btn-zoom-out').addEventListener('click', () => zoomAt(viewport.clientWidth / 2, 1 / 1.5));
document.getElementById('btn-reset'   ).addEventListener('click', resetView);
document.getElementById('btn-jump-modern').addEventListener('click', () => {
  zoom = viewport.clientWidth / (1500 * 12);
  panX = clampPan(40 - yearToX(249) * zoom, zoom);
  applyTransform();
});

[
  ['btn-show-world-events', () => { worldEventsOverride = worldLayer.classList.contains('world-events-hidden'); }],
  ['btn-show-age-bounds',   () => { ageBoundsOverride   = worldLayer.classList.contains('age-bounds-hidden');  }],
  ['btn-show-heroes',       () => { heroesOverride      = heroLayer.classList.contains('heroes-hidden');        }],
  ['btn-show-set-icons',    () => { setIconsOverride    = setLayer.style.opacity === '0';                       }],
].forEach(([id, fn]) => document.getElementById(id).addEventListener('click', () => { fn(); applyTransform(); }));

document.getElementById('legend-toggle').addEventListener('click', () => {
  const legend = document.getElementById('legend');
  const btn    = document.getElementById('legend-toggle');
  legend.classList.toggle('minimized');
  btn.textContent = legend.classList.contains('minimized') ? '+' : '−';
});

// Legend drag
(function () {
  const legend = document.getElementById('legend');
  const header = legend.querySelector('.legend-header');
  let dragging = false, offX = 0, offY = 0;

  header.addEventListener('mousedown', e => {
    if (e.target.id === 'legend-toggle') return;
    e.preventDefault();
    e.stopPropagation();
    const rect = legend.getBoundingClientRect();
    legend.style.cssText += `;bottom:auto;right:auto;top:${rect.top}px;left:${rect.left}px`;
    offX = e.clientX - rect.left;
    offY = e.clientY - rect.top;
    dragging = true;
    header.style.cursor = 'grabbing';
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    legend.style.left = Math.max(0, e.clientX - offX) + 'px';
    legend.style.top  = Math.max(0, e.clientY - offY) + 'px';
  });
  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    header.style.cursor = '';
  });
}());

hamburgerBtn.addEventListener('click', e => {
  e.stopPropagation();
  menuOverlay.classList.toggle('open');
});
menuOverlay.addEventListener('click', e => {
  if (e.target === menuOverlay) menuOverlay.classList.remove('open');
});

// Keyboard
const arrowKeys = { ArrowLeft: false, ArrowRight: false };
let arrowRafId = null;
const ARROW_PAN_SPEED = 10;

function arrowTick() {
  if (!arrowKeys.ArrowLeft && !arrowKeys.ArrowRight) { arrowRafId = null; return; }
  if (arrowKeys.ArrowLeft)  panX = clampPan(panX + ARROW_PAN_SPEED, zoom);
  if (arrowKeys.ArrowRight) panX = clampPan(panX - ARROW_PAN_SPEED, zoom);
  applyPanOnly();
  arrowRafId = requestAnimationFrame(arrowTick);
}

document.addEventListener('keydown', e => {
  if (['INPUT', 'LABEL'].includes(e.target.tagName)) return;
  if (e.key === 'Escape') { menuOverlay.classList.remove('open'); return; }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
    if (!arrowKeys[e.key]) {
      arrowKeys[e.key] = true;
      if (!arrowRafId) arrowRafId = requestAnimationFrame(arrowTick);
    }
    return;
  }
  if (e.key === '+' || e.key === '=') zoomAt(viewport.clientWidth / 2, 1.2);
  if (e.key === '-')                  zoomAt(viewport.clientWidth / 2, 1 / 1.2);
  if (e.key === '0')                  resetView();
});
document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') arrowKeys[e.key] = false;
});

// ─── Rebuild all layers (era collapse/expand) ─────────────────────────────────
function rebuildAll() {
  clearHeroHighlight();
  worldLayer.innerHTML     = '';
  setLayer.innerHTML       = '';
  heroLayer.innerHTML      = '';
  heroNamesLayer.innerHTML = '';
  heroDotsScreen.innerHTML = '';
  tickEls = null;
  heroLabelData.length = 0;
  heroDotData.length   = 0;
  eraLabelEls      = [];
  tickLabelEls     = [];
  eventDotEls      = [];
  eventLabelEls    = [];
  convergencePinEls = [];
  setImgEls        = [];

  TRACK_WIDTH       = computeTrackWidth();
  TICK_X            = TICK_YEARS.map(yearToX);
  track.style.width = TRACK_WIDTH + 'px';

  buildWorldLayer();
  buildSetLayer();
  buildHeroFanLayer();

  heroSVG.setAttribute('width', TRACK_WIDTH);
  zoom = Math.max((viewport.clientWidth - 80) / TRACK_WIDTH, zoom);
  panX = clampPan(panX, zoom);
  applyTransform();
}

// ─── Resize ───────────────────────────────────────────────────────────────────
let resizeRafId = null;
window.addEventListener('resize', () => {
  if (resizeRafId) return;
  resizeRafId = requestAnimationFrame(() => {
    resizeRafId = null;
    panX = clampPan(panX, zoom);
    applyTransform();
  });
});

// ─── Init ─────────────────────────────────────────────────────────────────────
track.style.width    = TRACK_WIDTH + 'px';
setLayer.style.width = TRACK_WIDTH + 'px';
buildWorldLayer();
buildSetLayer();
buildHeroFanLayer();
buildMenu();
resetView();
