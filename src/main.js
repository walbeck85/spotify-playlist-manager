import { fetchLikedTracks, filterTracksByDate } from "./spotifyApi.js";

// main.js

const loginBtn = document.getElementById("loginBtn");
const generateBtn = document.getElementById("generateBtn");
const userInfo = document.getElementById("userInfo");
const logBox = document.getElementById("log");
const playlistLink = document.getElementById("playlistLink");
const useMock = document.getElementById("useMock");

// Check for token in URL on redirect
if (window.location.hash.includes("access_token")) {
  const params = new URLSearchParams(window.location.hash.substring(1));
  const token = params.get("access_token");
  localStorage.setItem("spotifyToken", token);
  window.location.hash = "";
  log("✅ Logged in via Spotify.");
  userInfo.style.display = "inline";
  userInfo.textContent = "Welcome, Will Albeck!";
} else if (localStorage.getItem("spotifyToken")) {
  userInfo.style.display = "inline";
  userInfo.textContent = "Welcome, Will Albeck!";
}

async function loadMockTracks() {
  const res = await fetch("/data/mockTracks.json");
  return await res.json();
}

function log(message) {
  const timestamp = new Date().toLocaleTimeString();
  logBox.textContent += `[${timestamp}] ${message}\n`;
  logBox.scrollTop = logBox.scrollHeight;
}

loginBtn.addEventListener("click", () => {
  const clientId = "d85be739ee0d478fa227eb287a5a88e7";
  const redirectUri = window.location.origin;
  const scopes = [
    "user-library-read",
    "playlist-modify-public",
    "playlist-modify-private"
  ];

  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopes.join(" "))}`;

  window.location.href = authUrl;
});

generateBtn.addEventListener("click", async () => {
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;

  if (!start || !end) {
    log("⚠️ Please enter both start and end dates.");
    return;
  }

  log(`🎯 Filtering songs between ${start} and ${end}...`);

  const startDate = new Date(start);
  const endDate = new Date(end);

  let source = [];

  if (useMock.checked) {
    source = await loadMockTracks();
    log(`📦 Loaded ${source.length} mock tracks.`);
  } else {
    try {
      source = await fetchLikedTracks();
      log(`🎧 Loaded ${source.length} liked tracks from Spotify.`);
    } catch (error) {
      log(`❌ Failed to load Spotify tracks: ${error.message}`);
      return;
    }
  }

  const filtered = filterTracksByDate(source, start, end);

  log(`✅ Found ${filtered.length} matching songs.`);

  if (filtered.length) {
    playlistLink.style.display = "block";
    playlistLink.innerHTML = `<strong>Success!</strong> Your playlist would include:<br/><ul>${filtered
      .map(
        (s) => `<li>${s.name} – ${s.artist} (${s.tempo} BPM, added ${s.dateAdded})</li>`
      )
      .join("")}</ul>`;
  } else {
    playlistLink.style.display = "none";
  }
});