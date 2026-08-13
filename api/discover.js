module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Metodo non consentito" });
  }

  const query = '[out:json][timeout:25];(nwr["amenity"~"restaurant|cafe|fast_food|bar|pub"](45.00,7.57,45.14,7.78););out center tags;';

  try {
    const upstream = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!upstream.ok) throw new Error(`Overpass ${upstream.status}`);
    const data = await upstream.json();
    response.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return response.status(200).json(data);
  } catch (error) {
    return response.status(502).json({ error: "Servizio di ricerca temporaneamente non disponibile" });
  }
};
