const ytmp3 = require("../adv_youtube_download");

ytmp3.downloadAudio("https://www.youtube.com/watch?v=pcnxkUbtJcE",{path: "",convert_type: "mp3"})
    .then(response => {
        console.log(response);
    })
    .catch(err => {})