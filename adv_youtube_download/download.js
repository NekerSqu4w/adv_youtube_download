const ytdl = require('ytdl-core');
const fs = require('fs');

const NodeID3 = require('node-id3');
const {exec} = require("child_process");
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');

//handle download
async function dl_and_convert(videoUrl,settings) {
    const dl_detail = {};
    var temp_id = `.${settings.convert_type}.temp`;
    var to_id = `.${settings.convert_type}`;

    return new Promise(async (resolve, reject) => {
        //convert youtube info and youtube audio to data
        const info = await ytdl.getInfo(videoUrl).catch(err => reject(err));
        const audioStream = await ytdl(videoUrl,{quality: 'highestaudio',filter: 'audioonly'});
        const filename = info.videoDetails.title;

        //write audio file
        var stream = audioStream.pipe(fs.createWriteStream(settings.path + filename + temp_id))

        dl_detail.videoDetails = info.videoDetails;
        dl_detail.savedAs = settings.path + filename + to_id

        stream.on("finish", async () => {
            //convert .webm (.temp) file to mp3
            dl_detail.convertArgsArray = [
                "ffmpeg","-y","-i",
                '"' + path.join(settings.path,filename + temp_id) + '"',
                "-vn","-ar 44100","-ac 2","-ab 192k",
                '"' + path.join(settings.path,filename + "." + settings.convert_type) + '"',
            ];
            dl_detail.convertArgsCmd = dl_detail.convertArgsArray.join(' ');
            exec(`${dl_detail.convertArgsCmd}`,async (err) => {
                if(err) {reject(err);}
                else{
                    //remove temp file
                    fs.unlink(path.join(settings.path,filename + temp_id),() => {})

                    //rewrite mp3 tag after conversion is finished
                    if(settings.convert_type === "mp3") {
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
                        dl_detail.metadata = tags
                    }

                    resolve(dl_detail);
                }
            });
        });
    })
}

/**
 * Download any Youtube video to a folder with any extension
 * @param {Array} videoUrl The url or array of url from the video you wanna get the audio to a file
 * @param {Object} settings The settings used to convert your audio
 *
 * @returns {Object} Return a list of downloaded audio, with some information about, like audio tags if '.mp3' is used.
 * 
 * @example ytmp3.downloadAudio(["https://www.youtube.com/watch?v=8Xsey_hAioU"],{path: "my_download/",convert_type: "mp3"})
 */
async function download(videoUrl,settings) {
    let RETURN_INFO = {};
    RETURN_INFO.settings = settings;
    settings = settings || {};
    settings.path = settings.path || "";
    settings.convert_type = settings.convert_type || "mp3";

    RETURN_INFO.converted_file = [];

    return new Promise(async (resolve, reject) => {
        if(typeof(videoUrl) === "string") {
            await dl_and_convert(videoUrl,settings)
                .then(detail => {
                    RETURN_INFO.converted_file.push(detail);
                })
                .catch(err => reject(err));
        }
        else if(typeof(videoUrl === "object")) {
            for(const key in videoUrl) {
                const url = videoUrl[key];
                await dl_and_convert(url,settings)
                    .then(detail => {
                        RETURN_INFO.converted_file.push(detail);
                    })
                    .catch(err => reject(err));
            }
        }
        resolve(RETURN_INFO);
    });
}

module.exports.downloadAudio = download