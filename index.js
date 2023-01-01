var db = require('croxydb');
var request = require('request');
var parseString = require('xml2js').parseString;
var moment = require('moment');
const { WebhookClient, EmbedBuilder } = require('discord.js');

module.exports = function(id, webhook_url) {
    request('https://www.youtube.com/feeds/videos.xml?channel_id=' + id, function(err, res, body) {
        if (err) return console.log(err);
        parseString(body, function(err, result) {
            if (err) return console.log(err);
            let videoID = result.feed.entry[0].id[0].split(':').pop();
            let getdb_videoID = db.get(`yt_${id}`)?.videoID;
            if (getdb_videoID == videoID) return;
            var data = {
                id: result.feed.entry[0].id[0],
                videoID: videoID,
                title: result.feed.entry[0].title[0],
                link: result.feed.entry[0].link[0].$.href,
                author: result.feed.entry[0].author[0].name[0],
                published: result.feed.entry[0].published[0],
                updated: result.feed.entry[0].updated[0],
                thumbnail: result.feed.entry[0]['media:group'][0]['media:thumbnail'][0].$.url,
                description: result.feed.entry[0]['media:group'][0]['media:description'][0],
                views: result.feed.entry[0]['media:group'][0]['media:community'][0]['media:statistics'][0].$.views,
                check_date: moment().format('DD/MM/YYYY HH:mm:ss')
            };
            db.set(`yt_${id}`, data);
            var embed = new EmbedBuilder()
                .setColor('Random')
                .setTitle(data.title)
                .setURL(data.link)
                .setImage(data.thumbnail)
                .addFields(
                    { name: 'Author', value: data.author, inline: true },
                    { name: 'Published', value: moment(data.published).format('DD/MM/YYYY HH:mm:ss'), inline: true },
                    { name: 'Views', value: data.views, inline: true },
                    { name: 'Description', value: data.description, inline: false },
                )
                .setFooter({ text: "Powered by FastUptime" });
            var webhook = new WebhookClient({ url: webhook_url });
            webhook.send({ embeds: [embed] });
        });
    });
}