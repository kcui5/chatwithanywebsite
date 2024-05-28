function isValidUrl(url: string): boolean {
  // Checks if the given url is valid
  // Uses regex for any URL that is a base URL, has a subdomain, or a path
  // Taken from freeCodeCamp: https://www.freecodecamp.org/news/how-to-write-a-regular-expression-for-a-url/
  // Modified to require https or http and allow any amount of subpaths, query parameters, hash fragments
  const urlRegex = /^(https?:\/\/)([\w.-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?(?:\?[^\s#]*)?(?:#[^\s]*)?$/;
  return urlRegex.test(url);
}

function isHttpOrHttps(urlHeader: string): boolean {
  return urlHeader === "https%3A" || urlHeader === "http%3A"
}

function getDecodedUrlHeader(url: string): string {
  //Checks if the URL is HTTPS
  if (url === "https%3A") {
    return "https://"
  } else if (url === "http%3A") {
    return "http://"
  }
  return "ERROR"
}

function decodeSlug(slug: string | string[]): string {
  if (Array.isArray(slug)) {
    return slug.map(segment => decodeURIComponent(segment)).join('/')
  }
  return decodeURIComponent(slug);
}

export default function DynamicPage({ params } : { params: { slug: string | string[] } }) {
    const slug = params.slug
    console.log(`Received slug ${slug}`)

    let validSlug: boolean = true
    if (!Array.isArray(slug) || !isHttpOrHttps(slug[0])) {
      validSlug = false
    }

    const urlHeader = getDecodedUrlHeader(slug[0])
    if (urlHeader === "ERROR") {
      validSlug = false
    }
    const decodedSlug = decodeSlug(slug.slice(1))
    const userURL = urlHeader + decodedSlug
    if (!isValidUrl(userURL)) {
      validSlug = false
    }
    console.log(`Decoded slug as: ${userURL}`)
    console.log(`URL is valid: ${validSlug}`)

    return (
      <div>
        <h1>Dynamic Page for : {userURL}</h1>
        <div>{
          !validSlug && <h1>This URL is invalid :&#40;</h1>
        }</div>
      </div>
    )
}
