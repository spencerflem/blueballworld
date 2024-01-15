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
        const dataWithSprites = weaveProperty(data, { "spritesheet": filename });
        return dataWithSprites;
    }

    function weaveProperty(obj, extra) {
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, {
            ...v,
            ...extra
        }]));
    }

    function variantToSpritesheet(variant) {
        switch (variant) {
            case "blueballmachine": return ("blueballmachine");
            case "open": return ("openfragments");
            case "closed": return ("closedfragments");
            case "underconstruction": return ("underconstructionfragments");
        }
    }

    eleventyConfig.addShortcode("spritesheetJson", async function (spritesheet) {
        return JSON.stringify(await spritesheetData[spritesheet]);
    });

    eleventyConfig.addFilter("withvariant", async function (tile, variant) {
        tile["spritesheetName"] = variantToSpritesheet(variant);
        return tile;
    });

    eleventyConfig.addFilter("tilesprite", async function (tile) {
        return (await spritesheetData[tile.spritesheetName])[tile.sprites[tile.spritesheetName]];
    });

    eleventyConfig.addFilter("fragmentsprites", async function (tile, fragments) {
        const data = (await spritesheetData[tile.spritesheetName]);
        return tile.fragments.map(row => row.map(ids => ids.map(id => {
            return data[fragments[id].sprites[tile.spritesheetName]];
        })));
    });

    eleventyConfig.addFilter("sprite", async function (spritesheet, file) {
        return (await spritesheetData[spritesheet])[file]
    });

    eleventyConfig.addFilter("spritestyle", async function (sprite, basepath) {
        return `background: url('${basepath}/${sprite.spritesheet}') ${sprite.positionX}px -${sprite.positionY}px; width: ${sprite.width}px; height: ${sprite.height}px;`;
    });

    eleventyConfig.addFilter("appendStartingSet", (overrides) => {
        for (let y = -11; y <= 11; y++) {
            for (let x = -11; x <= 11; x++) {
                overrides[y] = overrides[y] ?? [];
                overrides[y][x] = overrides[y][x] ?? {
                    "type": "fragment",
                    "variant": "open"
                }
            }
        }
        return overrides;
    });

    eleventyConfig.addFilter("defaultTile", (variant, x, y) => {
        return {
            "alt": "alttext",
            "bubble": {
                "variant": variant
            },
            "spritesheetName": variant + "fragments", //todo: translate type to spritesheetNames!
            "fragments": [
                [['up-left'], ['up-left'], ['up-left']],
                [['up-left'], ['up-left'], ['up-left']],
                [['up-left'], ['up-left'], ['up-left']]
            ]
        };
    });
};