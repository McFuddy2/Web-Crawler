const { google } = require("googleapis");
const { scrapeSpell } = require(`./scrapper.js`);
const express = require("express");

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
			range: `Spells!D2:AA550`,
		});

		const spells = metaData.data.values.slice(1).map((row) => ({
			spellName: row[0],
			description: row[1],
			level: row[2],
			range: row[6],
			castingTime: row[7],
			duration: row[9],
			concentration: row[10],
			components: row[11],
			ritual: row[12],
			school: row[13],
			source: row[14],
			artificer: row[15],
			bard: row[16],
			cleric: row[17],
			druid: row[18],
			paladin: row[19],
			ranger: row[20],
			sorcerer: row[21],
			warlock: row[22],
			wizard: row[23],
		}));

		// Filter out spells with empty descriptions
		const spellsToUpdate = spells.filter((spell) => !spell.description);



        // source book abbreviations
        const sourceMap = {
            "Astral Adventures Guide": "AAG",
            "Guildmasters Guide to Ravnica": "GGR",
            "Fizbands Treasury of dragons": "FTD",
            "Strixhaven": "STX",
            "Acquisition Incorporated": "AI",
            "Explorer's Guide to Wildmount": "EGTW",
            "Tashas Cauldren of Everything": "TCE",
            "Player's Handbook": "PHB",
            "Xanathar's Guide to Everything": "XGTE",
            "Xanathar's Guide to Everything/Elemental Evil Player's Companion": "XGTE",
            "Icewind Dale": "IWD",
            "Lost Labratory of Kwalish": "LLOK",
            "Planescape: Adventures in the multiverse": "Plane",
            "Book of Many Things": "BOMT",
            "Elemental Evil Player's Companion": "EE"
        };

		// Iterate over spells with empty descriptions and scrape them
		for (const spell of spellsToUpdate) {
			try {
				const spellInfo = await scrapeSpell(spell.spellName);

				 // Reformat the level
                 let formattedLevel = spellInfo.level.toLowerCase();
                 if (formattedLevel === "cantrip") {
                     formattedLevel = 0;
                 } else {
                     // Extract numeric part from strings like "2nd-level" and convert to integer
                     formattedLevel = parseInt(formattedLevel);
                 }
                 spellInfo.level = formattedLevel; // Update the level with the reformatted value
        
                 spellInfo.ritual = spellInfo.ritual ? 'Yes' : 'No';
                 spellInfo.concentration = spellInfo.concentration ? 'Yes' : 'No';

                 if (spellInfo.source && sourceMap[spellInfo.source]) {
                    spellInfo.source = sourceMap[spellInfo.source];
                }
        

				// Iterate over each class and set the corresponding property in spellInfo
				const classes = ["Artificer", "Bard", "Cleric", "Druid", "Paladin", "Ranger", "Sorcerer", "Warlock", "Wizard"];
				classes.forEach((className) => {
					spellInfo[className.toLowerCase()] = spellInfo.spellLists.includes(className) ? "x" : " ";
				});

				const spellRowToUpdate = spells.find((s) => s.spellName === spell.spellName);
				const rowIndex = metaData.data.values.findIndex((row) => row[0] === spell.spellName) + 2;

				const updateValues = [
					spellInfo.spellName, // Placeholder for column D (skipped)
					spellInfo.description, // Column E
					spellInfo.level, // Column F
					"", // Placeholder for column G (skipped)
					"", // Placeholder for column H (skipped)
					"", // Placeholder for column I (skipped)
					spellInfo.range, // Column J
					spellInfo.castingTime, // Column K
					"", // Placeholder for column L (skipped)
					spellInfo.duration, // Column M
					spellInfo.concentration, // Column N
					spellInfo.components, // Column O
					spellInfo.ritual, // Column P
					spellInfo.school, // Column Q
					spellInfo.source, // Column R
					spellInfo.artificer, // Column S
					spellInfo.bard, // Column T
					spellInfo.cleric, // Column U
					spellInfo.druid, // Column V
					spellInfo.paladin, // Column W
					spellInfo.ranger, // Column X
					spellInfo.sorcerer, // Column Y
					spellInfo.warlock, // Column Z
					spellInfo.wizard, // Column AA
				];

				// Update the spreadsheet using the correct row index
				await googleSheet.spreadsheets.values.update({
					spreadsheetId: spreadsheetId,
					range: `Spells!D${rowIndex}:AA${rowIndex}`, // Use the calculated rowIndex
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

updateSpellDescriptions();
