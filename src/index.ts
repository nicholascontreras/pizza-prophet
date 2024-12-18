import { Client, GatewayIntentBits, Guild, GuildMember, Message, MessageType } from 'discord.js';
import { exit } from 'process';

// Fetch an environment variable and quit program if it's not found
const getEnvVar = (varName: string): string => {
    const val = process.env[varName];
    if (val) {
        return val;
    } else {
        console.error(`No environment variable found for the name: ${varName}`);
        exit(1);
    }
};

// Food type definitions and converters
enum Food { PIZZA, CHIPOTLE, BJS, SUBWAY, DAIRY_QUEEN, MCDONALDS, CRUMBL_COOKIES }

const detectFoodMentionedInMessage = async (message: string) : Promise<Food | undefined> => {
    message = message.toLowerCase();
    if (message.includes('pizza')) {
        return Food.PIZZA;
    } else if (message.includes('chipotle')) {
        return Food.CHIPOTLE;
    } else if (message.includes('bjs') || message.includes('bj\'s')) {
        return Food.BJS;
    } else if (message.includes('subway')) {
        return Food.SUBWAY;
    } else if (message.includes('dairy queen') || message.includes(' dq ')) {
        return Food.DAIRY_QUEEN;
    } else if (message.includes('mcdonald') || message.includes('mc donald')) {
        return Food.MCDONALDS;
    } else if (message.includes('crumbl')) {
        return Food.CRUMBL_COOKIES;
    }
};

const getBotName = async (food: Food) : Promise<string> => {
    switch (food) {
        case Food.PIZZA: return 'Pizza Prophet';
        case Food.CHIPOTLE: return 'Chipotle Chaplain';
        case Food.BJS: return 'BJ\'s Bishop';
        case Food.SUBWAY: return 'Subway Shaman';
        case Food.DAIRY_QUEEN: return 'Dairy Queen Deacon';
        case Food.MCDONALDS: return 'McDonald\'s Messiah';
        case Food.CRUMBL_COOKIES: return 'Crumbl Cookies Cleric';
    }
};

const getFoodName = async (food: Food) : Promise<string> => {
    switch (food) {
        case Food.PIZZA: return 'pizza';
        case Food.CHIPOTLE: return 'Chipotle';
        case Food.BJS: return 'BJ\'s';
        case Food.SUBWAY: return 'Subway';
        case Food.DAIRY_QUEEN: return 'Dairy Queen';
        case Food.MCDONALDS: return 'McDonald\'s';
        case Food.CRUMBL_COOKIES: return 'Crumbl Cookies';
    }
};

const DISCORD_TOKEN = getEnvVar('DISCORD_TOKEN');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

client.once('ready', () => {
    console.log('Bot ready');
});

client.on("messageCreate", async (message: Message) => {
    if (!client.user) {
        console.error('Cannot listen for messages, not logged in as a user');
        return;
    }

    // Ignore messages that don't mention me explicity
    if (message.content.includes("@here") || 
        message.content.includes("@everyone") || 
        message.type == MessageType.Reply) {  
        return;       
    } 

    // Otherwise, if I'm mentioned process the message
    if (message.mentions.has(client.user.id)) {
        await processMessage(message);
    }
});

// Process a message sent to me to determine if we should reply
const processMessage = async (message: Message) : Promise<void> => {
    const food = await detectFoodMentionedInMessage(message.content);
    if (food === undefined) {
        return;
    }

    if (await transformationNeeded(food)) {
        await transformBot(food);
    }

    await respondToMessage(message, food);
};

// Determines if the bot needs to change its name and profile picture
// before responding to the given food item
const transformationNeeded = async (food: Food) : Promise<boolean> => {
    const expectedName = await getBotName(food);

    const firstGuild = client.guilds.cache.map(g => g)[0];
    const meAsMember = getMeAsMember(firstGuild);
    if (meAsMember) {
        return meAsMember.displayName != expectedName;
    } else {
        console.error(`Bot user not found in the first guild: ${firstGuild.id}`);
        console.error('Unable to determine if transformation is needed');
        return true;
    }
};

// Transforms the bot to have the correct display name and profile picture 
// for the given food item in all guilds
const transformBot = async (food: Food) : Promise<void> => {
    const newName = await getBotName(food);

    const allGuilds = client.guilds.cache.map(g => g);
    for (let i = 0; i < allGuilds.length; i++) {
        const curGuild = allGuilds[i];
        await getMeAsMember(curGuild)?.setNickname(newName);
    }

    if (!client.user) {
        console.error('Cannot set avatar, not logged in as a user');
        return;
    }

    const fileName = (await getFoodName(food)).toLowerCase();
    await client.user.setAvatar(`images/${fileName}.png`);
};

// Make a determination and reply to the message with our answer
const respondToMessage = async (message: Message, food: Food) : Promise<void> => {
    let response: string;
    const foodName = await getFoodName(food);
    if (Math.random() < 0.75) {
        response = `Yes you should get ${foodName}`;
    } else {
        response = `No you shouldn't get ${foodName}`;
    }

    await message.reply(response);
};

// Get the bot user as a member in the given guild
// Ensures that we actually are a member in the given guild, otherwise exits the program
const getMeAsMember = (guild: Guild): GuildMember | undefined => {
    const me = guild.members.me;
    if (me) {
        return me;
    } else {
        console.error(`Bot user not found in the guild: ${guild.id}`);
    }
};

client.login(DISCORD_TOKEN);