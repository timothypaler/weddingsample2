(() => {
'use strict';
const body=document.body, reduced=matchMedia('(prefers-reduced-motion: reduce)');
const area=document.querySelector('#pages'), cover=document.querySelector('#cover-stage'), openButton=document.querySelector('#open-invitation');
const masthead=document.querySelector('.masthead');
let opened=false, opening=false, openingTimer;
const audio=document.querySelector('#wedding-music'), sound=document.querySelector('#sound-toggle');
let musicIntent=false, musicRamp=0;
audio.volume=.4;
function syncSound(){const playing=!audio.paused&&!audio.ended;sound.setAttribute('aria-pressed',String(playing));sound.setAttribute('aria-label',playing?'Pause wedding music':'Play wedding music');sound.classList.toggle('playing',playing);sound.querySelector('.sound-label').textContent=playing?'Music on':'Music off';}
async function playMusic(){musicIntent=true;try{await audio.play();cancelAnimationFrame(musicRamp);const start=performance.now(),initial=audio.volume;const fade=now=>{const t=Math.max(0,Math.min(1,(now-start)/1800));audio.volume=Math.max(0,Math.min(1,initial+(.4-initial)*t));if(t<1)musicRamp=requestAnimationFrame(fade);};musicRamp=requestAnimationFrame(fade);}catch{musicIntent=false;}syncSound();}
sound.addEventListener('click',()=>{if(audio.paused)playMusic();else{musicIntent=false;cancelAnimationFrame(musicRamp);audio.pause();syncSound();}});
audio.addEventListener('play',syncSound);audio.addEventListener('pause',syncSound);audio.addEventListener('error',syncSound);
document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.pause();else if(musicIntent)playMusic();});
function open(){if(opened||opening)return;opening=true;openButton.disabled=true;audio.volume=0;playMusic();body.classList.remove('is-reclosing','is-closed');body.classList.add('is-opening');window.scrollTo({top:0,behavior:'instant'});openingTimer=setTimeout(()=>{body.classList.add('is-open');body.classList.remove('is-opening');cover.inert=true;cover.hidden=true;area.inert=false;masthead.inert=false;opened=true;opening=false;document.querySelector('#invitation').focus({preventScroll:true});},reduced.matches?50:7200);}
function replay(){clearTimeout(openingTimer);opened=false;opening=false;area.inert=true;masthead.inert=true;cover.hidden=false;cover.inert=false;openButton.disabled=false;window.scrollTo({top:0,behavior:'instant'});body.classList.remove('is-open','is-opening');body.classList.add('is-reclosing','is-closed');history.replaceState(null,'',location.pathname);openButton.focus({preventScroll:true});requestAnimationFrame(()=>requestAnimationFrame(()=>body.classList.remove('is-reclosing')));}
openButton.addEventListener('click',open);document.querySelector('#replay').addEventListener('click',replay);document.querySelector('#replay-end').addEventListener('click',replay);
// Section motion is handled by motion.js; the document keeps native scrolling.
const form=document.querySelector('#rsvp-form'), success=document.querySelector('#rsvp-success');
const replyKey='invilinks-rose-light-sample-v1';
function safeStore(value){try{if(value===null)localStorage.removeItem(replyKey);else localStorage.setItem(replyKey,JSON.stringify(value));return true;}catch{return false;}}
function renderReply(reply){
 form.hidden=true;success.hidden=false;
 document.querySelector('#reply-summary').textContent=reply.attendance==='yes'?`${reply.guest} · Accepts for ${reply.count} ${reply.count===1?'guest':'guests'}.`:`${reply.guest} · Regretfully declines.`;
}
function toggleDetails(){document.querySelector('#guest-details').hidden=form.elements.attendance.value==='no';}
form.querySelectorAll('[name="attendance"]').forEach(el=>el.addEventListener('change',toggleDetails));
form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const guest=String(data.get('guest')||'').trim();if(!guest){form.elements.guest.setCustomValidity('Please enter your name.');form.elements.guest.reportValidity();return;}const reply={guest,attendance:data.get('attendance'),count:data.get('attendance')==='yes'?Number(data.get('count')):0,diet:String(data.get('diet')||'').trim(),note:String(data.get('note')||'').trim()};if(!safeStore(reply)){document.querySelector('.form-disclosure').textContent='Your browser blocked device storage. Enable it to save this sample reply.';return;}renderReply(reply);success.scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});});
form.elements.guest.addEventListener('input',()=>form.elements.guest.setCustomValidity(''));
document.querySelector('#edit-reply').addEventListener('click',()=>{success.hidden=true;form.hidden=false;form.elements.guest.focus();});
document.querySelector('#clear-reply').addEventListener('click',()=>{safeStore(null);form.reset();toggleDetails();success.hidden=true;form.hidden=false;form.elements.guest.focus();});
try{const reply=JSON.parse(localStorage.getItem(replyKey));if(reply&&typeof reply.guest==='string'&&['yes','no'].includes(reply.attendance)){form.elements.guest.value=reply.guest;form.elements.attendance.value=reply.attendance;form.elements.count.value=String(reply.count||1);form.elements.diet.value=reply.diet||'';form.elements.note.value=reply.note||'';toggleDetails();renderReply(reply);}}catch{}

const eventDate=new Date('2027-06-20T15:30:00+08:00');
function countdown(){const m=Math.max(0,eventDate-Date.now());document.querySelector('#days').textContent=Math.floor(m/86400000);document.querySelector('#hours').textContent=String(Math.floor(m/3600000)%24).padStart(2,'0');document.querySelector('#minutes').textContent=String(Math.floor(m/60000)%60).padStart(2,'0');}countdown();setInterval(countdown,30000);
const dialog=document.querySelector('#about-dialog');document.querySelector('#about-button').addEventListener('click',()=>dialog.showModal());document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();}});
const gallery=document.querySelector('#gallery-dialog'), galleryImage=document.querySelector('#gallery-image');
const photos=[...document.querySelectorAll('[data-photo]')];let photoIndex=0;
function showPhoto(i){photoIndex=(i+photos.length)%photos.length;const img=photos[photoIndex].querySelector('img');galleryImage.src=img.src;galleryImage.alt=img.alt;document.querySelector('#gallery-caption').textContent=photos[photoIndex].querySelector('span').textContent;}
photos.forEach((button,i)=>button.addEventListener('click',()=>{showPhoto(i);gallery.showModal();}));document.querySelector('#gallery-close').addEventListener('click',()=>gallery.close());document.querySelector('#gallery-prev').addEventListener('click',()=>showPhoto(photoIndex-1));document.querySelector('#gallery-next').addEventListener('click',()=>showPhoto(photoIndex+1));gallery.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(photoIndex-1);}if(e.key==='ArrowRight'){e.preventDefault();showPhoto(photoIndex+1);}});
fetch('assets/photo-credits.json').then(r=>r.json()).then(data=>{const container=document.querySelector('#photo-credits');const items=Array.isArray(data)?data:(data.photos||data.images||data.assets||[]);const used=['story.webp','rings.webp','gallery-1.webp','gallery-2.webp','gallery-3.webp','gallery-4.webp'];for(const entry of items){const serialized=JSON.stringify(entry);if(!used.some(f=>serialized.includes(f)))continue;const line=document.createElement('p');line.className='photo-credit';const a=document.createElement('a');a.href=entry.source_page||entry.url||'https://unsplash.com/license';a.target='_blank';a.rel='noopener noreferrer';a.textContent=(entry.photographer||entry.author||entry.title||'Photography')+' ↗';line.append(a);container.append(line);}}).catch(()=>{});
syncSound();
})();
