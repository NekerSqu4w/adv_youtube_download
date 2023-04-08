const ytmp3 = require("../adv_youtube_download");
const fs = require("fs");

fs.readFile("./video_list/listA.txt",(err, data) => {
    const url_list = data.toString().replace(/\n/g,"").split(";").filter(str => str.length > 0);

    ytmp3.downloadAudio(url_list,{path: "my_download/",convert_type: "mp3"})
        .then(response => {})
        .catch(err => {console.log(err);})
})