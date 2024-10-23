"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router"; // Import useRouter for accessing the route
import { Loading } from "@/components/auth/loading"; // Assume you have a loading component

const TextEditor = () => {
  const router = useRouter();
  const { roomId } = router.query; // Extract roomId from the URL
  const [loading, setLoading] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState("");

  useEffect(() => {
    // Simulate loading or any secure room setup
    setTimeout(() => {
      setLoading(false);
      setWelcomeMessage(`Hi, welcome to your secure room! Room ID: ${roomId}`);
    }, 1000); // Adjust this timeout as per the actual room setup time
  }, [roomId]); // Add roomId as a dependency

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      {/* Loading spinner */}
      {loading ? (
        <Loading />
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold">{welcomeMessage}</h1>
          {/* Add any other secure room content here */}
        </div>
      )}
    </div>
  );
};

export default TextEditor;
