
## Sections
- [Requirements](#requirements)
- [Informations](#informations)
- [Usage](#usage)

## Requirements
**You need this require package to make it work**

- [NodeJS 16.17.0](https://nodejs.org/en) _(Other version was not tested)._
- [ffmpeg n5.1.3](https://ffmpeg.org/download.html) _(Other version was not tested)._

## Informations
Allow you to convert any YouTube video to audio file formats.

**npm install is not supported for the moment..**


## Usage

```js
const ytmp3 = require("adv_youtube_download");

let settings = {
    path: "download/",  // Path of the final output
    convert_type: "mp3" // Final file format
}

let url = "video url"
let url = ["url_1","url_2"] // also supported

ytmp3.downloadAudio(url,settings)
    .then(response => {
        console.log(response);
    })
    .catch(err => {})
```

___

You can also make a script that can download youtube video to audio from an powershell command:
```js
#!/usr/bin/env node
const ytmp3 = require("./adv_youtube_download");

const url = process.argv[2];
const convert_type = process.argv[3] || "mp3"

if(!url) {
    console.error('Please provide a YouTube URL.');
    process.exit(1);
}

ytmp3.downloadAudio(url,{path: "download/",convert_type: convert_type})
    .then(response => {}).catch(err => {})
```

And run your script by using:
```bash
node your_file.js 'youtube link' 'format'
```