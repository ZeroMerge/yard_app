import { useEffect, useState } from "react";
import { loadDB, type DB, type Currency } from "./mockData";

export const useDB = (): DB => {
  const [db, setDb] = useState<DB>(() => loadDB());
  useEffect(() => {
    const refresh = () => setDb(loadDB());
    window.addEventListener("cy:db", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("cy:db", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return db;
};

export const money = (n: number, currency: Currency = "USD") => {
  if (currency === "NGN") {
    return "₦" + new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(n);
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
};

export const compactNumber = (n: number) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
