export default function defaultTile(x, y, type) {
    return {
        "alt": "alttext",
        "bubble": {
            "type": type
        },
        "variant": type, //todo: translate type to spritesheet/variant!
        "fragments": [
            [['up-left'],['up-left'],['up-left']],
            [['up-left'],['up-left'],['up-left']],
            [['up-left'],['up-left'],['up-left']]
        ]
    }
}