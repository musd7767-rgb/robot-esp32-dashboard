import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import LanguageSelection from "./pages/LanguageSelection";
import RobotSelection from "./pages/RobotSelection";
import MasterDashboard from "./pages/MasterDashboard";
import SlaveDashboard from "./pages/SlaveDashboard";
import DualDashboard from "./pages/DualDashboard";
import ControlPanel from "./pages/ControlPanel";
import GamepadControl from "./pages/GamepadControl";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={LanguageSelection} />
      <Route path={"/selection"} component={RobotSelection} />
      <Route path={"/master"} component={MasterDashboard} />
      <Route path={"/master/control"} component={() => <GamepadControl robotType="master" />} />
      <Route path={"/follower"} component={SlaveDashboard} />
      <Route path={"/slave"} component={SlaveDashboard} />
      <Route path={"/follower/control"} component={() => <GamepadControl robotType="follower" />} />
      <Route path={"/dual"} component={DualDashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider
          defaultTheme="dark"
          // switchable
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
