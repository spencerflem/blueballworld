const sharp = require('sharp');
const fs = require('fs/promises');
var path = require('path');
var crypto = require('crypto');

module.exports = (eleventyConfig, options) => {

    const spritesheetData = {};
    for (const [spritesheet, settings] of Object.entries(options)) {
        spritesheetData[spritesheet] = genSpritesheet(spritesheet, settings)
    };
    // TODO: this doesnt regen correctly on the dev server

    async function genSpritesheet(spritesheet, settings) {
        const files = await fs.readdir(settings.input);
        if (files.length === 0) {
            return null;
        }
        const data = {};
        let maxWidth = 0;
        let yOffset = 0;
        for (const file of files) {
            const metadata = await sharp(path.join(settings.input, file), { animated: settings.animated }).metadata();
            data[file] = {
                "width": metadata.width,
                "height": metadata.pageHeight ?? metadata.height,
                "pages": metadata.pages,
                "positionX": 0,
                "positionY": yOffset,
            }
            yOffset += metadata.pageHeight ?? metadata.height;
            maxWidth = Math.max(maxWidth, metadata.width * metadata.pages);
        }
        const spritesheetImg = sharp({
            create: {
                width: maxWidth,
                height: yOffset,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
        });
        const buffers = (await Promise.all(Object.entries(data).map(async ([file, metadata]) => {
            const items = [];
            for (let i = 0; i < metadata.pages; i++) {
                items.push({
                    "input": await sharp(path.join(settings.input, file), { page: i }).toBuffer(),
                    "top": metadata.positionY,
                    "left": metadata.positionX + (i * metadata.width)
                });
            }
            return items;
        }))).flat();
        await fs.mkdir(path.join(eleventyConfig.dir.output, settings.output), { recursive: true });
        const outputPng = await spritesheetImg
            .composite(buffers)
            .png({ palette: true })
        const hash = crypto.createHash('md5').update(await outputPng.toBuffer()).digest("hex").substring(0, 8);
        const filename = `${spritesheet}.${hash}.png`;
        await outputPng.toFile(path.join(eleventyConfig.dir.output, settings.output, filename));
        const dataWithSprites = weaveProperty(data, {"spritesheet": filename});
        return dataWithSprites;
    }

    function weaveProperty(obj, extra) {
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, {
            ...v,
            ...extra
        }]));
    }

    eleventyConfig.addShortcode("spritesheetJson", async function (spritesheet) {
        return JSON.stringify(await spritesheetData[spritesheet]);
    });


    eleventyConfig.addFilter("tilesprites", async function (tile) {
        return Object.fromEntries(await Promise.all(Object.entries(tile?.sprites ?? []).map(async ([spritesheet, filename]) => [
            spritesheet,
            (await spritesheetData[spritesheet])[filename]
        ])));
    });

    eleventyConfig.addFilter("sprite", async function (spritesheet, file) {
        return (await spritesheetData[spritesheet])[file]
    });

    eleventyConfig.addFilter("animStyle", async function (sprite, basepath) {
        return `background: url('${basepath}/${sprite.spritesheet}') inherit -${sprite.positionY}px;`;
    });

    eleventyConfig.addFilter("style", async function (sprite, basepath) {
        return `background: url('${basepath}/${sprite.spritesheet}') ${sprite.positionX}px -${sprite.positionY}px; width: ${sprite.width}px; height: ${sprite.height}px;`;
    });
};