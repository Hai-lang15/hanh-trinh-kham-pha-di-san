
const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { cauHoi, loai } = req.body;

    if (!["di-san", "bai-viet"].includes(loai)) {
      return res.status(400).json({ message: "Loại tìm kiếm không hợp lệ." });
    }

    if (typeof cauHoi !== "string" || !cauHoi.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập nội dung tìm kiếm." });
    }

    if (cauHoi.length > 500) {
      return res.status(400).json({ message: "Câu tìm kiếm tối đa 500 ký tự." });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Bạn hỗ trợ tìm kiếm dữ liệu di sản Việt Nam.
Phân tích câu hỏi thành các từ khóa tìm kiếm tiếng Việt.
Không trả lời câu hỏi, không bịa dữ liệu.
Trả về JSON theo dạng:
{"keywords":["từ khóa 1","từ khóa 2"],"intent":"mô tả ngắn ý định"}
Loại dữ liệu: ${loai === "di-san" ? "di sản" : "bài viết"}.
Bao gồm tên riêng, địa danh, chủ đề và từ đồng nghĩa hữu ích nếu phù hợp.
Tối đa 8 từ khóa.`
        },
        { role: "user", content: cauHoi.trim() }
      ],
      response_format: { type: "json_object" },
      max_tokens: 250,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    const keywords = Array.isArray(result.keywords)
      ? result.keywords
          .filter((word) => typeof word === "string")
          .map((word) => word.trim().slice(0, 100))
          .filter(Boolean)
          .slice(0, 8)
      : [];

    return res.json({
      keywords: [...new Set([cauHoi.trim(), ...keywords])],
      intent: typeof result.intent === "string" ? result.intent.slice(0, 200) : "",
    });
  } catch (error) {
    console.error("Lỗi tìm kiếm AI:", error.message);
    return res.status(500).json({
      message: "Không thể xử lý tìm kiếm AI lúc này.",
    });
  }
});

module.exports = router;
