const {crawlPage} = require(`./crawl.js`)


async function main(){
    if (process.argv.length < 3){
        console.log('No Website Provided')
        process.exit(1)
    } if (process.argv.length > 3){
        console.log('Too many sites!')
        process.exit(2)
    }

    const baseURL = process.argv[2]

    console.log(`Time to crawl on ${baseURL}`)
    const pages = await crawlPage(baseURL, baseURL, {})

    for (const page of Object.entries(pages)){
        console.log(page)
    }

}

main()
