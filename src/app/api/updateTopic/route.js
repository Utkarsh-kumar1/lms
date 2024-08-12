import { getToken } from 'next-auth/jwt';
import dbconnect from "@/lib/dbconnect"
import ApiResponse from '@/helpers/ApiResponse';
import { NextResponse } from 'next/server';

export async function PATCH(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });
    const { newtopicName: topicName, id } = await req.json();


    try {
        const pool = dbconnect();
        const [data] = await pool.execute(
            "SELECT t.id , t.topicName FROM topics t JOIN course c ON t.course = c.id JOIN subject s ON c.subject = s.id WHERE s.owner = ? HAVING t.id = ? ",
            [token.id, id]
        );

        if (data.length === 0) {
            return Response.json(ApiResponse.error(403, "Forbidden"), { status: 403 });
        }

        console.log(data[0].topicName);


        if (data[0].topicName === topicName) {
            return Response.json(ApiResponse.success("200", null, "Updated Successfully"), { status: 200 })
        }



        await pool.execute(
            `UPDATE topics SET topicName = ? WHERE id = ? ;`,
            [topicName, data[0].id]
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
//     if (!token) {
//         return Response.json(ApiResponse.error(400, "Unauthorized access"), { status: 401 });
//     }
//     const { topicName, courseId } = await req.json();

//     if (!topicName) {
//         return Response.json(ApiResponse.error(400, "Topic Name is required"), { status: 400 });
//     }
//     if (!courseId) {
//         return Response.json(ApiResponse.error(400, "Course Id is required"), { status: 400 });
//     }

//     try {
//         const pool = dbconnect()

//         const [courses] = await pool.execute(
//             "SELECT c.id FROM `course` c JOIN `subject` s ON c.subject = s.id WHERE s.owner = ? and c.id = ? ;",
//             [token.id, courseId]
//         );
//         console.log(courses);
//         if (!courses[0]) {
//             return Response.json(ApiResponse.error(400, "No such course found"), { status: 400 });
//         }

//         const [topics] = await pool.execute(
//             "SELECT t.topicIndex FROM topics t JOIN course c ON t.course = c.id JOIN subject s ON c.subject = s.id WHERE s.owner = ? and c.id = ? ORDER BY t.topicIndex DESC ",
//             [token.id, courseId]
//         );
//         console.log(topics);


//         const [databaseResponse] = await pool.execute("INSERT INTO topics (topicName , course , topicIndex) VALUES (? , ? , ?);", [topicName, courseId, (topics[0]?.topicIndex + 1) || 1])


//         const [topic] = await pool.execute(
//             "SELECT t.*, c.courseName, s.subjectName FROM topics t JOIN course c ON t.course = c.id JOIN subject s ON c.subject = s.id WHERE s.owner = ? and t.id = ? ",
//             [token.id, databaseResponse.insertId]
//         );


//         return Response.json(ApiResponse.success(200, topic[0], "Topic created successfully"), { status: 200 })
//     } catch (error) {
//         console.log(error);

//         return Response.json(ApiResponse.error(500, "Error while Creating Topic "), { status: 500 })
//     }


// }

export async function POST(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });

    if (!token) {
        return NextResponse.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
    }

    const { topics, subjectId, courseId } = await req.json();
    console.log(topics, subjectId, courseId);
    

    if (!Array.isArray(topics) || topics.length === 0 || !subjectId || !courseId) {
        return NextResponse.json(ApiResponse.error(400, "Invalid input data"), { status: 400 });
    }

    const pool = dbconnect();
    const client = await pool.getConnection();

    try {
        await client.beginTransaction();

        // Check if the course belongs to the user
        const [courses] = await client.query(
            "SELECT c.id FROM `course` c JOIN `subject` s ON c.subject = s.id WHERE s.owner = ? and c.id = ?;",
            [token.id, courseId]
        );

        if (!courses.length) {
            await client.rollback();
            return NextResponse.json(ApiResponse.error(400, "No such course found"), { status: 400 });
        }

        // Fetch existing topics
        const [existingTopics] = await client.query(
            "SELECT topicName FROM topics WHERE topicName IN (?) AND course = ?",
            [topics, courseId]
        );

        const existingTopicNames = existingTopics.map(topic => topic.topicName);
        const newTopics = topics.filter(topic => !existingTopicNames.includes(topic));

        if (newTopics.length === 0) {
            await client.rollback();
            return NextResponse.json(ApiResponse.success(200, null, "All topics already exist"), { status: 200 });
        }

        // Get the highest topicIndex for the course
        const [highestIndex] = await client.query(
            "SELECT MAX(topicIndex) as maxIndex FROM topics WHERE course = ?",
            [courseId]
        );

        const maxIndex = highestIndex[0].maxIndex || 0;

        // Prepare data for bulk insert
        const topicsToInsert = newTopics.map((topic, index) => [
            topic,
            courseId,
            maxIndex + index + 1
        ]);

        // Bulk insert new topics
        await client.query(
            "INSERT INTO topics (topicName, course, topicIndex) VALUES ?",
            [topicsToInsert]
        );

        await client.commit();

        // Fetch the inserted data
        const [insertedData] = await client.query(`
            SELECT t.*, c.courseName, s.subjectName 
            FROM topics t 
            JOIN course c ON t.course = c.id 
            JOIN subject s ON c.subject = s.id 
            WHERE t.topicName IN (?) AND t.course = ?
        `, [newTopics, courseId]);
        console.log(insertedData);
        

        return NextResponse.json(ApiResponse.success(200, insertedData, "Topics added successfully"), { status: 200 });
    } catch (error) {
        await client.rollback();
        console.error(error);
        return NextResponse.json(ApiResponse.error(500, "Error while saving the topics."), { status: 500 });
    } finally {
        client.release();
    }
}


