"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { User } from "../../typing";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

interface ICurrentUserContext {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const CurrentUserContext = createContext<ICurrentUserContext>({
  user: null,
  setUser: () => {},
});

export const CurrentUserContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
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

  return (
    <CurrentUserContext.Provider value={{ user, setUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
};

const useCurrentUser = () => useContext(CurrentUserContext);

export default useCurrentUser;
