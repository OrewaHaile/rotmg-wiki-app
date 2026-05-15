import { Switch, Route, Router as WouterRouter } from "wouter";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import ImportStats from "./pages/ImportStats";
import ItemPage from "./pages/ItemPage";
import ItemEditPage from "./pages/ItemEditPage";
import Dungeons from "./pages/Dungeons";

function Router() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/items" component={Home} />
        <Route path="/categories" component={Categories} />
        <Route path="/dungeons" component={Dungeons} />
        <Route path="/stats" component={ImportStats} />
        <Route path="/item/:slug/edit" component={ItemEditPage} />
        <Route path="/item/:slug" component={ItemPage} />
        <Route>
          <div className="min-h-screen bg-stone-950 flex items-center justify-center">
            <p className="text-stone-400">Page not found</p>
          </div>
        </Route>
      </Switch>
    </>
  );
}

export default function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}
