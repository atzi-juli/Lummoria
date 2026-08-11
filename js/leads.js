async function submitLead(payload) {
  const endpoint = SITE_CONFIG.formspree.endpoint;
  const body = { ...payload, timestamp: new Date().toISOString() };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) return { ok: true };

    let errorMsg = "No pudimos enviar tu información. Intenta de nuevo.";
    try {
      const data = await response.json();
      if (data?.errors?.length) errorMsg = data.errors.map((e) => e.message).join(" ");
    } catch (e) {}
    return { ok: false, error: errorMsg };
  } catch (networkError) {
    return { ok: false, error: "Error de conexión. Revisa tu internet e intenta de nuevo." };
  }
}