import {exec} from "child_process";
import * as fs from "fs";

function run(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const ls = exec("node" + " lib/index.js " + args.join(" "), (error, stdout, stderr) => {
            if (error) {
                console.log(error.stack);
                console.log('Error code: ' + error.code);
                console.log('Signal received: ' + error.signal);
                reject(error);
            }
            console.log('Child Process STDOUT: ' + stdout);
            console.log('Child Process STDERR: ' + stderr);
        });

        ls.on('exit', (code) => {
            console.log('Child process exited with exit code ' + code);
            if (code == 0) {
                resolve("" + code);
            } else {
                reject("Process failed with exitCode " + code + " != 0");
            }
        });
    });
}

describe("IntegrationTests", () => {

    beforeAll(() => {
        fs.rm("outputs", {recursive: true, force: false, maxRetries: 0}, err => {
            if (err) console.log(err);
        });

        return new Promise((resolve, reject) => {
            const ls = exec("npm run build", (error, stdout, stderr) => {
                if (error) {
                    console.log(error.stack);
                    console.log('Error code: ' + error.code);
                    console.log('Signal received: ' + error.signal);
                    reject(error);
                }
                console.log('Child Process STDOUT: ' + stdout);
                console.log('Child Process STDERR: ' + stderr);
            });

            ls.on('exit', (code) => {
                console.log('Child process exited with exit code ' + code);
                if (code == 0) {
                    resolve(code);
                } else {
                    reject(code);
                }
            });
        });
    });

    it('should fail when not input path given as argument', () => {
        return expect(run([])).rejects.toEqual("Process failed with exitCode 512 != 0");
    });

    it('should fail when input path is not an svg file or an directory', () => {
        return expect(run(["bla/blub/file.txt"])).rejects.toEqual("Process failed with exitCode 513 != 0");
    });

    it('should generate dxf file when argument is an svg file', async () => {
        await run(["test_resources/test_directory/sub/sarah.svg"]);

        expect(fs.existsSync("outputs/sarah.dxf")).toBeTruthy();
        expect(fs.readFileSync("outputs/sarah.dxf")).toEqual(fs.readFileSync("test_resources/test_directory/Sarah.dxf"));
    });

    it('should generate all dxf files when argument is a directory', async () => {
        await run(["test_resources/test_directory/sub"]);

        expect(fs.existsSync("outputs/sarah.dxf")).toBeTruthy();
        expect(fs.readFileSync("outputs/sarah.dxf")).toEqual(fs.readFileSync("test_resources/test_directory/Sarah.dxf"));
        expect(fs.existsSync("outputs/Peter.dxf")).toBeTruthy();
        expect(fs.readFileSync("outputs/peter.dxf")).toEqual(fs.readFileSync("test_resources/test_directory/Peter.dxf"));
    });
})
