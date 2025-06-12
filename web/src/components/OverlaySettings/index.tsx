import { useElectron } from "../../hooks/useElectron";
import { Config } from "../../state/config";
import { useClearGemProgress } from "../../state/gem-progress";
import { useClearRouteProgress } from "../../state/route-progress";
import { useClearCollapseProgress } from "../../state/section-collapse";
import styles from "./styles.module.css";
import classNames from "classnames";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaRoute,
  FaTools,
  FaList,
  FaEdit,
  FaUndoAlt,
  FaCog,
  FaEye,
} from "react-icons/fa";

interface OverlaySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  config: Config;
  onConfigChange: (config: Config) => void;
}

export const OverlaySettings = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}: OverlaySettingsProps) => {
  const { isElectron, setOpacity, overlayState } = useElectron();
  const [localOpacity, setLocalOpacity] = useState(0.9);
  const navigate = useNavigate();
  const location = useLocation();

  const clearGemProgress = useClearGemProgress();
  const clearRouteProgress = useClearRouteProgress();
  const clearCollapseProgress = useClearCollapseProgress();

  useEffect(() => {
    if (overlayState) {
      setLocalOpacity(overlayState.opacity);
    }
  }, [overlayState]);

  if (!isOpen || !isElectron) return null;

  const handleOpacityChange = async (value: number) => {
    setLocalOpacity(value);
    await setOpacity(value);
  };

  const handleNavigation = (path: string) => {
    console.log(`Navigating to: ${path}`);

    onClose();

    setTimeout(() => {
      navigate(path);
      console.log(`Navigation completed to: ${path}`);
    }, 100);
  };

  const handleResetProgress = () => {
    if (
      confirm(
        "Are you sure you want to reset all progress? This cannot be undone."
      )
    ) {
      clearGemProgress();
      clearRouteProgress();
      clearCollapseProgress();
      alert("Progress reset successfully!");
    }
  };

  const getCurrentPageName = () => {
    switch (location.pathname) {
      case "/":
        return "Route";
      case "/build":
        return "Build";
      case "/edit-route":
        return "Edit Route";
      default:
        return "Route";
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Settings & Navigation</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.debugInfo}>
            <small>Current path: {location.pathname}</small>
          </div>

          <div className={styles.section}>
            <h4>
              <FaRoute className={styles.sectionIcon} /> Navigation
            </h4>
            <div className={styles.currentPage}>
              Current: <strong>{getCurrentPageName()}</strong>
            </div>

            <div className={styles.navigationGrid}>
              <button
                className={classNames(styles.navButton, {
                  [styles.navButtonActive]: location.pathname === "/",
                })}
                onClick={() => handleNavigation("/")}
              >
                <FaRoute className={styles.navIcon} />
                Route
              </button>

              <button
                className={classNames(styles.navButton, {
                  [styles.navButtonActive]: location.pathname === "/build",
                })}
                onClick={() => handleNavigation("/build")}
              >
                <FaTools className={styles.navIcon} />
                Build
              </button>

              <button
                className={classNames(styles.navButton, {
                  [styles.navButtonActive]: location.pathname === "/edit-route",
                })}
                onClick={() => handleNavigation("/edit-route")}
              >
                <FaEdit className={styles.navIcon} />
                Edit Route
              </button>

              <button
                className={classNames(styles.navButton)}
                onClick={() => {
                  onClose();
                }}
              >
                <FaList className={styles.navIcon} />
                Sections
              </button>
            </div>
          </div>

          <div className={styles.section}>
            <h4>
              <FaUndoAlt className={styles.sectionIcon} /> Actions
            </h4>

            <button
              className={classNames(styles.actionButton, styles.dangerButton)}
              onClick={handleResetProgress}
            >
              <FaUndoAlt className={styles.navIcon} />
              Reset Progress
            </button>
          </div>

          <div className={styles.section}>
            <h4>
              <FaCog className={styles.sectionIcon} /> Overlay
            </h4>

            <div className={styles.setting}>
              <label>Opacity</label>
              <div className={styles.opacityControl}>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={localOpacity}
                  onChange={(e) => handleOpacityChange(Number(e.target.value))}
                />
                <span>{Math.round(localOpacity * 100)}%</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4>Hotkeys</h4>
            <div className={styles.hotkeyList}>
              <div className={styles.hotkeyItem}>
                <span>Toggle Overlay:</span>
                <kbd>F9</kbd>
              </div>
              <div className={styles.hotkeyItem}>
                <span>Increase Opacity:</span>
                <kbd>F10</kbd>
              </div>
              <div className={styles.hotkeyItem}>
                <span>Decrease Opacity:</span>
                <kbd>F11</kbd>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4>
              <FaEye className={styles.sectionIcon} /> Display
            </h4>

            <div className={styles.setting}>
              <label>
                <input
                  type="checkbox"
                  checked={config.gemsOnly}
                  onChange={(e) =>
                    onConfigChange({ ...config, gemsOnly: e.target.checked })
                  }
                />
                Gems Only
              </label>
            </div>

            {typeof config.showAllHints !== "undefined" && (
              <div className={styles.setting}>
                <label>
                  <input
                    type="checkbox"
                    checked={config.showAllHints}
                    onChange={(e) =>
                      onConfigChange({
                        ...config,
                        showAllHints: e.target.checked,
                      })
                    }
                  />
                  Show All Hints
                </label>
              </div>
            )}

            {typeof config.showSubsteps !== "undefined" && (
              <div className={styles.setting}>
                <label>
                  <input
                    type="checkbox"
                    checked={config.showSubsteps}
                    onChange={(e) =>
                      onConfigChange({
                        ...config,
                        showSubsteps: e.target.checked,
                      })
                    }
                  />
                  Show Substeps
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
