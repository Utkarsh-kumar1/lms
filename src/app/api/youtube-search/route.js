import ApiResponse from "@/helpers/ApiResponse";
import { getToken } from "next-auth/jwt";

export async function GET(request) {
    const secret = process.env.JWT_SECRET;
    const token = await getToken({ req: request, secret });

    if (!token) {
        return Response.json(ApiResponse.error(401, "Unauthorized access"), { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const pageToken = searchParams.get('pageToken') || ''; // Get the pageToken if available
    console.log(query);

    const maxResults = 15;

    // Construct the URL for the YouTube Data API request
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelType=any&key=${process.env.YOUTUBE_API_KEY}&maxResults=${maxResults}&q=${encodeURIComponent(query)}&pageToken=${pageToken}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);

        return Response.json(ApiResponse.success(200, data, "Fetched successfully"), { status: 200 });

    } catch (error) {
        console.error(error);
        return Response.json(ApiResponse.error(500, "Error fetching data"), { status: 500 });
    }
}
