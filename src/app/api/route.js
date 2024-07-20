import pool from "../../lib/dbconnect"

export async function GET(request) {

    try {
        const [data] = await pool.execute('select * from users');
    } catch (error) {
        console.log(error);
    }

    return Response.json(
        {
            // data,
            message: "success"
        },
        {
            status:200
        }
    )
}

// export async function GET() {

//     // const data = await res.json()

//     return Response.json({ data: "hello" })
// }