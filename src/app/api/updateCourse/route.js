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
        wantRevision,
        spaceRepetition,
        activityScheduleCount } = await req.json();

    console.log(courseName,
        id, isActive,
        wantRevision,
        spaceRepetition,
        activityScheduleCount);


    if (!courseName && !id) {
        return Response.json(ApiResponse.error(400, "newCourseName and course Id is requried"), { status: 401 });
    }
    if (spaceRepetition != null && !Array.isArray(spaceRepetition)) {
        return Response.json(ApiResponse.error(400, "spaceRepetation should be an array"), { status: 400 });
    }

    try {
        const user = await db.query.users.findFirst({
            with: {
                subjects: {
                    with: {
                        courses: {
                            where: (mycourse, { eq }) => eq(mycourse.id, id)
                        }
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



            if (courseData.isActive === isActive && courseData.wantRevision === wantRevision && courseData.courseName === courseName && JSON.stringify(courseData.spaceRepetition) === JSON.stringify(spaceRepetition) && courseData.activityScheduleCount === activityScheduleCount) {
                return Response.json(ApiResponse.success("200", null, "Updated Successfully"), { status: 200 })
            }

            await db
                .update(course)
                .set({
                    courseName,
                    wantRevision: wantRevision ?? courseData.wantRevision,
                    isActive: isActive ?? courseData.isActive,
                    spaceRepetition: spaceRepetition ?? courseData.spaceRepetition,
                    activityScheduleCount: activityScheduleCount ?? courseData.activityScheduleCount,
                })
                .where(eq(course.id, id));
        }



        return Response.json({ status: 200, message: "Update successful" });

    } catch (error) {


        return Response.json(ApiResponse.error(500, "Error while updating Course "), { status: 500 })

    }

}
