const {JSDOM} = require('jsdom')

async function crawlPage(baseURL, currentURL, pages){
    

    const baseURLObj = new URL(baseURL)
    const currentURLObj = new URL(currentURL)
    if (baseURLObj.hostname !== currentURLObj.hostname){
        return pages
    }

    const normailizedCurrentURL = normalizeURL(currentURL)

    if(pages[normailizedCurrentURL] > 0){
        pages[normailizedCurrentURL]++
        return pages
    }
    pages[normailizedCurrentURL] = 1

    console.log(`Actively crawling: ${currentURL}`)

    try {
    const response = await fetch(currentURL)

    if (response.status > 399) {
        console.log(`error in fetch with status code: ${response.status} on page: ${currentURL}`)
        return pages
    }

    const contentType = response.headers.get("content-type")
    if (!contentType.includes("text/html")) {
        console.log(`non html response, content type: ${contentType} on page: ${currentURL}`)
        return pages
    }

    const htmlBody = await response.text()

    const nextURLs = getURLsFromHTML(htmlBody, baseURL)
    for (nextURL of nextURLs){
        pages = await crawlPage(baseURL, nextURL, pages)
    }
    return pages

} catch (err) {
    console.log(`error in fetch: ${err.message} on page: ${currentURL}`)
}
}





function getURLsFromHTML(htmlBody, baseURL){
    const urls = []
    const dom = new JSDOM(htmlBody)
    const linkElements = dom.window.document.querySelectorAll('a')
    for (const linkElement of linkElements){
        if (linkElement.href.slice(0,1) === '/'){
            //relative URLS
            try {
            const urlObj = new URL(`${baseURL}${linkElement.href}`)
            urls.push(`${baseURL}${linkElement.href}`)
            } catch(err) {
                console.log(`error wiht relative URL: ${err.message}`)
            }
        } else {
            //Absolute URLS
            try {
                const urlObj = new URL(linkElement.href)
        urls.push(linkElement.href)
    } catch(err) {
        console.log(`error wiht absolute URL: ${err.message}`)
    }
    }}
    return urls

}



function normalizeURL(urlString){
    const urlObj = new URL(urlString)
    const hostPath = `${urlObj.hostname}${urlObj.pathname}`
    if (hostPath.length > 0 && hostPath.slice(-1) === '/'){
        return hostPath.slice(0, -1)
    }
    return hostPath
}



module.exports = {
    normalizeURL,
    getURLsFromHTML,
    crawlPage
  }
  