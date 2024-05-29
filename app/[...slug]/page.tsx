"use client"

import { useEffect, useState } from 'react'

import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import Image from 'next/image'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

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
  //Decodes url header into http or https
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

function invalidPage( url : string | string[] ) {
  return (
    <div>
      <h1>Dynamic Page for : {url}</h1>
      <h1>This URL is invalid :&#40;</h1>
    </div>
  )
}

const formSchema = z.object({
  message: z.string().max(5000),
})

export default function DynamicPage({ params } : { params: { slug: string | string[] } }) {
  const [fullPageLoading, setFullPageLoading] = useState(true)
  const [fileID, setFileID] = useState('')
  const [gptResponse, setGptResponse] = useState('')
  const [responseLoading, setResponseLoading] = useState(false)

  const slug = params.slug

  let validSlug: boolean = true
  if (!Array.isArray(slug) || !isHttpOrHttps(slug[0])) {
    validSlug = false
    return invalidPage(slug)
  }

  const urlHeader = getDecodedUrlHeader(slug[0])
  if (urlHeader === "ERROR") {
    validSlug = false
    return invalidPage(slug)
  }
  const decodedSlug = decodeSlug(slug.slice(1))
  const userURL = urlHeader + decodedSlug
  if (!isValidUrl(userURL)) {
    validSlug = false
    return invalidPage(slug)
  }

  useEffect(() => {
    // Fetch data from the server-side API
    async function fetchData() {
      try {
        const res = await fetch('/api/modal', {
          method: 'POST',
          body: JSON.stringify({
            user_url: userURL,
          })
        })
        const data = await res.json()
        setFileID(data.fileID)
        setFullPageLoading(false)
      } catch (error) {
        console.error('Error:', error)
        return invalidPage(userURL)
      }
    }

    fetchData()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const msg = values.message
    
    try {
      setResponseLoading(true)
      const res = await fetch('/api/gpt', {
        method: 'POST',
        body: JSON.stringify({
          user_url: userURL,
          user_query: msg,
        })
      })
      const data = await res.json()
      setGptResponse(data.message)
      setResponseLoading(false)
    } catch(err) {
      setGptResponse('Error')
    }    
  }

  return (
    <div>
      <div className="p-10">
        <h1 className="pb-2 text-2xl">Ask: {userURL}</h1>

        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ask GPT:</FormLabel>
                <FormControl>
                  <Textarea className="" placeholder="Ask me..." {...field} />
                </FormControl>
                <FormDescription>
                  Chat with the website.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
          <div>{
            // Taken from https://tenor.com/view/kakaotalk-emoticon-ompangie-pentol-buffering-gif-18260464
            // @kueape on tenor.com
            responseLoading && <Image src="/kakaotalk-emoticon.gif" alt="Loading..." width="72" height="72" className="pl-2"/>
          }</div>
        </form>
        </Form>
      </div>
    </div>
  )
}
