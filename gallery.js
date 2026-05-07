/* ═══════════════════════════════════════════════
   LAEZZA · GALLERY LIGHTBOX
   Uso: openGallery('dimora', 0)
   Struttura cartelle: foto/{prop}/{prop}-N.jpg
═══════════════════════════════════════════════ */

const GALLERY_DATA = {
  residenza: {
    label: 'Residenza Laezza',
    photos: [
      { src: './residenza-1.jpg', caption: 'Reception & Hall' },
      { src: './residenza-2.jpg', caption: 'Bar & Sala colazione' },
      { src: './residenza-3.jpg', caption: 'Camera Superior' },
      { src: './residenza-4.jpg', caption: 'Camera Deluxe — testa verde' },
      { src: './residenza-5.jpg', caption: 'Bagno con piastrelle floreali e specchio LED' },
      { src: './residenza-6.jpg', caption: 'Bagno — specchio LED e asciugacapelli a muro' },
    ]
  },
  flat: {
    label: 'Studio Duomo Flat',
    photos: [
      { src: './flat-1.jpg', caption: 'Soggiorno con scala — piano inferiore' },
      { src: './flat-2.jpg', caption: 'Scala in legno originale — 2 piani' },
      { src: './flat-3.jpg', caption: 'Angolo cottura' },
      { src: './flat-4.jpg', caption: 'Bagno in marmo nero con doccia rain' },
      { src: './flat-5.jpg', caption: 'Camera matrimoniale con quadro del Vesuvio' },
      { src: './flat-6.jpg', caption: 'Camera doppia — piano superiore' },
    ]
  },
  maison: {
    label: 'Maison Laezza',
    photos: [
      { src: './maison-3.jpg', caption: 'Camera matrimoniale', banner: '🏠 Appartamento A' },
      { src: './maison-2.jpg', caption: 'Cucina attrezzata',   banner: '🏠 Appartamento A' },
      { src: './maison-1.jpg', caption: 'Bagno con doccia tropical', banner: '🏠 Appartamento A' },
      { src: './maison-6.jpg', caption: 'Camera matrimoniale', banner: '🏠 Appartamento B' },
      { src: './maison-5.jpg', caption: 'Cucina con piastrelle vintage', banner: '🏠 Appartamento B' },
      { src: './maison-4.jpg', caption: 'Bagno in marmo con doccia', banner: '🏠 Appartamento B' },
    ]
  },
  dimora: {
    label: 'Dimora Laezza',
    photos: [
      { src: './dimora-1.jpg', caption: 'Camera matrimoniale' },
      { src: './dimora-2.jpg', caption: 'Camera doppia' },
      { src: './dimora-3.jpg', caption: 'Bagno con doccia' },
      { src: './dimora-4.jpg', caption: 'Ingresso' },
      { src: './dimora-5.jpg', caption: 'Cucina' },
    ]
  },
};

/* ── State ── */
let _prop = null, _idx = 0, _photos = [];

/* ── Build lightbox DOM (once) ── */
function buildLightbox() {
  if (document.getElementById('lb')) return;

  const lb = document.createElement('div');
  lb.id = 'lb';
  lb.innerHTML = `
    <div id="lb-overlay"></div>
    <div id="lb-box">
      <button id="lb-close" aria-label="Chiudi">✕</button>
      <button id="lb-prev" aria-label="Precedente">&#8592;</button>
      <button id="lb-next" aria-label="Successivo">&#8594;</button>
      <div id="lb-img-wrap">
        <img id="lb-img" src="" alt="">
        <div id="lb-loader">⏳</div>
      </div>
      <div id="lb-banner"></div>
      <div id="lb-footer">
        <span id="lb-caption"></span>
        <span id="lb-counter"></span>
      </div>
      <div id="lb-thumbs"></div>
    </div>
  `;
  document.body.appendChild(lb);

  /* CSS injected inline so gallery.js is self-contained */
  const style = document.createElement('style');
  style.textContent = `
    #lb {
      position: fixed; inset: 0; z-index: 9000;
      display: none; align-items: center; justify-content: center;
    }
    #lb.open { display: flex; }
    #lb-overlay {
      position: absolute; inset: 0;
      background: rgba(30,18,8,.92);
      backdrop-filter: blur(6px);
      cursor: pointer;
    }
    #lb-box {
      position: relative; z-index: 2;
      display: flex; flex-direction: column; align-items: center;
      max-width: 94vw; max-height: 96vh;
      padding: 0;
    }
    #lb-img-wrap {
      position: relative;
      display: flex; align-items: center; justify-content: center;
      max-width: 90vw; max-height: 72vh;
    }
    #lb-img {
      max-width: 90vw; max-height: 72vh;
      object-fit: contain;
      display: block;
      border: 1px solid rgba(255,255,255,.08);
      transition: opacity .25s;
    }
    #lb-img.loading { opacity: 0; }
    #lb-loader {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%,-50%);
      font-size: 1.5rem; display: none;
    }
    #lb-img.loading ~ #lb-loader { display: block; }

    #lb-close {
      position: fixed; top: 1.2rem; right: 1.4rem;
      background: rgba(250,250,248,.12); border: 1px solid rgba(255,255,255,.15);
      color: #fff; font-size: 1.1rem; width: 40px; height: 40px;
      border-radius: 50%; cursor: pointer; z-index: 10;
      transition: background .2s;
    }
    #lb-close:hover { background: rgba(250,250,248,.25); }

    #lb-prev, #lb-next {
      position: fixed; top: 50%; transform: translateY(-50%);
      background: rgba(250,250,248,.1); border: 1px solid rgba(255,255,255,.15);
      color: #fff; font-size: 1.4rem; width: 48px; height: 48px;
      border-radius: 50%; cursor: pointer; z-index: 10;
      transition: background .2s;
    }
    #lb-prev:hover, #lb-next:hover { background: rgba(250,250,248,.25); }
    #lb-prev { left: 1rem; }
    #lb-next { right: 1rem; }

    #lb-footer {
      display: flex; justify-content: space-between; align-items: center;
      width: 100%; padding: .8rem .5rem .3rem;
    }
    #lb-caption {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem; font-style: italic;
      color: rgba(255,255,255,.65);
    }
    #lb-counter {
      font-size: .7rem; letter-spacing: .15em;
      text-transform: uppercase; color: rgba(255,255,255,.35);
    }
    #lb-banner {
      display: none;
      width: 100%;
      text-align: center;
      padding: .35rem 1rem;
      margin-bottom: .3rem;
      font-size: .7rem; letter-spacing: .18em; text-transform: uppercase;
      background: rgba(201,169,110,.18);
      border: 1px solid rgba(201,169,110,.35);
      color: rgba(201,169,110,.9);
    }
    #lb-banner.visible { display: block; }

    #lb-thumbs {
      display: flex; gap: .5rem; flex-wrap: wrap;
      justify-content: center; padding: .5rem 0 0;
      max-width: 90vw;
    }
    .lb-thumb {
      width: 56px; height: 42px; object-fit: cover;
      opacity: .45; cursor: pointer; border: 1px solid transparent;
      transition: opacity .2s, border-color .2s;
      flex-shrink: 0;
    }
    .lb-thumb.active { opacity: 1; border-color: rgba(201,169,110,.8); }
    .lb-thumb:hover { opacity: .8; }

    @media (max-width: 600px) {
      #lb-prev { left: .3rem; }
      #lb-next { right: .3rem; }
      #lb-thumbs { display: none; }
      #lb-img { max-height: 60vh; }
    }
  `;
  document.head.appendChild(style);

  /* Events */
  document.getElementById('lb-overlay').onclick = closeGallery;
  document.getElementById('lb-close').onclick   = closeGallery;
  document.getElementById('lb-prev').onclick    = () => navigate(-1);
  document.getElementById('lb-next').onclick    = () => navigate(1);

  /* Keyboard */
  document.addEventListener('keydown', e => {
    if (!document.getElementById('lb').classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
    if (e.key === 'Escape')     closeGallery();
  });

  /* Touch swipe */
  let tx = 0;
  const imgWrap = document.getElementById('lb-img-wrap');
  imgWrap.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  imgWrap.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) navigate(dx < 0 ? 1 : -1);
  });
}

/* ── Open ── */
function openGallery(prop, startIdx = 0) {
  const data = GALLERY_DATA[prop];
  if (!data || !data.photos.length) {
    alert('Foto in arrivo!');
    return;
  }
  buildLightbox();
  _prop = prop;
  _photos = data.photos;
  _idx = startIdx;
  document.getElementById('lb').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderLightbox();
  buildThumbs();
}

function closeGallery() {
  document.getElementById('lb').classList.remove('open');
  document.body.style.overflow = '';
}

function navigate(dir) {
  _idx = (_idx + dir + _photos.length) % _photos.length;
  renderLightbox();
}

function renderLightbox() {
  const photo = _photos[_idx];
  const img = document.getElementById('lb-img');

  img.classList.add('loading');
  img.onload = () => img.classList.remove('loading');
  img.src = photo.src;
  img.alt = photo.caption || '';

  document.getElementById('lb-caption').textContent = photo.caption || '';
  document.getElementById('lb-counter').textContent = `${_idx + 1} / ${_photos.length}`;

  // Banner (App. A / App. B)
  const bannerEl = document.getElementById('lb-banner');
  if (photo.banner) {
    bannerEl.textContent = photo.banner;
    bannerEl.classList.add('visible');
  } else {
    bannerEl.textContent = '';
    bannerEl.classList.remove('visible');
  }

  /* Update thumbs */
  document.querySelectorAll('.lb-thumb').forEach((t, i) => {
    t.classList.toggle('active', i === _idx);
  });

  /* Show/hide arrows */
  document.getElementById('lb-prev').style.display = _photos.length > 1 ? '' : 'none';
  document.getElementById('lb-next').style.display = _photos.length > 1 ? '' : 'none';
}

function buildThumbs() {
  const container = document.getElementById('lb-thumbs');
  container.innerHTML = '';
  _photos.forEach((p, i) => {
    const img = document.createElement('img');
    img.src = p.src;
    img.alt = p.caption || '';
    img.className = 'lb-thumb' + (i === _idx ? ' active' : '');
    img.onclick = () => { _idx = i; renderLightbox(); };
    container.appendChild(img);
  });
}
