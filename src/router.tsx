import * as React from 'react'; // Necessário para entender o elemento <Index />
import Index from "./pages/index"; // Importação explícita do arquivo index
import NotFound from "./pages/NotFound";

export const routers = [
    {
      path: "/",
      name: 'home',
      element: <Index />,
    },
    {
      path: "*",
      name: '404',
      element: <NotFound />,
    },
];

// Declaração para permitir acesso global (se for necessário para ferramentas de debug)
declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;