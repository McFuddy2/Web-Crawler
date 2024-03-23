const { default: axios } = require('axios');
const cheerio = require('cheerio');


async function scrapeSpell(spellName) {
    try {
        console.log(`I am scraping for ${spellName}`);
        
        //construct the website URL
        if (!spellName) {
            console.error('spellName is null or undefined');
            return null;
        }

        const currentSiteToScrape = "http://dnd5e.wikidot.com/spell:";
        const website = currentSiteToScrape + spellName.toLowerCase().replace(/\s/g, '-');

        // fetch HTML content of the site
        const response = await axios.get(website);
        const html = response.data;

        const $ = cheerio.load(html);

        // Extract source, school, and level
        const source = $('p').eq(0).text().split(':')[1].trim();
        const schoolAndLevel = $('p').eq(1).text().split(' ');
        const school = schoolAndLevel[0];
        const level = schoolAndLevel.slice(1).join(' ');

        // Extract other details
        const castingTime = $('strong:contains("Casting Time")').next().text().trim();
        const range = $('strong:contains("Range")').next().text().trim();
        const components = $('strong:contains("Components")').next().text().trim();
        const duration = $('strong:contains("Duration")').next().text().trim();
        const description = $('strong:contains("Description")').next().text().trim();

        // Extract spell lists
        const spellLists = [];
        $('strong:contains("Spell Lists")').next().find('a').each((index, element) => {
            spellLists.push($(element).text());
        });

        // Create and return the spell object
        const spell = {
            source,
            school,
            level,
            castingTime,
            range,
            components,
            duration,
            description,
            spellLists
        };

        return spell;
    } catch (error) {
        console.error('Error scraping spell:', error);
        return null;
    }
}


module.exports = { scrapeSpell };

