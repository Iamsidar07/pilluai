"use client";

import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

export interface User {
  name: string;
  email: string;
  photoURL: string;
  uid: string;
}

const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User signed in:", user);
        setUser({
          name: user.displayName || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
          uid: user.uid,
        });
      } else {
        console.log("User signed out");
        setUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  return { user, setUser };
};

export default useUser;
