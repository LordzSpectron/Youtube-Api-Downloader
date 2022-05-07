const express = require('express');
const ytdl = require('ytdl-core');
const app = express();

app.set('json spaces', 2)

app.get('/', (req, res) => {
    res.json({
        status: 'error',
        reason: 'Youtube id not found'
    })
})

app.get('/favicon.ico', (req, res) => {
    res.sendStatus(404)
});

app.get('/:id', (req, res) => {
    var idYout = req.params.id;
    console.log("Coletando informações de: " + idYout)
    try {
        ytdl('https://www.youtube.com/watch?v=' + idYout)
            .on('info', (info) => {
                let formats_info = Object.entries(info.formats).reduce((a, [key, value]) => {
                    mimeType = value.mimeType
                    if (mimeType.includes("video")) {
                        type = "video"
                        quality = value.qualityLabel
                    } else {
                        type = "audio"
                        quality = value.audioQuality
                    }
                    itag = value.itag
                    fps = value.fps
                    extension = value.container
                    length = bytesToSize(value.contentLength)
                    video = value.hasVideo
                    audio = value.hasAudio
                    url = value.url
                    a.formats_info[key] = { type, itag, quality, length, fps, extension, video, audio, url }
                    return a;
                }, { formats_info: {} })
                res.json({
                    id: idYout,
                    name: info.videoDetails.title,
                    length: toTime(info.videoDetails.lengthSeconds),
                    channel: info.videoDetails.author.name,
                    formats: formats_info
                })
            });
    } catch (error) {
        console.log(error)
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Utilizando a porta 3000');
});

function toTime(seconds) {
    var date = new Date(null);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
}

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + '' + sizes[i];
}
