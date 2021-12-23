'use strict';

require('dotenv').config();

const puppeteer = require('puppeteer');
const fs = require('fs');
const Discord = require('discord.js');
const data = require('../data/data5');
// const gamePages = require('../links');

// const discordHook = new Discord.WebhookClient(process.env.API_ID, process.env.API_TOKEN);

const emailInputId = '#username';
const passwordInputId = '#password';
const loginButtonId = '.el-button.login__button.el-button--default';
const login = process.env.LOGIN;
const password = process.env.PASSWORD;
const lobbySelector = '.lobby';
const nameSelector = '.player__username';
const loginPage = 'https://avalon.fun/login';
let page;
const messages = new Set();
const messagesOld = new Set(Object.keys(data));
const dates2 = {};

const getGameData = () => {
    const results = {
        names: undefined,
        roles: undefined,
        redWin: false,
        blueWin: false,
        merlinShot: undefined,
        byMissions: undefined
    };
    const roles = $('.player-avatar.player__player-avatar > .player-avatar__container > .player-avatar__avatar')
        .map(( __, role ) => $(role).css('background-image').match(/img\/(\w*)/)[1])
        .get();

    if ( roles.length === 0 ) {
        return;
    }

    const names = $('.player__username')
        .text()
        .replace(/\n\s*/g, ',')
        .substring(1)
        .slice(0, -1)
        .split(',')
        .map(name => name.replace(/[^\w\d\sа-яА-Я]/g, ''))
        .map(name => name.charAt(0).toUpperCase() + name.slice(1));

    if ( names.length <= 6 ) {
        return;
    }

    const successCount = $('.g-tbl__quests > .quest--success').length;
    const failCount = $('.g-tbl__quests > .quest--fail').length;

    const shotRoleIndex = $('.player__x-mark').map(( i, e ) => {
        if ( $(e).css('opacity') === '1' ) {
            return i;
        }
    }).get()[0];

    if ( typeof shotRoleIndex !== 'undefined' && roles[shotRoleIndex] === 'merlin' ) {
        results.merlinShot = true;
    }
    if ( successCount === 3 && !results.merlinShot ) {
        results.blueWin = true;
        results.byMissions = true;
    } else if ( failCount === 3 ) {
        results.redWin = true;
        results.byMissions = true;
        results.merlinShot = false;
    } else {
        results.redWin = true;
        results.byMissions = false;
    }
    results.names = names;
    results.roles = roles;

    return new Promise(resolve => {
        resolve(results);
    });
};

const authorization = async () => {
    await page.goto(loginPage, {waitUntil: 'networkidle2'});
    await page.waitForSelector(emailInputId);
    await page.type(emailInputId, login);
    await page.type(passwordInputId, password);
    await page.click(loginButtonId);
    await page.click(loginButtonId);
    await page.waitForSelector(lobbySelector);
};

const loadPage = async gameLink => {
    await page.goto(gameLink, {waitUntil: 'networkidle2'});

    try {
        await page.waitForSelector(nameSelector, {
            timeout: 500
        });
        await page.evaluate(async () => {
            const script = await document.createElement('script');

            script.src = 'https://code.jquery.com/jquery-3.4.1.min.js';
            await document.getElementsByTagName('head')[0].appendChild(script);
        });
        await page.waitForTimeout(500);
    } catch ( e ) {
        return;
    }

    return await page.evaluate(getGameData);
};

const loadMessages = async ( channel, lastMessageId ) => {
    const maximumMessageCount = Number.MAX_SAFE_INTEGER;
    // const maximumMessageCount = 5;
    const fetchOptions = {limit: 100};
    let fetchComplete = false;
    let i = 1;

    while ( !fetchComplete ) {
        if ( lastMessageId ) {
            fetchOptions.before = lastMessageId;
        }

        const fetched = await channel.messages.fetch(fetchOptions);

        console.log('i = ', (i * 100));
        i++;
        console.log(messages.size);

        if ( fetched.size === 0 ) {
            break;
        }

        lastMessageId = fetched.last().id;
        await Promise.all(fetched.map(async msg => {
            const isTooManyMessages = messages.size >= maximumMessageCount;
            const isTooOldMessages = new Date(msg.createdTimestamp).getMonth() === 9;

            if ( isTooManyMessages || isTooOldMessages ) {
                fetchComplete = true;

                return;
            }

            if ( msg.cleanContent.includes('https://avalon.fun/GAME-') ) {
                const link = msg.cleanContent.match(/(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,?^=%&:\/~+#-]*[\w?^=%&\/~+#-])/)[0];
                const date = msg.createdAt.toLocaleDateString();
                const sizeBefore = messages.size;

                if ( !messagesOld.has(link) ) {
                    messages.add(link);
                }

                if ( messages.size !== sizeBefore ) {
                    dates2[link] = date;
                }
            }
        }));
    }

    return lastMessageId;
};

const loadDiscordMessages = async () => {
    const client = new Discord.Client({
        intents: [
            Discord.Intents.FLAGS.GUILD_MESSAGES,
            Discord.Intents.FLAGS.DIRECT_MESSAGES,
            Discord.Intents.FLAGS.GUILDS,
            Discord.Intents.FLAGS.GUILD_MESSAGES,
            Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING,
            Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING
        ],
        partials: [
            'MESSAGE',
            'CHANNEL',
            'REACTION'
        ]
    });

    await client.login(process.env.BOT_TOKEN);

    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    await guild.channels.fetch();

    const channel = guild.channels.cache.get(process.env.CHANNEL_ID);
    const lastId = await loadMessages(channel);

    console.log(messages);
    console.log(dates2);
    console.log(lastId);
    fs.writeFileSync('./links11.js', 'module.exports = ' + JSON.stringify([...messages], null, 2));
    fs.writeFileSync('./dates222.js', 'module.exports = ' + JSON.stringify(dates2, null, 2));
};

(async () => {
    try {
        await loadDiscordMessages();
        const browser = await puppeteer.launch({
            'headless': false,
            'args': ['--fast-start', '--disable-extensions', '--no-sandbox'],
            'ignoreHTTPSErrors': true
        });

        page = await browser.newPage();
        await authorization();

        let i = 1;

        for ( const gamePage of messages ) {
            // if  (i === 15) break;
            const currentData = data[gamePage];

            if ( !data[gamePage] || data[gamePage] === null ) {
                console.log(i, ': ', gamePage);
                i++;

                const result = await loadPage(gamePage);

                if ( result ) {
                    result.date = dates2[gamePage];
                }
                data[gamePage] = result;
            }
        }

        const replacer = ( key, value ) => (typeof value === 'undefined'
            ? null
            : value);

        fs.writeFileSync('./data/data5.js', 'module.exports = ' + JSON.stringify(data, replacer, 2));
        await browser.close();

    } catch ( e ) {
        console.log(e);
    }
})();
