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

/* =========================================================
   WEDDING WISHES — Supabase
   ========================================================= */

var SUPABASE_URL = "https://wguwukhanzcajrdarqnl.supabase.co";
var SUPABASE_PUBLISHABLE_KEY = "sb_publishable_kVVr3bvLPNGc7nLnsLb7aQ_JI749noW";

function loadSupabase() {
  return new Promise(function (resolve, reject) {
    if (window.supabase && window.supabase.createClient) {
      resolve(window.supabase);
      return;
    }

    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.async = true;

    script.onload = function () {
      if (window.supabase && window.supabase.createClient) {
        resolve(window.supabase);
      } else {
        reject(new Error("Supabase library unavailable."));
      }
    };

    script.onerror = function () {
      reject(new Error("Could not load Supabase."));
    };

    document.head.appendChild(script);
  });
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatWishDate(dateString) {
  var date = new Date(dateString);

  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function createGuestbook() {
  var countdown = document.querySelector(".countdown");

  if (!countdown) return null;

  var section = document.createElement("section");

  section.id = "weddingWishes";
  section.className = "wrap rule wedding-wishes";

  section.innerHTML = `
    <div class="eyebrow">A few words to keep</div>

    <h2 class="title">Wedding Wishes</h2>

    <p class="wishes-copy">
      Leave a little message for us. Your words will stay with us long after the day is over.
    </p>

    <form id="wishForm" class="wish-form" novalidate>

      <label class="wish-field">
        <span class="wish-label">Your Name</span>

        <input
          id="wishName"
          type="text"
          maxlength="80"
          autocomplete="name"
          placeholder="Your name"
          required
        >
      </label>

      <label class="wish-field">
        <span class="wish-label">Your Wishes</span>

        <textarea
          id="wishMessage"
          maxlength="500"
          rows="4"
          placeholder="Write something for Keagan & Cindy..."
          required
        ></textarea>
      </label>

      <button
        id="wishSubmit"
        class="wish-submit"
        type="submit"
      >
        Send Wishes
      </button>

      <div
        id="wishStatus"
        class="wish-status"
        aria-live="polite"
      ></div>

    </form>

    <div
      id="wishList"
      class="wish-list"
      aria-live="polite"
    ></div>
  `;

  countdown.insertAdjacentElement("afterend", section);

  return section;
}

function renderWishes(list, wishes) {
  if (!wishes.length) {
    list.innerHTML =
      '<div class="wishes-empty">Be the first to leave a wish.</div>';

    return;
  }

  list.innerHTML = wishes.map(function (wish) {
    return `
      <article class="wish-card">

        <div class="wish-card-head">

          <div class="wish-name">
            ${escapeHTML(wish.name)}
          </div>

          <div class="wish-date">
            ${escapeHTML(formatWishDate(wish.created_at))}
          </div>

        </div>

        <div class="wish-message">
          ${escapeHTML(wish.message).replace(/\n/g, "<br>")}
        </div>

      </article>
    `;
  }).join("");
}

function initWeddingWishes() {
  var section = createGuestbook();

  if (!section) return;

  var form = document.getElementById("wishForm");
  var nameInput = document.getElementById("wishName");
  var messageInput = document.getElementById("wishMessage");
  var submitButton = document.getElementById("wishSubmit");
  var status = document.getElementById("wishStatus");
  var list = document.getElementById("wishList");

  var wishes = [];

  function showStatus(message, type) {
    status.textContent = message || "";
    status.className = "wish-status" + (type ? " " + type : "");
  }

  function sortWishes() {
    wishes.sort(function (a, b) {
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }

  function addWish(wish) {
    var exists = wishes.some(function (item) {
      return String(item.id) === String(wish.id);
    });

    if (!exists) {
      wishes.push(wish);
    }

    sortWishes();

    renderWishes(list, wishes);
  }

  loadSupabase()
    .then(function (supabase) {

      var client = supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
      );

      return client
        .from("wedding_wishes")
        .select("id, name, message, created_at")
        .order("created_at", {
          ascending: false
        })
        .limit(100)

        .then(function (result) {

          if (result.error) {
            throw result.error;
          }

          wishes = result.data || [];

          renderWishes(list, wishes);

          client
            .channel("wedding-wishes-live")

            .on(
              "postgres_changes",
              {
                event: "INSERT",
                schema: "public",
                table: "wedding_wishes"
              },

              function (payload) {
                addWish(payload.new);
              }
            )

            .subscribe();
        });
    })

    .catch(function (error) {

      console.error(
        "Wedding wishes failed:",
        error
      );

      list.innerHTML =
        '<div class="wishes-empty">Wishes are temporarily unavailable.</div>';
    });


  form.addEventListener("submit", function (event) {

    event.preventDefault();

    var name = nameInput.value.trim();
    var message = messageInput.value.trim();

    if (!name || !message) {

      showStatus(
        "Please enter your name and a message.",
        "error"
      );

      return;
    }

    if (name.length > 80 || message.length > 500) {

      showStatus(
        "Your name or message is too long.",
        "error"
      );

      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending…";

    showStatus("", "");

    loadSupabase()

      .then(function (supabase) {

        var client = supabase.createClient(
          SUPABASE_URL,
          SUPABASE_PUBLISHABLE_KEY
        );

        return client

          .from("wedding_wishes")

          .insert({
            name: name,
            message: message
          })

          .select(
            "id, name, message, created_at"
          )

          .single();
      })

      .then(function (result) {

        if (result.error) {
          throw result.error;
        }

        addWish(result.data);

        form.reset();

        showStatus(
          "Your wishes have been sent. Thank you. ♡",
          "success"
        );
      })

      .catch(function (error) {

        console.error(
          "Wedding wish submission failed:",
          error
        );

        showStatus(
          "Something went wrong. Please try again.",
          "error"
        );
      })

      .finally(function () {

        submitButton.disabled = false;

        submitButton.textContent =
          "Send Wishes";
      });
  });
}


if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    initWeddingWishes
  );

} else {

  initWeddingWishes();

}
