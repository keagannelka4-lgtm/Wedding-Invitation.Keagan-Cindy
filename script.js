const WEDDING_DATE="2026-11-06T10:00:00+07:00";
const RSVP_URL="https://forms.google.com/";
const target=new Date(WEDDING_DATE).getTime();
function countdown(){const d=target-Date.now();if(d<=0)return;document.getElementById("days").textContent=String(Math.floor(d/86400000)).padStart(3,"0");document.getElementById("hours").textContent=String(Math.floor(d/3600000)%24).padStart(2,"0");document.getElementById("mins").textContent=String(Math.floor(d/60000)%60).padStart(2,"0");document.getElementById("secs").textContent=String(Math.floor(d/1000)%60).padStart(2,"0")}countdown();setInterval(countdown,1000);
const obs=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add("visible")),{threshold:.12});document.querySelectorAll(".reveal").forEach(e=>obs.observe(e));
const entry=document.getElementById("entry"),enter=document.getElementById("enter"),music=document.getElementById("music"),btn=document.getElementById("musicBtn"),label=document.getElementById("musicText");document.body.classList.add("locked");
enter.addEventListener("click",async()=>{entry.classList.add("hidden");document.body.classList.remove("locked");btn.classList.add("show");try{await music.play();label.textContent="MUSIC ON"}catch(e){label.textContent="MUSIC OFF"}});
btn.addEventListener("click",async()=>{if(music.paused){try{await music.play();label.textContent="MUSIC ON"}catch(e){}}else{music.pause();label.textContent="MUSIC OFF"}});
document.getElementById("rsvpLink").href=RSVP_URL;
document.querySelectorAll(".copy").forEach(button=>button.addEventListener("click",async()=>{
  const value=button.dataset.copy;
  try{await navigator.clipboard.writeText(value);button.textContent="COPIED"}catch(e){button.textContent="SELECT & COPY"}
  setTimeout(()=>button.textContent="COPY",1500);
}));
