import { useElectron } from "../../hooks/useElectron";
import styles from "./styles.module.css";
import classNames from "classnames";
import { useState } from "react";
import { FaEyeSlash, FaCog, FaGripVertical } from "react-icons/fa";

interface OverlayHeaderProps {
  onToggleSettings: () => void;
  isSettingsOpen: boolean;
}

export const OverlayHeader = ({
  onToggleSettings,
  isSettingsOpen,
}: OverlayHeaderProps) => {
  const { isElectron, toggleOverlay } = useElectron();
  const [isDragging, setIsDragging] = useState(false);

  if (!isElectron) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={classNames(styles.header, { [styles.dragging]: isDragging })}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className={styles.dragArea}>
        <FaGripVertical className={styles.gripIcon} />
        <span className={styles.title}>PoE Leveling Guide</span>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.controlButton}
          onClick={onToggleSettings}
          title="Settings"
        >
          <FaCog />
        </button>

        <button
          className={styles.controlButton}
          onClick={toggleOverlay}
          title="Hide Overlay (F9)"
        >
          <FaEyeSlash />
        </button>
      </div>
    </div>
  );
};
