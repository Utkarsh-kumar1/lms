import { getToken } from 'next-auth/jwt';
import dbconnect from "@/lib/dbconnect"
import ApiResponse from '@/helpers/ApiResponse';
import { db } from '@/db/drizzle';
import { course } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    const { newCourseName: courseName, id } = await req.json();
    if (!token) {
        return Response.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
    }

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
            where: (user, { eq, and }) => eq(user.id, token.id)
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

        }

        await db.update(course).set({ courseName }).where(eq(course.id , id));

        return Response.json({ status: 200, message: "Update successful" });

    } catch (error) {
        console.log(error);



        return Response.json(ApiResponse.error(500, "Error while updating Course "), { status: 500 })

    }

}



export async function POST(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });

    if (!token) {
        return Response.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
    }

    const { courseNames, subjectId } = await req.json();

    if (!Array.isArray(courseNames) || courseNames.length === 0) {
        return Response.json(ApiResponse.error(400, "Course Names are required"), { status: 400 });
    }
    if (!subjectId) {
        return Response.json(ApiResponse.error(400, "Subject ID is required"), { status: 400 });
    }

    const pool = dbconnect();
    const client = await pool.getConnection();

    try {
        await client.beginTransaction();

        // Check for existing courses
        const [existingCourses] = await client.query(
            "SELECT courseName FROM course WHERE courseName IN (?) AND subject = ?",
            [courseNames, subjectId]
        );

        const existingCourseNames = existingCourses.map(course => course.courseName);
        const newCourseNames = courseNames.filter(course => !existingCourseNames.includes(course));

        if (newCourseNames.length === 0) {
            await client.rollback();
            return Response.json(ApiResponse.success(200, null, "All courses already exist"), { status: 200 });
        }

        // Prepare data for bulk insert
        const coursesToInsert = newCourseNames.map(courseName => [courseName, subjectId]);

        // Bulk insert new courses
        await client.query(
            "INSERT INTO course (courseName, subject) VALUES ?",
            [coursesToInsert]
        );

        await client.commit();

        // Fetch the inserted courses
        const [insertedCourses] = await client.query(
            `SELECT c.*, s.subjectName 
       FROM course c 
       JOIN subject s ON c.subject = s.id 
       WHERE c.courseName IN (?) AND c.subject = ?`,
            [newCourseNames, subjectId]
        );

        return Response.json(ApiResponse.success(200, insertedCourses, "Courses created successfully"), { status: 200 });
    } catch (error) {
        await client.rollback();
        console.error(error);
        return Response.json(ApiResponse.error(500, "Error while creating courses"), { status: 500 });
    } finally {
        client.release();
    }
}
