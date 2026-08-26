import { useState, useCallback } from "react";
import { Expense, Category, PaymentMethod } from "../types";
import { DEFAULT_CATEGORIES, generateSampleExpenses, getTodayDateString } from "../utils/storage";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  const handleSaveExpense = useCallback(
    (expenseData: {
      id?: string;
      title: string;
      amount: number;
      categoryId: string;
      bankAccountId?: string;
      date: string;
      time: string;
      paymentMethod: PaymentMethod;
      notes?: string;
    }) => {
      if (expenseData.id) {
        setExpenses((prev) =>
          prev.map((item) =>
            item.id === expenseData.id
              ? {
                  ...item,
                  title: expenseData.title,
                  amount: expenseData.amount,
                  categoryId: expenseData.categoryId,
                  bankAccountId: expenseData.bankAccountId,
                  date: expenseData.date,
                  time: expenseData.time,
                  paymentMethod: expenseData.paymentMethod,
                  notes: expenseData.notes,
                  updatedAt: Date.now(),
                }
              : item
          )
        );
      } else {
        const newExpense: Expense = {
          id: "exp-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
          title: expenseData.title,
          amount: expenseData.amount,
          categoryId: expenseData.categoryId,
          bankAccountId: expenseData.bankAccountId,
          date: expenseData.date,
          time: expenseData.time,
          paymentMethod: expenseData.paymentMethod,
          notes: expenseData.notes,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setExpenses((prev) => [newExpense, ...prev]);
      }
    },
    []
  );

  const handleDeleteExpense = useCallback((expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  }, []);

  const handleAddCategory = useCallback((categoryData: Omit<Category, "id" | "createdAt">) => {
    const newCat: Category = {
      ...categoryData,
      id: "cat-" + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCat]);
  }, []);

  const handleUpdateCategory = useCallback((updatedCat: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));
  }, []);

  const handleDeleteCategory = useCallback((categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  }, []);

  const handleResetExpenses = useCallback(() => {
    setExpenses([]);
  }, []);

  const handleLoadSampleExpenses = useCallback(() => {
    setExpenses(generateSampleExpenses());
    setCategories(DEFAULT_CATEGORIES);
  }, []);

  return {
    expenses,
    setExpenses,
    categories,
    setCategories,
    handleSaveExpense,
    handleDeleteExpense,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleResetExpenses,
    handleLoadSampleExpenses,
  };
}

