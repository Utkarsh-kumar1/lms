import { getServerSession } from "next-auth";
import Today from "./Today";
import { authOptions } from "../api/auth/[...nextauth]/options";



export default async function Page() {
  const token = await getServerSession(authOptions)

  return (
    <div>
      {/* tasks section */}
      {/* {console.log("MY token",token)} */}
      <Today token={token} />
      
    </div>
  );
}
