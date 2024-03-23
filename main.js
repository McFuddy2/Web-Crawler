const { google } = require("googleapis");
const { scrapeSpell } = require(`./scrapper.js`);
const express = require('express');

const app = express();

async function updateSpellDescriptions() {
    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const client = await auth.getClient();

    const googleSheet = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = "1me_peELYXltqZ4BrfVfmhNVed0yZCYtY8JzrNl3rQcI";

    try {
        // Read from sheet
        const metaData = await googleSheet.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: "Spells!A2:AA550",
        });
        
        const spells = metaData.data.values.slice(1).map((row) => ({
            spellName: row[3],
            description: row[4],
            level: row[5],
            range: row[9],
            castingTime: row[10],
            duration: row[12],
            concentration: row[13],
            components: row[14],
            ritual: row[15],
            school: row[16],
            source: row[17],
            artificer: row[18],
            bard: row[19],
            cleric: row[20],
            druid: row[21],
            paladin: row[22],
            ranger: row[23],
            sorcerer: row[24],
            warlock: row[25],
            wizard: row[26],
        }));

        // Filter out spells with empty descriptions
        const spellsToUpdate = spells.filter((spell) => !spell.description);

        // Iterate over spells with empty descriptions and scrape them
        for (const spell of spellsToUpdate) {
            try {
                const spellInfo = await scrapeSpell(spell.spellName);

                // Iterate over each class and set the corresponding property in spellInfo
                const classes = ["Artificer", "Bard", "Cleric", "Druid", "Paladin", "Ranger", "Sorcerer", "Warlock", "Wizard"];
                classes.forEach((className) => {
                    spellInfo[className.toLowerCase()] = spellInfo.spellLists.includes(className) ? "x" : " ";
                });

                const spellRowToUpdate = spells.find((s) => s.spellName === spell.spellName);
                const rowIndex = spells.indexOf(spellRowToUpdate); // Adjust for spreadsheet row index starting from 2
                const updateValues = [
                    '', // Placeholder for column A (skipped)
                    '', // Placeholder for column B (skipped)
                    '', // Placeholder for column C (skipped)
                    spellInfo.spellName,  // Column D
                    spellInfo.description,  // Column E
                    spellInfo.level,  // Column F
                    '', // Placeholder for column G (skipped)
                    '', // Placeholder for column H (skipped)
                    '', // Placeholder for column I (skipped)
                    spellInfo.range,  // Column J
                    spellInfo.castingTime,  // Column K
                    '', // Placeholder for column L (skipped)
                    spellInfo.duration,  // Column M
                    spellInfo.concentration,  // Column N
                    spellInfo.components,  // Column O
                    spellInfo.ritual,  // Column P
                    spellInfo.school,  // Column Q
                    spellInfo.source,  // Column R
                    spellInfo.artificer,  // Column S
                    spellInfo.bard,  // Column T
                    spellInfo.cleric,  // Column U
                    spellInfo.druid,  // Column V
                    spellInfo.paladin,  // Column W
                    spellInfo.ranger,  // Column X
                    spellInfo.sorcerer,  // Column Y
                    spellInfo.warlock,  // Column Z
                    spellInfo.wizard,  // Column AA
                ];
                

                // Update the spreadsheet using the correct row index
                await googleSheet.spreadsheets.values.update({
                    spreadsheetId: spreadsheetId,
                    range: `Spells!B${rowIndex}`, // Use the calculated rowIndex
                    valueInputOption: "USER_ENTERED",
                    requestBody: {
                        values: [updateValues],
                    },
                });
            } catch (error) {
                console.error(`Error updating spell ${spell.spellName}:`, error);
            }
        }

        console.log("Spell descriptions updated successfully.");
    } catch (error) {
        console.error("Error reading spreadsheet data:", error);
        throw error; // Re-throw the error to be caught by the caller
    }
}

app.get("/", async (req, res) => {
    try {
        await updateSpellDescriptions();
        res.send("Spell descriptions updated successfully.");
    } catch (error) {
        console.error("An error occurred while updating spell descriptions:", error);
        res.status(500).send("Internal server error.");
    }
});


updateSpellDescriptions()
