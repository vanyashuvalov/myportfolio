# Telegram Bot Setup for Contact Messages

## ANCHOR POINTS
- ENTRY: Instructions for setting up Telegram bot
- MAIN: Bot creation and configuration steps
- DEPS: Telegram BotFather, .env configuration

## Step 1: Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow instructions to choose bot name and username
4. Copy the bot token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Step 2: Get Your Chat ID

1. Send any message to your bot
2. Open this URL in browser (replace `YOUR_BOT_TOKEN`):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
3. Find `"chat":{"id":123456789}` in the response
4. Copy the chat ID number

## Step 3: Configure Environment Variables

Edit `backend/.env` file:

```env
# Telegram Bot Configuration for Contact Messages
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

## Step 4: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Step 5: Test the Setup

1. Start the backend server:
   ```bash
   python api_server.py
   ```

2. Test the endpoint:
   ```bash
   curl -X POST http://localhost:8000/api/contact/send \
     -H "Content-Type: application/json" \
     -d '{"message":"Test message","contact":"test@example.com"}'
   ```

3. Check your Telegram bot for the message

## Troubleshooting

- **503 Error**: Bot token or chat ID not configured in .env
- **Timeout**: Check internet connection and bot token validity
- **No message received**: Verify chat ID is correct and you've sent at least one message to the bot

## Security Notes

- Never commit `.env` file to git
- Keep bot token secret
- Consider adding rate limiting for production
- Use HTTPS in production environment
