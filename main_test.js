const ytmp3 = require("./adv_youtube_download");

ytmp3.downloadAudio("https://www.youtube.com/watch?v=8Xsey_hAioU",{path: "my_download/",convert_type: "mp3"})
    .then(response => {
        console.log(response);
    })
    .catch(err => {
        console.log(err);
    })

//loop
//prevent script from stopping execution
setInterval(function() {
},1000);