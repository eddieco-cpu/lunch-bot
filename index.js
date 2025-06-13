const restify = require('restify');
const { BotFrameworkAdapter } = require('botbuilder');
require('dotenv').config();

// 建立 Adapter
const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// 建立伺服器
const server = restify.createServer();
const port = process.env.PORT || 3978;
server.listen(port, () => {
  console.log(`伺服器啟動中 http://localhost:${port}`);
});

// 儲存便當訂單
const orders = [];

// 處理 Teams 訊息
server.post('/api/messages', async (req, res, next) => {
  await adapter.processActivity(req, res, async (context) => {
    if (context.activity.type === 'message') {
      const text = context.activity.text.trim();
      const match = text.match(/^\$便當[:：]?\s*(\d+)/);
      if (match) {
        const count = parseInt(match[1]);
        const name = context.activity.from.name;
        orders.push({ name, count });
        await context.sendActivity(`✅ 已記錄 ${name} 的便當：${count} 份`);
      }
    }
  });

  // 別忘記要呼叫 next()
  await next();
});

