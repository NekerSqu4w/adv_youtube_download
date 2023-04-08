const ytmp3 = require("../adv_youtube_download");

ytmp3.downloadAudio(["https://www.youtube.com/watch?v=pcnxkUbtJcE","https://www.youtube.com/watch?v=jPoZrKPHE0w"],{path: "",convert_type: "mp3"})
    .then(response => {})
    .catch(err => {})