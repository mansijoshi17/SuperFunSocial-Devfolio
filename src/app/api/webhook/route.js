import axios from 'axios';
import { NextResponse } from 'next/server';

const TELEGRAM_TOKEN = process.env.NEXT_PUBLIC_TG_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const WEBHOOK_URL = `https://demo.superfun.social/api/telegram`;

export  async function POST(req, res) {
    try {
        const response = await axios.post(`${TELEGRAM_API}/setWebhook`, {
          url: WEBHOOK_URL,
        }); 
        return NextResponse.json({response: response.data},{status:200});
      } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to set webhook' });
      }
}
