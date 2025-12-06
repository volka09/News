/// <reference types="vite/client" />

// Объявим корректный тип для root элемента, чтобы TS не путал Element и ReactNode
declare global {
  interface Window {}
}

export {};
