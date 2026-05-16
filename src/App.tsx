import { Switch, Route, Router as WouterRouter } from "wouter";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import ImportStats from "./pages/ImportStats";
import ItemPage from "./pages/ItemPage";
import ItemEditPage from "./pages/ItemEditPage";
import Dungeons from "./pages/Dungeons";
import Sets from "./pages/Sets";
import Skins from "./pages/Skins";

function Router() {
  return (
    <ErrorBoundary>
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/items" component={Home} />
        <Route path="/categories" component={Categories} />
        <Route path="/dungeons" component={Dungeons} />
        <Route path="/sets" component={Sets} />
        <Route path="/skins" component={Skins} />
        <Route path="/stats" component={ImportStats} />
        <Route path="/item/:slug/edit" component={ItemEditPage} />
        <Route path="/item/:slug" component={ItemPage} />
        <Route>
          <div className="min-h-screen bg-stone-950 flex items-center justify-center">
            <p className="text-stone-400">Page not found</p>
          </div>
        </Route>
      </Switch>
      <Footer />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <div className="min-h-screen bg-stone-950 text-stone-100">
        <Router />
      </div>
    </WouterRouter>
  );
}
