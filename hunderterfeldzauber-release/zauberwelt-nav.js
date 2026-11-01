/* Zauberwelt: zentrale, reine Navigation. Zum Ergänzen nur APPS erweitern. */
(function () {
  'use strict';
  const APPS = [
    { id: 'silbenzauber', label: 'Silbenzauber', href: 'https://silbenzauber.lessqq.de/' },
    { id: 'zahlenzauber', label: 'Zahlenzauber', href: 'https://silbenzauber.pages.dev/zahlenzauber/' },
    { id: 'hunderterfeldzauber', label: 'Hunderterfeldzauber', href: 'https://hunderterfeldzauber.pages.dev/' }
  ];
  const host = window.location.hostname;
  const target = document.querySelector('[data-zauberwelt-nav]')
    || document.querySelector('.header-actions')
    || document.querySelector('.nav-right')
    || document.querySelector('.top-nav');
  if (!target || document.getElementById('zauberweltMenu')) return;
  const here = target.dataset.app || (host.includes('hunderterfeldzauber') ? 'hunderterfeldzauber'
    : window.location.pathname.includes('/zahlenzauber') ? 'zahlenzauber' : 'silbenzauber');
  const style = document.createElement('style');
  style.textContent = `
    #zauberweltMenu{position:relative;z-index:120;flex:0 0 auto;font:inherit;line-height:1.2;max-width:100%}
    #zauberweltMenu summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:6px;padding:10px 12px;border:2px solid #b4e6dd;border-radius:13px;background:#08677a;color:#fffef0;white-space:nowrap;font:inherit;font-size:clamp(.82rem,1vw,1rem);box-shadow:0 3px 8px #073c4440}
    #zauberweltMenu summary::-webkit-details-marker{display:none}
    #zauberweltMenu summary:hover,#zauberweltMenu[open] summary{background:#0b8294}
    #zauberweltMenu summary:focus-visible,#zauberweltMenu a:focus-visible{outline:3px solid #f3b636;outline-offset:3px}
    #zauberweltMenu .zw-arrow{font-size:.7em}
    #zauberweltMenu[open] .zw-arrow{transform:rotate(180deg)}
    #zauberweltMenu .zw-list{position:absolute;right:0;top:calc(100% + 7px);width:max-content;min-width:210px;max-width:min(290px,95vw);border-radius:14px;background:#fff9e9;border:2px solid #b7d7cd;box-shadow:0 12px 30px #1c414c55;padding:10px;display:flex;flex-direction:column;gap:2px;z-index:121}
    #zauberweltMenu .zw-heading{font-size:.87rem;color:#47666a;padding:6px 8px}
    #zauberweltMenu a{display:block;color:#114c54;padding:10px 9px;text-decoration:none;font:inherit;font-size:.99rem;border-radius:9px;white-space:normal}
    #zauberweltMenu a:hover{background:#d7efdf;text-decoration:underline}
    .zw-footer{font:inherit;font-size:clamp(.78rem,1.1vw,.94rem);text-align:center;padding:12px 12px 18px;line-height:1.6;color:#416469;background:#fff9e9aa}
    .companion-link[hidden]{display:none!important}\n    .zw-footer-links a{margin:0 7px;text-decoration:underline;text-underline-offset:3px}\n    .zw-footer a{color:#076579;text-decoration:underline;text-underline-offset:3px;margin:0 6px}
    .zw-footer a:focus-visible{outline:2px solid #076579;outline-offset:3px}
    @media(max-width:400px){#zauberweltMenu summary{padding:8px 6px;font-size:.75rem;gap:3px}#zauberweltMenu .zw-list{right:-3px;min-width:190px}}
  `;
  document.head.appendChild(style);
  const menu = document.createElement('details');
  menu.id = 'zauberweltMenu';
  const summary = document.createElement('summary');
  summary.textContent = '✦ Zauberwelt ';
  const arrow = document.createElement('span');
  arrow.className = 'zw-arrow';
  arrow.textContent = '▾';
  summary.appendChild(arrow);
  menu.appendChild(summary);
  const list = document.createElement('div');
  list.className = 'zw-list';
  const heading = document.createElement('span');
  heading.className = 'zw-heading';
  heading.textContent = 'Weitere Apps der Zauberwelt';
  list.appendChild(heading);
  APPS.filter(app => app.id !== here).forEach(app => {
    const link = document.createElement('a');
    link.href = app.href;
    link.textContent = app.label;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    list.appendChild(link);
  });
  menu.appendChild(list);
  target.appendChild(menu);
  // Vorhandene Einzelverweise bleiben als Fallback erhalten, werden bei erfolgreichem Laden ausgeblendet.
  const duplicate = here === 'silbenzauber' ? document.querySelector('.companion-link') : null;
  if (duplicate) duplicate.hidden = true;
  document.addEventListener('click', e => { if (!menu.contains(e.target)) menu.open = false; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') menu.open = false; });
  const footer = document.querySelector('[data-zauberwelt-footer]') || document.createElement('footer');
  if (!footer.hasAttribute('data-zauberwelt-footer')) {
    footer.className = 'zw-footer';
    (document.querySelector('.page-shell') || document.querySelector('.scene') || document.querySelector('.app-shell') || document.body).appendChild(footer);
  }
  const title = document.createElement('span');
  title.textContent = 'Eine App der Zauberwelt · ';
  footer.appendChild(title);
  APPS.filter(app => app.id !== here).forEach(app => {
    const a = document.createElement('a'); a.href = app.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = app.label; footer.appendChild(a);
  });
})();

