const ytdl = require('ytdl-core');
const fs = require('fs');

const NodeID3 = require('node-id3');
const {exec} = require("child_process");
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');

dl_and_convert_audio = (videoUrl,settings) => {
    const dl_detail = {};
    var temp_id = `.${settings.convert_type}.temp`;
    var to_id = `.${settings.convert_type}`;
    var video_identifier = `[${videoUrl.replace("https://www.youtube.com/watch?v=","")}] `

    console.log(video_identifier + "Download starting..");

    return new Promise(async (resolve, reject) => {
        if(!videoUrl.startsWith("https://www.youtube.com/watch?v=")) {reject(videoUrl + " is not valid");};
        //convert youtube info and youtube audio to data
        
        console.log(video_identifier + "Searching video information..");
        const info = await ytdl.getInfo(videoUrl).catch(err => reject);

        if(info.videoDetails) {
            const filename = info.videoDetails.title.replace(/"/g,"_").replace(/'/g,"_");

            console.log(video_identifier + "Downloading video audio..");
            const audioStream = await ytdl(videoUrl,{quality: 'highestaudio',filter: 'audioonly'});

            //write audio file
            console.info(video_identifier + "Writing audio file as '" + (settings.path + filename + temp_id) + "'..");

            //crash for some reason 30/04/2023, this fixed
            const wstream = fs.createWriteStream(settings.path + filename + temp_id);
            var audioData = audioStream.pipe(wstream);
            //


            dl_detail.videoDetails = info.videoDetails;
            dl_detail.savedAs = settings.path + filename + to_id

            audioData.on("finish", async () => {
                //rewrite to mp3 data, because some video as other audio type
                dl_detail.convertArgsArray = [
                    "ffmpeg","-y","-i",
                    '"' + path.join(settings.path,filename + temp_id) + '"',
                    "-vn","-ar 44100","-ac 2","-ab 192k",
                    '"' + path.join(settings.path,filename + "." + settings.convert_type) + '"',
                ];
                dl_detail.convertArgsCmd = dl_detail.convertArgsArray.join(' ');

                console.log(video_identifier + "Converting file.. (Can take several seconds to end)");
                exec(`${dl_detail.convertArgsCmd}`,async (err) => {
                    if(err) {reject(err);}
                    else{
                        //remove temp file
                        console.log(video_identifier + "Removing temp audio file..");
                        fs.unlink(path.join(settings.path,filename + temp_id),() => {})

                        //rewrite mp3 tag after conversion is finished
                        if(settings.convert_type === "mp3") {
                            console.log(video_identifier + "Adding metadata information..");

                            const tags = NodeID3.read(path.join(settings.path,filename + "." + settings.convert_type));
                            const response = await axios.get(info.videoDetails.thumbnails[info.videoDetails.thumbnails.length-1].url,{responseType: 'arraybuffer'});
                            const jpegBuffer = await sharp(response.data, {failOnError: false}).jpeg().toBuffer();

                            tags.title = dl_detail.videoDetails.title
                            tags.artist = dl_detail.videoDetails.author.name
                            tags.image = {
                                mime: "image/jpeg",
                                description: "Back Cover",
                                imageBuffer: jpegBuffer
                            }
                            NodeID3.update(tags, path.join(settings.path,filename + to_id));

                            //fs.writeFile("tags.txt",JSON.stringify(tags,"",4),() => {})
                            dl_detail.metadata = tags
                        }

                        console.log(video_identifier + "Download finished with success !");
                        resolve(dl_detail);
                    }
                });
            });
        }
        else{
            reject(videoUrl + " no video details found..");
        }
    })
}

downloadAudio = (videoUrl,settings) => {
    const RETURN_INFO = {};
    settings = settings || {};
    settings.path = settings.path || "";
    settings.convert_type = settings.convert_type || "mp3";

    RETURN_INFO.converted_file = [];
    RETURN_INFO.settings = settings;

    return new Promise(async (resolve, reject) => {
        if(typeof(videoUrl) === "string") {
            await dl_and_convert_audio(videoUrl,settings)
                .then(detail => {
                    RETURN_INFO.converted_file.push(detail);
                })
                .catch(err => reject);
        }
        else if(typeof(videoUrl === "object")) {
            for(const key in videoUrl) {
                const url = videoUrl[key];
                await dl_and_convert_audio(url,settings)
                    .then(detail => {
                        RETURN_INFO.converted_file.push(detail);
                    })
                    .catch(err => reject);
            }
        }

        console.log("All download has been finished with success !");
        resolve(RETURN_INFO);
    });
}

module.exports.downloadAudio = downloadAudio;
module.exports.version = require('./package.json').version;