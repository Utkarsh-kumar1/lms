
import { getServerSession } from "next-auth";
import Dashboard from "./Dashboard";
import StatisticsDashboard from "./StatisticsDashboard";
import { authOptions } from "../api/auth/[...nextauth]/options";
import dbconnect from "../../lib/dbconnect"

async function fetchData(id){
  const pool = dbconnect();
  
 
  try {
    
    const [userData] = await pool.execute(
      `Select * from userData where id = ? ;`,
      [id]
    );

    return userData[0];
  } catch (error) {
    
    throw new Error("Error while fetching Data");
  }
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  

  try {
    const userData = await fetchData(session.id);
    const data = JSON.parse(userData.UserData)
    
    
    return (
      <div className="w-full ">
        <Dashboard userData={data} />
      </div>
    );
  } catch (error) {
    return <div className=" text-green-600 font-bold"> {error.message} </div>;
  }

  
}
