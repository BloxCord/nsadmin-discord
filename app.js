require('dotenv').config();

var discord = require('discord.js');
var roblox = require('noblox.js');
var Trello = require('node-trello');

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var sleep = require('sleep');
var time = require('time');

var t = new Trello(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN);

var client = new discord.Client();
client.login(process.env.DISCORD_TOKEN);

/*var settings = require('./noblox.js-server/settings.json')
const COOKIE = settings.cookie

function login () {
    return roblox.cookieLogin(COOKIE)
}
login()*/

var currentActivityNumber;

var activities = [
    {options:{type:3}, name:'/cmds'},
    {options:{type:0}, name:'with the banhammer'},
    {options:{type:0}, name:'with level crossings'},
    {options:{type:0}, name:'you'},
    {options:{type:2}, name:'train horns'},
    {options:{type:0}, name:'with commands'},
    {options:{type:0}, name:'with Peterboy'},
    {options:{type:0}, name:'with nukes'},
    {options:{type:0}, name:'Spaceman'},
    {options:{type:0}, name:'with fire'},
    {options:{type:0}, name:'hard to get'},
    {options:{type:0}, name:'cards'},
    {options:{type:0}, name:'with friends'},
    {options:{type:0}, name:'as Guest'},
    {options:{type:2}, name:'autistic screeching'},
    {options:{type:1, url:"https://www.twitch.tv/guidojw"}, name:'nothing'},
    {options:{type:1, url:"https://www.twitch.tv/guidojw"}, name:'how to tie a tie'},
    {options:{type:3}, name:'the end of the world'}
];

function getActivityFromNumber(num) {
    return num == 0 && "Playing" || num == 1 && "Streaming" || num == 2 && "Listening to" || num == 3 && "Watching";
}

var activitiesString = "";
activities.forEach((activity, index) => {
    activitiesString += `${index + 1}. **${getActivityFromNumber(activity.options.type)}** ${activity.name}\n`;
});

function getRandomInt(max, last) {
    var newNumber = Math.floor(Math.random()*Math.floor(max));
    if (max == 1 || !last || newNumber != last) {
        return newNumber;
    } else {
        return getRandomInt(max, last);
    }
}

function setActivity(num) {
    var activity = activities[num];
    client.user.setActivity(activity.name, activity.options);
    currentActivityNumber = num;
    return `**${getActivityFromNumber(activity.options.type)}** ${activity.name}`;
}

var startUnix;

client.on('ready', () => {
    startUnix = getUnix();
    setActivity(getRandomInt(activities.length));
    console.log(`Ready to serve on ${client.guilds.size} servers, for ${client.users.size} users.`);
});

client.on('error', err => {
    console.error(err);
    restart(client);
});

function restart(client) {
    client.destroy().then(() => {
        client.login(process.env.DISCORD_TOKEN).then(() => {
            var guild = client.guilds.find(x => x.name === 'NS Roblox');
            if (guild) {
                var admin_logschannel = guild.channels.find(x => x.name === 'admin_logs');
                admin_logschannel.send('Due to connection errors, I just restarted myself.');
            }
            console.log('Client logged in!');
        }).catch(() => {
            sleep.sleep(30);
            restart(client);
        });
    }).catch(() => {
        sleep.sleep(30);
        restart(client);
    });
}

const prefix = '/';
const maximumRank = 5;
const groupId = 1018818;
const MTgroupId = 2661380;

const QOTDInterval = 3; // in days
const checkRate = 60*60*1000; // in miliseconds

const NSadminDiscordUserID = '5a57ee52ffa8593145697d03';
const trainingSchedulerBoardID = '5a52b61dbb039ad5909f2895';
const currentSuspensionsListID = '5809d4a29cb8026531caca83';
const doneSuspensionsListID = '5809d4a43ab48cb87fc42e79';
const exiledListID = '5a36783a7a2c516ccd5d76ae';
const bannedListID = '5a54e9a585e806299bff1011';
const unbannedListID = '5b44b73f21d213fd5c91c58e';
const scheduledTrainingsListID = '5a52b61fec92437fecc1e7b1';
const finishedTrainingsListID = '5a52b6200a81f0b886803194';
const cancelledTrainingsListID = '5a9600082162203597c483c3';
const suggestedQOTDsListID = '5a5df470ad58200e9140508f';
const declinedQOTDsListID = '5a5df665f1acaee38bf29e1a';
const approvedQOTDsListID = '5a5df475379b29fc0a41fffd';
const askedQOTDsListID = '5a5df47c4416542fa7573528';

const commands = [
    {
        main1: `**/amiadmin** *[username]*: Tells if you're a server admin.
**/isadmin** *[username]*: Equivalent of **/amiadmin**.
**/reason** *[username]*: If suspended, posts the duration and reason of suspension of given/your nickname.
**/suspendinfo** *[username]*: Equivalent of **/reason**.
**/getshout**: Fetches current group shout, author and date.
**/groupshout**: Equivalent of **/getshout**.
**/suggest** *"suggestion"*: Suggests suggestion in the suggestions channel, suggestion must be between double quotation marks.
**/userid** *[username]*: Fetches userId of username given/your nickname.
**/getuserid** *[username]*: Equivalent of **/userid**.
**/rank** *[username]*: Fetches the group rank of username given/your nickname.
**/getrank** *[username]*: Equivalent of **/rank**.
**/role** *[username]*: Fetches the group role of username given/your nickname.
**/getrole** *[username]*: Equivalent of **/role**.`,
        main2: `**/joindate** *[username]*: Fetches Join Date of username given/your nickname.
**/age** *[username]*: Fetches AccountAge of username given/your nickname.
**/playerurl** *[username]*: Posts a link of the profile of username given/your nickname.
**/userurl** *[username]*: Equivalent of **/playerurl**.
**/url** *[username]*: Equivalent of **/playerurl**.
**/suggestqotd** *"suggestion"*: Suggests QOTD suggestion on the Trello board.
**/activities**: Postst a list of all activities.
**/statuses**: Equivalent of **/activities**.
**/update** *[username]*: Updates roles of username given/you.
**/notdutch**: Gives command's author the Not Dutch role which will prevent one from chatting in #dutchland.
**/trainings** *[trainingid]*: DMs command's author information about training with given ID/all trainings.
**/traininginfo** *[trainingid]*: Equivalent of **/trainings**.
**/traininglist** *[trainingid]*: Equivalent of **/trainings**.
**/training** *[trainingid]*: Equivalent of **/trainings**.`,
        main3: `**/optout**: Gives command's author the No Training Announcements role which will disable the #trainings channel.
**/optin**: Removes command's author's No Training Announcements role which will enable the #trainings channel.`,
        misc1: `**/rr**: Posts a link of the Rules & Regulations.
**/rulesregulations**: Equivalent of **/rr**.
**/group**: Posts a link of the group's page. 
**/grouppage**: Equivalent of **/group**.
**/grouplink**: Equivalent of **/group**.
**/game**: Posts a link of the main game's page.
**/gamepage**: Equivalent of **/game**.
**/trello**: Posts link of the development board on Trello.
**/ttdt**: Posts a link of the Theoretical Train Driver Test II.
**/theoretical**: Equivalent of **/ttdt**.
**/ptdt**: Posts a link of the Practical Train Driver Test II.
**/practical**: Equivalent of **/ptdt**.
**/time** *[timezone]*: Posts time of timezone (abbreviation). Defaults to Dutch time.
**/date** *[timezone]*: Posts local time, date, weekday and timezone information of given timezone (abbreviation). Defaults to Dutch time.
**/unix**: Posts current epoch time.
**/epoch**: Equivalent of **/unix**.
**/place** *timezone*: Posts region of timezone (abbreviation).`,
        misc2: `**/groupcenter**: Posts a link of the Group Center.
**/groupcentre**: Equivalent of **/groupcenter**.
**/gc**: Equivalent of **/groupcenter**.
**/discord**: Posts link to the server.`,
        HR1: `**/suspend** *username, days[, rankback], "reason"*: Suspends username in group for given amount of days.
**/promote** *username*: Promotes username in group.
**/pban** *username*: Pbans username from NS games.
**/shout** *["clear"]*/*"content"*: Posts shout with given content to the group.
**/clearreports**: Clears the reports channel.
**/uw**: Posts a link of the Updates Workplace.
**/updatesworkplace**: Equivalent of **/uw**.
**/docs**: Posts links of all HR related documentss.
**/hrdocs**: Equivalent of **/docs**.
**/trainingslogs**: Posts a link of the Training Logs Spreadsheets.
**/tl**: Equivalent of **/traininglogs**.
**/maliciousspreadsheets**: Posts a link of the Malicious Spreadsheets.
**/ms**: Equivalent of **/maliciousspreadsheets**.
**/trainingprotocols**: Posts a link of the Training Protocols document.
**/tp**: Equivalent of **/trainingprotocols**.
**/isindiscord** *username*: Checks if user with given username is in Discord server.`
    },
    {
        HR2: `**/activity** *[activity]*: Sets NSadmin's activity to given activity/random.
**/status** *[activity]*: Equivalent of **/activity**.
**/host** *type date time ["specialnotes"]*: Creates a new training of given type on given time and date and with optional specialnotes.
**/hosttraining** *type date time ["specialnotes"]*: Equivalent of **/host**.
**/finish** *trainingid*: Finishes training with given ID.
**/finishtraining** *trainingid*: Equivalent of **/finish**.
**/canceltraining** *trainingid "reason"*: Cancels training with given ID with given reason.
**/changetraining** *trainingid key:data*: Changes training with given ID's given key to given data. Key can be by/date/time/type/specialnotes and data should be formatted the same as in **/host**. Key "by" regards the host and you can only change trainings you're the host of.
**/announce** *trainingid*: Announces training with given ID on Discord and shouts default training shout on Roblox.`,
        HR3: `**/announcediscord** *trainingid*: Announces training with given ID on Discord.
**/announceroblox** *trainingid*: Shouts default training shout on Roblox.
**/exampleshout** *trainingid*: Posts the default training shout.
**/exampleannouncement** *trainingid*: Posts an announcement example for training with given ID.
**/cancelsuspension** *username "reason"*: Cancels suspension of username given with given reason.
**/extend** *username days "reason"*: Extends suspension of username given for given amount of days with given reason.
**/extendsuspension** *username days "reason"*: Equivalent of **/extend**.
**/changesuspension** *username key:data*: Changes suspension of username given's key to given data. Key can be by/reason/rankback and data should be formatted the same as in **/suspend**. Key "by" regards the suspender and you can only change suspension you've made.
**/cancel**: Command does nothing but warns author to specify what to cancel (training/suspension).`,
        HR4: `**/change**: Command does nothing but warns author to specify what to change (training/suspension).
**/issuspended** *[username]*: Tells if you're/given username is suspended.
**/unpban** *username*: Unpbans username from NS games.
**/pbanlist**: DMs command's author the pbanlist.
**/checkeverything**: Checks for recent promotions, QOTD updates and MT join requests.`,
        bot1: `**/cmds**: DMs command's author a list of all commands.
**/commands**: Equivalent of **/cmds**.
**/help**: Equivalent of **/cmds**.
**/lastupdated**: Posts a timestamp of when the bot was last updated.
**/uptime**: Posts a timestamp in s of how long the bot has been online.`
    }
];

const defaultTrainingShout = '[TRAININGS] There are new trainings being hosted soon, check out the Training Scheduler in the Group Center for more info!';

const cmdsEmbeds = [
    new discord.RichEmbed()
        .setAuthor('NSadmin', 'https://image.prntscr.com/image/ltRs7okBRVGs8KLf4a-fCw.png')
        .setColor([255, 174, 12])
        .setTitle('Commands (1)')
        .addField('Main commands I', commands[0].main1)
        .addField('Main commands II', commands[0].main2)
        .addField('Main commands III', commands[0].main3)
        .addField('Miscellaneous I', commands[0].misc1)
        .addField('Miscellaneous II', commands[0].misc2)
        .addField('HR commands I', commands[0].HR1),
    new discord.RichEmbed()
        .setAuthor('NSadmin', 'https://image.prntscr.com/image/ltRs7okBRVGs8KLf4a-fCw.png')
        .setColor([255, 174, 12])
        .setTitle('Commands (2)')
        .addField('HR commands II', commands[1].HR2)
        .addField('HR commands III', commands[1].HR3)
        .addField('HR commands IV', commands[1].HR4)
        .addField('Bot commands', commands[1].bot1)
]

var joindatecache = {};

var convertedTimezones;
fs.readFile('./convertedTimezones.txt', (err, data) => {
    convertedTimezones = JSON.parse(data);
});


function isCommand(command, message) {
    var command = command.toLowerCase();
    var content = message.content.toLowerCase();
    if (String(content).length == String(command + prefix).length) {
        return content.startsWith(prefix + command);
    } else {
        return content.startsWith(prefix + command + " ");
    }
}

function pluck(array) {
    return array.map(item => {
        return item['name'];
    });
}

function hasRole(member, role) {
    return pluck(member.roles).includes(role)
}

function isAdmin(member) {
    return hasRole(member, 'HR')
}

function getUnix(date) {
    if (!date) {
        date = new Date();
    }
    return Math.round(date.getTime()/1000);
}

function getEmbed(title, text) {
    return compileRichEmbed([{title:title, message:text}]);
}

function logCommand(user, command, text, channel) {
    if (channel) {
        channel.send(compileRichEmbed([{title:`**${user}** used command **/${command}**!`, message:text}]));
    }
}

function getAgeDays(joindate) {
    var dateNumbers = joindate.split(/[/]+/);
    var date = new Date(parseInt(dateNumbers[2]), parseInt(dateNumbers[1]) - 1, parseInt(dateNumbers[0]));
    var ageDays = Math.round((getUnix() - date.getTime()/1000)/86400);
    if (ageDays == 1) {
        return ageDays + ' day';
    } else {
        return ageDays + ' days';
    }
}

function getPossessionName(name) {
    if (name.slice(-1) == 's') {
        return '**' + name + "**'";
    } else {
        return '**' + name + "**'s";
    }
}

function extractText(str, delimiter) {
    var extracted;
    if (str && delimiter) {
        if (str.indexOf(delimiter) != str.lastIndexOf(delimiter)) {
            var firstIndex = str.indexOf(delimiter) + 1;
            var lastIndex = str.lastIndexOf(delimiter);
            extracted = str.substring(firstIndex, lastIndex);
        }
    }
    return extracted;
}

function getMemberByName(name, guild) {
    var guildmembers = guild.members.array();
    var foundmember;
    guildmembers.forEach(member => {
        var who = member.nickname || member.user.username;
        if (who.toLowerCase() == name.toLowerCase()) {
            foundmember = member;
        }
    });
    return foundmember;
}

function getCardInList(name, idList) {
    return new Promise(
        (resolve, reject) => {
            t.get(`/1/lists/${idList}/cards`, {}, (err, data) => {
                if (!err) {
                    for (var i in data) {
                        if (data[i].name == String(name)) {
                            resolve(data[i]);
                        }
                    }
                    resolve(null);
                } else {
                    reject(new Error(err.message));
                }
            });
        }
    );
}

function getCardsInList(idList) {
    return new Promise(
        (resolve, reject) => {
            t.get(`/1/lists/${idList}/cards`, {}, (err, data) => {
                if (!err) {
                    resolve(data);
                } else {
                    reject(new Error(err.message));
                }
            });
        }
    );
}

function isSuspended(name) {
    return new Promise(
        (resolve, reject) => {
            roblox.getIdFromUsername(name)
                .then(id => {
                    getCardInList(id, currentSuspensionsListID)
                        .then(suspended => {
                            if (suspended) {
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        }).catch(err => reject(new Error(err.message)));
                }).catch(err => reject(new Error(err.message)));
        }
    );
}

function getPlaceFromTimezone(abbreviation) {
    return new Promise(
        resolve => {
            abbreviation = abbreviation.toUpperCase();
            Object.keys(convertedTimezones).forEach(key => {
                if (convertedTimezones[key].includes(abbreviation)) {
                    resolve(key);
                }
            });
            resolve(null);
        }
    );
}

function checkRole(guild, member, rank) {
    if (rank == 2) {
        if (!hasRole(member, 'Suspended')) {
            member.addRole(guild.roles.find(x => x.name === 'Suspended'));
        };
        if (hasRole(member, 'MR')) {
            member.removeRole(guild.roles.find(x => x.name === 'MR'));
        }
        if (hasRole(member, 'Representative')) {
            member.removeRole(guild.roles.find(x => x.name === 'Representative'));
        }
        if (hasRole(member, 'Staff Coordinator')) {
            member.removeRole(guild.roles.find(x => x.name === 'Staff Coordinator'));
        }
        if (hasRole(member, 'Operations Coordinator')) {
            member.removeRole(guild.roles.find(x => x.name === 'Operations Coordinator'));
        }
    } else {
        if (hasRole(member,'Suspended')) {
            member.removeRole(guild.roles.find(x => x.name === 'Suspended'));
        }
        if (rank < 100 && hasRole(member, 'MR')) {
            member.removeRole(guild.roles.find(x => x.name === 'MR'));
        }
        if (rank != 100 && hasRole(member, 'Representative')) {
            member.removeRole(guild.roles.find(x => x.name === 'Representative'));
        }
        if (rank != 101 && hasRole(member, 'Staff Coordinator')) {
            member.removeRole(guild.roles.find(x => x.name === 'Staff Coordinator'));
        }
        if (rank != 102 && hasRole(member, 'Operations Coordinator')) {
            member.removeRole(guild.roles.find(x => x.name === 'Operations Coordinator'));
        }
        if (rank >= 100 && rank <= 102 && !hasRole(member, 'MR')) {
            member.addRole(guild.roles.find(x => x.name === 'MR'));
        }
        if (rank == 100 && !hasRole(member, 'Representative')) {
            member.addRole(guild.roles.find(x => x.name === 'Representative'));
        } else if (rank == 101 && !hasRole(member, 'Staff Coordinator')) {
            member.addRole(guild.roles.find(x => x.name === 'Staff Coordinator'));
        } else if (rank == 102 && !hasRole(member, 'Operations Coordinator')) {
            member.addRole(guild.roles.find(x => x.name === 'Operations Coordinator'));
        }
    }
}

function checkLastPromotions(guild) {
    fs.readFile('/home/pi/suspended.txt', (err, data) => {
        if (!err) {
            data = JSON.parse(data);
            for (var i in data) {
                (() => {
                    var key = i;
                    var userId = parseInt(key);
                    roblox.getUsernameFromId(userId)
                        .then(username => {
                            var member = getMemberByName(username, guild);
                            if (member) {
                                var table = data[key];
                                for (var x in table) {
                                    (() => {
                                        var playerTable = table;
                                        var promotion = x;
                                        checkRole(guild, member, playerTable[promotion].rank);
                                    })();
                                }
                            }
                        }).catch(err => console.log(err.message));
                })();
            }
            fs.writeFile('/home/pi/suspended.txt', '{}', err => {
                if (err) {
                    console.log(err.message);
                }
            });
        } else {
            console.log(err.message);
        }
    });
}

function checkQOTD(guild) {
    t.get(`/1/lists/${askedQOTDsListID}/cards`, {}, (err, data) => {
        if (!err) {
            var lastcard = data[0];
            var due = new Date(lastcard.due);
            var difftime = getUnix() - getUnix(due);
            if (difftime > QOTDInterval*86400) {
                t.get(`/1/lists/${approvedQOTDsListID}/cards` , {}, (err, data) => {
                    if (!err && data.length > 0) {
                        var newcard = data[0];
                        var dueseconds = getUnix(due);
                        var times = Math.floor(difftime/86400);
                        var newdueseconds = dueseconds + times*86400;
                        var newdue = new Date(newdueseconds*1000);
                        newdue = newdue.toISOString();
                        t.put(`/1/cards/${newcard.id}`, {pos:'top', due:newdue, dueComplete:true, idList:askedQOTDsListID, idMembers:[NSadminDiscordUserID]}, () => {
                            guild.channels.find(x => x.name === 'announcements').send(
                                `${guild.emojis.get('248922413599817728')} **QOTD**
*${newcard.name}*
Leave your answers in ${guild.channels.find(x => x.name === 'general')}!
@everyone`
                            );
                        });
                    }
                });
            }
        }
    });
}

function isDST(unix) {
    let date = new Date(unix);
    let jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
    let jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
    return Math.max(jan, jul) != date.getTimezoneOffset();
}

function checkMTJoinRequests(guild) {
    roblox.getJoinRequests(MTgroupId)
        .then(requests => {
            var admin_logschannel = guild.channels.find(x => x.name === 'admin_logs');
            for (var i in requests) {
                var request = requests[i];
                var username = request.username;
                roblox.getIdFromUsername(username)
                    .then(userId => {
                        roblox.getRankInGroup(groupId, userId)
                            .then(rank => {
                                if (rank >= 8) {
                                    var member = getMemberByName(username, guild);
                                    if (member) {
                                        checkRole(guild, member, rank);
                                    }
                                    roblox.handleJoinRequestId(MTgroupId, request.requestId, true)
                                        .then(() => {
                                            admin_logschannel.send(`Accepted ${getPossessionName(username)} MT join request.`);
                                            if (rank == 251 || rank == 252) {
                                                rank = 199;
                                            }
                                            roblox.setRank(MTgroupId, userId, rank)
                                                .then(newRole => admin_logschannel.send(`Successfully ranked **${username}** to **${newRole.Name}** in MT group.`))
                                                .catch(err => {
                                                    console.log(err.message);
                                                    admin_logschannel.send(`Couldn't rank **${username}** to **${rank}** in MT group.`);
                                                });
                                        }).catch(err => {
                                        console.log(err.message);
                                        admin_logschannel.send(`Couldn't accept **${getPossessionName(username)}** MT group join request.`);
                                    });
                                } else {
                                    roblox.handleJoinRequestId(MTgroupId, request.requestId, false)
                                        .then(() => admin_logschannel.send(`Declined ${getPossessionName(username)} MT join request.`))
                                        .catch(err => {
                                            console.log(err.message);
                                            admin_logschannel.send(`Couldn't decline ${getPossessionName(username)} MT group join request.`);
                                        });
                                }
                            }).catch(err => console.log(err.message));
                    }).catch(err => console.log(err.message));
            }
        }).catch(err => console.log(err.message));
};

function compileRichEmbed(fields, opts) {
    fields = fields || []
    opts = opts || {}
    var embed = opts.original;
    if (!embed) {
        embed = new discord.RichEmbed()
            .setAuthor('NSadmin', 'https://image.prntscr.com/image/ltRs7okBRVGs8KLf4a-fCw.png')
            .setColor([255, 174, 12])
    }
    if (opts.timestamp) {
        embed.setTimestamp(opts.timestamp)
    } else {
        embed.setTimestamp()
    }
    var len = fields.length <= 25 ? fields.length:25;
    for (var i = 0; i < len; i++) {
        var title = fields[i].title;
        var message = fields[i].message;
        if (title && title.length > 256) {
            title = title.substring(0, 253) + '...';
            console.log(`Shortened title ${title}, 256 characters is max.`);
        }
        if (message && message.length > 2048) {
            message = message.substring(0, 2045) + '...';
            conmsole.log(`Shortened message ${message}, 2048 characters is max.`);
        }
        embed.addField(fields[i].title || '?', fields[i].message || '-');
    }
    if (fields.length > 25) {
        console.log(`Ignored ${fields.length-25} fields, 25 is max.`);
    }
    return embed;
}

function getUsername(str) {
    return new Promise(
        (resolve, reject) => {
            if (parseInt(str)) {
                roblox.getUsernameFromId(parseInt(str))
                    .then(username => resolve(username))
                    .catch(err => reject(new Error(err.message)));
            } else {
                roblox.getIdFromUsername(str)
                    .then(id => {
                        roblox.getUsernameFromId(id)
                            .then(username => resolve(username))
                            .catch(() => resolve(str));
                    }).catch(() => resolve(str));
            }
        }
    );
}

function getRoleByAbbreviation(str) {
    if (str) {
        str = str.toUpperCase();
        return str == 'G' && 'Guest' || str == 'C' && 'Customer' || str == 'S' && 'Suspended' || str == 'TD' && 'Train Driver' || str == 'CD' && 'Conductor' || str == 'CSR' && 'Customer Service Representative' || str == 'CS' && 'Customer Service' ||
            str == 'J' && 'Janitor' || str == 'Se' && 'Security' || str == 'LC' && 'Line Controller' || str == 'PR' && 'Partner Representative' || str == 'R' && 'Representative' || str == 'MC' && 'Management Coordinator' ||
            str == 'OC' && 'Operations Coordinator' || str == 'GA' && 'Group Admin' || str  == 'BoM' && 'Board of Managers' || str == 'BoD' && 'Board of Directors' || str == 'CF' && 'Co-Founder' || str == 'AA' && 'Alt. Accounts' ||
            str == 'PD' && 'President-Director'	|| str == 'UT' && 'Update Tester' || str == 'P' && 'Pending' || str == 'PH' && 'Pending HR' || str == 'MoCR' && 'Manager of Customer Relations' || str == 'MoSe'	&& 'Manager of Security' ||
            str == 'MoRS' && 'Manager of Rolling Stock' || str == 'MoSt' && 'Manager of Stations' || str == 'MoE' && 'Manager of Events' || str == 'MoC' && 'Manager of Conductors' || str == 'MoRM' && 'Manager of Rail Management' ||
            str == 'DoNSR' && 'Director of NS Reizgers' || str == 'DoO' && 'Director of Operations' || null;
    }
    return null;
}

function getAbbreviationByRank(rank, group) {
    if (rank == 0) {
        return 'G';
    }
    if (!group || group == groupId) {
        return rank == 1 && 'C' || rank == 2 && 'S' || rank == 3 && 'TD' || rank == 4 && 'CD' || rank == 5 && 'CSR' || rank == 6 && 'J' || rank == 7 && 'Se' || rank == 8 && 'LC' || rank == 99 && 'PR' || rank == 100 && 'R' || rank == 101 && 'SC' ||
            rank == 102 && 'OC' || rank == 103 && 'GA' || rank == 251 && 'BoM' || rank == 252 && 'BoD' || rank == 253 && 'CF' || rank == 254 && 'AA' || rank == 255 && 'PD' || null;
    } else if (group == MTgroupId) {
        return rank == 2 && 'P' || rank == 50 && 'UT' || rank == 55 && 'LC' || rank == 100 && 'R' || rank == 101 && 'SC' || rank == 102 && 'OC' || rank == 199 && 'PHR' || rank == 244 && 'MoCR' || rank == 245 && 'MoSe' || rank == 246 && 'MoRS' ||
            rank == 247 && 'MoSt' || rank == 248 && 'MoE' || rank == 249 && 'MoC' || rank == 250 && 'MoRM' || rank == 251 && 'DoNSR' || rank == 252 && 'DoO' || rank == 253 && 'GA' || rank == 254 && 'AA' || rank == 255 && 'PD';
    }
}

function getRoleByRank(rank, group) {
    return getRoleByAbbreviation(getAbbreviationByRank(rank, group));
}

function isTrainableAbbreviation(str) {
    str = String(str);
    if (str) {
        str = str.toUpperCase();
        return str == 'CD' || str == 'CSR' || str == 'CS';
    }
    return false;
}

function validTime(timeString) {
    timeString = String(timeString);
    if (timeString) {
        if (timeString.length == 5) {
            var hours = parseInt(timeString.substring(0, 2));
            var minutes = parseInt(timeString.substring(3, 5));
            if (hours && minutes || hours == 0 && minutes || hours == 0 && minutes == 0 || hours && minutes == 0) {
                if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
                    return true;
                }
            }
        }
    }
    return false;
}

function validDate(dateString) {
    dateString = String(dateString);
    if (dateString) {
        if (dateString.length >= 8  && dateString.length <= 10) {
            if (dateString.indexOf('-') != dateString.lastIndexOf('-')) {
                var day = dateString.substring(0, dateString.indexOf('-'));
                var month = dateString.substring(dateString.indexOf('-') + 1, dateString.lastIndexOf('-'));
                var year = dateString.substring(dateString.lastIndexOf('-') + 1, dateString.length);
                if (day && month && year) {
                    var leapyear = year%4 == 0;
                    if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
                        if (day <= 31) {
                            return true;
                        }
                    } else if (month == 4 || month == 6 || month == 9 || month == 11) {
                        if (day <= 30) {
                            return true;
                        }
                    } else if (month == 2) {
                        if (leapyear) {
                            if (day <= 29) {
                                return true;
                            }
                        } else {
                            if (day <= 28) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
    }
    return false;
}

function getDateInfo(dateString) {
    var day = dateString.substring(0, dateString.indexOf('-'));
    var month = dateString.substring(dateString.indexOf('-') + 1, dateString.lastIndexOf('-'));
    var year = dateString.substring(dateString.lastIndexOf('-') + 1, dateString.length);
    return {day:day, month:month, year:year}
}

function getTimeInfo(timeString) {
    var hours = timeString.substring(0, timeString.indexOf(':'));
    var minutes = timeString.substring(timeString.indexOf(':') + 1, timeString.length);
    return {hours:hours, minutes:minutes}
}

function getCardsNumOnBoard(boardId) {
    return new Promise(
        (resolve, reject) => {
            t.get(`/1/boards/${boardId}/cards`, {}, (err, data) => {
                if (!err) {
                    resolve(data.length);
                } else {
                    reject(new Error(err.message));
                }
            });
        }
    );
}

function getReadableDate(opts) {
    return opts.day + '-' + opts.month + '-' + opts.year;
}

function getReadableTime(opts) {
    if (opts.minutes.length == 1) {
        opts.minutes = '0' + opts.minutes
    }
    return opts.hours + ':' + opts.minutes;
}

function getDate(unix) {
    var dateObject = new Date(unix);
    var day = String(dateObject.getDate());
    var month = String(dateObject.getMonth() + 1);
    var year = String(dateObject.getFullYear());
    return getReadableDate({day:day, month:month, year:year});
}

function getTime(unix) {
    var dateObject = new Date(unix);
    var hours = String(dateObject.getHours());
    var minutes = String(dateObject.getMinutes());
    return getReadableTime({hours:hours, minutes:minutes});
}

function getTrainingSentence(trainingData) {
    var role = trainingData.type.toUpperCase();
    var dateUnix = trainingData.date;
    var readableDate = getDate(dateUnix*1000);
    var readableTime = getTime(dateUnix*1000);
    return `**${role}** training on **${readableDate}** at **${readableTime} ${isDST(dateUnix*1000) && 'CEST' || 'CET'}**, hosted by **${trainingData.by}**.`;
}

function DMmember(member, message) {
    return new Promise(
        (resolve, reject) => {
            member.createDM()
                .then(channel => {
                    channel.send(message);
                    resolve(true);
                })
                .catch(err => reject(new Error(err.message)));
        }
    );
}

function getRobloxTrainingShout(trainingData) {
    var role = getRoleByAbbreviation(trainingData.type);
    var dateString = getDate(trainingData.date*1000);
    //var timeString = getTime(trainingData.date*1000);
    var by = trainingData.by;
    var specialnotes = trainingData.specialnotes;
    var content = `[TRAINING] ${role} training on ${dateString} (for times please check Group Center), hosted by ${by}.${specialnotes && ' '+specialnotes || ''}`
    return content;
}

function getDiscordTrainingAnnouncement(trainingData, guild) {
    var role = getRoleByAbbreviation(trainingData.type);
    var dateString = getDate(trainingData.date*1000);
    var timeString = getTime(trainingData.date*1000);
    var by = trainingData.by;
    var specialnotes = trainingData.specialnotes;
    var content =
        `${guild.emojis.get('248922413599817728')} **TRAINING**
There will be a *${role}* training on **${dateString}**.
Time: **${timeString} ${isDST(trainingData.date*1000) && 'CEST' || 'CET'}**. 
${specialnotes && specialnotes + '\n' || ''}Hosted by **${by}**.
@everyone`
    return content;
}

function announceRoblox(content) {
    return new Promise(
        (resolve, reject) => {
            roblox.shout(groupId, content)
                .then(() => resolve(content))
                .catch(err => reject(new Error(err.message)));
        }
    );
}

function announceDiscord(content, channel) {
    return new Promise(
        (resolve, reject) => {
            channel.send(content)
                .then(() => resolve(content))
                .catch(err => reject(new Error(err.message)));
        }
    );
}

function getPbanList(cards) {
    return new Promise(
        resolve => {
            var list = '';
            var cardsProcessed = 0;
            cards.forEach((card, index, array) => {
                setTimeout(() => {
                    var userId = parseInt(card.name);
                    var pbanData = JSON.parse(card.desc);
                    var rank = pbanData.rank;
                    var byId = pbanData.by;
                    var reason = pbanData.reason;
                    var at = pbanData.at;
                    var role = '??';
                    var dateString = '??';
                    if (rank) {
                        role = getAbbreviationByRank(rank);
                    }
                    if (at) {
                        dateString = getDate(at*1000);
                    }
                    if (!reason) {
                        reason = '??';
                    }
                    if (!byId == 0) {
                        list += `**${userId}** (**${role}**) by **${byId}** at **${dateString}** with reason "*${reason}*"\n`;
                    } else {
                        list += `**${userId}** (**${role}**) by **??** at **${dateString}** with reason "*${reason}*"\n`;
                    }
                    cardsProcessed ++;
                    if (cardsProcessed === array.length) {
                        resolve(list);
                    }
                }, 100);
            });
        }
    );
}

function checkUpdates(guild) {
    return new Promise(
        resolve => {
            checkLastPromotions(guild);
            checkQOTD(guild);
            checkMTJoinRequests(guild);
            resolve(null);
        }
    );
}


client.on('message', async (message) => {
    if (message.author.bot) {
        return;
    }
    var args = message.content.split(/[ ]+/);
    var command = args[0].substring(1, args[0].length);
    var member = message.member;
    var username = args[1] || member.nickname || message.author.username;
    var guild = member.guild;
    var trainingschannel = guild.channels.find(x => x.name === 'trainings');
    var admin_logschannel = guild.channels.find(x => x.name === 'admin_logs');
    var nsadmin_logschannel = guild.channels.find(x => x.name === 'nsadmin_logs');
    var reportschannel = guild.channels.find(x => x.name === 'reports');
    var hrchannel = guild.channels.find(x => x.name === 'hr');
    var suggestionschannel = guild.channels.find(x => x.name === 'suggestions');
    if (message.content.startsWith(prefix)) {
        if (message.channel == guild.channels.find(x => x.name === 'verify')) {
            message.channel.send('Cannot use commands in this channel.');
            return;
        }
    }
    if (args[1]) {
        try {
            username = await getUsername(username);
        } catch(err) {}
    }
    if (isCommand('amiadmin', message) || isCommand('isadmin', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
        if (args[1]) {
            var member = getMemberByName(username, guild);
            if (member) {
                if (isAdmin(member)) {
                    message.channel.send(getEmbed(command, `Yes, **${username}** is admin.`));
                } else {
                    message.channel.send(getEmbed(command, `No, **${username}** is not admin.`));
                }
            } else {
                message.channel.send(getEmbed(command, `Couldn't find **${username}** in server.`));
            }
        } else {
            if (isAdmin(member)) {
                message.channel.send(getEmbed(command, `Yes, **${username}** is admin!`));
            } else {
                message.channel.send(getEmbed(command, `No, **${username}** is not admin.`));
            };
        }
        return;
    };
    if (isCommand('userid', message) || isCommand('getuserid', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
        if (username) {
            roblox.getIdFromUsername(username)
                .then(id => message.channel.send(getEmbed(command,`**${username}** has userId **${id}**.`)))
                .catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox`)));
        } else {
            message.channel.send('Please enter a username.');
        }
        return;
    }
    if (isCommand('rr', message) || isCommand('rulesregulations', message)) {
        message.channel.send('<https://devforum.roblox.com/t/ns-rules-and-regulations/63617> - Rules & Regulations');
        return;
    }
    if (isCommand('group', message) || isCommand('grouppage', message) || isCommand('grouplink', message)) {
        message.channel.send('<https://www.roblox.com/Groups/group.aspx?gid=1018818> - Group Page');
        return;
    }
    if (isCommand('game', message) || isCommand('gamepage', message)) {
        message.channel.send('<https://www.roblox.com/games/140576204/NS-Games-Universe> - Game Page');
        return;
    }
    if (isCommand('role', message) || isCommand('getrole', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
        if (username) {
            roblox.getIdFromUsername(username)
                .then(id => {
                    roblox.getRankInGroup(groupId, id)
                        .then(rank => {
                            if (rank >= 200) {
                                roblox.getRankNameInGroup(MTgroupId, id)
                                    .then(role => message.channel.send(getEmbed(command, `**${username}** has role **${role}**.`)))
                                    .catch(() => message.channel.send("Couldn't get rank."));
                            } else {
                                roblox.getRankNameInGroup(groupId, id)
                                    .then(role => message.channel.send(getEmbed(command, `**${username}** has role **${role}**.`)))
                                    .catch(() => message.channel.send("Couldn't get rank."));
                            }
                        }).catch(() => message.channel.send("Couldn't get user in the group."));
                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)));
        } else {
            message.channel.send('Please enter a username.');
        }
        return;
    }
    if (isCommand('rank', message) || isCommand('getrank', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
        if (username) {
            roblox.getIdFromUsername(username)
                .then(id => {
                    roblox.getRankInGroup(groupId, id)
                        .then(rank => message.channel.send(getEmbed(command, `**${username}** has rank **${rank}**.`)))
                        .catch(() => message.channel.send("Couldn't get user in the group."));
                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)));
        } else {
            message.channel.send('Please enter a username.');
        }
        return;
    }
    if (isCommand('time', message)) {
        var now = new time.Date();
        if (args[1]) {
            var timezone = await getPlaceFromTimezone(args[1]);
            if (timezone) {
                now.setTimezone(timezone);
            } else {
                message.channel.send(`Unknown Timezone: '**${args[1]}**'`);
                return;
            }
        } else {
            now.setTimezone('right/Europe/Amsterdam');
        }
        var hours = ('0' + now.getHours()).slice(-2);
        var minutes = ('0' + now.getMinutes()).slice(-2);
        var timeString = hours + ":" + minutes;
        message.channel.send(getEmbed('time', timeString));
        return;
    }
    if (isCommand('date', message)) {
        var now = new time.Date();
        if (args[1]) {
            var timezone = await getPlaceFromTimezone(args[1]);
            if (timezone) {
                now.setTimezone(timezone);
            } else {
                message.channel.send(`Unknown Timezone: '**${args[1]}**'`);
                return;
            }
        } else {
            now.setTimezone('right/Europe/Amsterdam');
        }
        message.channel.send(getEmbed('date', now.toString()));
        return;
    }
    if (isCommand('promote', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            var username = args[1];
            var byusername = member.nickname || message.author.username;
            if (username) {
                roblox.getIdFromUsername(username)
                    .then(id => {
                        roblox.getRankInGroup(groupId, id)
                            .then(rank => {
                                if (rank >= maximumRank || rank == 0 || rank == 2) {
                                    message.channel.send(getEmbed(command, `**${username}** is rank **${rank}** and not promotable.`));
                                } else {
                                    if (!admin_logschannel) {
                                        message.channel.send("Couldn't find admin_logs channel.");
                                    } else {
                                        var offset = rank == 1 ? 2 : 1;
                                        roblox.changeRank(groupId, id, offset)
                                            .then(roles => {
                                                admin_logschannel.send(`**${byusername}** promoted **${username}** from **${roles.oldRole.Name}** to **${roles.newRole.Name}**.`);
                                                message.channel.send(getEmbed(command, `Promoted **${username}** from **${roles.oldRole.Name}** to **${roles.newRole.Name}**.`));
                                                var member = getMemberByName(username, guild);
                                                if (member) {
                                                    checkRole(guild, member, roles.newRole.Rank);
                                                }
                                            }).catch(() => message.channel.send('Failed to promote.'));
                                    }
                                }
                            }).catch(() => message.channel.send("Couldn't get user in the group."));
                    }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)));
            } else {
                message.channel.send('Please enter a username.');
            }
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('clearreports', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            if (!reportschannel) {
                message.channel.send("Couldn't find reports channel.");
            } else {
                reportschannel.fetchMessages()
                    .then(messages => {
                        if (messages.size - 1 > 0) {
                            reportschannel.bulkDelete(messages.size - 1)
                                .then(() => {
                                    if (message.channel != reportschannel) {
                                        message.channel.send(getEmbed(command, `Successfully deleted **${messages.size-1}** messages in ${guild.channels.find(x => x.name === 'reports')}.`))
                                    }
                                }).catch(() => message.channel.send('Error deleting the messages!'));
                        } else {
                            message.channel.send('There are no messages to delete in #reports.');
                        }
                    }).catch(() => message.channel.send('Error getting the messages'));
            }
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('suspend', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            var username = args[1];
            var byusername = member.nickname || message.author.username;
            var days = args[2];
            var rankback = (args[3] && args[3].toLowerCase() == 'no') ? 0:1;
            var reason = extractText(message.content, '"');
            if (!username) {
                message.channel.send('Please enter a username.');
                return;
            }
            if (!days) {
                message.channel.send('Please enter an amount of days.');
                return;
            } else {
                days = parseInt(days);
                if (days) {
                    days = Math.round(days);
                    if (days < 1) {
                        message.channel.send('Insufficient amount of days.');
                        return;
                    }
                    if (days > 7) {
                        message.channel.send('Too many days.');
                        return;
                    }
                } else {
                    message.channel.send('Days must be a number.');
                    return;
                }
            }
            if (!reason) {
                message.channel.send('Please enter a reason between *double* quotation marks.');
                return;
            }
            roblox.getIdFromUsername(username)
                .then(id => {
                    roblox.getRankInGroup(groupId, id)
                        .then(rank => {
                            if (rank < 200 && rank != 99 && rank != 103) {
                                if (rank == 2) {
                                    message.channel.send(getEmbed(command, `**${username}** is already suspended.`));
                                } else {
                                    t.get(`/1/lists/${currentSuspensionsListID}/cards`, {}, (err, data) => {
                                        if (err) {
                                            console.log(err.message);
                                            message.channel.send('Try again!');
                                        } else {
                                            var suspended = false;
                                            for (var i in data) {
                                                if (data[i].name == ""+id) {
                                                    suspended = true;
                                                    break;
                                                }
                                            }
                                            if (suspended == true) {
                                                message.channel.send(getEmbed(command, `**${username}** is already suspended.`));
                                            } else {
                                                roblox.getIdFromUsername(byusername)
                                                    .then(byid => {
                                                        if (!admin_logschannel) {
                                                            message.channel.send("Couldn't find admin_logs channel.");
                                                        } else {
                                                            desc = {
                                                                rank:rank,
                                                                rankback:rankback,
                                                                duration:days*86400,
                                                                by:byid,
                                                                reason:reason,
                                                                at:getUnix()
                                                            }
                                                            t.post('/1/cards', {idList:currentSuspensionsListID, name:String(id), desc:JSON.stringify(desc)}, err => {
                                                                if (err) {
                                                                    message.channel.send(getEmbed(command, `Error trying to suspend **${username}**.`));
                                                                } else {
                                                                    if (days > 1 || days < -1) {
                                                                        admin_logschannel.send(`**${username}** was suspended by **${byusername}** for **${days}** days with reason "*${reason}*"`);
                                                                    } else {
                                                                        admin_logschannel.send(`**${username}** was suspended by **${byusername}** for **${days}** day with reason "*${reason}*"`);
                                                                    }
                                                                    message.channel.send(getEmbed(command, `Successfully suspended **${username}**.`));
                                                                    if (rank >= 1) {
                                                                        roblox.setRank(groupId, id, 2)
                                                                            .then(newRole => {
                                                                                var member = getMemberByName(username, guild);
                                                                                if (member) {
                                                                                    checkRole(guild, member, 2);
                                                                                }
                                                                            }).catch(err => {
                                                                            console.log(err);
                                                                            message.channel.send(`Error setting rank of **${username}** to **Suspended**, but suspended anyways.`);
                                                                        });
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${byusername}** doesn't exist on Roblox.`)));
                                            }
                                        }
                                    });
                                }
                            } else {
                                message.channel.send(getEmbed(command, `**${username}** is rank **${rank}** and not suspendable.`));
                            }
                        }).catch(() => message.channel.send("Couldn't get user in the group."));
                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)));
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('unix', message) || isCommand('epoch', message)) {
        message.channel.send(getEmbed(command, getUnix()));
        return;
    }
    if (isCommand('cmds', message) || isCommand('commands', message) || isCommand('help', message)) {
        cmdsEmbeds.forEach(embed => {
            DMmember(member, embed.setTimestamp())
                .catch(() => message.channel.send("Couldn't DM user."));
        });
        return;
    }
    if (isCommand('activities', message) || isCommand('statuses', message)) {
        message.channel.send(getEmbed('Activities', activitiesString));
        return;
    }
    if (isCommand('joindate', message) || isCommand('age', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
        message.channel.send('That command is currently disabled!');
        /* roblox.getIdFromUsername(username)
        .then(id => {
            if (!joindatecache[id]) {
                var url = `https://www.roblox.com/users/${id}/profile`;
                request(url, (error, response, html) => {
                    if (!error) {
                        var found = false;
                        var $ = cheerio.load(html);
                        $('.profile-stats-container').filter(() => {
                            found = true;
                            var data = $(this);
                            var joindate = data.children().first().children().last().text();
                            console.log(joindate);
                            joindatecache[id] = joindate;
                            if (isCommand('joindate', message)) {
                                message.channel.send(getEmbed(command, `**${username}** joined Roblox on **${joindate}**.`));
                            } else {
                                var agedays = getAgeDays(joindate);
                                var who = getPossessionName(username);
                                message.channel.send(getEmbed(command, `${who} Roblox account is **${agedays}** old.`));
                            }
                        });
                        if (found == false) {
                            var who = getPossessionName(username);
                            message.channel.send(getEmbed(command, `Looks like ${who} account is terminated!`));
                        }
                    } else {
                        message.channel.send("Error finding player's profile.")
                    }
                });
            } else {
                if (isCommand('joindate', message)) {
                    message.channel.send(getEmbed(command, `**${username}** joined Roblox on **${joindatecache[id]}**.`));
                } else {
                    var joindate = joindatecache[id];
                    var agedays = getAgeDays(joindate);
                    var who = getPossessionName(username);
                    message.channel.send(getEmbed(command, `${who} Roblox account is **${agedays}** old.`));
                }
            }
        }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`))); */
        return;
    }
    if (isCommand('playerurl', message) || isCommand('userurl', message) || isCommand('url', message)) {
        roblox.getIdFromUsername(username)
            .then(id => message.channel.send(`https://www.roblox.com/users/${id}/profile`))
            .catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)));
        return;
    }
    if (isCommand('ttdt', message) || isCommand('theoretical', message)) {
        message.channel.send('<https://www.roblox.com/games/528038240/Theoretical-Train-Driver-Test-II>	- Theoretical Train Driver Test II');
        return;
    }
    if (isCommand('ptdt', message) || isCommand('pracical', message)) {
        message.channel.send('<https://www.roblox.com/games/496933015/Practical-Train-Driver-Test-II> - Practical Train Driver Test II');
        return;
    }
    if (isCommand('trello', message)) {
        message.channel.send('<https://trello.com/b/PDkRNR6G/project-railrunner-dev-board> - Trello Dev Board');
        return;
    }
    if (isCommand('uw', message) || isCommand('updatesworkplace', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            message.channel.send('<https://www.roblox.com/games/149045435/UTASD-Updates-Workplace> - Updates Workplace');
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('isindiscord', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            if (args[1]) {
                roblox.getIdFromUsername(username)
                    .then(id => {
                        var member = getMemberByName(username, guild);
                        if (member) {
                            var name = member.nickname || member.user.username;
                            message.channel.send(compileRichEmbed([{title:command, message:`Yes, **${name}** is in this server`}]));
                        } else {
                            message.channel.send(compileRichEmbed([{title:command, message:`No, **${username}** is not in this server.`}]));
                        }
                    }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${args[1]}** doesn't exist on Roblox.`)));
            } else {
                message.channel.send('Please enter a username.');
            }
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('pban', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            var username = args[1];
            var byusername = member.nickname || message.author.username;
            var reason = extractText(message.content, '"');
            if (!username) {
                message.channel.send('Please enter a username.');
                return;
            }
            if (!reason) {
                message.channel.send('Please enter a reason between *double* quotation marks.');
                return;
            }
            roblox.getIdFromUsername(username)
                .then(id => {
                    roblox.getRankInGroup(groupId, id)
                        .then(rank => {
                            if (rank < 200 && rank != 103 && rank != 99) {
                                t.get(`/1/lists/${bannedListID}/cards`, {}, (err, data) => {
                                    if (err) {
                                        console.log(err.message);
                                        message.channel.send('Try again!');
                                    } else {
                                        var pbanned = false;
                                        for (var i in data) {
                                            if (data[i].name == ""+id) {
                                                pbanned = true;
                                                break;
                                            }
                                        }
                                        if (pbanned == true) {
                                            message.channel.send(getEmbed(command, `**${username}** is already pbanned.`));
                                        } else {
                                            roblox.getIdFromUsername(byusername)
                                                .then(byid => {
                                                    if (!admin_logschannel) {
                                                        message.channel.send("Couldn't find admin_logs channel.");
                                                    } else {
                                                        desc = {
                                                            rank:rank,
                                                            reason:reason,
                                                            by:byid,
                                                            at:getUnix()
                                                        }
                                                        t.post('/1/cards', {idList:bannedListID, name:String(id), desc:JSON.stringify(desc)}, err => {
                                                            if (err) {
                                                                message.channel.send(getEmbed(command, `Error trying to pban **${username}**.`));
                                                            } else {
                                                                admin_logschannel.send(`**${username}** was pbanned by **${byusername}** with reason: "*${reason}*"`);
                                                                message.channel.send(getEmbed(command, `Successfully pbanned **${username}**.`));
                                                            }
                                                        });
                                                    }
                                                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${byusername}** doesn't exist on Roblox.`)));
                                        }
                                    }
                                });
                            } else {
                                message.channel.send(getEmbed(command, `**${username}** is rank **${rank}** and not pbannable.`));
                            }
                        }).catch(() => message.channel.send("Couldn't get user in the group."));
                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)));
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('docs', message) || isCommand('hrdocs', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            if (message.channel == hrchannel) {
                message.channel.send(`<${process.env.TP_DOC}> - Training Protocols`);
                message.channel.send(`<${process.env.TL_DOC}g> - Training Logs`);
                message.channel.send(`<${process.env.MS_DOC}> - Malicious Spreadsheets`);
            } else {
                message.channel.send('Wrong channel!');
            }
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('traininglogs', message) || isCommand('tl', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            if (message.channel == hrchannel) {
                message.channel.send(`<${process.env._TL_DOC}> - Training Logs`);
            } else {
                message.channel.send('Wrong channel!');
            }
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('maliciousspreadsheets', message) || isCommand('ms', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            if (message.channel == hrchannel) {
                message.channel.send(`<${process.env.MS_DOC}> - Malicious Spreadsheets`);
            } else {
                message.channel.send('Wrong channel!');
            }
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('trainingprotocols', message) || isCommand('tp', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            if (message.channel == hrchannel) {
                message.channel.send(`<${process.env.TP_DOC}> - Training Protocols`);
            } else {
                message.channel.send('Wrong channel!');
            }
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('reason', message) || isCommand('suspendinfo', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
        var byusername = member.nickname || message.author.username;
        if (username) {
            if (username != byusername) {
                if (!isAdmin(member)) {
                    message.channel.send('Insufficient powers!');
                    return;
                }
            }
            roblox.getIdFromUsername(username)
                .then(id => {
                    roblox.getRankInGroup(groupId, id)
                        .then(rank => {
                            if (rank == 0 || rank == 2) {
                                t.get(`/1/lists/${currentSuspensionsListID}/cards`, {}, (err, data) => {
                                    if (err) {
                                        console.log(err.message);
                                        message.channel.send('Try again!');
                                    } else {
                                        var found = false;
                                        for (var i in data) {
                                            if (data[i].name == String(id)) {
                                                found = true;
                                                var desc = JSON.parse(data[i].desc);
                                                var duration;
                                                if (desc.duration/86400 == 1) {
                                                    duration = desc.duration/86400 + ' day';
                                                } else {
                                                    duration = desc.duration/86400 + ' days';
                                                }
                                                if (username == byusername) {
                                                    message.channel.send(compileRichEmbed([{title:"You're suspended for", message:duration}, {title:'Reason', message:`*"${desc.reason}"*`}]));
                                                } else {
                                                    message.channel.send(compileRichEmbed([{title:`${username} is suspended for`, message:duration}, {title:'Reason', message:`*"${desc.reason}"*`}]));
                                                }
                                                break;
                                            }
                                        }
                                        if (!found) {
                                            message.channel.send("Couldn't find suspension!");
                                        }
                                    }
                                });
                            } else {
                                if (username == byusername) {
                                    message.channel.send(`You're rank **${rank}** and not suspended!`);
                                } else {
                                    message.channel.send(`**${username}** is rank **${rank}** and not suspended!`);
                                }
                            }
                        }).catch(() => message.channel.send("Couldn't get user in the group."));
                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)));
        } else {
            message.channel.send('Please enter a username.');
        }
        return;
    }
    if (isCommand('shout', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            var byusername = member.nickname || message.author.username;
            if (args[1] && args[1].toLowerCase() == 'clear') {
                roblox.shout(groupId)
                    .then(() => {
                        message.channel.send('Successfully cleared shout.');
                        admin_logschannel.send(`**${byusername}** cleared the group shout.`)
                    }).catch(err => {
                    message.channel.send("Couldn't clear shout.");
                    console.log(err.message);
                });
                return;
            }
            var content = extractText(message.content, '"');
            if (!content) {
                message.channel.send('Please enter a shout between *double* quotation marks.');
                return;
            }
            if (content.length + 2 + byusername.length > 255) {
                message.channel.send("Can't post shout, it's too long.")
            } else {
                roblox.shout(groupId, content+" ~"+byusername)
                    .then(() => {
                        message.channel.send(compileRichEmbed([{title:'Successfully shouted', message:content}]));
                        admin_logschannel.send(`**${byusername}** posted *"${content}"* to group shout.`)
                    }).catch(err => {
                    message.channel.send("Couldn't post shout.");
                    console.log(err.message);
                });
            }
        } else {
            message.channel.send('Insufficient  powers!');
        }
        return;
    }
    if (isCommand('getshout', message) || isCommand('groupshout', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
        roblox.getShout(groupId)
            .then(shout => {
                if (shout) {
                    message.channel.send(compileRichEmbed([{title:`Current shout by ${shout.author.name}`, message:shout.message}], {timestamp:shout.date}));
                } else {
                    message.channel.send('There currently is no shout.');
                }
            }).catch(err => {
            message.channel.send("Couldn't fetch shout.");
            console.log(err.message);
        });
        return;
    }
    if (isCommand('suggest', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
        var byusername = member.nickname || message.author.username;
        var suggestion = extractText(message.content, '"');
        if (!suggestion) {
            message.channel.send('Please enter a suggestion between *double* quotation marks.');
            return;
        }
        message.channel.send(compileRichEmbed([{title:'Successfully suggested', message:`*"${suggestion}"*`}]));
        suggestionschannel.send(compileRichEmbed([{title:`**${byusername}** suggested`, message:`*"${suggestion}"*`}]).setFooter('Vote using the reactions!'))
            .then(message => {
                message.react('✔')
                    .then(() => message.react('✖'))
                    .catch(() => {});
            }).catch(err => console.log(err.message));
        return;
    }
    if (isCommand('activity', message) || isCommand('status', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            if (args[1] && parseInt(args[1])) {
                var activity = parseInt(args[1]) - 1
                if (activities[activity]) {
                    var status = setActivity(activity);
                    message.channel.send(getEmbed('**Successfully set activity to**', status));
                } else {
                    message.channel.send('No action with that number exists.');
                }
            } else {
                var status = setActivity(getRandomInt(activities.length, currentActivityNumber));
                message.channel.send(getEmbed('**Successfully set activity to**', status));
            }
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('update', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
        var byusername = member.nickname || message.author.username;
        if (args[1] && !isAdmin(member) && username != byusername) {
            message.channel.send('Insufficient powers!');
            return;
        }
        var member = getMemberByName(username, guild);
        if (member) {
            roblox.getIdFromUsername(username)
                .then(id => {
                    roblox.getRankInGroup(groupId, id)
                        .then(rank => {
                            if (rank == 2) {
                                checkRole(guild, member, 2);
                                message.channel.send(`Successfully checked ${getPossessionName(username)} roles.`);
                            } else {
                                isSuspended(username)
                                    .then(suspended => {
                                        if (suspended) {
                                            checkRole(guild, member, 2);
                                            message.channel.send(`Successfully checked ${getPossessionName(username)} roles.`);
                                        } else {
                                            checkRole(guild, member, rank);
                                            message.channel.send(`Successfully checked ${getPossessionName(username)} roles.`);
                                        }
                                    }).catch(() => message.channel.send(`Error while checking if **${username}** is suspended.`));
                            }
                        }).catch(err => message.channel.send(`Couldn't get ${getPossessionName(username)} rank.`));
                }).catch(err => message.channel.send(`Username **${username}** does not exist on Roblox.`));
        } else {
            message.channel.send(`**${username}** is not in this server.`);
        }
        return;
    }
    if (isCommand('suggestqotd', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
        var byusername = member.nickname || message.author.username;
        var qotd = extractText(message.content, '"');
        if (!qotd) {
            message.channel.send('Please enter a QOTD suggestion between *double* quotation marks.');
            return;
        }
        t.post('/1/cards', {idList:suggestedQOTDsListID, name:qotd, desc:byusername}, err => {
            if (!err) {
                message.channel.send(compileRichEmbed([{title:'Successfully suggested QOTD', message:`"*${qotd}*"`}]));
            } else {
                message.channel.send("Couldn't add QOTD suggestion to the Trello board.");
            }
        });
        return;
    }
    if (isCommand('host', message) || isCommand('hosttraining', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            var byusername = member.nickname || message.author.username;
            var type = args[1];
            var dateString = args[2];
            var timeString = args[3];
            var specialnotes = extractText(message.content, '"');
            var role = getRoleByAbbreviation(type);
            if (!role) {
                message.channel.send('Please enter a valid type of training.');
                return;
            }
            if (!dateString) {
                message.channel.send('Please give a date for your training.');
                return;
            } else if (!validDate(dateString)) {
                message.channel.send('Please give a valid date for your training.');
                return;
            }
            if (!timeString) {
                message.channel.send('Please give a time for your training.');
                return;
            } else if (!validTime(timeString)) {
                message.channel.send('Please give a valid time for your training.');
                return;
            }
            var dateInfo = getDateInfo(dateString);
            var timeInfo = getTimeInfo(timeString);
            var dateUnix = getUnix(new Date(dateInfo.year, dateInfo.month - 1, dateInfo.day, timeInfo.hours, timeInfo.minutes));
            var nowUnix = getUnix();
            var afterNow = dateUnix - nowUnix > 0;
            if (!afterNow) {
                message.channel.send("Please give a date and time that's after now.");
                return;
            }
            var trainingData = {
                by:byusername,
                type:type,
                at:getUnix(),
                date:dateUnix,
            }
            if (specialnotes) {
                trainingData.specialnotes = specialnotes;
            }
            var cardsNum = await getCardsNumOnBoard(trainingSchedulerBoardID);
            if (cardsNum || cardsNum == 0) {
                t.post('/1/cards', {name:String(cardsNum + 1), idList:scheduledTrainingsListID, desc:JSON.stringify(trainingData)}, err => {
                    if (!err) {
                        message.channel.send(compileRichEmbed([{title:'Successfully hosted', message:`**${role}** training on **${dateString}** at **${timeString}**.`}, {title:'Training ID:', message:String(cardsNum + 1)}]));
                    } else {
                        message.channel.send("Couldn't post training to Trello.");
                    }
                });
            } else {
                message.channel.send("Couldn't make training ID.");
            }
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('trainings', message) || isCommand('traininginfo', message) || isCommand('training', message) || isCommand('traininglist', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
        t.get(`/1/lists/${scheduledTrainingsListID}/cards`, {}, (err, data) => {
            if (!err) {
                var id = parseInt(args[1]);
                var embed
                if (data.length > 0) {
                    if (!id) {
                        embed = compileRichEmbed();
                    }
                } else {
                    message.channel.send('There are currently no hosted trainings.');
                    return;
                }
                var found = false;
                var string;
                for (var i in data) {
                    if (id) {
                        id = String(id);
                        if (data[i].name == id) {
                            found = true;
                            embed = compileRichEmbed([{title:`Training ID: ${id}`, message:getTrainingSentence(JSON.parse(data[i].desc))}]);
                            break;
                        }
                    } else {
                        if (!string) {
                            string = `${data[i].name}. ` + getTrainingSentence(JSON.parse(data[i].desc));
                        } else {
                            var newString = `${data[i].name}. ` + getTrainingSentence(JSON.parse(data[i].desc));
                            if (string.length + newString.length > 1024) {
                                embed = compileRichEmbed([{title:`Upcoming trainings ${embed.fields.length + 1}`, message:string}], {original:embed})
                                string = null;
                            } else {
                                string = string + `\n${newString}`
                            }
                        }
                    }
                }
                if (string) {
                    embed = compileRichEmbed([{title:`Upcoming trainings ${embed.fields.length + 1}`, message:string}], {original:embed})
                    string = null;
                }
                if (id && !found) {
                    message.channel.send(`Couldn't find info for Training ID **${id}**.`);
                }
                if (embed) {
                    if (!id) {
                        DMmember(member, embed)
                            .catch(() => message.channel.send("Couldn't DM user."));
                    } else {
                        message.channel.send(embed);
                    }
                }
            } else {
                message.channel.send("Couldn't get hosted trainings.");
            }
        });
        return;
    }
    if (isCommand('cancel', message) || isCommand('change', message)) {
        message.channel.send(`This is not a command, please specify if you want to ${command} a **training** or a **suspension**.`);
        return;
    }
    if (isCommand('canceltraining', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            var id = parseInt(args[1]);
            if (id) {
                var reason = extractText(message.content, '"');
                if (!reason) {
                    message.channel.send('Please enter a reason between *double* quotation marks.');
                    return;
                }
                getCardInList(id, scheduledTrainingsListID)
                    .then(card => {
                        if (card) {
                            var byusername = member.nickname || message.author.username;
                            var trainingData = JSON.parse(card.desc);
                            trainingData.cancelled = {
                                by:byusername,
                                at:getUnix(),
                                reason:reason
                            }
                            t.put(`/1/cards/${card.id}`, {idList:cancelledTrainingsListID, desc:JSON.stringify(trainingData)}, err => {
                                if (!err) {
                                    message.channel.send(`Successfully cancelled Training ID **${id}** with reason: "*${reason}*"`);
                                } else {
                                    message.channel.send(`Couldn't cancel Training ID **${id}**.`);
                                }
                            });
                        } else {
                            message.channel.send(`Couldn't find training with ID **${id}**.`);
                        }
                    }).catch(() => message.channel.send(`Error finding card for Training ID **${id}**.`));
            } else {
                message.channel.send('Please enter a Training ID.');
            }
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('announce', message) || isCommand('announcetraining', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            var id = parseInt(args[1]);
            if (id) {
                getCardInList(id, scheduledTrainingsListID)
                    .then(card => {
                        if (card) {
                            var byusername = member.nickname || message.author.username;
                            var trainingData = JSON.parse(card.desc);
                            announceDiscord(getDiscordTrainingAnnouncement(trainingData, guild), trainingschannel)
                                .then(content => message.channel.send(compileRichEmbed([{title:'Successfully announced', message:content}])))
                                .catch(err => {
                                    message.channel.send("Couldn't post announcement.");
                                    console.log(err.message);
                                });
                            announceRoblox(defaultTrainingShout)
                                .then(content => {
                                    message.channel.send(compileRichEmbed([{title:'Successfully shouted', message:content}]));
                                    admin_logschannel.send(`**${byusername}** posted *"${content}"* to group shout.`)
                                }).catch(err => {
                                message.channel.send("Couldn't post shout.");
                                console.log(err.message);
                            });
                        } else {
                            message.channel.send(`Couldn't find training with ID **${id}**.`);
                        }
                    }).catch(() => message.channel.send(`Error finding card for Training ID **${id}**.`));
            } else {
                message.channel.send('Please enter a Training ID.');
            }
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('announcediscord', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            var id = parseInt(args[1]);
            if (id) {
                getCardInList(id, '5a52b61fec92437fecc1e7b1')
                    .then(card => {
                        if (card) {
                            var trainingData = JSON.parse(card.desc);
                            announceDiscord(getDiscordTrainingAnnouncement(trainingData, guild), trainingschannel)
                                .then(content => message.channel.send(compileRichEmbed([{title:'Successfully announced', message:content}])))
                                .catch(err => {
                                    message.channel.send("Couldn't post announcement.");
                                    console.log(err.message);
                                });
                        } else {
                            message.channel.send(`Couldn't find training with ID **${id}**.`);
                        }
                    }).catch(() => message.channel.send(`Error finding card for Training ID **${id}**.`));
            } else {
                message.channel.send('Please enter a Training ID.');
            }
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('announceroblox', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            var id = parseInt(args[1]);
            if (id) {
                getCardInList(id, scheduledTrainingsListID)
                    .then(card => {
                        if (card) {
                            var byusername = member.nickname || message.author.username;
                            announceRoblox(defaultTrainingShout)
                                .then(content => {
                                    message.channel.send(compileRichEmbed([{title:'Successfully shouted', message:content}]));
                                    admin_logschannel.send(`**${byusername}** posted *"${content}"* to group shout.`)
                                }).catch(err => {
                                message.channel.send("Couldn't post shout.");
                                console.log(err.message);
                            });
                        } else {
                            message.channel.send(`Couldn't find training with ID **${id}**.`);
                        }
                    }).catch(() => message.channel.send(`Error finding card for Training ID **${id}**.`));
            } else {
                message.channel.send('Please enter a Training ID.');
            }
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('exampleannouncement', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            var id = parseInt(args[1]);
            if (id) {
                getCardInList(id, scheduledTrainingsListID)
                    .then(card => {
                        if (card) {
                            var trainingData = JSON.parse(card.desc);
                            message.channel.send(compileRichEmbed([{title:`Announcement for Training ID ${id}`, message:getDiscordTrainingAnnouncement(trainingData, guild)}])
                                .setFooter('Please note: Copying and pasting the announcement does NOT copy the layout.'));
                        } else {
                            message.channel.send(`Couldn't find training with ID **${id}**.`);
                        }
                    }).catch(() => message.channel.send(`Error finding card for Training ID **${id}**.`));
            } else {
                message.channel.send('Please enter a Training ID.');
            }
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('exampleshout', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            var id = parseInt(args[1]);
            if (id) {
                getCardInList(id, scheduledTrainingsListID)
                    .then(card => {
                        if (card) {
                            message.channel.send(compileRichEmbed([{title:`Shout for Training ID ${id}`, message:defaultTrainingShout}]));
                        } else {
                            message.channel.send(`Couldn't find training with ID **${id}**.`);
                        }
                    }).catch(() => message.channel.send(`Error finding card for Training ID **${id}**.`));
            } else {
                message.channel.send('Please enter a Training ID.');
            }
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('changetraining', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            var byUsername = member.nickname || message.author.username;
            var id = parseInt(args[1]);
            if (id) {
                var key = args[2]
                if (key && key.indexOf(':') != -1) {
                    key = key.substring(0, key.indexOf(':')).toLowerCase();
                    var changeData = message.content.substring(message.content.indexOf(':') + 1, message.content.length);
                    if (key == 'type' || key == 'date' || key == 'time' || key == 'specialnotes' || key == 'by') {
                        getCardInList(id, scheduledTrainingsListID)
                            .then(card => {
                                if (card) {
                                    var trainingData = JSON.parse(card.desc);
                                    if (trainingData.by == byUsername) {
                                        if (key == 'type') {
                                            if (getRoleByAbbreviation(changeData.toLowerCase())) {
                                                trainingData.type = changeData.toLowerCase();
                                                t.put(`/1/cards/${card.id}`, {desc:JSON.stringify(trainingData)}, err => {
                                                    if (!err) {
                                                        message.channel.send(`Successfully changed Training ID **${id}**'s type to **${changeData.toUpperCase()}**.`);
                                                    } else {
                                                        message.channel.send(`Couldn't change Training ID **${id}**'s type to **${changeData.toUpperCase()}**.`);
                                                    }
                                                });
                                            } else {
                                                message.channel.send(`Role abbreviaton **${changeData}** does not exist.`);
                                            }
                                        } else if (key == 'specialnotes') {
                                            var specialnotes = extractText(changeData, '"');
                                            if (specialnotes) {
                                                trainingData.specialnotes = specialnotes;
                                                t.put(`/1/cards/${card.id}`, {desc:JSON.stringify(trainingData)}, err => {
                                                    if (!err) {
                                                        message.channel.send(`Successfully changed Training ID **${id}**'s specialnotes to "*${specialnotes}*".`);
                                                    } else {
                                                        message.channel.send(`Couldn't change Training ID **${id}**'s specialnotes to "*${specialnotes}*.`);
                                                    }
                                                });
                                            } else {
                                                message.channel.send('Please enter new specialnotes between *double* quotation marks.');
                                            }
                                        } else if (key == 'date') {
                                            if (validDate(changeData)) {
                                                var unix = trainingData.date*1000;
                                                var timeInfo = getTimeInfo(getTime(unix));
                                                var dateInfo = getDateInfo(changeData);
                                                var dateUnix = getUnix(new Date(dateInfo.year, dateInfo.month - 1, dateInfo.day, timeInfo.hours, timeInfo.minutes));
                                                trainingData.date = dateUnix;
                                                t.put(`/1/cards/${card.id}`, {desc:JSON.stringify(trainingData)}, err => {
                                                    if (!err) {
                                                        message.channel.send(`Successfully changed Training ID **${id}**'s date to **${changeData}**.`);
                                                    } else {
                                                        message.channel.send(`Couldn't change Training ID **${id}**'s date to **${changeData}**.`);
                                                    }
                                                });
                                            } else {
                                                message.channel.send('Please enter a valid date.');
                                            }
                                        } else if (key == 'time') {
                                            if (validTime(changeData)) {
                                                var unix = trainingData.date*1000;
                                                var dateInfo = getDateInfo(getDate(unix));
                                                var timeInfo = getTimeInfo(changeData);
                                                var dateUnix = getUnix(new Date(dateInfo.year, dateInfo.month - 1, dateInfo.day, timeInfo.hours, timeInfo.minutes));
                                                trainingData.date = dateUnix;
                                                t.put(`/1/cards/${card.id}`, {desc:JSON.stringify(trainingData)}, err => {
                                                    if (!err) {
                                                        message.channel.send(`Successfully changed Training ID **${id}**'s time to **${changeData}**.`);
                                                    } else {
                                                        message.channel.send(`Couldn't change Training ID **${id}**'s time to **${changeData}**.`);
                                                    }
                                                });
                                            } else {
                                                message.channel.send('Please enter a valid time.');
                                            }
                                        } else if (key == 'by') {
                                            roblox.getIdFromUsername(changeData)
                                                .then(userId => {
                                                    roblox.getRankInGroup(groupId, userId)
                                                        .then(rank => {
                                                            if (rank > 200) {
                                                                trainingData.by = changeData;
                                                                t.put(`/1/cards/${card.id}`, {desc:JSON.stringify(trainingData)}, err => {
                                                                    if (!err) {
                                                                        message.channel.send(`Successfully changed Training ID **${id}**'s host to **${changeData}**.`);
                                                                    } else {
                                                                        message.channel.send(`Couldn't change Training ID **${id}**'s host to **${changeData}**.`);
                                                                    }
                                                                });
                                                            } else {
                                                                message.channel.send(`${getPossessionName(changeData)} rank is too low.`);
                                                            }
                                                        }).catch(() => message.channel.send(`Couldn't get ${getPossessionName(changeData)} rank.`));
                                                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${changeData}** doesn't exist on Roblox.`)));
                                        }
                                    } else {
                                        message.channel.send('You can only change your own trainings.');
                                    }
                                } else {
                                    message.channel.send(`Couldn't find training with ID **${id}**.`);
                                }
                            }).catch(() => message.channel.send(`Error finding card for Training ID **${id}**.`));
                    } else {
                        message.channel.send('That key is not valid.');
                    }
                } else {
                    message.channel.send('Please give the key you want to change.');
                }
            } else {
                message.channel.send('Please enter a Training ID.');
            }
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('finish', message) || isCommand('finishtraining', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            var id = parseInt(args[1]);
            if (id) {
                getCardInList(id, scheduledTrainingsListID)
                    .then(card => {
                        if (card) {
                            var byusername = member.nickname || message.author.username;
                            var trainingData = JSON.parse(card.desc);
                            trainingData.finished = {
                                by:byusername,
                                at:getUnix()
                            }
                            t.put(`/1/cards/${card.id}`, {idList:finishedTrainingsListID, desc:JSON.stringify(trainingData)}, err => {
                                if (!err) {
                                    message.channel.send(`Successfully finished Training ID **${id}**.`);
                                } else {
                                    message.channel.send(`Couldn't finish Training ID **${id}**.`);
                                }
                            });
                        } else {
                            message.channel.send(`Couldn't find training with ID **${id}**.`);
                        }
                    }).catch(() => message.channel.send(`Error finding card for Training ID **${id}**.`));
            } else {
                message.channel.send('Please enter a Training ID.');
            }
        } else {
            message.channel.send('Insufficient powers!');
        }
        return;
    }
    if (isCommand('cancelsuspension', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            var username = args[1];
            var byusername = member.nickname || message.author.username;
            var reason = extractText(message.content, '"');
            if (!username) {
                message.channel.send('Please enter a username.');
                return;
            }
            if (!reason) {
                message.channel.send('Please enter a reason between *double* quotation marks.');
                return;
            }
            roblox.getIdFromUsername(username)
                .then(id => {
                    roblox.getIdFromUsername(byusername)
                        .then(byId => {
                            getCardInList(id, currentSuspensionsListID)
                                .then(card => {
                                    suspensionData = JSON.parse(card.desc);
                                    suspensionData.cancelled = {
                                        by:byId,
                                        at:getUnix(),
                                        reason:reason
                                    }
                                    t.put(`/1/cards/${card.id}`, {idList:doneSuspensionsListID, desc:JSON.stringify(suspensionData)}, err => {
                                        if (!err) {
                                            message.channel.send(`Successfully cancelled **${username}**'s suspension.`);
                                        } else {
                                            message.channel.send(`Couldn't cancel **${username}**'s suspension.`);
                                        }
                                    });
                                }).catch(() => message.channel.send(`Couldn't find suspension of **${username}**.`));
                        }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${byusername}** doesn't exist on Roblox.`)));
                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)));
        } else {
            message.channel.send("Insufficient powers!");
        }
        return;
    }
    if (isCommand('extend', message) || isCommand('extendsuspension', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            var username = args[1];
            var byusername = member.nickname || message.author.username;
            var reason = extractText(message.content, '"');
            if (!username) {
                message.channel.send('Please enter a username.');
                return;
            }
            if (!reason) {
                message.channel.send('Please enter a reason between *double* quotation marks.');
                return;
            }
            roblox.getIdFromUsername(username)
                .then(id => {
                    roblox.getIdFromUsername(byusername)
                        .then(byId => {
                            getCardInList(id, currentSuspensionsListID)
                                .then(card => {
                                    suspensionData = JSON.parse(card.desc);
                                    var days = suspensionData.duration/86400;
                                    if (!suspensionData.extended) {
                                        suspensionData.extended = [];
                                    } else {
                                        suspensionData.extended.forEach(extension => {
                                            days += extension.duration/86400;
                                        });
                                    }
                                    var extension = parseFloat(args[2]);
                                    if (extension) {
                                        extension = Math.round(extension);
                                        if (days + extension < 1) {
                                            message.channel.send('Insufficient amount of days!');
                                            return;
                                        } else if (days + extension > 7) {
                                            message.channel.send('Too many days!');
                                            return;
                                        }
                                        suspensionData.extended.push({
                                            by:byId,
                                            duration:extension*86400,
                                            at:getUnix(),
                                            reason:reason
                                        });
                                        t.put(`/1/cards/${card.id}`, {desc:JSON.stringify(suspensionData)}, err => {
                                            if (!err) {
                                                message.channel.send(`Successfully extended **${username}**'s suspension.`);
                                            } else {
                                                message.channel.send(`Couldn't extend **${username}**'s suspension.`);
                                            }
                                        });
                                    } else {
                                        message.channel.send('Please enter a number amount of days!');
                                    }
                                }).catch(() => message.channel.send(`Couldn't find suspension of **${username}**.`));
                        }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${byusername}** doesn't exist on Roblox.`)));
                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)));
        } else {
            message.channel.send("Insufficient powers!");
        }
        return;
    }
    if (isCommand('changesuspension', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            var username = args[1];
            var byUsername = member.nickname || message.author.username;
            if (username) {
                var key = args[2];
                if (key && key.indexOf(':') != -1) {
                    key = key.substring(0, key.indexOf(':')).toLowerCase();
                    var changeData = message.content.substring(message.content.indexOf(':') + 1, message.content.length);
                    if (key == 'by' || key == 'reason' || key == "rankback") {
                        roblox.getIdFromUsername(username)
                            .then(userId => {
                                roblox.getIdFromUsername(byUsername)
                                    .then(byId => {
                                        getCardInList(userId, currentSuspensionsListID)
                                            .then(card => {
                                                if (card) {
                                                    var suspensionData = JSON.parse(card.desc);
                                                    if (suspensionData.by == byId) {
                                                        if (key == 'by') {
                                                            roblox.getIdFromUsername(changeData)
                                                                .then(newId => {
                                                                    roblox.getRankInGroup(groupId, newId)
                                                                        .then(rank => {
                                                                            if (rank > 200) {
                                                                                suspensionData.by = newId;
                                                                                t.put(`/1/cards/${card.id}`, {desc:JSON.stringify(suspensionData)}, err => {
                                                                                    if (!err) {
                                                                                        message.channel.send(`Successfully changed ${getPossessionName(username)} suspension's suspender to **${changeData}**.`);
                                                                                    } else {
                                                                                        message.channel.send(`Couldn't change ${getPossessionName(username)} suspension's suspender to **${changeData}**.`);
                                                                                    }
                                                                                });
                                                                            } else {
                                                                                message.channel.send(`${getPossessionName(changeData)} rank is too low.`);
                                                                            }
                                                                        }).catch(() => message.channel.send(`Couldn't get ${getPossessionName(changeData)} rank.`));
                                                                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)));
                                                        } else if (key == 'reason') {
                                                            var reason = extractText(changeData, '"');
                                                            if (reason) {
                                                                suspensionData.reason = reason;
                                                                t.put(`/1/cards/${card.id}`, {desc:JSON.stringify(suspensionData)}, err => {
                                                                    if (!err) {
                                                                        message.channel.send(`Successfully changed ${getPossessionName(username)} suspension's reason to "*${reason}*".`);
                                                                    } else {
                                                                        message.channel.send(`Couldn't change ${getPossessionName(username)} suspension's reason to "*${reason}*".`);
                                                                    }
                                                                });
                                                            } else {
                                                                message.channel.send('Please enter new reason between *double* quotation marks.');
                                                            }
                                                        } else if (key == 'rankback') {
                                                            if (changeData.toLowerCase() == 'yes' || changeData.toLowerCase() == 'no') {
                                                                suspensionData.rankback = changeData.toLowerCase() == 'yes' && 1 || 0
                                                                t.put(`/1/cards/${card.id}`, {desc:JSON.stringify(suspensionData)}, err => {
                                                                    if (!err) {
                                                                        message.channel.send(`Successfully changed ${getPossessionName(username)} suspension's rankback to **${changeData.toLowerCase()}**.`);
                                                                    } else {
                                                                        message.channel.send(`Couldn't change ${getPossessionName(username)} suspension's rankback to **${changeData.toLowerCase()}**.`);
                                                                    }
                                                                });
                                                            } else {
                                                                message.channel.send(`**${changeData}** is not a valid value for rankback.`);
                                                            }
                                                        }
                                                    } else {
                                                        message.channel.send('You can only change your own made suspensions.');
                                                    }
                                                } else {
                                                    message.channel.send(`Couldn't find suspension of **${username}**.`);
                                                }
                                            }).catch(() => message.channel.send(`Error finding card for suspension of **${username}**.`));
                                    }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${byUsername}** doesn't exist on Roblox.`)));
                            }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)));
                    } else {
                        message.channel.send('That key is not valid.');
                    }
                } else {
                    message.channel.send('Please give the key you want to change.');
                }
            } else {
                message.channel.send('Please enter a username.');
            }
        } else {
            message.channel.send("Insufficient powers!");
        }
        return;
    }
    if (isCommand('issuspended', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            if (username) {
                isSuspended(username)
                    .then(suspended => {
                        if (suspended) {
                            message.channel.send(`**${username}** is suspended.`);
                        } else {
                            message.channel.send(`**${username}** is not suspended.`);
                        }
                    }).catch(err => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)));
            } else {
                message.channel.send('Please enter a username.');
            }
        } else {
            message.channel.send("Insufficient powers!");
        }
        return;
    }
    if (isCommand('groupcentre', message) || isCommand('gc', message) || isCommand('groupcenter', message)) {
        message.channel.send('<https://www.roblox.com/games/348800431/Group-Center> - Group Centre');
        return;
    }
    if (isCommand('optin', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
        if (hasRole(member, 'No Training Announcements')) {
            member.removeRole(guild.roles.find(x => x.name === 'No Training Announcements'));
            message.channel.send('Successfully opted in.');
        } else {
            message.channel.send("You're already opted in.");
        }
        return;
    }
    if (isCommand('optout', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
        if (!hasRole(member, 'No Training Announcements')) {
            member.addRole(guild.roles.find(x => x.name === 'No Training Announcements'));
            message.channel.send('Successfully opted out.');
        } else {
            message.channel.send("You're already opted out.");
        }
        return;
    }
    if (isCommand('notdutch', message)) {
        logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
        if (!hasRole(member, 'Not Dutch')) {
            member.addRole(guild.roles.find(x => x.name === 'Not Dutch'));
            message.channel.send('Successfully updated roles.');
        } else {
            message.channel.send('You already have the Not Dutch role.');
        }
        return;
    }
    if (isCommand('unpban', message)) {
        if (member.id == '235476265325428736') {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            var username = args[1];
            if (!username) {
                message.channel.send('Please enter a username.');
                return;
            }
            roblox.getIdFromUsername(username)
                .then(id => {
                    getCardInList(id, bannedListID)
                        .then(card => {
                            t.put(`/1/cards/${card.id}`, {idList:unbannedListID}, err => {
                                if (!err) {
                                    message.channel.send(`Successfully unpbanned **${username}**.`);
                                } else {
                                    message.channel.send(`Couldn't unpban **${username}**.`);
                                }
                            });
                        }).catch(() => message.channel.send(`Couldn't find pban of **${username}**.`));
                }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)));
        } else {
            message.channel.send("Insufficient powers!");
        }
        return;
    }
    if (isCommand('pbanlist', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            var cards = await getCardsInList(bannedListID);
            if (cards) {
                var list = await getPbanList(cards);
                var pieces = [];
                var count = 0;
                while (list.length > 1024) {
                    var piece = list.substring(0, 1024);
                    piece = piece.substring(0, piece.lastIndexOf('\n'));
                    list = list.substring(piece.length, list.length);
                    pieces.push(piece);
                }
                pieces.push(list);
                var embeds = [];
                var embedNum = 0;
                var count = 0;
                pieces.forEach(piece => {
                    if (!embeds[embedNum]) {
                        embeds[embedNum] = [];
                    }
                    count ++;
                    embeds[embedNum].push({title:`Part ${count}`, message:piece});
                    if (count%5 == 0) {
                        embedNum ++;
                    }
                });
                embedCount = 0;
                embeds.forEach(embed => {
                    embedCount ++;
                    DMmember(member, compileRichEmbed(embed).setTitle(`Pbanlist (${embedCount})`))
                        .catch(() => message.channel.send("Couldn't DM member."));
                });
            } else {
                message.channel.send("Couldn't get pbanlist.");
            }
        } else {
            message.channel.send("Insufficient powers!");
        }
        return;
    }
    if (isCommand('place', message)) {
        if (args[1]) {
            var timezone = await getPlaceFromTimezone(args[1]);
            if (timezone) {
                message.channel.send(getEmbed('place', timezone));
            } else {
                message.channel.send(`Unknown Timezone: '**${args[1]}**'`);
                return;
            }
        } else {
            message.channel.send('Please enter an abbreviation.');
        }
        return;
    }
    if (isCommand('checkeverything', message)) {
        if (member.id == '235476265325428736') {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            checkUpdates(guild)
                .then(() => message.channel.send('Successfully checked for updates.'));
        } else {
            message.channel.send("Insufficient powers!");
        }
        return;
    }
    if (isCommand('lastupdate', message)) {
        fs.stat('..', (err, stats) => {
            if (!err) {
                message.channel.send(getEmbed('NSadmin was last updated on', stats.mtime));
            } else {
                message.channel.send("Couldn't get file stats.");
            }
        });
        return;
    }
    if (isCommand('discord', message)) {
        message.channel.send('discord.gg/nZE8dXM');
        return;
    }
    if (isCommand('uptime', message)) {
        message.channel.send(getEmbed('NSadmin has been online for', `${getUnix() - startUnix}s`));
        return;
    }

    if (isCommand('isdst', message)) {
        message.channel.send(isDST(new Date().getTime()));
    }

    if (isCommand('isloggedin', message)) {
        roblox.getCurrentUser()
            .then(() => message.channel.send(true))
            .catch(() => message.channel.send(false));
    }

    if (isCommand('pm', message)) {
        if (isAdmin(member)) {
            logCommand(member.nickname || message.author.username, command, message, nsadmin_logschannel);
            var username = args[1];
            if (username) {
                var content = extractText(message.content, '"');
                if (!content) {
                    message.channel.send('Please enter a message between *double* quotation marks.');
                    return;
                }
                roblox.getIdFromUsername(username)
                    .then(id => {
                        roblox.follow(id)
                            .then(() => {
                                roblox.message(id, 'Automatic message', content)
                                    .then(() => message.channel.send(`Succesfully messaged **${username}** "*${content}*".`))
                                    .catch(() => message.channel.send(getEmbed(command, `Couldn't message **${username}**.`)));
                                roblox.unfollow(id)
                                    .then(() => {})
                                    .catch(() => message.channel.send(getEmbed(command, `Couldn't unfollow **${username}**.`)));
                            }).catch(() => message.channel.send(getEmbed(command, `Couldn't follow **${username}**.`)));
                    }).catch(() => message.channel.send(getEmbed(command, `Sorry, but **${username}** doesn't exist on Roblox.`)));
            } else {
                message.channel.send('Please enter a username.');
            }
        } else {
            message.channel.send("Insufficient powers!");
        }
    }
});


setInterval(() => {
    var guild = client.guilds.find(x => x.name === 'NS Roblox');
    if (guild) {
        checkUpdates(guild)
            .then(() => {});
    }
}, checkRate);
