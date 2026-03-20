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
        model: "gpt-5-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `${systemPrompt || ""}\n\nReturn only valid JSON. No markdown fences.`
          },
          {
            role: "user",
            content: userPrompt || ""
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OpenAI request failed",
        details: data
      });
    }

    let text = data?.choices?.[0]?.message?.content || "{}";

    if (typeof text !== "string") {
      text = JSON.stringify(text || {});
    }

    text = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: "Model did not return valid JSON",
        raw: text
      });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: String(error && error.message ? error.message : error)
    });
  }
};
