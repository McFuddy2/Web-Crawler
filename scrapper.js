const { default: axios } = require("axios");
const cheerio = require("cheerio");

async function scrapeSpell(spellName) {
	try {
		console.log(`I am scraping for ${spellName}`);

		//construct the website URL
		if (!spellName) {
			console.error("spellName is null or undefined");
			return null;
		}

		const currentSiteToScrape = "http://dnd5e.wikidot.com/spell:";
        let formattedSpellName = spellName.toLowerCase().replace(/\s/g, "-");

        // Remove apostrophes if present in the spellName
        formattedSpellName = formattedSpellName.replace(/'/g, '');
        formattedSpellName = formattedSpellName.replace(/\//g, ' ');
        

        const website = currentSiteToScrape + formattedSpellName;

		// fetch HTML content of the site
		const response = await axios.get(website);
		
        
        
        if (response.status === 200){
            const html = response.data;

		const $ = cheerio.load(html);

		// Extract source, school, and level
        const source = $("p").eq(0).text().split(":")[1].trim();
        let schoolAndLevel = $("p").eq(1).text().split(" ");
        let school = "";
        let level = "";
        let ritual = false;

        // Check if the last element contains the "(ritual)" tag
        if (schoolAndLevel[schoolAndLevel.length - 1].includes("(ritual)")) {
            ritual = true;
            // Remove the "(ritual)" tag from the last element
            schoolAndLevel[schoolAndLevel.length - 1] = schoolAndLevel[schoolAndLevel.length - 1].replace("(ritual)", "").trim();
        }

        if (schoolAndLevel.includes("cantrip")) {
            // Cantrip follows the format: school cantrip
            school = schoolAndLevel[0];
            level = "cantrip";
        } else {
            // Other spells follow the format: levelOfSpell school
            level = schoolAndLevel[0];
            school = schoolAndLevel.slice(1).join(" ");
        }




		// Extract casting time using regular expression
		const castingTimeRegex = /<strong>Casting Time:<\/strong>\s*([^<]+)/;
		const castingTimeMatch = html.match(castingTimeRegex);
		const castingTime = castingTimeMatch ? castingTimeMatch[1].trim() : "";

		// Extract range using regular expression
		const rangeRegex = /<strong>Range:<\/strong>\s*([^<]+)/;
		const rangeMatch = html.match(rangeRegex);
		const range = rangeMatch ? rangeMatch[1].trim() : "";

		// Extract components using regular expression
		const componentsRegex = /<strong>Components:<\/strong>\s*([^<]+)/;
		const componentsMatch = html.match(componentsRegex);
		const components = componentsMatch ? componentsMatch[1].trim() : "";

		// Regular expression to match the duration, description, and "At Higher Levels" section
		const descriptionRegex =
			/<strong>Duration:<\/strong>\s*([^<]+)\s*<\/p>\s*<p>(.*?)<\/p>(?:\s*<p><strong><em>At Higher Levels.<\/em><\/strong>\s*(.*?)<\/p>)?/;

		// Extract duration, description, and "At Higher Levels" section using the regular expression
		const descriptionMatch = html.match(descriptionRegex);
		let duration = "";
		let description = "";
		let atHigherLevels = "";

		if (descriptionMatch) {
			duration = descriptionMatch[1].trim();
			description = descriptionMatch[2].trim();
			atHigherLevels = descriptionMatch[3] ? descriptionMatch[3].trim() : "";

			// Append the "At Higher Levels" section to the description if it exists
			if (atHigherLevels) {
				description += " At Higher Levels: " + atHigherLevels;
			}
		}

		// Check if the duration contains "Concentration"
		const concentration = duration.toLowerCase().includes("concentration");
		if (concentration) {
			// Remove "Concentration" from the duration
			duration = duration.replace(/concentration,/i, "").trim();
		}




        // Extract spell lists
        const spellLists = [];
        $('strong:contains("Spell Lists")').nextAll('a').each((index, element) => {
            spellLists.push($(element).text().trim());
        });
        // Log the HTML of the element containing spell lists
        console.log($('strong:contains("Spell Lists")').next('p').html());


		// Create and return the spell object
		const spell = {
			spellName,
			source,
			school,
			level,
			castingTime,
			range,
			components,
			duration,
            ritual,
			concentration,
			description,
			spellLists,
		};

		return spell;
    } else if (response.status === 404){
        console.log(`Spell page does not exist for ${spellName}`);
        return null;
    } else {
        console.log(`non 404 error`)
        return null;
    }
	} catch (error) {
		console.error("Error scraping spell:", error);
		return null;
	}
}

module.exports = { scrapeSpell };
