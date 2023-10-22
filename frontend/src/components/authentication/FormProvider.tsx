import React, { ReactNode } from "react";

interface FormProviderProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}

const FormProvider = ({ children, onSubmit }: FormProviderProps) => {
  return <form onSubmit={onSubmit}>{children}</form>;
};

export default FormProvider;
