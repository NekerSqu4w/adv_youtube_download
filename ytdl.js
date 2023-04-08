#!/usr/bin/env node
const ytmp3 = require("./adv_youtube_download");

//dl audio using cmd
//to use node ytdl.js yt_url
const url = process.argv[2];
const convert_type = process.argv[3] || "mp3"

if(!url) {
    console.error('Please provide a YouTube URL.');
    process.exit(1);
}

ytmp3.downloadAudio(url,{path: "my_download/",convert_type: convert_type})
    .then(response => {
        console.log(response);
    })
    .catch(err => {
        console.log(err);
    })
