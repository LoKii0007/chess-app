import React, { createContext, useState } from "react";

interface AccountContextType {
  activeUser: object;
  setActiveUser: React.Dispatch<React.SetStateAction<object>>;
}

export const AccountContext = createContext<AccountContextType>({
  activeUser: {},
  setActiveUser: () => {},
});

const AccountState = (props: any) => {
  const [activeUser, setActiveUser] = useState<object>({});

  return (
    <AccountContext.Provider value={{ activeUser, setActiveUser }}>
      {props.children}
    </AccountContext.Provider>
  );
};

export default AccountState;
