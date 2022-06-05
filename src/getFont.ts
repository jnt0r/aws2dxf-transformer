import opentype, {Font} from "opentype.js";
import fs from "fs";
import https from "https";
import {R_OK} from "constants";

function loadFont(fontPath: string, resolve: (value: Font) => void, reject: (reason?: any) => void) {
    opentype.load(fontPath, function (err, font) {
        if (err != null || font == null) {
            console.error("Font could not be loaded!", err);
            reject("Font could not be loaded! " + err);
        } else {
            console.log("loaded font from path " + fontPath)
            resolve(font);
        }
    });
}

export async function getFont(url: string, fontPath: string): Promise<Font> {
    return new Promise((resolve, reject) =>
        fs.access(fontPath, R_OK, (err) => {
            if (err) {
                const file = fs.createWriteStream(fontPath);

                https.get(url, response => {
                    response.on('error', (error) => {
                        reject(error);
                    });
                    response.pipe(file);

                    // after download completed close filestream
                    file.on("finish", () => {
                        file.close();
                        console.log("Download for font " + fontPath + " completed");

                        loadFont(fontPath, resolve, reject);
                    });
                });
            } else {
                loadFont(fontPath, resolve, reject);
            }
        }));
}
