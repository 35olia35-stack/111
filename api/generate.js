module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true });
  }

  try {
    const { systemPrompt, userPrompt } = req.body || {};

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt || "" },
          { role: "user", content: userPrompt || "" }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "{}";

    let parsed = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }

    return res.status(200).json(parsed);
  } catch (_error) {
    return res.status(500).json({ error: "Server error" });
  }
};
