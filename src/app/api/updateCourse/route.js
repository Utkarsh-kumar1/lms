import { getToken } from 'next-auth/jwt';
import ApiResponse from '@/helpers/ApiResponse';
import { db } from '@/db/drizzle';
import { course } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    if (!token) {
        return Response.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
    }
    const {
        newCourseName: courseName,
        id, isActive,
        wantRevision } = await req.json();

    if (!courseName && !id) {
        return Response.json(ApiResponse.error(400, "newCourseName and course Id is requried"), { status: 401 });

    }

    try {
        const user = await db.query.users.findFirst({
            with: {
                subjects: {
                    with: {
                        courses: true
                    },
                }
            },
            where: (user, { eq }) => eq(user.id, token.id)
        })



        if (user || user.subjects.length > 0) {

            let isOwner = false
            let courseData;
            for (const subject of user.subjects) {
                if (subject.courses && subject.courses.length > 0) {
                    isOwner = true;
                    courseData = subject.courses[0]
                    break;
                }
            }

            if (!isOwner) {
                return Response.json(ApiResponse.error(403, "Forbidden"), { status: 403 });
            }


            if (courseData.courseName === courseName) {
                return Response.json(ApiResponse.success("200", null, "Updated Successfully"), { status: 200 })
            }
            await db
                .update(course)
                .set({
                    courseName,
                    wantRevision: wantRevision ?? courseData.wantRevision,
                    isActive: isActive ?? courseData.isActive
                })
                .where(eq(course.id, id));
        }




        return Response.json({ status: 200, message: "Update successful" });

    } catch (error) {



        return Response.json(ApiResponse.error(500, "Error while updating Course "), { status: 500 })

    }

}
