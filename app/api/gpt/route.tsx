import { NextResponse } from "next/server"
import axios from 'axios'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const user_url = body.user_url
        const user_query = body.user_query
        console.log("API received: ")
        console.log(user_url)
        console.log(user_query)

        const response = await axios.post('https://kcui5--chatwithanywebsite-handler-askwithknowledge.modal.run', {
            user_url: user_url,
            user_query: user_query,
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.CHATWITHANYWEBSITE_KEY}`
            },
        })

        console.log("Response received: ")
        console.log(response.data)

        return NextResponse.json({ message: response.data }, { status: 200 })
    } catch(err) {
        console.log("Modal GPT call error: ")
        console.log(err)
        return NextResponse.json({ message: "Error" }, { status: 500 })
    }
}