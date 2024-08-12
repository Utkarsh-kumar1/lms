import { getToken } from 'next-auth/jwt';
import dbconnect from "@/lib/dbconnect"
import ApiResponse from '@/helpers/ApiResponse';

export async function PATCH(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    const { newcourseName : courseName, id } = await req.json();


    try {
        const pool = dbconnect();
        const [data] = await pool.execute(
            "SELECT c.id , c.courseName FROM `course` c JOIN `subject` s ON c.subject = s.id WHERE s.owner = ? HAVING c.id = ?",
            [token.id , id]
        );
        if (data.length === 0) {
            return Response.json(ApiResponse.error(403, "Forbidden"), { status: 403 });
        }

        console.log(data[0].courseName);


        if (data[0].courseName === courseName) {
            return Response.json(ApiResponse.success("200", null, "Updated Successfully"), { status: 200 })
        }
        


        await pool.execute(
            `UPDATE course SET courseName = ? WHERE id = ? ;`,
            [courseName, data[0].id]
        );

        return Response.json({ status: 200, message: "Update successful" });

    } catch (error) {
        console.log(error);


        return Response.json(ApiResponse.error(500, "Error while updating Activity "), { status: 500 })

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
