// utils/spotify.js

const SPOTIFY_CLIENT_ID = "your_spotify_client_id";
const REDIRECT_URI = "http://localhost:5173";
const SCOPES = [
  "user-library-read",
  "playlist-modify-private",
  "playlist-modify-public"
];

export function getAuthUrl() {
  const state = crypto.randomUUID();
  const verifier = btoa(state);
  localStorage.setItem("code_verifier", verifier);

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(" "),
    code_challenge_method: "plain",
    code_challenge: verifier,
    state,
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function getTokenFromCode(code) {
  const verifier = localStorage.getItem("code_verifier");
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: SPOTIFY_CLIENT_ID,
    code_verifier: verifier,
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  return res.json();
}

export async function fetchLikedTracks(token, offset = 0) {
  const res = await fetch(
    `https://api.spotify.com/v1/me/tracks?limit=50&offset=${offset}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await res.json();
  return data.items.map((item) => ({
    id: item.track.id,
    name: item.track.name,
    artist: item.track.artists[0].name,
    dateAdded: item.added_at,
  }));
}

export async function createPlaylist(token, userId, name) {
  const res = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, public: false }),
  });

  return res.json();
}

export async function addTracksToPlaylist(token, playlistId, uris) {
  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris }),
    }
  );

  return res.json();
}