// Kita memanggil server lokal Express.js kita
const BACKEND_URL = 'http://localhost:5000/api/new-releases';

export const getNewReleases = async () => {
  try {
    const response = await fetch(BACKEND_URL);

    if (!response.ok) {
      throw new Error(`Gagal memanggil Backend. Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error pada Front-End:", error);
    return [];
  }
};

export const getDiscover = async (query = "top hit 2025") => {
  const res = await fetch(
    `http://localhost:5000/api/discover?q=${query}`
  );

  const data = await res.json();
  return data.tracks || [];
};