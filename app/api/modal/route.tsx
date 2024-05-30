import { NextResponse } from "next/server"
import axios from 'axios'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const user_url = body.user_url
        console.log("API received")
        console.log(user_url)

        const response = await axios.post('https://kcui5--handler-py-addwebsitetoknowledge-dev.modal.run', {
            user_url: user_url,
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.CHATWITHANYWEBSITE_KEY}`,
            },
        })
        console.log("Received status: ")
        console.log(response.data)
        if (response.data !== "Success") {
            console.log("Error adding to knowledge base")
            return NextResponse.json({ status: response.data }, { status: 500 })
        }
        return NextResponse.json({ status: response.data }, { status: 200 })
    } catch(err) {
        console.log("Error when adding website to knowledge base: ")
        console.log(err)
        return NextResponse.json({ status: 'Error' }, { status: 500 })
    }
}