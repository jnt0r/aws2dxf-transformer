const makerjs = require('makerjs');
const fs = require('fs')
const opentype = require('opentype.js');
const https = require('https');

// read inputs
// if input is directory => get all files in directory
// for each .svg file => load file
// check if font already in fonts folder
// if font not in fonts folder => download font
// load font
// generate output

getFont("https://pc-vendor-gallery-prod-eu.s3.amazonaws.com/A1CYBT1LRH6UER/font/2020-01-10/d5f1dc4f-42ef-4e9b-b633-fa192d03f179.ttf", "d5f1dc4f-42ef-4e9b-b633-fa192d03f179.ttf")
    .then((font) => {
        const fontSize = 24.253658536585366;
        const nameValue = 'Sarah';
        var textModel = new makerjs.models.Text(font, nameValue, fontSize, true);

        var svg = makerjs.exporter.toDXF(textModel, { usePOLYLINE: true, fontSize });

        fs.writeFile(nameValue + '.dxf', svg, err => {
            if (err) {
                console.error(err)
                return
            }
            console.log("File written");
        });
    }).catch((err) => {
        console.log(err);
    });

function getFont(url, name) {
    return new Promise((resolve, reject) => {
        const fontPath = "fonts/" + name;
        const file = fs.createWriteStream(fontPath);

        const request = https.get(url, function (response) {
            response.pipe(file);
            // after download completed close filestream
            file.on("finish", () => {
                file.close();
                console.log("Download for font " + name + " completed");
                
                //load a font asynchronously
                opentype.load(fontPath, function (err, font) {
                    if (err) {
                        console.error("Font could not be loaded!", err);
                        reject("Font could not be loaded! " + err);
                    } else {
                        resolve(font);
                    }
                });
            });
        });
    });
}