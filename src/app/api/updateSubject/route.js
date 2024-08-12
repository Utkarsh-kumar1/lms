import { getToken } from 'next-auth/jwt';
import dbconnect from "@/lib/dbconnect"
import ApiResponse from '@/helpers/ApiResponse';

export async function PATCH(req) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req, secret });

    if(!token){
        return Response.json(ApiResponse.error(400, "Unauthorized access"), { status: 401 });
    }
    
    const { isActive, newSubjectName , id } = await req.json();
    console.log(isActive);
    

    if((isActive == null) && !newSubjectName){
        return Response.json(ApiResponse.error(400, "Subject Name is required"), { status: 400 });
    }
    
    

    try {
        const pool = dbconnect();
        const [data] = await pool.execute(
            "SELECT id , isActive , subjectName FROM subject WHERE id = ? AND owner = ?",
            [ id , token.id]
        );
        if (data.length === 0) {
            return Response.json(ApiResponse.error(403, "Forbidden"), { status: 403 });
        }

        const field = isActive !== undefined ? "isActive" : "subjectName";
        const value = isActive !== undefined ? isActive : newSubjectName;
        console.log(field);
        console.log(value);
        console.log(data[0].subjectName);
        

        if(field == "subjectName" && data[0].subjectName == value)
        {
            return Response.json(ApiResponse.success("200" , null , "Updated Successfully"), { status: 200 })
        }
        if(field == "isActive" && data[0].isActive == value)
        {
            return Response.json(ApiResponse.success("200" , null , "Updated Successfully"), { status: 200 })
        }
        
        
        await pool.execute(
            `UPDATE subject SET ${field} = ? WHERE id = ? AND owner = ?`,
            [value, id, token.id]
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

    const { subjects } = await req.json();

    if (!Array.isArray(subjects) || subjects.length === 0) {
        return Response.json(ApiResponse.error(400, "Subject(s) are required"), { status: 400 });
    }

    const pool = dbconnect();
    const client = await pool.getConnection();

    try {
        await client.beginTransaction();

        // Check for existing subjects
        const [existingSubjects] = await client.query(
            "SELECT subjectName FROM subject WHERE subjectName IN (?) AND owner = ?",
            [subjects, token.id]
        );

        const existingSubjectNames = existingSubjects.map(sub => sub.subjectName);
        const newSubjects = subjects.filter(subject => !existingSubjectNames.includes(subject));

        if (newSubjects.length === 0) {
            await client.rollback();
            return Response.json(ApiResponse.success(200, null, "All subjects already exist"), { status: 200 });
        }

        // Prepare data for bulk insert
        const subjectsToInsert = newSubjects.map(subjectName => [subjectName, token.id]);

        // Bulk insert new subjects
        await client.query(
            "INSERT INTO subject (subjectName, owner) VALUES ?",
            [subjectsToInsert]
        );

        await client.commit();

        // Fetch the inserted subjects
        const [insertedSubjects] = await client.query(
            `SELECT id, subjectName, isCompleted, isActive 
       FROM subject 
       WHERE subjectName IN (?) AND owner = ?`,
            [newSubjects, token.id]
        );

        return Response.json(ApiResponse.success(200, insertedSubjects, "Subjects created successfully"), { status: 200 });
    } catch (error) {
        await client.rollback();
        console.error(error);
        return Response.json(ApiResponse.error(500, "Error while creating subjects"), { status: 500 });
    } finally {
        client.release();
    }
}

