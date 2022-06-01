import React, { FC, createContext, useContext } from "react";
import { PositionValue } from "../";

interface PSContextData {
  tip: AMap.AutoComplete.Tip;
  setTip: (tip: AMap.AutoComplete.Tip) => void;
  dropVisible: boolean;
  setDropVisible: (visible: boolean) => void;
  options: any[];
  setOptions: (opt: any[]) => void;
}

export const PSContext = createContext<PSContextData>({} as PSContextData);

const PSContextProvider: FC<PSContextData> = (props) => {
  const { children, ...rest } = props;
  return (
    <PSContext.Provider value={{ ...rest }}>{children}</PSContext.Provider>
  );
};
export default PSContextProvider;

export const usePSContext = (): PSContextData => useContext(PSContext);
