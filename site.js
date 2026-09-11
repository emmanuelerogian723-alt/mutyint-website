/* MUTYINT — shared site behavior */
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* smooth scroll (Lenis) */
let lenis=null;
if(!RM && window.Lenis){
  lenis=new Lenis({lerp:.09,wheelMultiplier:1,smoothWheel:true});
  (function raf(t){lenis.raf(t);requestAnimationFrame(raf);})(0);
  lenis.on('scroll',()=>scrollFX());
}
function goTo(sel){const el=document.querySelector(sel);if(!el)return;
  if(sel==='#top'){if(lenis)lenis.scrollTo(0,{duration:1.2});else scrollTo({top:0,behavior:RM?'auto':'smooth'});return;}
  if(lenis)lenis.scrollTo(el,{offset:-70,duration:1.4});
  else el.scrollIntoView({behavior:RM?'auto':'smooth'});}
document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>goTo(b.dataset.goto)));
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();goTo(a.getAttribute('href'));}));

/* page intro */
function onReady(){
  const hero=document.querySelector('.page-hero')||document.querySelector('.hero');
  if(hero)setTimeout(()=>hero.classList.add('play'),RM?0:120);
}

/* nav + scroll fx */
const nav=document.getElementById('nav');let lastY=0;
function scrollFX(){
  const y=scrollY;
  nav.classList.toggle('scrolled',y>40);
  if(y>lastY&&y>420&&!document.getElementById('navLinks').classList.contains('open'))nav.classList.add('hide');
  else nav.classList.remove('hide');
  lastY=y;
  const h=document.documentElement.scrollHeight-innerHeight;
  document.getElementById('prog').style.width=(h>0?y/h*100:0)+'%';
  const a1=document.querySelector('.a1'),a2=document.querySelector('.a2');
  if(a1)a1.style.transform=`translateY(${y*.08}px)`;
  if(a2)a2.style.transform=`translateY(${y*-.05}px)`;
  const hv=document.getElementById('heroVisual');
  if(hv&&y<innerHeight*1.2){hv.style.transform=`translateY(${y*.14}px) scale(${1+y*.00006})`;}
  lightWords();
}
addEventListener('scroll',()=>{if(!lenis)scrollFX();},{passive:true});
scrollFX();

/* mobile menu */
const burger=document.getElementById('burger'),links=document.getElementById('navLinks');
burger.addEventListener('click',()=>{burger.classList.toggle('open');links.classList.toggle('open');});
links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{burger.classList.remove('open');links.classList.remove('open');}));

/* reveals */
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){
    e.target.classList.add('in');
    const p=e.target.closest('h2');if(p)p.classList.add('in');
    io.unobserve(e.target);
  }
}),{threshold:.15,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));
document.querySelectorAll('h2.m2').forEach(el=>io.observe(el));
const mio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');mio.unobserve(e.target);}}),{threshold:.25});
document.querySelectorAll('.mark').forEach(el=>mio.observe(el));

/* scroll-lit words */
const manis=[...document.querySelectorAll('.mani-p')];
manis.forEach(p=>{
  const walk=node=>{
    [...node.childNodes].forEach(ch=>{
      if(ch.nodeType===3){
        const frag=document.createDocumentFragment();
        ch.textContent.split(/\s+/).filter(Boolean).forEach(word=>{
          const s=document.createElement('span');s.className='w';s.textContent=word;frag.appendChild(s);frag.appendChild(document.createTextNode(' '));
        });
        node.replaceChild(frag,ch);
      }else if(ch.nodeType===1&&ch.tagName!=='BR')walk(ch);
    });
  };
  walk(p);
});
function lightWords(){
  if(RM){document.querySelectorAll('.mani .w').forEach(w=>w.classList.add('lit'));return;}
  manis.forEach(p=>{
    const r=p.getBoundingClientRect();
    const prog=Math.min(1,Math.max(0,(innerHeight*.85-r.top)/(r.height+innerHeight*.35)));
    const ws=p.querySelectorAll('.w'),n=Math.floor(ws.length*prog);
    ws.forEach((w,i)=>w.classList.toggle('lit',i<n));
  });
}

/* counters */
const cio=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;const el=e.target,target=+el.dataset.count,suf=el.dataset.suffix||'';let t0=null;
  const step=ts=>{if(!t0)t0=ts;const p=Math.min((ts-t0)/1500,1);
    el.firstChild.textContent=Math.round(target*(1-Math.pow(1-p,3)))+suf;
    if(p<1)requestAnimationFrame(step);};
  requestAnimationFrame(step);cio.unobserve(el);
}),{threshold:.6});
document.querySelectorAll('[data-count]').forEach(el=>{const hold=document.createElement('span');el.insertBefore(hold,el.firstChild);cio.observe(el);});

/* 3D tilt + spotlight */
if(matchMedia('(hover:hover)').matches&&!RM){
  document.querySelectorAll('[data-tilt]').forEach(c=>{
    let raf;
    c.addEventListener('pointermove',e=>{
      const r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
      c.style.setProperty('--mx',(px+.5)*r.width+'px');c.style.setProperty('--my',(py+.5)*r.height+'px');
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{c.style.transform=`perspective(1100px) rotateY(${px*5}deg) rotateX(${-py*5}deg) translateY(-2px)`;});
    });
    c.addEventListener('pointerleave',()=>{cancelAnimationFrame(raf);c.style.transition='transform .7s var(--ease)';c.style.transform='';setTimeout(()=>c.style.transition='',700);});
  });
  document.querySelectorAll('.chap').forEach(c=>{
    c.addEventListener('pointermove',e=>{
      const r=c.getBoundingClientRect();
      c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');
    });
  });
}

/* magnetic buttons */
if(matchMedia('(hover:hover)').matches&&!RM){
  document.querySelectorAll('.btn').forEach(b=>{
    b.addEventListener('pointermove',e=>{
      const r=b.getBoundingClientRect(),dx=(e.clientX-r.left-r.width/2)*.22,dy=(e.clientY-r.top-r.height/2)*.3;
      b.style.transform=`translate(${dx}px,${dy}px)`;
    });
    b.addEventListener('pointerleave',()=>{b.style.transform='';});
  });
}

/* custom cursor */
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
  const cur=document.getElementById('cur'),dot=document.getElementById('curDot');
  let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my;
  addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;dot.style.transform=`translate(${mx}px,${my}px)`;});
  (function loop(){cx+=(mx-cx)*.14;cy+=(my-cy)*.14;cur.style.transform=`translate(${cx}px,${cy}px)`;requestAnimationFrame(loop);})();
  document.querySelectorAll('a,button,.vcard,.chap,.deptrow,.mdrow,.lrow').forEach(el=>{
    el.addEventListener('pointerenter',()=>cur.classList.add('big'));
    el.addEventListener('pointerleave',()=>cur.classList.remove('big'));
  });
}

/* preloader (any page with #loader) */
(function(){
  const ld=document.getElementById('loader');
  if(!ld){onReady();return;}
  const bar=document.getElementById('ldBar'),pct=document.getElementById('ldPct');
  let p=0;
  const t=setInterval(()=>{
    p=Math.min(100,p+Math.random()*17+4);
    bar.style.width=p+'%';pct.textContent=Math.floor(p)+'%';
    if(p>=100){clearInterval(t);setTimeout(()=>{ld.classList.add('lift');onReady();},350);}
  },110);
})();
