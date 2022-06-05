import GeneratorValues from "./GeneratorValues";
import fs from "fs";
import {parse, RootNode} from 'svg-parser';

async function getChildElement(parent: Element | RootNode, tagName: string): Promise<Element> {
    return new Promise((resolve, reject) => {
        try {
            // @ts-ignore
            resolve(parent.children.find((value) => value.tagName === tagName));
        } catch (e) {
            reject(e);
        }
    });
}

export default async function readSvgFile(filePath: string): Promise<GeneratorValues> {
    return new Promise((resolve, reject) =>
        fs.readFile(filePath, async (err, data) => {
            if (err) {
                reject("Could not read SVG file: " + err);
                return;
            }

            const svgContent = parse(data.toString());
            // @ts-ignore
            const name = await getChildElement(svgContent, "svg").then(p => getChildElement(p, "g")).then(p => getChildElement(p, "text")).then(p => getChildElement(p, "tspan")).then(p => p.children.find(value => value.type === "text").value).catch(reason => {
                console.log("Fehler beim Extrahieren des Namens!");
                console.log(reason);
                reject("Fehler beim Extrahieren des Namens!");
            });
            // @ts-ignore
            const fontSize: number = await getChildElement(svgContent, "svg").then(p => getChildElement(p, "g")).then(p => getChildElement(p, "text")).then(e => {
                // @ts-ignore
                const fontSize = Number.parseFloat(e.properties['font-size']);
                if (isNaN(fontSize)) {
                    console.log("Schriftgröße ist NaN!")
                    reject("Fehler beim Extrahieren der Schriftgröße!");
                }
                return fontSize;
            }).catch(reason => {
                console.log("Fehler beim Extrahieren der Schriftgröße!");
                console.log(reason);
                reject("Fehler beim Extrahieren der Schriftgröße!");
            })
            // @ts-ignore
            const fontFace: string[] = await getChildElement(svgContent, "svg").then(p => getChildElement(p, "defs")).then(p => getChildElement(p, "style")).then(e => (<string>e.children[0]).match(/@font-face([\n\t ]*){([\n\t ]*)font-family:([\n\t ]*)'([A-z0-9\-]+)';([\n\t ]*)src:([\n\t ]*)url\('([A-z0-9\-:\/.]+)'\);([\n\t ]*)}/)).catch(reason => {
                console.log("Fehler beim Extrahieren der FontUrl!");
                console.log(reason);
                reject("Fehler beim Extrahieren der FontUrl!");
            });

            resolve({name, fontUrl: fontFace[7], fontSize, fontName: fontFace[4]});
        }));
}
