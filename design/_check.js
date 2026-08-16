
  const nav = document.getElementById('nav');
  const hero = document.querySelector('.hero');

  // Hero departure. Reduced motion leaves --p at 0, so the hero stays whole.
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  let ticking = false;

  function update() {
    ticking = false;
    const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)));
    hero.style.setProperty('--p', p.toFixed(4));
    // The bar only takes on its light surface once the hero is genuinely gone;
    // switching earlier leaves ink-coloured links sitting on the photograph.
    nav.classList.toggle('stuck', window.scrollY > window.innerHeight * 0.92);
  }

  function onScroll() {
    if (ticking || calm.matches) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();




  // ---- Feed: photo sets only, newest first, shape follows content --------
  // Footprint is a function of the set: how many photographs it holds and which
  // way the lead one faces. Nothing here is hand-placed, so the run reshapes
  // itself as the archive grows instead of repeating a designed rhythm.
  const U2 = 'https://unsplash.com/photos/';
  const sets = [
    { t:'The long way back',  d:'2025-02-12', by:'Partner',
      ph:['mL2B7wvsD38','EdULZpOKsUE','99mN3NEGrMA'], lead:'landscape' },
    { t:'Third coffee',       d:'2025-01-28', by:'Partner',
      ph:['8c3zjKrkkBA'], lead:'portrait' },
    { t:'Nobody could park',  d:'2025-02-02', by:'Marko',
      ph:['3DPaL6XDcZE','xSI-8hwyUzE','loTTPqOed7c','qXcl3z7_AOc','Aj6mvFNBXAA','EvcUtLF12XQ'],
      lead:'landscape' },
    { t:'Rained the whole time', d:'2025-01-06', by:'Marko',
      ph:['EvcUtLF12XQ','Aj6mvFNBXAA'], lead:'landscape' },
    { t:'You said it was close', d:'2024-11-19', by:'Partner',
      ph:['xSI-8hwyUzE'], lead:'landscape' },
    { t:'Both suitcases, one hand', d:'2024-10-11', by:'Marko',
      ph:['loTTPqOed7c','3DPaL6XDcZE','qXcl3z7_AOc','mL2B7wvsD38'], lead:'landscape' }
  ];

  // span (of 12) and height, derived from the set itself
  function footprint(set) {
    const n = set.ph.length;
    if (n >= 4)  return { span:7, h:'clamp(17rem,30vw,26rem)' };
    if (n >= 2)  return { span:5, h:'clamp(14rem,23vw,20rem)' };
    return set.lead === 'portrait'
      ? { span:3, h:'clamp(15rem,26vw,23rem)' }
      : { span:4, h:'clamp(11rem,18vw,16rem)' };
  }

  const feed = document.getElementById('feedgrid');
  if (feed) {
    const fmt = iso => new Date(iso).toLocaleDateString('en-GB',
      { day:'numeric', month:'short', year:'numeric' });

    feed.innerHTML = sets.map(set => {
      const { span, h } = footprint(set);
      const extra = set.ph.slice(1, 3);
      return `<a class="card" href="#" style="--span:${span};--h:${h}">
        <span class="obj">
          ${set.ph.length > 1 ? `<span class="count">${set.ph.length} photos</span>` : ''}
          <img src="${U2}${set.ph[0]}/download?w=1000" alt="${set.t}">
          ${extra.length ? `<span class="pile">${extra.map(id =>
            `<img src="${U2}${id}/download?w=200" alt="">`).join('')}</span>` : ''}
        </span>
        <span class="cap"><b>${set.t}</b>
          <span>${fmt(set.d)} · added by <em>${set.by}</em></span></span>
      </a>`;
    }).join('')
    + `<p class="feedmore"><a href="#">Everything, in order →</a></p>`;
  }

  // Coastlines drawn from real geodata using geoNaturalEarth1 — equirectangular
  // smears everything toward the poles (Iceland and Greenland go wide and flat).
  // PROJ is shared with the pins so both use identical maths.
  let PROJ = null;
  const MAP_W = 1040, MAP_H = 520;

  async function drawCoastlines() {
    const svg = document.getElementById('mapsvg');
    if (!svg || typeof d3 === 'undefined' || typeof topojson === 'undefined') return false;
    const topo = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(r => r.json());
    const land = topojson.feature(topo, topo.objects.countries);
    PROJ = d3.geoNaturalEarth1().fitSize([MAP_W, MAP_H], { type: 'Sphere' });
    const path = d3.geoPath(PROJ);
    svg.innerHTML = '<g class="land">'
      + land.features.map(f => `<path d="${path(f)}"/>`).join('')
      + '</g>';
    return true;
  }

  // ---- Places map ---------------------------------------------------------
  // Equirectangular projection: longitude and latitude map linearly to x and y,
  // verified against known coastlines before this was wired up.
  const places = [
    { n:'Split',      c:'Croatia',      lat:43.51, lon:16.44, been:true },
    { n:'Vienna',     c:'Austria',      lat:48.21, lon:16.37, been:true },
    { n:'Ljubljana',  c:'Slovenia',     lat:46.06, lon:14.51, been:true },
    { n:'Rome',       c:'Italy',        lat:41.90, lon:12.50, been:true },
    { n:'Lisbon',     c:'Portugal',     lat:38.72, lon:-9.14, been:true },
    { n:'Reykjavik',  c:'Iceland',      lat:64.15, lon:-21.94, been:false },
    { n:'El Nido',    c:'Philippines',  lat:11.20, lon:119.42, been:false },
    { n:'Tokyo',      c:'Japan',        lat:35.68, lon:139.69, been:false },
    { n:'Merzouga',   c:'Morocco',      lat:31.10, lon:-4.01, been:false },
    { n:'Zion',       c:'United States',lat:37.30, lon:-113.03, been:false },
    { n:'Queenstown', c:'New Zealand',  lat:-45.03, lon:168.66, been:false },
    { n:'Cape Town',  c:'South Africa', lat:-33.92, lon:18.42, been:false },
  ];

  const mapEl = document.getElementById('map');
  const listEl = document.getElementById('placelist');

  if (mapEl && listEl) {
    let filter = 'all';

    // viewBox units -> percentages of .map, which is exact because the svg
    // and the viewBox share a 2:1 aspect.
    const xy = p => {
      if (PROJ) {
        const [px, py] = PROJ([p.lon, p.lat]);
        return { x: px / MAP_W * 100, y: py / MAP_H * 100 };
      }
      return { x:(p.lon + 180) / 360 * 100, y:(90 - p.lat) / 180 * 100 };
    };

    function draw() {
      mapEl.querySelectorAll('.pin').forEach(n => n.remove());
      places.forEach((p, i) => {
        const { x, y } = xy(p);
        const s = document.createElement('span');
        s.className = 'pin' + (p.been ? ' been' : '');
        s.style.left = x + '%';
        s.style.top = y + '%';
        s.dataset.i = i;
        s.innerHTML = '<i></i><b>' + p.n + '</b>';
        mapEl.appendChild(s);
      });

      const shown = places
        .map((p, i) => ({ p, i }))
        .filter(({ p }) => filter === 'all' || (filter === 'been') === p.been);

      listEl.innerHTML = shown.map(({ p, i }) =>
        `<li class="${p.been ? 'been' : ''}"><button data-i="${i}"
           aria-label="${p.been ? 'Mark ' + p.n + ' as not visited' : 'Mark ' + p.n + ' as visited'}">
           <span class="dot"></span>
           <span class="nm">${p.n}<span class="cty">${p.c}</span></span>
           <span class="tick">${p.been ? '✓' : '+'}</span></button></li>`).join('');

      const been = places.filter(p => p.been).length;
      document.getElementById('placecount').textContent =
        been + ' been · ' + (places.length - been) + ' to go';
    }

    function highlight(i, on) {
      const pin = mapEl.querySelector('.pin[data-i="' + i + '"]');
      if (pin) pin.classList.toggle('on', on);
    }

    listEl.addEventListener('click', e => {
      const b = e.target.closest('button[data-i]');
      if (!b) return;
      places[+b.dataset.i].been = !places[+b.dataset.i].been;
      draw();
    });
    listEl.addEventListener('pointerover', e => {
      const b = e.target.closest('button[data-i]'); if (b) highlight(+b.dataset.i, true);
    });
    listEl.addEventListener('pointerout', e => {
      const b = e.target.closest('button[data-i]'); if (b) highlight(+b.dataset.i, false);
    });
    listEl.addEventListener('focusin', e => {
      const b = e.target.closest('button[data-i]'); if (b) highlight(+b.dataset.i, true);
    });
    listEl.addEventListener('focusout', e => {
      const b = e.target.closest('button[data-i]'); if (b) highlight(+b.dataset.i, false);
    });

    document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
      filter = c.dataset.f;
      document.querySelectorAll('.chip').forEach(o =>
        o.setAttribute('aria-pressed', String(o === c)));
      draw();
    }));

    document.getElementById('addplace').addEventListener('submit', e => {
      e.preventDefault();
      const inp = e.target.querySelector('input');
      const v = inp.value.trim();
      if (!v) return;
      // Real build geocodes this; the mockup drops it mid-Atlantic so the
      // round trip from typing to pin is still visible.
      places.push({ n:v, c:'Needs a location', lat:20, lon:-30, been:false });
      inp.value = '';
      draw();
    });

    drawCoastlines()
      .then(() => draw())
      .catch(err => { console.warn('map failed to draw', err); draw(); });
  }

  // ---- Ribbon: the whole history compressed to one horizontal glance ------
  // Position is strictly proportional here — no clamping — because the point
  // is to see the real shape of it: the clusters and the quiet years.
  const MET = new Date('2024-01-06');
  const TODAY = new Date('2026-08-13');

  const events = [
    { d:'2024-01-06', ms:true, t:'We met' },
    { d:'2024-02-02', t:'Rained the whole time' },
    { d:'2024-03-19', ms:true, t:'First kiss' },
    { d:'2024-06-11', t:'Both suitcases, one hand' },
    { d:'2024-09-01', ms:true, t:'Moved in' },
    { d:'2025-01-28', t:'Third coffee' },
    { d:'2025-02-12', t:'The long way back' },
    { d:'2025-07-14', ms:true, t:'The wrong ferry' },
    { d:'2026-05-30', ms:true, t:'Married' },
  ];

  const track = document.getElementById('track');
  if (track) {
    const span = TODAY - MET;
    const pct = iso => ((new Date(iso) - MET) / span) * 100;
    const fmt = iso => new Date(iso).toLocaleDateString('en-GB',
      { day:'numeric', month:'short', year:'numeric' });

    let html = '';

    // year gridlines
    for (let y = MET.getFullYear() + 1; y <= TODAY.getFullYear(); y++) {
      const x = pct(y + '-01-01');
      if (x > 1 && x < 99) html += `<span class="gl" style="left:${x}%"><b>${y}</b></span>`;
    }

    // markers; milestone labels alternate above and below so they never collide
    let msIndex = 0;
    events.forEach((e, i) => {
      const x = pct(e.d);
      const side = e.ms ? (msIndex++ % 2 === 0 ? 'up' : 'down') : '';
      const edge = i === 0 ? ' first' : (i === events.length - 1 ? ' last' : '');
      html += `<span class="mk${e.ms ? ' mk--ms ' + side : ''}${edge}" style="left:${x}%"`
            + ` title="${e.t} · ${fmt(e.d)}"><i></i>`
            + (e.ms ? `<span class="mk__l"><b>${e.t}</b><span>${fmt(e.d)}</span></span>` : '')
            + `</span>`;
    });

    html += `<span class="cap2 cap2--a">${fmt(MET)}</span>`;
    html += `<span class="cap2 cap2--b">Today</span>`;
    track.innerHTML = html;

    const days = Math.round(span / 86400000);
    document.getElementById('ribbonspan').textContent =
      days + ' days · ' + events.filter(e => e.ms).length + ' that mattered';
  }

