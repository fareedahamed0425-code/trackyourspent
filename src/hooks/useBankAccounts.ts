import { useState, useCallback } from "react";
import { BankAccount } from "../types";

export function useBankAccounts() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  const handleAddBank = useCallback((bank: Omit<BankAccount, "id" | "createdAt">) => {
    const newBank: BankAccount = {
      ...bank,
      id: "bank-" + Date.now(),
      createdAt: Date.now(),
    };
    setBankAccounts((prev) => [...prev, newBank]);
  }, []);

  const handleUpdateBank = useCallback((updatedBank: BankAccount) => {
    setBankAccounts((prev) => prev.map((b) => (b.id === updatedBank.id ? updatedBank : b)));
  }, []);

  const handleDeleteBank = useCallback((bankId: string) => {
    setBankAccounts((prev) => prev.filter((b) => b.id !== bankId));
  }, []);

  return {
    bankAccounts,
    setBankAccounts,
    handleAddBank,
    handleUpdateBank,
    handleDeleteBank,
  };
}

