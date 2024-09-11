import kleur from "kleur"
import { download_love, get_download_urls, all_platforms } from "../dist/index.js";
import { unlink, rm } from "fs/promises";


const temp = "./temp";

// the most rudimentary tests possible

const test = async (title, test_fn) => {
    console.log(kleur.bgGreen(" TEST "), kleur.underline(title), "\n");
    const result = await test_fn();
    console.log(kleur.bgYellow("RESULT"), result);
    console.log("...", kleur.underline("Done\n"));
}

for (let platform of all_platforms) {
    await test(`get_download_urls for love 11.5, ${platform} platform`, () => get_download_urls("11.5", [platform]));
}

await test("Defaults to downloading current platform", () => download_love(temp, "11.5"));

await test ("Download for all platforms", () => download_love(temp, "11.5", all_platforms))

console.log(kleur.gray("Cleaning up..."))
try {
    await rm(temp, { 
        recursive: true,
        force: true,
    })
    console.log(kleur.bgGreen("Tests Complete"))
}
catch (ex) {
    console.error(ex);
}