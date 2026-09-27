// guest personalization: index.html?guest=key
var guests = { "family": "Our Dear Family", "friends": "Our Dear Friends" };
var key = new URLSearchParams(location.search).get("guest");
var gn = document.getElementById("guestName");
if (key && guests[key]) gn.textContent = "Dear " + guests[key];

// shrink any .fitline element to fit on one line, no matter the text length
function fitOneLine(el) {
  var min = 13;
  el.style.fontSize = "";
  var max = parseFloat(getComputedStyle(el).fontSize);
  var size = max;
  el.style.fontSize = size + "px";
  var guard = 0;
  while (el.scrollWidth > el.clientWidth && size > min && guard < 200) {
    size -= 1;
    el.style.fontSize = size + "px";
    guard++;
  }
}
function fitAll() {
  document.querySelectorAll(".fitline").forEach(fitOneLine);
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
else fitAll();
window.addEventListener("load", fitAll);
var fitTimer;
window.addEventListener("resize", function () {
  clearTimeout(fitTimer);
  fitTimer = setTimeout(fitAll, 120);
});

// open invitation + start music
var opening = document.getElementById("opening");
var music = document.getElementById("music");
var musicToggle = document.getElementById("musicToggle");
var musicPlaying = false;

document.getElementById("openBtn").addEventListener("click", function () {
  opening.classList.add("hidden");
  document.body.classList.remove("locked");
  music.play().then(function () {
    musicPlaying = true;
    musicToggle.textContent = "Ⅱ";
  }).catch(function (e) {
    console.log("Music could not start:", e);
  });
});

musicToggle.addEventListener("click", function () {
  if (musicPlaying) {
    music.pause();
    musicPlaying = false;
    musicToggle.textContent = "♫";
  } else {
    music.play().then(function () {
      musicPlaying = true;
      musicToggle.textContent = "Ⅱ";
    }).catch(function (e) {
      console.log("Music could not start:", e);
    });
  }
});

// countdown — change the date/time below when finalized (format: YYYY-MM-DDTHH:MM:SS+ZZ:ZZ)
var weddingDate = new Date("2026-11-06T10:00:00+07:00").getTime();
function pad(n) { return String(n).padStart(2, "0"); }
function tick() {
  var diff = weddingDate - Date.now();
  if (diff <= 0) {
    ["days", "hours", "minutes", "seconds"].forEach(function (id) {
      document.getElementById(id).textContent = "00";
    });
    clearInterval(iv);
    return;
  }
  document.getElementById("days").textContent = pad(Math.floor(diff / 86400000));
  document.getElementById("hours").textContent = pad(Math.floor(diff / 3600000) % 24);
  document.getElementById("minutes").textContent = pad(Math.floor(diff / 60000) % 60);
  document.getElementById("seconds").textContent = pad(Math.floor(diff / 1000) % 60);
}
tick();
var iv = setInterval(tick, 1000);

// copy account number
document.querySelectorAll(".copy-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var val = btn.dataset.copy;
    var original = btn.textContent;
    function done(ok) {
      btn.textContent = ok ? "Copied" : "Couldn't copy";
      setTimeout(function () { btn.textContent = original; }, 1400);
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(val).then(function () { done(true); }, function () { done(false); });
      } else {
        var ta = document.createElement("textarea");
        ta.value = val; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.focus(); ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        done(true);
      }
    } catch (e) { done(false); }
  });
});

// handle missing photos safely regardless of load order
function markMissing(img) {
  img.closest(".photo").classList.add("no-img");
}
document.querySelectorAll(".photo img").forEach(function (img) {
  // image already failed before this script ran
  if (img.complete && img.naturalWidth === 0) {
    markMissing(img);
  } else {
    img.addEventListener("error", function () { markMissing(img); });
  }
});
