#!/usr/bin/env node
/*
ISC License

Copyright (c) 2019-2020 Vincenzo Tilotta

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/
const fs = require("fs");
const path = require("path"); // Added for path manipulation
const nameDir = process.argv[2];
const currDir = process.cwd();

if (process.argv.length < 3 || !nameDir) {
    console.error('Usage: ./directories2file.js <directory_name>\n  <directory_name>: The directory previously created by file2directories.js.');
    process.exit(1);
}

// Validate nameDir
if (!fs.existsSync(nameDir) || !fs.lstatSync(nameDir).isDirectory()) {
    console.error('Error: Directory not found or is not accessible.');
    console.error('Usage: ./directories2file.js <directory_name>\n  <directory_name>: The directory previously created by file2directories.js.');
    process.exit(1);
}

const readLoopDir = async (currentChunkName, currentPath, accumulatedData) => {
    const newAccumulatedData = `${accumulatedData}/${currentChunkName}`;

    fs.readdir(currentPath, (err, files) => {
        if (err) {
            console.error(`Error reading directory ${currentPath}: ${err.message}`);
            throw err; // Propagate error as original script did
        }

        if (files.length === 0) { // End of the directory chain
            const dataString = newAccumulatedData.substring(1).replace(`${nameDir}/`, '').replace(/\//g, '').replace(/\|/g, '/');
            const buffer = Buffer.from(dataString, 'base64').toString('binary'); // Using Buffer.from()
            const outputFileName = nameDir.replace(/\//g, '');
            
            const CWD = process.cwd(); // Save current CWD
            process.chdir(currDir);

            fs.writeFile(`new_${outputFileName}`, buffer, 'binary', (writeErr) => {
                process.chdir(CWD); // Restore CWD
                if (writeErr) {
                    console.error(`Error writing file new_${outputFileName}: ${writeErr.message}`);
                    throw writeErr;
                }
                console.log(`File new_${outputFileName} successfully created in ${currDir}`);
            });
            return;
        }

        // Expecting a linear chain of directories as created by file2directories.js
        // Each directory should ideally contain only one subdirectory.
        if (files.length > 1) {
            console.warn(`Warning: Directory ${currentPath} contains multiple items: [${files.join(', ')}]. Processing the first valid subdirectory found.`);
        }

        let nextDirFound = false;
        for (const file of files) {
            const nextPath = path.join(currentPath, file);
            if (fs.existsSync(nextPath) && fs.lstatSync(nextPath).isDirectory()) {
                readLoopDir(file, nextPath, newAccumulatedData); // Corrected recursive call
                nextDirFound = true;
                break; // Process only the first directory, assuming linear structure
            }
        }
        if (!nextDirFound && files.length > 0) {
            console.error(`Error: Directory ${currentPath} is not empty but contains no subdirectory to continue the chain. File reconstruction might be incomplete.`);
        }
    });
};

// Initial call: currentChunkName is nameDir, currentPath is nameDir (relative to currDir), accumulatedData is empty
readLoopDir(nameDir, path.resolve(currDir, nameDir), "");
