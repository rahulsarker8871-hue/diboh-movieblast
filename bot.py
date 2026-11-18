import json
import subprocess
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes, ConversationHandler

# --- আপনার টোকেন এখানে বসান ---
BOT_TOKEN = '9065102904:AAFaQj7GgJficN-kKvTXY8gkgG-jLjM4qLk'

JSON_FILE = 'data/movies.json'

TITLE, YEAR, POSTER, DESC, DL_LINK = range(5)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("স্বাগতম! নতুন মুভি অ্যাড করতে /add কমান্ড দিন।")
    return ConversationHandler.END

async def add_movie(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("১. মুভির নাম (Title) দিন:")
    return TITLE

async def get_title(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['title'] = update.message.text
    await update.message.reply_text("২. মুক্তির বছর (Year) দিন:")
    return YEAR

async def get_year(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['year'] = update.message.text
    await update.message.reply_text("৩. পোস্টারের ছবির লিংক (URL) দিন:")
    return POSTER

async def get_poster(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['poster'] = update.message.text
    await update.message.reply_text("৪. মুভির সংক্ষিপ্ত বর্ণনা (SEO Description) দিন:")
    return DESC

async def get_desc(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['desc'] = update.message.text
    await update.message.reply_text("৫. MediaFire ডাউনলোড লিংক দিন:")
    return DL_LINK

async def get_link(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['link'] = update.message.text
    
    new_movie = {
        "id": context.user_data['title'].lower().replace(" ", "-") + "-" + context.user_data['year'],
        "title": context.user_data['title'],
        "year": int(context.user_data['year']),
        "language": "English",
        "runtime": "120 min",
        "genre": ["Action", "Drama"],
        "poster": context.user_data['poster'],
        "description": context.user_data['desc'],
        "cast": ["Unknown"],
        "sourceName": "MediaFire", 
        "rightsStatus": "Public Domain",
        "rightsEvidence": "Uploaded via Telegram Bot.",
        "rating": 7.5,
        "popularity": 80,
        "downloadOptions": [
            {"quality": "720p", "size": "~1.2GB", "url": context.user_data['link']}
        ]
    }
    
    try:
        with open(JSON_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        data.append(new_movie)
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        await update.message.reply_text("✅ ডেটা সেভ হয়েছে! গিটহাবে পুশ করা হচ্ছে...")
        
        subprocess.run(["git", "add", "."])
        subprocess.run(["git", "commit", "-m", f"Added {new_movie['title']} via Bot"])
        subprocess.run(["git", "push"])
        
        await update.message.reply_text(f"🎉 সফলভাবে {new_movie['title']} সাইটে যুক্ত হয়েছে!")
    except Exception as e:
        await update.message.reply_text(f"❌ সমস্যা হয়েছে: {str(e)}")
        
    return ConversationHandler.END

if __name__ == '__main__':
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    conv_handler = ConversationHandler(
        entry_points=[CommandHandler('add', add_movie)],
        states={
            TITLE: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_title)],
            YEAR: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_year)],
            POSTER: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_poster)],
            DESC: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_desc)],
            DL_LINK: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_link)],
        },
        fallbacks=[CommandHandler('start', start)],
    )
    app.add_handler(CommandHandler('start', start))
    app.add_handler(conv_handler)
    print("বট চালু হয়েছে... টেলিগ্রামে গিয়ে /add দিন।")
    app.run_polling()
