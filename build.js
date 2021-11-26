const { promises: fs } = require("fs")
const path = require("path")
const sharp = require("sharp")
const sqip = require('sqip').default

main()

async function main() {

    let imagesFolder = path.join(__dirname, "src/assets")
    let outputFolder = path.join(__dirname, "_site/assets")

    // guarantee we have output dir
    await fs.mkdir(outputFolder, { recursive: true });

    // read paths in input dir
    let imagePaths = await fs.readdir(imagesFolder)

    // async loop through all paths
    await Promise.all(imagePaths.map(async(fileName) => {
        try {

            // build file paths
            let filePath = path.join(imagesFolder, fileName)
            let outputPath = path.join(outputFolder, fileName)

            // copy raw image
            await fs.copyFile(filePath, outputPath);

            // generate next gen image
            let outputExt = outputPath.substr(0, outputPath.lastIndexOf(".")) + ".webp";
            await sharp(filePath)
                .toFormat('webp')
                .toFile(outputExt);

            // generate low res version
            let sqipResults = await sqip({
                input: filePath,
                plugins: [{
                    name: 'sqip-plugin-primitive',
                    options: {
                        numberOfPrimitives: 80,
                        mode: 8,
                    },
                }],
            })

            let lowRestExt = outputPath.substr(0, outputPath.lastIndexOf(".")) + ".svg";
            await fs.writeFile(lowRestExt, sqipResults.content, 'utf8')


        } catch (error) {
            console.log(error, filePath)
        }

    }));

    // const pluginResults = await sqip({
    //     input: imagesFolder,
    //     output: outputFolder,
    //     plugins: [{
    //         name: 'sqip-plugin-primitive',
    //         options: {
    //             numberOfPrimitives: 8,
    //             mode: 0,
    //         },
    //     }, ],
    // })

}