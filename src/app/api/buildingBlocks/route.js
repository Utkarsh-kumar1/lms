
import { getToken } from 'next-auth/jwt';
import ApiResponse from '@/helpers/ApiResponse';
import { db } from "@/db/drizzle";
import { tasks } from "@/db/schema";
import { and, eq, lte, ne } from "drizzle-orm";

export async function GET() {

    const secret = process.env.JWT_SECRET;
    // const token = await getToken({ req, secret });
    // if (!token) {
    //     return Response.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
    // }
    // const searchParams = req.nextUrl.searchParams
    // const date = searchParams.get('date')


    try {
        // const today = new Date().toISOString().split("T")[0];
        const data = await db
        .select()
        .from(tasks)
        .where(and(ne(tasks.status, "Completed"), lte(tasks.dueDate, new Date())));

        return Response.json(ApiResponse.success(200, data, "Data fetched successfully"), { status: 200 });
    } catch (error) {
        console.error(error);

        return Response.json(ApiResponse.error(500, "Error while fetching the data"), { status: 200 });
    }
}


// export async function PATCH(req) {
//     const secret = process.env.JWT_SECRET;
//     const token = await getToken({ req, secret });
//     const { status, id } = await req.json();

//     if (!token) {
//         return Response.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
//     }

//     if (status == null) {
//         return Response.json(ApiResponse.error(400, "status is required"), { status: 400 });

//     }

//     try {
//         const updateResponse = await db
//             .update(dailyActivitiesScheduled)
//             .set({ isCompleted: status ? true : false })
//             .where(
//                 and(
//                     eq(dailyActivitiesScheduled.id, id),
//                     eq(dailyActivitiesScheduled.owner, token.id)
//                 )
//             )

//         return Response.json({ status: 200, message: "Update successful" });

//     } catch (error) {


//         return Response.json(ApiResponse.error(500, "Error while updating Activity "), { status: 500 })

//     }

// }




