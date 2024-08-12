import { getToken } from 'next-auth/jwt';
import dbconnect from "@/lib/dbconnect"
import ApiResponse from '@/helpers/ApiResponse';
import { NextResponse } from 'next/server';

export async function PATCH(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    const { newsubtopicName: subtopicName, id } = await req.json();


    try {
        const pool = dbconnect();
        const [data] = await pool.execute(
            "SELECT st.id , st.subtopicName FROM subtopics st JOIN topics t ON st.topic = t.id JOIN course c ON t.course = c.id JOIN subject s ON c.subject = s.id WHERE s.owner = ?  HAVING st.id = ?; ",
            [token.id, id]
        );
        // const [data] = await pool.execute(
        //     "SELECT c.id , c.courseName FROM `course` c JOIN `subject` s ON c.subject = s.id WHERE s.owner = ? HAVING c.id = ?",
        //     [token.id, id]
        // );
        if (data.length === 0) {
            return Response.json(ApiResponse.error(403, "Forbidden"), { status: 403 });
        }

        console.log(data[0].subtopicName);


        if (data[0].subtopicName === subtopicName) {
            return Response.json(ApiResponse.success("200", null, "Updated Successfully"), { status: 200 })
        }



        await pool.execute(
            `UPDATE subtopics SET subtopicName = ? WHERE id = ? ;`,
            [subtopicName, data[0].id]
        );

        return Response.json({ status: 200, message: "Update successful" }, { status: 200 });

    } catch (error) {
        console.log(error);


        return Response.json(ApiResponse.error(500, "Error while updating Activity "), { status: 500 })

    }

}

// export async function POST(req) {
//     const secret = process.env.JWT_SECRET;
//     const token = await getToken({ req, secret });
//     const { subtopicName, subjectId, courseId, topicId } = await req.json();

//     try {
//         const pool = dbconnect();

//         // Verify if the subject and course exist for the user
//         const [subjectCourse] = await pool.execute(
//             `SELECT s.id AS subjectId, c.id AS courseId 
//              FROM subject s 
//              JOIN course c ON c.subject = s.id 
//              WHERE s.owner = ? AND s.id = ? AND c.id = ?`,
//             [token.id, subjectId, courseId]
//         );

//         if (subjectCourse.length === 0) {
//             return Response.json(ApiResponse.error(403, "Forbidden"), { status: 403 });
//         }

//         // Check if the subtopic already exists
//         const [existingSubtopic] = await pool.execute(
//             `SELECT id, subtopicName FROM subtopics 
//              WHERE topic = ? AND subtopicName = ?`,
//             [topicId, subtopicName]
//         );

//         if (existingSubtopic.length > 0) {
//             return Response.json(ApiResponse.success("200", null, "Subtopic already exists"), { status: 200 });
//         }

//         // Get the highest subtopicIndex for the topic
//         const [highestIndex] = await pool.execute(
//             `SELECT MAX(subtopicIndex) as maxIndex FROM subtopics WHERE topic = ?`,
//             [topicId]
//         );

//         const newSubtopicIndex = highestIndex[0].maxIndex ? highestIndex[0].maxIndex + 1 : 1;

//         // Insert the new subtopic with the incremented index
//         const [insertedData] = await pool.execute(
//             `INSERT INTO subtopics (subtopicName, subtopicIndex, topic) VALUES (?, ?, ?)`,
//             [subtopicName, newSubtopicIndex, topicId]
//         );
//         console.log(insertedData);
        

//         const [subTopic] = await pool.execute(
//             `SELECT * FROM subtopics WHERE id = ?`,
//             [insertedData.insertId]
//         );
//         return Response.json(ApiResponse.success(200 , subTopic[0] , "Subtopic Created successfully"), { status: 200 });

//     } catch (error) {
//         console.error(error);
//         return Response.json(ApiResponse.error(500, "Error while adding subtopic"), { status: 500 });
//     }
// }


export async function POST(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });

    if (!token) {
        return NextResponse.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
    }

    const { subtopics, subjectId, courseId, topicId } = await req.json();

    if (!Array.isArray(subtopics) || !subjectId || !courseId || !topicId) {
        return NextResponse.json(ApiResponse.error(400, "Invalid input data"), { status: 400 });
    }

    const pool = dbconnect();
    const client = await pool.getConnection();
    try {
        await client.beginTransaction();

        // Fetch existing subtopics
        const [existingSubtopics] = await client.query(
            "SELECT subtopicName FROM subtopics WHERE subtopicName IN (?) AND topic = ?",
            [subtopics, topicId]
        );

        const existingSubtopicNames = existingSubtopics.map(sub => sub.subtopicName);
        const newSubtopics = subtopics.filter(sub => !existingSubtopicNames.includes(sub));

        if (newSubtopics.length === 0) {
            await client.rollback();
            return NextResponse.json(ApiResponse.success(200, null, "All subtopics already exist"), { status: 200 });
        }

        // Get the highest subtopicIndex for the topic
        const [highestIndex] = await client.query(
            "SELECT MAX(subtopicIndex) as maxIndex FROM subtopics WHERE topic = ?",
            [topicId]
        );

        const maxIndex = highestIndex[0].maxIndex || 0;

        // Prepare data for bulk insert
        const subtopicsToInsert = newSubtopics.map((subtopic, index) => [
            subtopic,
            maxIndex + index + 1,
            topicId
        ]);

        // Bulk insert new subtopics
        await client.query(
            "INSERT INTO subtopics (subtopicName, subtopicIndex, topic) VALUES ?",
            [subtopicsToInsert]
        );

        await client.commit();

        // Fetch the inserted data
        const [insertedData] = await client.query(`
            SELECT st.*, t.topicName, c.courseName, s.subjectName 
            FROM subtopics st 
            JOIN topics t ON st.topic = t.id 
            JOIN course c ON t.course = c.id 
            JOIN subject s ON c.subject = s.id 
            WHERE st.subtopicName IN (?) AND st.topic = ?
        `, [newSubtopics, topicId]);

        console.log(insertedData);
        console.log("new usbtopcn" , newSubtopics , topicId);
        
        

        return NextResponse.json(ApiResponse.success(200, insertedData, "Subtopics added successfully"), { status: 200 });
    } catch (error) {
        await client.rollback();
        console.error(error);
        return NextResponse.json(ApiResponse.error(500, "Error while saving the subtopic."), { status: 500 });
    } finally {
        client.release();
    }
}



