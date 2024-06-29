import axios from 'axios';
import { NextResponse } from 'next/server';

const TELEGRAM_TOKEN = process.env.NEXT_PUBLIC_TG_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const WEB_APP_URL = 'https://demo.superfun.social';

export  async function POST(req, res) {
    const { message } = req.body;

    if (message && message.text === '/start') {
      const chatId = message.chat.id;
      
      try {
        const response = await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: 'Welcome to the Telegram Mini App!',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Open Mini App',
                  web_app: {
                    url: WEB_APP_URL
                  }
                }
              ]
            ]
          }
        });
        return NextResponse.json({response: response.data});
      } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Error sending message' });
      }
    } else {
      return NextResponse.json({message: 'No message received'});
    }
}
