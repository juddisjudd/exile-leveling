import { ErrorFallback } from "../components/ErrorFallback";
import { Loading } from "../components/Loading";
import { Navbar } from "../components/Navbar";
import { OverlayApp } from "./OverlayApp";
import { useElectron } from "../hooks/useElectron";
import { withBlank } from "../utility/withBlank";
import { withScrollRestoration } from "../utility/withScrollRestoration";
import { Suspense, lazy, useEffect, ComponentType } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RoutesLazy = lazy(() => import("./Routes"));
const BuildLazy = lazy(() => import("./Build"));
const EditRouteLazy = lazy(() => import("./EditRoute"));

const RoutesContainer: ComponentType = withScrollRestoration(
  withBlank(RoutesLazy)
);
const BuildContainer: ComponentType = withBlank(BuildLazy);
const EditRouteContainer: ComponentType = withBlank(EditRouteLazy);

export function App() {
  const { isElectron } = useElectron();

  useEffect(() => {
    if (isElectron) {
      document.documentElement.classList.add("electron-app");
      document.body.classList.add("electron-app");
      document.body.classList.add("overlay-mode");

      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.overflowX = "hidden";
      document.documentElement.style.overflowY = "hidden";

      document.body.style.overflow = "hidden";
      document.body.style.overflowX = "hidden";
      document.body.style.overflowY = "hidden";

      const root = document.getElementById("root");
      if (root) {
        root.style.overflow = "hidden";
        root.style.overflowX = "hidden";
        root.style.overflowY = "hidden";
      }
    } else {
      document.documentElement.classList.remove("electron-app");
      document.body.classList.remove("electron-app");
      document.body.classList.remove("overlay-mode");

      document.documentElement.style.overflow = "";
      document.documentElement.style.overflowX = "";
      document.documentElement.style.overflowY = "";

      document.body.style.overflow = "";
      document.body.style.overflowX = "";
      document.body.style.overflowY = "";

      const root = document.getElementById("root");
      if (root) {
        root.style.overflow = "";
        root.style.overflowX = "";
        root.style.overflowY = "";
      }
    }
  }, [isElectron]);

  if (isElectron) {
    return <OverlayApp />;
  }

  return (
    <>
      <Navbar />
      <ToastContainer
        position="bottom-right"
        theme="dark"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Suspense fallback={<Loading />}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Routes>
            <Route path="/" element={<RoutesContainer />} />
            <Route path="/build" element={<BuildContainer />} />
            <Route path="/edit-route" element={<EditRouteContainer />} />
          </Routes>
        </ErrorBoundary>
      </Suspense>
    </>
  );
}
