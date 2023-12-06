import React from "react";

type DeleteButtonsProps = {
    children: React.ReactNode;
    onClick: () => void;
    deleted: boolean;
}

export default function DeleteButton({children, onClick, deleted}: DeleteButtonsProps) {

  return (
    <button
    disabled={ deleted }
    onClick={ onClick }
    className={`group -ml-2 items-center gap-1 self-start flex transition-colors duration-200 ${deleted 
        ? "text-white" 
        : "text-gray-500 hover:text-red-500 focus-visible:text-red-500"}`}
    >
        {children}    
    </button>
  )
}
