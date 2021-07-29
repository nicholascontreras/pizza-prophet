import os, random
import discord
from discord.ext import tasks

client = discord.Client()

@client.event
async def on_ready():
    print('We have logged in as: ' + str(client.user))

@client.event
async def on_message(message):
    # Don't respond to any messages we've sent
    if message.author == client.user:
        return

    msg = message.content.lower()

    if ('randy' in msg or 'i' in msg) and 'get pizza' in msg:
        if random.random() > 0.75:
            await message.reply(content='yes you should get pizza')
        else: 
            await message.reply(content='not you shouldn\'t get pizza')

client.run(os.getenv('DISCORD_TOKEN'))