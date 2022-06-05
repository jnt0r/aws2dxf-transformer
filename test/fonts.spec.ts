import fs from "fs";
import nock from "nock";
import {getFont} from "../src/getFont";
import {loadSync} from "opentype.js";

function deleteFileIfExists(path: string) {
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
        console.log('Delete file ' + path)
    }
}

const meridienOneFont = loadSync('test_resources/fonts/Meridien_One.ttf');

describe('getFont', () => {

    beforeEach(() => {
        deleteFileIfExists('test_resources/fonts/name_of_the_font.ttf');
        jest.resetAllMocks();
        nock.cleanAll();
    });

    afterEach(() => {
        deleteFileIfExists('test_resources/fonts/name_of_the_font.ttf');
        nock.cleanAll();
    });

    it('should download font when font does not exist in fonts folder', async () => {
        expect(fs.existsSync('test_resources/fonts/name_of_the_font.ttf')).toBeFalsy();

        const requestScope = nock('https://example.org').get("/name_of_the_font.ttf").replyWithFile(200, 'test_resources/fonts/Meridien_One.ttf', {"Content-Type": "image"});

        const fontResponse = await getFont('https://example.org/name_of_the_font.ttf', 'test_resources/fonts/name_of_the_font.ttf');

        expect(requestScope.isDone()).toBeTruthy();
        expect(fontResponse).toEqual(meridienOneFont);
        expect(fs.existsSync('test_resources/fonts/name_of_the_font.ttf'));
    });

    it('should load font from fonts folder when exists', () => {
        expect(fs.existsSync('test_resources/fonts/Meridien_One.ttf')).toBeTruthy()

        const fontResponse = getFont('SOME_URL', 'test_resources/fonts/Meridien_One.ttf');

        expect(fontResponse).resolves.toEqual(meridienOneFont);
    });
});
