import os, random, time
import discord
from discord.ext import tasks

client = discord.Client()

last_no_time = 0

@client.event
async def on_ready():
    print('We have logged in as: ' + str(client.user))

@client.event
async def on_message(message):
    global last_no_time

    # Don't respond to any messages we've sent
    if message.author == client.user:
        return

    msg = message.content.lower()

    if ('randy' in msg or (' i ' in msg and message.author.id == 133742150725664769)) and 'get pizza' in msg:
        if time.time() - last_no_time < 2 * 60:
            await message.reply(content='**I SAID NO YOU DUMB BITCH**')
            last_no_time = 0
        else:
            if random.random() < 0.75:
                if message.author.id == 133742150725664769:
                    await message.reply(content='yes you should get pizza')
                else: 
                    await message.reply(content='yes randy should get pizza')
            else:
                if message.author.id == 133742150725664769:
                    await message.reply(content='no you shouldn\'t get pizza')
                else:
                    await message.reply(content='no randy shouldn\'t get pizza')
                last_no_time = time.time()

client.run(os.getenv('DISCORD_TOKEN'))