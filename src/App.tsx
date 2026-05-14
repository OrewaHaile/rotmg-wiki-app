import { Switch, Route, Router as WouterRouter } from "wouter";
import Home from "./pages/Home";
import ItemPage from "./pages/ItemPage";
import ItemEditPage from "./pages/ItemEditPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/item/:slug/edit" component={ItemEditPage} />
      <Route path="/item/:slug" component={ItemPage} />
      <Route>
        <div className="min-h-screen bg-stone-950 flex items-center justify-center">
          <p className="text-stone-400">Page not found</p>
        </div>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}
