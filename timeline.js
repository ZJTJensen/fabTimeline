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

function xToYear(x) {
  let remaining = x - TRACK_OFFSET;
  for (const era of ERAS) {
    if (collapsedEras.has(era.id)) {
      if (remaining <= COLLAPSED_PX) return era.start + (era.end - era.start) * (remaining / COLLAPSED_PX);
      remaining -= COLLAPSED_PX;
      continue;
    }
    for (const seg of SEGMENTS.filter(s => s.eraId === era.id)) {
      const segW = (seg.end - seg.start) * seg.pxPerYr;
      if (remaining <= segW) return seg.start + remaining / seg.pxPerYr;
      remaining -= segW;
    }
  }
  const last = SEGMENTS[SEGMENTS.length - 1];
  return last.end + remaining / last.pxPerYr;
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
let showDates           = false;
let showDeathmatch      = false;

const DEATHMATCH_EXCEPTIONS = new Set(['kassai', 'kayo', 'rhinar']);

let heroSVG = null;
const heroLabelData = [];

let eraLabelEls       = [];
let tickLabelEls      = [];
let eventDotEls       = [];
let eventLabelEls     = [];
let eventAxisYearEls  = [];
let convergencePinEls = [];
let setImgEls         = [];
let heroDotData       = [];

const SET_THRESHOLD         = 0.15;
const HERO_THRESHOLD        = 0.5;
const WORLD_EVENT_THRESHOLD = 0.04;
const MAX_ZOOM              = 2.9;
const LANE_SPACING          = 18;
const AXIS_PADDING          = 60;

const TICK_YEARS = [
  -750, -501, -400, -101, -50, -1,
  50, 100, 150, 200, 220, 240, 248,
  250, 250.3, 250.6, 251, 251.3, 251.6, 252, 252.3, 252.6,
  253, 253.3, 253.6, 254, 254.3, 254.6,
  255, 256, 257, 258, 259, 260,
];
const AGE_END_TICK_YEARS = new Set([-501, -101, -1, 250, 251, 252, 253, 254, 255]);
const TICK_YEAR_SET = new Set(TICK_YEARS);
let TICK_X = TICK_YEARS.map(yearToX);
const TICK_MIN_SCREEN_PX = 50;

function tickMinZoom(i) {
  const left  = i > 0                  ? TICK_X[i] - TICK_X[i - 1] : Infinity;
  const right = i < TICK_X.length - 1 ? TICK_X[i + 1] - TICK_X[i] : Infinity;
  return TICK_MIN_SCREEN_PX / Math.max(left, right);
}

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
const yearHover      = document.getElementById('year-hover');
const btnWE          = document.getElementById('btn-show-world-events');
const btnAB          = document.getElementById('btn-show-age-bounds');
const btnH           = document.getElementById('btn-show-heroes');
const btnSI          = document.getElementById('btn-show-set-icons');
const btnDates       = document.getElementById('btn-show-dates');

track.style.transformOrigin = '0 0';

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
    tick.dataset.minZoom = AGE_END_TICK_YEARS.has(yr) ? 0 : tickMinZoom(i);
    const lbl = document.createElement('span');
    lbl.textContent = yearToAgeLabel(yr);
    tick.appendChild(lbl);
    tickLabelEls.push(lbl);
    worldLayer.appendChild(tick);
  });

  const nonAge = WORLD_EVENTS.filter(ev => ev.type !== 'age').sort((a, b) => a.year - b.year);
  nonAge.forEach((ev, i) => { ev._autoBelow = i % 2 !== 0; });
  WORLD_EVENTS.filter(ev => ev.convergence).forEach(ev => { ev._autoBelow = false; });

  const groups = WORLD_EVENTS.reduce((m, ev) => (m.set(ev.year, [...(m.get(ev.year) ?? []), ev]), m), new Map());
  groups.forEach(group => {
    const above = group.filter(ev => !ev._autoBelow);
    const below = group.filter(ev => ev._autoBelow);
    above.sort((a, b) => (a.type === 'age' || a.convergence ? 0 : 1) - (b.type === 'age' || b.convergence ? 0 : 1));
    above.forEach((ev, i) => { ev._stackIdx = i; });
    below.forEach((ev, i) => { ev._stackIdx = i; });
  });

  const axisYearShown = new Set();
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

    if (ev.type !== 'age' && !TICK_YEAR_SET.has(ev.year) && !axisYearShown.has(ev.year) && !inCollapsed) {
      const axisYr = document.createElement('div');
      axisYr.className = 'event-axis-year';
      axisYr.textContent = yearToAgeLabel(ev.year);
      axisYr.style.left = yearToX(ev.year) + 'px';
      worldLayer.appendChild(axisYr);
      eventAxisYearEls.push(axisYr);
      axisYearShown.add(ev.year);
    }

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
      img.addEventListener('click', ev => showTooltip(ev, s.label, showDates ? yearToAgeLabel(s.year) : ''));
      col.appendChild(img);
      setImgEls.push(img);
    });

    setLayer.appendChild(col);
  });
}

function buildHeroFanLayer() {
  const dated = HEROES.filter(h => h.events.some(e => e.year !== null));
  const N = dated.length;

  const maxTimelineYear = Math.max(
    ...HEROES.flatMap(h => h.events.filter(e => e.year !== null).map(e => e.year)),
    ...WORLD_EVENTS.filter(e => e.year !== null).map(e => e.year)
  );
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

    const _lastReal = evts[evts.length - 1];
    if (!_lastReal.death && _lastReal.year < maxTimelineYear) {
      const _offset = hero.id === 'ira' ? 10 : 0.3;
      evts.push({ year: _lastReal.year + _offset, label: 'Whereabouts Unknown', unknown: true, noConvergence: true });
    }

    const laneYVal = evtY(hero.id);
    const pts = evts.map(ev => ({
      x:    yearToX(ev.year),
      y:    convergenceYears.has(ev.year) && !ev.noConvergence ? 0 : laneYVal,
      dotY: laneYVal,
      ev,
    }));

    const hasUnknown = evts[evts.length - 1].unknown === true;
    const solidPts   = hasUnknown ? pts.slice(0, -1) : pts;

    if (solidPts.length >= 2) {
      let d = `M${solidPts[0].x},${solidPts[0].y}`;
      for (let i = 1; i < solidPts.length; i++) {
        const a = solidPts[i - 1], b = solidPts[i];
        const cp = (b.x - a.x) / 3;
        d += ` C${a.x + cp},${a.y} ${b.x - cp},${b.y} ${b.x},${b.y}`;
      }
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('stroke', hero.color);
      path.setAttribute('opacity', '0.85');
      path.dataset.hero = hero.id;
      heroSVG.appendChild(path);

      const hitPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      hitPath.setAttribute('d', d);
      hitPath.setAttribute('fill', 'none');
      hitPath.setAttribute('stroke', 'transparent');
      hitPath.setAttribute('stroke-width', '12');
      hitPath.setAttribute('class', 'hero-hit-path');
      hitPath.dataset.hero = hero.id;
      hitPath.addEventListener('click', e => {
        e.stopPropagation();
        if (heroLayer.style.opacity === '0' || !isHeroVisible(hero.id)) return;
        jumpToNextEvent(hero);
      });
      heroSVG.appendChild(hitPath);
    }

    if (hasUnknown) {
      const a     = solidPts.length > 0 ? solidPts[solidPts.length - 1] : pts[0];
      const b     = pts[pts.length - 1];
      const fromY = a.y;
      const cp    = (b.x - a.x) / 3;
      const dashD = fromY === laneYVal
        ? `M${a.x},${laneYVal} L${b.x},${laneYVal}`
        : `M${a.x},${fromY} C${a.x + cp},${fromY} ${b.x - cp},${laneYVal} ${b.x},${laneYVal}`;
      const dashPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      dashPath.setAttribute('d', dashD);
      dashPath.setAttribute('fill', 'none');
      dashPath.setAttribute('stroke', hero.color);
      dashPath.setAttribute('stroke-width', '1.5');
      dashPath.setAttribute('stroke-dasharray', '4 3');
      dashPath.setAttribute('opacity', '0.5');
      dashPath.dataset.hero = hero.id;
      heroSVG.appendChild(dashPath);
    }

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

    const visiblePts = pts.filter(pt => pt.ev.unknown || !convergenceYears.has(pt.ev.year));
    const uniquePositions = new Set(visiblePts.map(p => p.x)).size;
    const actualLastIsConvergence = pts.length > 0 && convergenceYears.has(pts[pts.length - 1].ev.year);

    visiblePts.forEach((pt, ptIdx) => {
      const isUnknown = !!pt.ev.unknown;
      const isDeath   = !!pt.ev.death;
      const isFirst   = ptIdx === 0 && uniquePositions > 1 && !isUnknown;
      const isLast    = ptIdx === visiblePts.length - 1 && uniquePositions > 1 && !actualLastIsConvergence && !isUnknown;

      const dot = document.createElement('div');
      dot.className = 'hero-dot' + (isUnknown ? ' hero-dot--unknown' : isDeath ? ' hero-dot--death' : isFirst ? ' hero-dot--first' : isLast ? ' hero-dot--last' : '');
      dot.dataset.hero = hero.id;
      dot.style.left = pt.x + 'px';
      dot.style.top  = pt.dotY + 'px';

      const sharesEndPos = !isUnknown && uniquePositions > 1 && !isLast && !actualLastIsConvergence && pt.x === visiblePts[visiblePts.length - 1].x;
      if (isUnknown || isDeath || isFirst || isLast) {
        dot.style.color = hero.color;
      } else if (!sharesEndPos) {
        dot.style.background = hero.color;
        dot.style.boxShadow  = `0 0 8px ${hero.color}`;
      }

      const evLbl = document.createElement('div');
      evLbl.className = 'hero-event-label';
      evLbl.textContent = isUnknown ? `${hero.name} — Whereabouts Unknown` : pt.ev.label;
      evLbl.style.color = hero.color;
      dot.appendChild(evLbl);

      dot.addEventListener('click', e => {
        e.stopPropagation();
        if (isUnknown) {
          showTooltip(e, hero.name, 'Whereabouts Unknown', hero.color);
        } else {
          showTooltip(e, pt.ev.label, showDates ? `${hero.name} · ${yearToAgeLabel(pt.ev.year)}` : hero.name, hero.color);
          if (pt.ev.url) window.open(pt.ev.url, '_blank', 'noopener');
        }
      });
      dot.addEventListener('mouseenter', () => highlightHero(hero.id));
      dot.addEventListener('mouseleave', clearHeroHighlight);

      heroDotsScreen.appendChild(dot);
      heroDotData.push({ el: dot, heroId: hero.id, trackX: pt.x, dotY: pt.dotY });
    });

  });
}

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


function isHeroVisible(heroId) {
  if (!visibleHeroes.has(heroId)) return false;
  const hero = HEROES.find(h => h.id === heroId);
  if (!showDeathmatch && hero?.deathmatch && !DEATHMATCH_EXCEPTIONS.has(heroId)) return false;
  return true;
}

function applyHeroVisibility() {
  if (!heroSVG) return;
  heroSVG.querySelectorAll('[data-hero]').forEach(el => {
    el.style.display = isHeroVisible(el.dataset.hero) ? '' : 'none';
  });
  updateStickyLabels();
}

function applyDatesVisibility() {
  tickLabelEls.forEach(el     => { el.style.display = showDates ? '' : 'none'; });
  eventAxisYearEls.forEach(el => { el.style.display = showDates ? '' : 'none'; });
  worldLayer.classList.toggle('dates-hidden', !showDates);
  if (btnDates) btnDates.textContent = (showDates ? 'Hide' : 'Show') + ' Unofficial Dates';
}

function updateStickyLabels() {
  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;
  const visibleLeftTrack  = -panX / zoom;
  const visibleRightTrack = (vw - panX) / zoom;

  heroLabelData.forEach(({ el, heroId, firstX, lastX, baseX, dotY }) => {
    if (!isHeroVisible(heroId)) { if (el.style.display !== 'none') el.style.display = 'none'; return; }
    const inView = firstX <= visibleRightTrack && lastX >= visibleLeftTrack;
    if (!inView) { if (el.style.display !== 'none') el.style.display = 'none'; return; }
    if (el.style.display === 'none') el.style.display = '';
    el.style.left = Math.max(10, panX + baseX * zoom) + 'px';
    el.style.top  = (vh / 2 + dotY - 8) + 'px';
  });

  heroDotData.forEach(({ el, heroId, trackX, dotY }) => {
    if (!isHeroVisible(heroId)) { el.style.display = 'none'; return; }
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
  eraLabelEls.forEach(el          => { el.style.transform = scaleX; });
  tickLabelEls.forEach(el         => { el.style.transform = `scaleX(${invZ}) rotate(-40deg)`; });
  eventDotEls.forEach(el          => { el.style.transform = `scaleX(${invZ}) rotate(45deg)`; });
  eventLabelEls.forEach(el        => { el.style.transform = scaleX; });
  convergencePinEls.forEach(el    => { el.style.transform = centeredPin; });
  setImgEls.forEach(el            => { el.style.transform = `translateX(${-45 * invZ}px) scaleX(${invZ})`; });
  eventAxisYearEls.forEach(el     => { el.style.transform = `scaleX(${invZ}) rotate(-40deg)`; });

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

viewport.addEventListener('mousemove', e => {
  const vpLeft = viewport.getBoundingClientRect().left;
  const trackX = (e.clientX - vpLeft - panX) / zoom;
  yearHover.textContent = yearToAgeLabel(Math.round(xToYear(trackX)));
  yearHover.style.left = e.clientX + 'px';
  yearHover.style.top  = e.clientY + 'px';
  yearHover.style.display = 'block';
});
viewport.addEventListener('mouseleave', () => { yearHover.style.display = 'none'; });

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

btnDates.addEventListener('click', () => { showDates = !showDates; applyDatesVisibility(); });

document.getElementById('legend-toggle').addEventListener('click', () => {
  const legend = document.getElementById('legend');
  const btn    = document.getElementById('legend-toggle');
  legend.classList.toggle('minimized');
  btn.textContent = legend.classList.contains('minimized') ? '+' : '−';
});

document.getElementById('non-canon-toggle').addEventListener('click', () => {
  const panel = document.getElementById('non-canon-panel');
  const btn   = document.getElementById('non-canon-toggle');
  panel.classList.toggle('minimized');
  btn.textContent = panel.classList.contains('minimized') ? '+' : '−';
});

(function () {
  const tag = document.querySelector('#non-canon-panel .non-canon-tag');

  tag.addEventListener('click', () => {
    showDeathmatch = !showDeathmatch;
    tag.classList.toggle('active', showDeathmatch);
    applyHeroVisibility();
  });

  tag.addEventListener('mouseenter', () => activateHighlight(id => (HEROES.find(h => h.id === id)?.deathmatch || DEATHMATCH_EXCEPTIONS.has(id)) && isHeroVisible(id)));
  tag.addEventListener('mouseleave', clearHeroHighlight);
}());

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

(function () {
  const panel  = document.getElementById('non-canon-panel');
  const header = panel.querySelector('.non-canon-header');
  let dragging = false, offX = 0, offY = 0;

  header.addEventListener('mousedown', e => {
    if (e.target.id === 'non-canon-toggle') return;
    e.preventDefault();
    e.stopPropagation();
    const rect = panel.getBoundingClientRect();
    panel.style.cssText += `;bottom:auto;right:auto;top:${rect.top}px;left:${rect.left}px`;
    offX = e.clientX - rect.left;
    offY = e.clientY - rect.top;
    dragging = true;
    header.style.cursor = 'grabbing';
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    panel.style.left = Math.max(0, e.clientX - offX) + 'px';
    panel.style.top  = Math.max(0, e.clientY - offY) + 'px';
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
  eraLabelEls          = [];
  tickLabelEls         = [];
  eventDotEls          = [];
  eventLabelEls        = [];
  eventAxisYearEls     = [];
  convergencePinEls    = [];
  setImgEls            = [];

  TRACK_WIDTH       = computeTrackWidth();
  TICK_X            = TICK_YEARS.map(yearToX);
  track.style.width = TRACK_WIDTH + 'px';

  buildWorldLayer();
  buildSetLayer();
  buildHeroFanLayer();

  heroSVG.setAttribute('width', TRACK_WIDTH);
  zoom = Math.max((viewport.clientWidth - 80) / TRACK_WIDTH, zoom);
  panX = clampPan(panX, zoom);
  applyDatesVisibility();
  applyTransform();
}

const EXPORT_AXIS        = '#ffffff';
const EXPORT_TEXT        = '#e8e8f0';
const EXPORT_DIM         = '#8a8aa8';
const EXPORT_ERA_BORDER  = '#33334f';
const EXPORT_AGE         = '#f6e05e';
const EXPORT_CONV        = '#ffffff';
const EXPORT_EVENT       = '#d7d7f0';
const EXPORT_LABEL_BG    = 'rgba(14,14,26,0.93)';
const EXPORT_FONT_FAMILY = "'Segoe UI', system-ui, sans-serif";
const EXPORT_LINE_H      = 15;
const EXPORT_SUB_LINE_H  = 13;
const EXPORT_PAD_X       = 10;
const EXPORT_PAD_Y       = 7;
const EXPORT_DOT_GAP     = 10;
const EXPORT_INNER_GAP   = 16;
const EXPORT_LANE_GAP    = 14;
const EXPORT_TOP_PAD     = 40;
const EXPORT_BOTTOM_PAD  = 40;
const EXPORT_SIDE_PAD    = 50;

const exportMeasureCanvas = document.createElement('canvas');
const exportMeasureCtx    = exportMeasureCanvas.getContext('2d');
function measureTextWidth(text, font) {
  exportMeasureCtx.font = font;
  return exportMeasureCtx.measureText(text).width;
}

function escapeXML(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
}

function wrapSVG(content, width, height) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${content}</svg>`;
}

function buildWorldExportLayout() {
  const totalTrackWidth = computeTrackWidth();

  const items = WORLD_EVENTS.map(ev => {
    const lines = ev.label.split('\n').map(l => l.trim()).filter(Boolean);
    const subLine = yearToAgeLabel(ev.year);
    const mainWidth = Math.max(...lines.map(l => measureTextWidth(l, `600 12px ${EXPORT_FONT_FAMILY}`)));
    const subWidth  = measureTextWidth(subLine, `400 10px 'Courier New', monospace`);
    const w = Math.max(mainWidth, subWidth) + EXPORT_PAD_X * 2;
    const h = lines.length * EXPORT_LINE_H + EXPORT_SUB_LINE_H + EXPORT_PAD_Y * 2 + 4;
    const isAge  = ev.type === 'age';
    const isConv = !!ev.convergence;
    const below  = !isAge && !isConv && !!ev._autoBelow;
    return { ev, lines, subLine, x: yearToX(ev.year), w, h, isAge, isConv, below };
  });

  function packLanes(list) {
    list.sort((a, b) => a.x - b.x);
    const laneRight = [];
    list.forEach(it => {
      const half = it.w / 2;
      let lane = laneRight.findIndex(r => (it.x - half) >= r);
      if (lane === -1) { lane = laneRight.length; laneRight.push(-Infinity); }
      laneRight[lane] = it.x + half + 8;
      it.lane = lane;
    });
    return Math.max(1, laneRight.length);
  }

  const aboveLanes = packLanes(items.filter(it => !it.below));
  const belowLanes = packLanes(items.filter(it => it.below));

  const maxH = Math.max(...items.map(it => it.h));
  const laneHeight = maxH + EXPORT_INNER_GAP + EXPORT_DOT_GAP + EXPORT_LANE_GAP;

  return { items, totalTrackWidth, aboveLanes, belowLanes, laneHeight };
}

function buildHeroExportLayout() {
  const dated = HEROES.filter(h => h.events.some(e => e.year !== null));
  const N = dated.length;
  const half = Math.floor(N / 2);
  const laneY = {};
  dated.forEach((hero, i) => {
    laneY[hero.id] = i < half
      ? -(half - i) * LANE_SPACING - AXIS_PADDING
      :  (i - half + 1) * LANE_SPACING + AXIS_PADDING;
  });

  const maxTimelineYear = Math.max(
    ...HEROES.flatMap(h => h.events.filter(e => e.year !== null).map(e => e.year)),
    ...WORLD_EVENTS.filter(e => e.year !== null).map(e => e.year)
  );
  const convergenceYears = new Set(WORLD_EVENTS.filter(w => w.convergence).map(w => w.year));

  const heroPaths = {};
  const items = [];

  dated.forEach(hero => {
    const evts = hero.events.filter(e => e.year !== null).sort((a, b) => a.year - b.year);
    if (evts.length === 0) return;

    const _lastReal = evts[evts.length - 1];
    if (!_lastReal.death && _lastReal.year < maxTimelineYear) {
      const _offset = hero.id === 'ira' ? 10 : 0.3;
      evts.push({ year: _lastReal.year + _offset, label: 'Whereabouts Unknown', unknown: true, noConvergence: true });
    }

    const laneYVal = laneY[hero.id] ?? 0;
    const pts = evts.map(ev => ({
      x: yearToX(ev.year),
      yLocal: convergenceYears.has(ev.year) && !ev.noConvergence ? 0 : laneYVal,
      ev,
    }));
    const hasUnknown = evts[evts.length - 1].unknown === true;
    const solidPts   = hasUnknown ? pts.slice(0, -1) : pts;
    heroPaths[hero.id] = { pts, hasUnknown, solidPts, laneYVal };

    const visiblePts = pts.filter(pt => pt.ev.unknown || !convergenceYears.has(pt.ev.year));
    const uniquePositions = new Set(visiblePts.map(p => p.x)).size;
    const actualLastIsConvergence = pts.length > 0 && convergenceYears.has(pts[pts.length - 1].ev.year);
    const below = laneYVal > 0;

    visiblePts.forEach((pt, idx) => {
      const isUnknown = !!pt.ev.unknown;
      if (isUnknown) return;

      const isDeath = !!pt.ev.death;
      const isFirst = idx === 0 && uniquePositions > 1;
      const isLast  = idx === visiblePts.length - 1 && uniquePositions > 1 && !actualLastIsConvergence;
      const text = pt.ev.label;

      const textW = measureTextWidth(text, `500 11px ${EXPORT_FONT_FAMILY}`);
      let w = textW + EXPORT_PAD_X * 2;
      let h = EXPORT_LINE_H + EXPORT_PAD_Y * 2;
      if (isFirst) {
        const nameW = measureTextWidth(hero.name, `700 12px ${EXPORT_FONT_FAMILY}`);
        w = Math.max(w, nameW + EXPORT_PAD_X * 2);
        h += EXPORT_LINE_H + 2;
      }

      items.push({
        hero, x: pt.x, w, h, below,
        naturalDist: Math.abs(laneYVal),
        isFirst, isLast, isDeath, isUnknown, text,
      });
    });
  });

  function packHeroLanes(list) {
    const maxH = Math.max(20, ...list.map(it => it.h));
    const stepHeight = maxH + EXPORT_DOT_GAP + EXPORT_LANE_GAP;
    const baseDist = EXPORT_INNER_GAP;
    list.forEach(it => { it.naturalLane = Math.max(0, Math.round((it.naturalDist - baseDist) / stepHeight)); });
    list.sort((a, b) => a.x - b.x);
    const laneRight = [];
    list.forEach(it => {
      const half = it.w / 2;
      let lane = it.naturalLane;
      while ((laneRight[lane] ?? -Infinity) > it.x - half) lane++;
      laneRight[lane] = it.x + half + 8;
      it.lane = lane;
      it.dist = baseDist + lane * stepHeight;
    });
    return laneRight.length ? baseDist + laneRight.length * stepHeight : 0;
  }

  const aboveExtent = packHeroLanes(items.filter(it => !it.below));
  const belowExtent = packHeroLanes(items.filter(it => it.below));

  return { dated, laneY, heroPaths, items, aboveExtent, belowExtent };
}

function computeSharedExportFrame(worldLayout, heroLayout) {
  const worldAboveExtent = worldLayout.aboveLanes * worldLayout.laneHeight;
  const worldBelowExtent = worldLayout.belowLanes * worldLayout.laneHeight;

  const aboveExtent = Math.max(worldAboveExtent, heroLayout.aboveExtent);
  const belowExtent = Math.max(worldBelowExtent, heroLayout.belowExtent);

  const axisY       = EXPORT_TOP_PAD + aboveExtent;
  const totalHeight = axisY + belowExtent + EXPORT_BOTTOM_PAD;
  const totalWidth  = worldLayout.totalTrackWidth + EXPORT_SIDE_PAD * 2;

  return { axisY, totalWidth, totalHeight, SIDE_PAD: EXPORT_SIDE_PAD };
}

function renderWorldItemSVG(it, laneHeight, frame) {
  const { axisY, SIDE_PAD } = frame;
  const x = it.x + SIDE_PAD;
  const dir = it.below ? 1 : -1;
  const dSize = it.isConv ? 15 : it.isAge ? 13 : 9;
  let dotY, labelCenterY, connY2;

  if (it.isAge || it.isConv) {
    dotY = axisY;
    const labelDist = EXPORT_INNER_GAP + it.lane * laneHeight + it.h / 2;
    labelCenterY = axisY + dir * labelDist;
    connY2 = labelCenterY + dir * (it.h / 2);
  } else {
    const bandInner = EXPORT_INNER_GAP + it.lane * laneHeight;
    dotY = axisY + dir * bandInner;
    labelCenterY = axisY + dir * (bandInner + EXPORT_DOT_GAP + it.h / 2);
    connY2 = dotY;
  }

  let s = `<line x1="${x}" y1="${axisY}" x2="${x}" y2="${connY2}" stroke="rgba(255,255,255,0.35)" stroke-width="1"/>`;

  if (it.isAge) {
    s += `<rect x="${x - dSize / 2}" y="${dotY - dSize / 2}" width="${dSize}" height="${dSize}" fill="${EXPORT_AGE}" transform="rotate(45 ${x} ${dotY})"/>`;
  } else if (it.isConv) {
    s += `<circle cx="${x}" cy="${dotY}" r="${dSize / 2}" fill="${EXPORT_CONV}" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>`;
  } else {
    s += `<circle cx="${x}" cy="${dotY}" r="${dSize / 2}" fill="${EXPORT_EVENT}"/>`;
  }

  const boxColor = it.isAge ? EXPORT_AGE : it.isConv ? EXPORT_CONV : EXPORT_TEXT;
  const boxX = x - it.w / 2, boxY = labelCenterY - it.h / 2;
  s += `<rect x="${boxX}" y="${boxY}" width="${it.w}" height="${it.h}" rx="6" fill="${EXPORT_LABEL_BG}" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>`;
  s += `<rect x="${boxX}" y="${boxY}" width="${it.w}" height="2" rx="1" fill="${boxColor}" opacity="0.55"/>`;

  const ty = boxY + EXPORT_PAD_Y + EXPORT_LINE_H * 0.75;
  s += `<text x="${x}" y="${ty}" text-anchor="middle" font-family="${EXPORT_FONT_FAMILY}" font-size="12" font-weight="600" fill="${boxColor}">`;
  it.lines.forEach((line, i) => {
    s += `<tspan x="${x}"${i === 0 ? '' : ` dy="${EXPORT_LINE_H}"`}>${escapeXML(line)}</tspan>`;
  });
  s += `</text>`;

  const subY = boxY + it.h - EXPORT_PAD_Y - 2;
  s += `<text x="${x}" y="${subY}" text-anchor="middle" font-family="'Courier New', monospace" font-size="10" fill="${EXPORT_DIM}">${escapeXML(it.subLine)}</text>`;
  return s;
}

function renderWorldEventsSVG(worldLayout, frame) {
  const content = worldLayout.items
    .filter(it => !it.isAge)
    .map(it => renderWorldItemSVG(it, worldLayout.laneHeight, frame))
    .join('');
  return wrapSVG(content, frame.totalWidth, frame.totalHeight);
}

function renderAgeBoundariesSVG(worldLayout, frame) {
  const content = worldLayout.items
    .filter(it => it.isAge)
    .map(it => renderWorldItemSVG(it, worldLayout.laneHeight, frame))
    .join('');
  return wrapSVG(content, frame.totalWidth, frame.totalHeight);
}

function renderTimelineOnlySVG(frame) {
  const { axisY, totalWidth, totalHeight, SIDE_PAD } = frame;
  let content = '';
  ERAS.forEach(era => {
    const x1 = yearToX(era.start) + SIDE_PAD;
    const x2 = yearToX(era.end)   + SIDE_PAD;
    content += `<line x1="${x1}" y1="14" x2="${x1}" y2="${totalHeight - 14}" stroke="${EXPORT_ERA_BORDER}" stroke-width="1"/>`;
    content += `<text x="${(x1 + x2) / 2}" y="20" text-anchor="middle" font-family="${EXPORT_FONT_FAMILY}" font-size="11" letter-spacing="1.5" fill="${EXPORT_DIM}">${escapeXML(era.label.toUpperCase())}</text>`;
  });
  const xEnd = yearToX(ERAS[ERAS.length - 1].end) + SIDE_PAD;
  content += `<line x1="${xEnd}" y1="14" x2="${xEnd}" y2="${totalHeight - 14}" stroke="${EXPORT_ERA_BORDER}" stroke-width="1"/>`;
  content += `<line x1="0" y1="${axisY}" x2="${totalWidth}" y2="${axisY}" stroke="${EXPORT_AXIS}" stroke-width="2"/>`;
  return wrapSVG(content, totalWidth, totalHeight);
}

function renderDatesSVG(frame) {
  const { axisY, SIDE_PAD } = frame;
  const content = TICK_YEARS.map(yr => {
    const x = yearToX(yr) + SIDE_PAD;
    const label = yearToAgeLabel(yr);
    const labelY = axisY + 24;
    return `<line x1="${x}" y1="${axisY}" x2="${x}" y2="${axisY + 10}" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>` +
      `<text x="${x + 3}" y="${labelY}" text-anchor="start" font-family="${EXPORT_FONT_FAMILY}" font-size="12" fill="${EXPORT_TEXT}" transform="rotate(-40 ${x} ${labelY})">${escapeXML(label)}</text>`;
  }).join('');
  return wrapSVG(content, frame.totalWidth, frame.totalHeight);
}

function renderHeroLabelItemSVG(it, frame) {
  const { axisY, SIDE_PAD } = frame;
  const x = it.x + SIDE_PAD;
  const dir = it.below ? 1 : -1;
  const dotYAbs = axisY + dir * it.naturalDist;
  const boxNear = axisY + dir * it.dist;
  const boxFar  = boxNear + dir * it.h;
  const boxTop  = Math.min(boxNear, boxFar);
  const boxX    = x - it.w / 2;

  let s = '';
  if (boxNear !== dotYAbs) {
    s += `<line x1="${x}" y1="${dotYAbs}" x2="${x}" y2="${boxNear}" stroke="${it.hero.color}" stroke-width="1" opacity="0.4"/>`;
  }
  s += `<rect x="${boxX}" y="${boxTop}" width="${it.w}" height="${it.h}" rx="5" fill="${EXPORT_LABEL_BG}" stroke="${it.hero.color}" stroke-opacity="0.5" stroke-width="1"/>`;
  s += `<rect x="${boxX}" y="${boxTop}" width="${it.w}" height="2" rx="1" fill="${it.hero.color}" opacity="0.7"/>`;

  if (it.isFirst) {
    const nameY  = boxTop + EXPORT_PAD_Y + EXPORT_LINE_H * 0.75;
    const eventY = nameY + EXPORT_LINE_H + 2;
    s += `<text x="${x}" y="${nameY}" text-anchor="middle" font-family="${EXPORT_FONT_FAMILY}" font-size="12" font-weight="700" fill="${it.hero.color}">${escapeXML(it.hero.name)}</text>`;
    s += `<text x="${x}" y="${eventY}" text-anchor="middle" font-family="${EXPORT_FONT_FAMILY}" font-size="11" font-weight="500" fill="${EXPORT_TEXT}">${escapeXML(it.text)}</text>`;
  } else {
    const ty = boxTop + EXPORT_PAD_Y + EXPORT_LINE_H * 0.75;
    s += `<text x="${x}" y="${ty}" text-anchor="middle" font-family="${EXPORT_FONT_FAMILY}" font-size="11" font-weight="500" fill="${EXPORT_TEXT}">${escapeXML(it.text)}</text>`;
  }
  return s;
}

function renderHeroesSVG(heroLayout, frame, selectedIds) {
  const { axisY, SIDE_PAD } = frame;
  const { heroPaths, items } = heroLayout;

  let content = '';

  heroLayout.dated.filter(hero => selectedIds.has(hero.id)).forEach(hero => {
    const path = heroPaths[hero.id];
    if (!path) return;
    const { pts: localPts, hasUnknown, solidPts: localSolidPts, laneYVal } = path;
    const dotYAbs = axisY + laneYVal;
    const pts      = localPts.map(p => ({ x: p.x + SIDE_PAD, y: axisY + p.yLocal, ev: p.ev }));
    const solidPts = hasUnknown ? pts.slice(0, -1) : pts;

    if (solidPts.length >= 2) {
      let d = `M${solidPts[0].x},${solidPts[0].y}`;
      for (let i = 1; i < solidPts.length; i++) {
        const a = solidPts[i - 1], b = solidPts[i];
        const cp = (b.x - a.x) / 3;
        d += ` C${a.x + cp},${a.y} ${b.x - cp},${b.y} ${b.x},${b.y}`;
      }
      content += `<path d="${d}" stroke="${hero.color}" stroke-width="1.8" fill="none" opacity="0.9"/>`;
    }

    if (hasUnknown) {
      const a = solidPts.length > 0 ? solidPts[solidPts.length - 1] : pts[0];
      const b = pts[pts.length - 1];
      const cp = (b.x - a.x) / 3;
      const dashD = a.y === dotYAbs
        ? `M${a.x},${dotYAbs} L${b.x},${dotYAbs}`
        : `M${a.x},${a.y} C${a.x + cp},${a.y} ${b.x - cp},${dotYAbs} ${b.x},${dotYAbs}`;
      content += `<path d="${dashD}" stroke="${hero.color}" stroke-width="1.5" fill="none" stroke-dasharray="4 3" opacity="0.5"/>`;
    }

    const convergenceYears = new Set(WORLD_EVENTS.filter(w => w.convergence).map(w => w.year));
    if (convergenceYears.has(pts[0].ev.year) && !pts[0].ev.noConvergence) {
      content += `<line x1="${pts[0].x}" y1="${dotYAbs}" x2="${pts[0].x}" y2="${axisY}" stroke="${hero.color}" stroke-width="1.5" opacity="0.85"/>`;
    }

    const visiblePts = pts.filter(pt => pt.ev.unknown || !convergenceYears.has(pt.ev.year));
    const uniquePositions = new Set(visiblePts.map(p => p.x)).size;
    const actualLastIsConvergence = pts.length > 0 && convergenceYears.has(pts[pts.length - 1].ev.year);

    visiblePts.forEach((pt, idx) => {
      const isUnknown = !!pt.ev.unknown;
      const isDeath   = !!pt.ev.death;
      const isFirst   = idx === 0 && uniquePositions > 1 && !isUnknown;
      const isLast    = idx === visiblePts.length - 1 && uniquePositions > 1 && !actualLastIsConvergence && !isUnknown;

      if (isUnknown) {
        content += `<text x="${pt.x}" y="${dotYAbs + 5}" text-anchor="middle" font-family="${EXPORT_FONT_FAMILY}" font-size="13" font-weight="700" fill="${hero.color}" opacity="0.7">??</text>`;
      } else if (isDeath) {
        content += `<text x="${pt.x}" y="${dotYAbs + 8}" text-anchor="middle" font-family="${EXPORT_FONT_FAMILY}" font-size="22" font-weight="900" fill="${hero.color}">✕</text>`;
      } else if (isFirst) {
        content += `<text x="${pt.x}" y="${dotYAbs + 9}" text-anchor="middle" font-family="${EXPORT_FONT_FAMILY}" font-size="26" font-weight="900" fill="${hero.color}">+</text>`;
      } else if (isLast) {
        content += `<text x="${pt.x}" y="${dotYAbs + 6}" text-anchor="middle" font-family="${EXPORT_FONT_FAMILY}" font-size="26" font-weight="900" fill="${hero.color}">−</text>`;
      } else {
        content += `<circle cx="${pt.x}" cy="${dotYAbs}" r="5" fill="${hero.color}" stroke="rgba(9,9,15,0.9)" stroke-width="2"/>`;
      }
    });
  });

  items
    .filter(it => selectedIds.has(it.hero.id))
    .forEach(it => { content += renderHeroLabelItemSVG(it, frame); });

  return wrapSVG(content, frame.totalWidth, frame.totalHeight);
}

async function rasterizeExportCanvas(width, height, svgStr) {
  const SCALE = 1.5;
  const canvas = document.createElement('canvas');
  canvas.width  = Math.round(width  * SCALE);
  canvas.height = Math.round(height * SCALE);
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);

  if (svgStr) {
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    try {
      const img = await new Promise((resolve, reject) => {
        const el = new Image();
        el.onload  = () => resolve(el);
        el.onerror = () => reject(new Error('Failed to rasterize export SVG'));
        el.src = url;
      });
      ctx.drawImage(img, 0, 0, width, height);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  return { canvas, ctx };
}

function downloadCanvas(canvas, filename) {
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      resolve();
    }, 'image/png');
  });
}

function canvasToBlob(canvas) {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

const crc32Table = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) crc = crc32Table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function buildZip(files) {
  const encoder = new TextEncoder();
  const now = new Date();
  const dosTime = ((now.getHours() & 0x1F) << 11) | ((now.getMinutes() & 0x3F) << 5) | ((now.getSeconds() >> 1) & 0x1F);
  const dosDate = (((now.getFullYear() - 1980) & 0x7F) << 9) | (((now.getMonth() + 1) & 0xF) << 5) | (now.getDate() & 0x1F);

  const localParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach(f => {
    const nameBytes = encoder.encode(f.name);
    const crc = crc32(f.data);
    const size = f.data.length;

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0, true);
    local.setUint16(8, 0, true);
    local.setUint16(10, dosTime, true);
    local.setUint16(12, dosDate, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, size, true);
    local.setUint32(22, size, true);
    local.setUint16(26, nameBytes.length, true);
    local.setUint16(28, 0, true);
    localParts.push(new Uint8Array(local.buffer), nameBytes, f.data);

    const central = new DataView(new ArrayBuffer(46));
    central.setUint32(0, 0x02014b50, true);
    central.setUint16(4, 20, true);
    central.setUint16(6, 20, true);
    central.setUint16(8, 0, true);
    central.setUint16(10, 0, true);
    central.setUint16(12, dosTime, true);
    central.setUint16(14, dosDate, true);
    central.setUint32(16, crc, true);
    central.setUint32(20, size, true);
    central.setUint32(24, size, true);
    central.setUint16(28, nameBytes.length, true);
    central.setUint16(30, 0, true);
    central.setUint16(32, 0, true);
    central.setUint16(34, 0, true);
    central.setUint16(36, 0, true);
    central.setUint32(38, 0, true);
    central.setUint32(42, offset, true);
    centralParts.push(new Uint8Array(central.buffer), nameBytes);

    offset += 30 + nameBytes.length + size;
  });

  const centralOffset = offset;
  const centralSize = centralParts.reduce((s, p) => s + p.length, 0);

  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(4, 0, true);
  end.setUint16(6, 0, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, centralOffset, true);
  end.setUint16(20, 0, true);

  return new Blob([...localParts, ...centralParts, new Uint8Array(end.buffer)], { type: 'application/zip' });
}

function safeFileName(name) {
  return name.replace(/[\\/:*?"<>|]/g, '').replace(/,\s*/g, ' - ').trim();
}

async function runHeroBatchExport() {
  const btn = document.getElementById('btn-export-heroes-all');
  if (btn) { btn.disabled = true; btn.textContent = 'Exporting…'; }

  const savedCollapsed = Array.from(collapsedEras);
  collapsedEras.clear();
  try {
    const worldLayout = buildWorldExportLayout();
    const heroLayout  = buildHeroExportLayout();
    const frame        = computeSharedExportFrame(worldLayout, heroLayout);

    const dated = heroLayout.dated;
    const files = [];
    const usedNames = new Set();

    for (let i = 0; i < dated.length; i++) {
      const hero = dated[i];
      if (btn) btn.textContent = `Exporting ${i + 1}/${dated.length + 1}…`;
      const svg = renderHeroesSVG(heroLayout, frame, new Set([hero.id]));
      const { canvas } = await rasterizeExportCanvas(frame.totalWidth, frame.totalHeight, svg);
      const blob = await canvasToBlob(canvas);

      let base = safeFileName(hero.name) || hero.id;
      let name = base;
      let n = 2;
      while (usedNames.has(name)) { name = `${base} (${n++})`; }
      usedNames.add(name);

      files.push({ name: `heroes/${name}.png`, data: new Uint8Array(await blob.arrayBuffer()) });
    }

    if (btn) btn.textContent = `Exporting ${dated.length + 1}/${dated.length + 1}…`;
    const svgAll = renderHeroesSVG(heroLayout, frame, new Set(dated.map(h => h.id)));
    const { canvas: canvasAll } = await rasterizeExportCanvas(frame.totalWidth, frame.totalHeight, svgAll);
    const blobAll = await canvasToBlob(canvasAll);
    files.push({ name: 'all-heroes-combined.png', data: new Uint8Array(await blobAll.arrayBuffer()) });

    if (btn) btn.textContent = 'Zipping…';
    const zipBlob = buildZip(files);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(zipBlob);
    a.download = 'world-of-rathe-heroes-individual.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.error('Hero batch export failed:', err);
    alert('Hero batch export failed: ' + err.message);
  } finally {
    collapsedEras.clear();
    savedCollapsed.forEach(id => collapsedEras.add(id));
    if (btn) { btn.disabled = false; btn.textContent = 'Export All Heroes (zip)'; }
  }
}

document.getElementById('btn-export-heroes-all').addEventListener('click', runHeroBatchExport);

const EXPORT_BUTTONS = {
  world:    { id: 'btn-export-world',    label: 'Export World Events',    filename: 'world-of-rathe-world-events.png' },
  age:      { id: 'btn-export-age',      label: 'Export Age Boundaries',  filename: 'world-of-rathe-age-boundaries.png' },
  timeline: { id: 'btn-export-timeline', label: 'Export Timeline Only',   filename: 'world-of-rathe-timeline-base.png' },
  heroes:   { id: 'btn-export-heroes',   label: 'Export Hero Timelines',  filename: 'world-of-rathe-heroes.png' },
  dates:    { id: 'btn-export-dates',    label: 'Export Dates',           filename: 'world-of-rathe-dates.png' },
};

function runExport(kind) {
  const meta = EXPORT_BUTTONS[kind];
  const btn  = document.getElementById(meta.id);

  if (kind === 'heroes') {
    const selected = new Set(HEROES.filter(h => isHeroVisible(h.id)).map(h => h.id));
    if (selected.size === 0) {
      alert('No heroes are currently checked. Open the ☰ menu and select the heroes you want in this export.');
      return;
    }
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Exporting…'; }

  setTimeout(async () => {
    const savedCollapsed = Array.from(collapsedEras);
    collapsedEras.clear();
    try {
      const worldLayout = buildWorldExportLayout();
      const heroLayout  = buildHeroExportLayout();
      const frame        = computeSharedExportFrame(worldLayout, heroLayout);

      let svg;
      if (kind === 'world')         svg = renderWorldEventsSVG(worldLayout, frame);
      else if (kind === 'age')      svg = renderAgeBoundariesSVG(worldLayout, frame);
      else if (kind === 'timeline') svg = renderTimelineOnlySVG(frame);
      else if (kind === 'dates')    svg = renderDatesSVG(frame);
      else if (kind === 'heroes')   svg = renderHeroesSVG(heroLayout, frame, new Set(HEROES.filter(h => isHeroVisible(h.id)).map(h => h.id)));

      const { canvas } = await rasterizeExportCanvas(frame.totalWidth, frame.totalHeight, svg);
      await downloadCanvas(canvas, meta.filename);
    } catch (err) {
      console.error('Timeline export failed:', err);
    } finally {
      collapsedEras.clear();
      savedCollapsed.forEach(id => collapsedEras.add(id));
      if (btn) { btn.disabled = false; btn.textContent = meta.label; }
    }
  }, 20);
}

Object.keys(EXPORT_BUTTONS).forEach(kind => {
  const el = document.getElementById(EXPORT_BUTTONS[kind].id);
  if (el) el.addEventListener('click', () => runExport(kind));
});

let resizeRafId = null;
window.addEventListener('resize', () => {
  if (resizeRafId) return;
  resizeRafId = requestAnimationFrame(() => {
    resizeRafId = null;
    panX = clampPan(panX, zoom);
    applyTransform();
  });
});

track.style.width    = TRACK_WIDTH + 'px';
setLayer.style.width = TRACK_WIDTH + 'px';
buildWorldLayer();
buildSetLayer();
buildHeroFanLayer();
buildMenu();
applyDatesVisibility();
applyHeroVisibility();
resetView();
