const restify = require('restify');
const { BotFrameworkAdapter } = require('botbuilder');
require('dotenv').config();

// 建立 Adapter（連接 Teams 的橋樑）
const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// 建立伺服器
const server = restify.createServer();
server.listen(process.env.PORT || 3978, () => {
  console.log(`伺服器啟動中 http://localhost:3978`);
});

// 儲存便當訂單
const orders = [];

// 主要 Bot 邏輯

// new
adapter.use(async (context, next) => {
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
  await next();
});

// old
// adapter.processActivity(async (context) => {
//   if (context.activity.type === 'message') {
//     const text = context.activity.text.trim();

//     const match = text.match(/^\$便當[:：]?\s*(\d+)/);
//     if (match) {
//       const count = parseInt(match[1]);
//       const name = context.activity.from.name;
//       orders.push({ name, count });
//       await context.sendActivity(`已記錄 ${name} 的便當：${count} 份`);
//     }
//   }
// });

// 處理來自 Teams 的訊息
server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    await adapter.runMiddleware(context, async (ctx) => {
      await adapter.run(context);
    });
  });
});
