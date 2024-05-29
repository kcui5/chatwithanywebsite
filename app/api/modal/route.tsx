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
        })

        console.log(response.data)

        return NextResponse.json({ fileID: response.data }, { status: 200 })
    } catch(err) {
        console.log("MODAL CALL ERROR")
        console.log(err)
        return NextResponse.json({ message: 'Error' }, { status: 500 })
    }
}