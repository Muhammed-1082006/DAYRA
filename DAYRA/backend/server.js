require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const contentPath = path.join(__dirname, "../app/src/main/assets/data/dayra_content.json");
const dayraContent = JSON.parse(fs.readFileSync(contentPath, "utf8"));

const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash"
});

app.get("/", (req, res) => {
  res.json({
    app: "DAYRA AI",
    status: "online"
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "الرسالة فارغة"
      });
    }

    const context = JSON.stringify(dayraContent, null, 2);
      const prompt = `أنت DAYRA AI، مساعد تعليمي داخل تطبيق DAYRA. استخدم محتوى DAYRA التالي عند الإجابة، ولا تخترع معلومات غير موجودة فيه إذا كان السؤال متعلقًا بالمحتوى الدراسي.\n\nمحتوى DAYRA:\n${context}\n\nسؤال الطالب:\n${message}`;

      const result = await model.generateContentStream(prompt);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");
      for await (const chunk of result.stream) {
        res.write(chunk.text());
      }
      return res.end();



  } catch (error) {
    console.error("DAYRA AI ERROR:", error.message);

    res.status(500).json({
      error: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`DAYRA AI running on port ${PORT}`);
});
