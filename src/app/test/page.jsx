import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { db } from "@/db/drizzle";

async function page() {
  const session = await getServerSession(authOptions);

  const user = await db.query.users.findFirst({
    with: {
      
      
    },
    where: (user, { eq, and }) => eq(user.id, session.id),
  });

  console.log(JSON.stringify(user, null, 2));

  return <div>{}</div>;
}

export default page;
