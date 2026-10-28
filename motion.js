(() => {
'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=value=>Math.max(0,Math.min(1,value));
const chapters=[...document.querySelectorAll('.chapter')];
for(const [index,chapter] of chapters.entries()){
 if(chapter.classList.contains('cinematic'))continue;
 const flowers=document.createElement('div');flowers.className='floral-surround composition-'+(index%3);flowers.setAttribute('aria-hidden','true');
 flowers.innerHTML='<span class="floral-corner floral-left"></span><span class="floral-corner floral-right"></span><span class="floral-bouquet bouquet-upper"></span><span class="floral-bouquet bouquet-lower"></span>';
 chapter.prepend(flowers);
}
// One restrained reveal per editorial group; no repeated cover or ornamental overlays.
const selectors=[
 '.chapter-heading','.story-images','.story-copy > .script-line','.story-copy > h3',
 '.story-copy > p:not(.script-line)','.story-milestones',
 '.celebration .sheet > .eyebrow,.celebration .sheet > h2,.celebration .sheet > .intro',
 '.timeline > div','.celebration .outlined',
 '.place-sheet > .eyebrow,.place-sheet > h2','.venue-art','.place-details',
 '.photo-gallery > button',
 '.attire-sheet > .eyebrow,.attire-sheet > h2,.attire-sheet > .script-line',
 '.attire-illustration','.palette','.attire-sheet > .intro,.attire-practical',
 '.notes-chapter .accordions > details',
 '.rsvp-sheet > .eyebrow,.rsvp-sheet > h2,.rsvp-sheet > .intro',
 '.closing-monogram,.closing-sheet > h2,.closing-sheet > .intro,.countdown'
];
const elements=[];
for(const selector of selectors){
 document.querySelectorAll(selector).forEach((element,index)=>{
  element.classList.add('editorial-reveal');
  element.style.setProperty('--reveal-delay',`${Math.min(index*.1,.3)}s`);
  elements.push(element);
 });
}
const photoRecords=[];
for(const image of document.querySelectorAll('.story-main,.story-small,.photo-gallery img')){
 const frame=document.createElement('div');frame.className='picture-frame';
 const viewport=document.createElement('div');viewport.className='photo-viewport';
 image.before(frame);frame.append(viewport);viewport.append(image);
 for(const position of ['tl','tr','bl','br']){const ornament=document.createElementNS('http://www.w3.org/2000/svg','svg');ornament.setAttribute('class','frame-engraving engraving-'+position);ornament.setAttribute('viewBox','0 0 50 50');ornament.setAttribute('aria-hidden','true');ornament.innerHTML='<use href="#frame-engraving"></use>';frame.append(ornament);}
 const plate=document.createElement('span');plate.className='frame-monogram';plate.setAttribute('aria-hidden','true');plate.innerHTML='<svg viewBox="0 0 200 240"><use href="#suite-crest"></use></svg>';frame.append(plate);
 if(image.classList.contains('story-main')){frame.classList.add('story-main-frame');viewport.classList.add('story-viewport');}
 else if(image.classList.contains('story-small'))frame.classList.add('story-small-frame');
 else frame.classList.add('gallery-frame');
 photoRecords.push({image,viewport,top:0,height:0});
}
let revealObserver;
function observe(){
 revealObserver?.disconnect();
 if(reduced.matches){elements.forEach(el=>el.classList.add('editorial-visible'));return;}
 revealObserver=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(entry.isIntersecting){entry.target.classList.add('editorial-visible');revealObserver.unobserve(entry.target);}
  }
 },{rootMargin:'0px 0px 4% 0px',threshold:.02});
 elements.forEach(el=>revealObserver.observe(el));
}
// Optical movement is confined to photographs within fixed masks.
// Text stays in document flow, with no blur, rotation or section-sized movement.
let raf=0,measureNeeded=true,vh=0,documentHeight=0;
let sectionRecords=[];
const cinematic=document.querySelector('.cinematic-scene');let cinemaTop=0,cinemaHeight=0;
function measure(){
 vh=innerHeight;const y=scrollY;
 sectionRecords=chapters.map(chapter=>({chapter,top:chapter.getBoundingClientRect().top+y,height:chapter.offsetHeight}));
 for(const photo of photoRecords){const rect=photo.viewport.getBoundingClientRect();photo.top=rect.top+y;photo.height=rect.height;}
 if(cinematic){const rect=cinematic.getBoundingClientRect();cinemaTop=rect.top+y;cinemaHeight=rect.height;}
 documentHeight=document.documentElement.scrollHeight;measureNeeded=false;
}
function render(){
 raf=0;if(measureNeeded)measure();
 if(!document.body.classList.contains('is-open')||reduced.matches)return;
 const y=scrollY;
 for(const record of sectionRecords){
  const top=record.top-y;
  if(top>vh*1.2||top+record.height<0)continue;
  const progress=clamp((vh*1.02-top)/(vh*.52));
  const eased=progress*progress*(3-2*progress);
  // The section is fully opaque before its heading reaches the reading area.
  record.chapter.style.setProperty('--chapter-opacity',(.78+.22*eased).toFixed(4));
  record.chapter.dataset.transitionProgress=eased.toFixed(3);
 }
 const travel=innerWidth<700?5:9;
 for(const photo of photoRecords){
  const top=photo.top-y;
  if(top>vh||top+photo.height<0)continue;
  const passage=clamp((vh-top)/(vh+photo.height));
  photo.image.style.setProperty('--photo-offset',`${((passage-.5)*travel*2).toFixed(2)}px`);
 }
 if(cinematic){
  const top=cinemaTop-y;
  if(top<vh*1.2&&top+cinemaHeight>0){
   const p=clamp((vh*.98-top)/(vh*.7));const e=p*p*(3-2*p);
   cinematic.style.setProperty('--cinema-inset',`${((1-e)*7).toFixed(2)}%`);
   cinematic.style.setProperty('--cinema-radius',`${((1-e)*140+3).toFixed(1)}px`);
   cinematic.style.setProperty('--cinema-scale',(1.09-e*.065).toFixed(4));
   cinematic.style.setProperty('--cinema-type-opacity',clamp((e-.12)/.72).toFixed(3));
   cinematic.dataset.revealProgress=e.toFixed(3);
  }
 }
 document.documentElement.style.setProperty('--reading-progress',clamp(y/Math.max(1,documentHeight-vh)).toFixed(4));
}
function queue(){if(!raf)raf=requestAnimationFrame(render);}
addEventListener('scroll',queue,{passive:true});
addEventListener('resize',()=>{measureNeeded=true;queue();},{passive:true});
addEventListener('load',()=>{measureNeeded=true;queue();},{once:true});
new ResizeObserver(()=>{measureNeeded=true;queue();}).observe(document.querySelector('#pages'));
new MutationObserver(queue).observe(document.body,{attributes:true,attributeFilter:['class']});
reduced.addEventListener('change',()=>{observe();queue();});
addEventListener('focusin',e=>{const element=e.target.closest('.editorial-reveal');if(element)element.classList.add('editorial-visible');});
observe();document.body.classList.add('editorial-motion');queue();
})();
