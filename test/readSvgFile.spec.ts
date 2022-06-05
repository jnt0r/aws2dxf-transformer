import readSvgFile from "../src/readSvgFile";
import * as fs from "fs";

describe('readSvgFile', () => {

    it('should read and return correct values', async () => {
        expect(fs.existsSync('test_resources/test_directory/sub/sarah.svg')).toBeTruthy();

        const actual = await readSvgFile('test_resources/test_directory/sub/sarah.svg');

        expect(actual).toEqual({
            name: "Sarah",
            fontUrl: "https://pc-vendor-gallery-prod-eu.s3.amazonaws.com/A1CYBT1LRH6UER/font/2020-01-10/d5f1dc4f-42ef-4e9b-b633-fa192d03f179.ttf",
            fontSize: 24.253658536585366,
            fontName: 'font-ea192986-10ce-44b2-a010-12',
        });
    });

    it('should fail if font-face is missing', () => {
        return expect(readSvgFile('test_resources/test_directory/invalid.svg')).rejects.toEqual("Fehler beim Extrahieren der FontUrl!")
    });

    it('should fail if tspan is missing', () => {
        return expect(readSvgFile('test_resources/test_directory/invalid_2.svg')).rejects.toEqual("Fehler beim Extrahieren des Namens!")
    });

    it('should fail if font-size is missing', () => {
        return expect(readSvgFile('test_resources/test_directory/invalid_3.svg')).rejects.toEqual("Fehler beim Extrahieren der Schriftgröße!")
    });
});
