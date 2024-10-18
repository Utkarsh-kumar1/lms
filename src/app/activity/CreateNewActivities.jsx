function mylog(data) {

  console.log("data");
  console.log(data);
  console.log("data");
}

export default function CreateNewActivities({ data }) {

  const test = mylog(data); 


  return (
    <div className="flex items-center justify-center flex-col">
      <h1 className="text-2xl font-bold mb-5">Courses and Topics</h1>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border">Course</th>
            <th className="py-2 px-4 border">Topic</th>
            <th className="py-2 px-4 border">Subtopic</th>
            <th className="py-2 px-4 border">Subtopic</th>
          </tr> 
        </thead>
        <tbody>
          { data?.map((course) => 
            course.subtopics.map((subtopics) => (
              <tr key={subtopics.topicId}>
                <td className="py-2 px-4 border">{course.courseName}</td>
                <td className="py-2 px-4 border">{subtopics.topicName}</td>
                <td className="py-2 px-4 border">{subtopics.subtopicName}</td>
                <td className="py-2 px-4 border">{subtopics.subTopicIndex}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Helper function for row colors
const getRowColor = (group) => {
  switch (group) {
    case "Group1":
      return "bg-red-100";
    case "Group2":
      return "bg-green-100";
    case "Group3":
      return "bg-blue-100";
    default:
      return "";
  }
};
