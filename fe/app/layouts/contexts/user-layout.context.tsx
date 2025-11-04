import { createContext, useContext, useState, type ReactNode } from "react";

type UsersContextType = {
  title: string;
  description: string;
  action: ReactNode;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setAction: (action: ReactNode) => void;
};

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider = ({ children }: { children: React.ReactNode }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [action, setAction] = useState<ReactNode>();
  return (
    <UsersContext.Provider
      value={{
        title,
        action,
        description,
        setTitle,
        setAction,
        setDescription,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export const useUsersContext = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsersContext must be used within a UsersProvider");
  }
  return context;
};
