import { OverlayHeader } from "../../components/OverlayHeader";
import { OverlaySettings } from "../../components/OverlaySettings";
import { useElectron } from "../../hooks/useElectron";
import { configSelector } from "../../state/config";
import styles from "./styles.module.css";
import classNames from "classnames";
import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Loading } from "../../components/Loading";
import { ErrorFallback } from "../../components/ErrorFallback";
import { Routes, Route, useLocation } from "react-router-dom";

const RoutesContainer = lazy(() => import("../Routes"));
const BuildContainer = lazy(() => import("../Build"));
const EditRouteContainer = lazy(() => import("../EditRoute"));

export const OverlayApp = () => {
  const { isElectron, overlayState } = useElectron();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [config, setConfig] = useRecoilState(configSelector);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkWindowSize = () => {
      if (overlayState?.bounds) {
        const { width, height } = overlayState.bounds;
        setIsCompactMode(width < 500 || height < 600);
      }
    };

    checkWindowSize();
    const handleResize = () => checkWindowSize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [overlayState]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isSettingsOpen) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsOpen]);

  if (!isElectron) {
    return (
      <Suspense fallback={<Loading />}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Routes>
            <Route path="/" element={<RoutesContainer />} />
            <Route path="/build" element={<BuildContainer />} />
            <Route path="/edit-route" element={<EditRouteContainer />} />
          </Routes>
        </ErrorBoundary>
      </Suspense>
    );
  }

  return (
    <div
      className={classNames(styles.overlayContainer, {
        [styles.compactMode]: isCompactMode,
        [styles.settingsOpen]: isSettingsOpen,
      })}
    >
      <OverlayHeader
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        isSettingsOpen={isSettingsOpen}
      />

      <div className={styles.content}>
        <div className={styles.routesContainer}>
          <Suspense fallback={<Loading />}>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Routes>
                <Route path="/" element={<RoutesContainer />} />
                <Route path="/build" element={<BuildContainer />} />
                <Route path="/edit-route" element={<EditRouteContainer />} />
                <Route path="*" element={<RoutesContainer />} />
              </Routes>
            </ErrorBoundary>
          </Suspense>
        </div>
      </div>

      <OverlaySettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onConfigChange={setConfig}
      />

      {isSettingsOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};
