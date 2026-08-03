/*
 * ESAU — Premium Agency 2026 Interactions
 * Supports new Plus Jakarta + Inter redesign + legacy
 */
document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  // Loader
  const loader = $('.page-loader');
  const hideLoader = () => {
    if (!loader) document.body.classList.add('is-loaded');
    else {
      loader.classList.add('hide');
      loader.classList.add('is-hidden');
      setTimeout(()=>loader.remove(), 500);
      document.body.classList.add('is-loaded');
    }
  };
  if (document.readyState === 'complete') setTimeout(hideLoader, 320);
  else window.addEventListener('load', () => setTimeout(hideLoader, 320));
  setTimeout(hideLoader, 1800);

  // Mobile toggles — support both old (.menu-toggle/.sf-menu) and new (#menuToggle/#navMenu)
  const toggles = [
    { btn: $('.menu-toggle'), menu: $('.sf-menu') },
    { btn: $('#menuToggle'), menu: $('#navMenu') }
  ];
  toggles.forEach(({btn, menu}) => {
    if (!btn || !menu) return;
    btn.addEventListener('click', e => {
      e.preventDefault();
      menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', menu.classList.contains('open'));
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      if (window.innerWidth <= 1040) menu.classList.remove('open');
    }));
  });

  // Active nav
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  $$('.nav-menu a, .sf-menu a').forEach(a => {
    const href = (a.getAttribute('href')||'').toLowerCase();
    if (href === current || (current === '' && href === 'index.html')) a.classList.add('active');
  });

  // Sticky header
  ['.site-header', '.main-menu-wrapper'].forEach(sel => {
    const hdr = $(sel);
    if (!hdr) return;
    const onScroll = () => {
      if (window.scrollY > 12) hdr.classList.add('scrolled');
      else hdr.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  });

  // Reveal — supports .reveal (new) + .reveal.is-visible legacy
  if ('IntersectionObserver' in window) {
    // auto assign
    $$('.kicker, .hero-copy > *, .program-card, .news-card, .content-card, .sidebar-card, .g-item, .feat-img, .feat-body, .cta, .ied-banner, .stats, .featured-story').forEach((el,i)=>{
      if (!el.classList.contains('reveal') && !el.closest('.stagger')) {
        el.classList.add('reveal');
        el.style.setProperty('--d', `${(i%4)*70}ms`);
      }
    });
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{
        if (en.isIntersecting){
          en.target.classList.add('in');
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, {rootMargin:'0px 0px -10% 0px', threshold:0.12});
    $$('.reveal, .stagger, .stats').forEach(el=>io.observe(el));
    // stagger containers
    $$('.grid, .news-grid, .gallery-grid, .partners-track, .stats-inner').forEach(row=>{
      if (row.children.length>=2) row.classList.add('stagger');
      io.observe(row);
    });
  }else{
    $$('.reveal, .stagger').forEach(el=>{el.classList.add('in');el.classList.add('is-visible')});
  }

  // Counters
  const counters = $$('.stat-num[data-target], .counter[data-target]');
  if (counters.length){
    const animate = el => {
      const target = parseInt(el.dataset.target,10);
      if (isNaN(target)) return;
      let cur = 0;
      const step = Math.max(1, Math.floor(target/80));
      const tick = () => {
        cur += step;
        if (cur >= target){ el.textContent = target.toLocaleString(); }
        else { el.textContent = cur.toLocaleString(); requestAnimationFrame(tick); }
      };
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window && !prefersReduced){
      const co = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{
          if (e.isIntersecting){ animate(e.target); co.unobserve(e.target); }
        });
      }, {threshold:0.5});
      counters.forEach(c=>co.observe(c));
    }else{
      counters.forEach(c=>c.textContent = c.dataset.target);
    }
  }

  // Hero slider (legacy) + new hero parallax
  (function(){
    const banner = $('.tp-banner');
    if (!banner) return;
    const slides = banner.querySelectorAll('li.slide');
    if (!slides.length) return;
    let idx=0, timer=null;
    const dotsWrap = banner.querySelector('.slider-dots');
    if (dotsWrap){ dotsWrap.innerHTML=''; slides.forEach((_,i)=>{ const d=document.createElement('span'); if(i===0)d.classList.add('active'); d.addEventListener('click',()=>go(i)); dotsWrap.appendChild(d); });}
    const update = ()=>{ slides.forEach((s,i)=>s.classList.toggle('active', i===idx)); if(dotsWrap) dotsWrap.querySelectorAll('span').forEach((d,i)=>d.classList.toggle('active', i===idx)); };
    const go = n => { idx=(n+slides.length)%slides.length; update(); restart(); };
    const next = ()=>go(idx+1), prev=()=>go(idx-1);
    const pBtn = banner.querySelector('.prev'), nBtn=banner.querySelector('.next');
    if(pBtn) pBtn.addEventListener('click', prev); if(nBtn) nBtn.addEventListener('click', next);
    const restart = ()=>{ if(timer) clearInterval(timer); if(!prefersReduced) timer=setInterval(next, 5600); };
    update(); restart();
    banner.addEventListener('mouseenter',()=>clearInterval(timer)); banner.addEventListener('mouseleave', restart);
  })();

  // Flexslider legacy
  $$('.flexslider').forEach(slider=>{
    const track = slider.querySelector('.slides');
    const items = track? track.querySelectorAll('li'): [];
    if (!track || items.length<=1){ const nav=slider.querySelector('.flex-nav'), dots=slider.querySelector('.flex-dots'); if(nav)nav.style.display='none'; if(dots)dots.style.display='none'; return; }
    let index=0; const dotsWrap=slider.querySelector('.flex-dots');
    if(dotsWrap){ dotsWrap.innerHTML=''; items.forEach((_,i)=>{ const s=document.createElement('span'); if(i===0)s.classList.add('active'); s.addEventListener('click',()=>go(i)); dotsWrap.appendChild(s); });}
    const upd=()=>{ track.style.transform=`translateX(-${index*100}%)`; if(dotsWrap) dotsWrap.querySelectorAll('span').forEach((d,i)=>d.classList.toggle('active', i===index)); };
    const go=i=>{ index=(i+items.length)%items.length; upd(); restart(); };
    const nextBtn=slider.querySelector('.flex-next'), prevBtn=slider.querySelector('.flex-prev');
    if(nextBtn) nextBtn.addEventListener('click',()=>go(index+1)); if(prevBtn) prevBtn.addEventListener('click',()=>go(index-1));
    let timer=null; const restart=()=>{ if(timer) clearInterval(timer); if(!prefersReduced) timer=setInterval(()=>go(index+1), 4200); };
    track.style.display='flex'; track.style.width='100%'; items.forEach(it=>it.style.flex='0 0 100%'); upd(); restart();
  });

  // Back to top
  const btt = $('#back-to-top');
  if (btt){
    window.addEventListener('scroll',()=>{ if(window.scrollY>420) btt.classList.add('show'); else btt.classList.remove('show'); }, {passive:true});
    btt.addEventListener('click',()=>window.scrollTo({top:0, behavior: prefersReduced? 'auto':'smooth'}));
  }

  // Year
  $$('.js-year').forEach(el=>el.textContent=new Date().getFullYear());

  // Button ripple
  $$('.btn').forEach(btn=>{
    btn.style.overflow='hidden'; btn.style.position='relative';
    btn.addEventListener('click', function(e){
      if (prefersReduced) return;
      const rect=this.getBoundingClientRect();
      const rip=document.createElement('span');
      rip.style.position='absolute'; rip.style.borderRadius='50%'; rip.style.transform='scale(0)';
      rip.style.pointerEvents='none'; rip.style.background='rgba(255,255,255,.38)';
      rip.style.width=rip.style.height=`${Math.max(rect.width, rect.height)*1.2}px`;
      rip.style.left=`${e.clientX-rect.left-parseFloat(rip.style.width)/2}px`;
      rip.style.top=`${e.clientY-rect.top-parseFloat(rip.style.height)/2}px`;
      rip.style.transition='transform .6s cubic-bezier(.16,1,.3,1), opacity .6s';
      this.appendChild(rip);
      requestAnimationFrame(()=>{ rip.style.transform='scale(1)'; rip.style.opacity='0'; });
      setTimeout(()=>rip.remove(), 640);
    });
  });

  // Smooth anchor
  $$('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const id=a.getAttribute('href');
      if (id.length<=1) return;
      const t=document.querySelector(id);
      if (t){ e.preventDefault(); t.scrollIntoView({behavior: prefersReduced? 'auto':'smooth'}); }
    });
  });

  // Subtle hero parallax (desktop)
  if (!prefersReduced && window.innerWidth>1040){
    const hero = $('.hero-card-main img');
    const visual = $('.hero-visual');
    if (visual && hero){
      visual.addEventListener('mousemove', e=>{
        const r=visual.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
        hero.style.transform=`scale(1.04) translate(${x*-10}px, ${y*-8}px)`;
      });
      visual.addEventListener('mouseleave',()=>{ hero.style.transform='scale(1)'; });
    }
  }
});
