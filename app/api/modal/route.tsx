import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const user_url = body.user_url
        console.log("API received")
        console.log(user_url)
        return NextResponse.json({ message: "response message here" }, { status: 200 })
    } catch(err) {
        console.log("MODAL CALL ERROR")
        return NextResponse.json({ message: 'Error' }, { status: 500 })
    }
}