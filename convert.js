const fs = require('fs');
const sportsLibPkg = require('@sports-alliance/sports-lib');
const exporterPkg = require('@sports-alliance/sports-lib/lib/events/adapters/exporters/exporter.gpx.js');
const path = require('path');
const DOMParser = require('xmldom').DOMParser;

const folder = process.cwd();
const moveFrom = folder + "/input";
const moveTo = folder + "/output";

const { SportsLib } = sportsLibPkg;
const { EventExporterGPX } = exporterPkg;

let counter = 0;
let subFolderName = 1;

async function convertAll(divideIntoSubFolders = false) {
    // Get the files as an array
    const files = await fs.promises.readdir(moveFrom);
    // Loop them all with the new for...of
    for (const file of files) {
        const toSubFolder = path.join(moveTo, subFolderName.toString());
        // Get the full paths
        const fromPath = path.join(moveFrom, file);
        const toPath = path.join(moveTo, subFolderName.toString(), changeExtension(file, '.gpx'));

        // Stat the file to see if we have a file or dir
        const stat = await fs.promises.stat(fromPath);

        if (stat.isFile() && fromPath.endsWith('.tcx')) {
            counter += 1;
            if (counter % 10 === 0 && counter != 0) {
                subFolderName += 1;
                console.log("------------------ ", subFolderName)
            }
            if (!fs.existsSync(moveTo)) {
                fs.mkdirSync(moveTo);
            }
            if (!fs.existsSync(toSubFolder)) {
                fs.mkdirSync(toSubFolder);
            }
            fromTxcToGpx(fromPath, toPath);
            //console.log("Converted '%s'->'%s'", fromPath, toPath);
        }
        else if (stat.isDirectory())
            console.log("'%s' is a directory.", fromPath);

    }

}

function changeExtension(file, ext) {
    return path.join(path.dirname(file), path.basename(file, path.extname(file)) + ext)
}

function fromTxcToGpx(inputFilePath, outputGpxFilePath) {
    // reads the FIT file into memory
    const inputFile = fs.readFileSync(inputFilePath, { encoding: 'utf8', flag: 'r' });
    if (!inputFile) {
        console.error('Ooops, could not read the inputFile or it does not exists, see details below');
        console.error(JSON.stringify(inputFilePath));
        return;
    }

    SportsLib.importFromTCX((new DOMParser()).parseFromString(inputFile, 'application/xml')).then((event) => {
        // convert to gpx
        const gpxPromise = new EventExporterGPX().getAsString(event);
        gpxPromise.then((gpxString) => {
            // writes the gpx to file
            fs.writeFileSync(outputGpxFilePath, gpxString, (wError) => {
                if (wError) {
                    console.error('Ooops, something went wrong while saving the GPX file, see details below.');
                    console.error(JSON.stringify(wError));
                }
            });
            // all done, celebrate!
            console.log('Converted TXC file to GPX successfully!');
            console.log("Converted '%s'->'%s'", inputFilePath, outputGpxFilePath);
        }).catch((cError) => {
            console.error('Ooops, something went wrong while converting the FIT file, see details below');
            console.error(JSON.stringify(cError));
        });
    });
}

convertAll(true);

