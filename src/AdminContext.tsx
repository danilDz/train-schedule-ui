import React, { Dispatch, ReactNode, createContext, useReducer } from "react";

export const AdminContext = createContext<boolean>(null!);
export const AdminDispatchContext = createContext<Dispatch<{ value: boolean }>>(
  null!
);

function isAdminReducer(isAdmin: boolean, action: { value: boolean }) {
  return action.value;
}

export const AdminProvider: React.FunctionComponent<{
  children: ReactNode;
}> = ({ children }) => {
  const [isAdmin, dispatch] = useReducer(isAdminReducer, null!);

  return (
    <AdminContext.Provider value={isAdmin}>
      <AdminDispatchContext.Provider value={dispatch}>
        {children}
      </AdminDispatchContext.Provider>
    </AdminContext.Provider>
  );
};
