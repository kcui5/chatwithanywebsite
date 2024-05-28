export default function DynamicPage({ params } : { params: { slug: string[] } }) {
    const slug = params.slug
    console.log(`Received slug ${slug}`)
    return (
      <div>
        <h1>Dynamic Page for: {slug}</h1>
      </div>
    )
}
