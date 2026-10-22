import { createRoot } from "react-dom/client";
import { DEMO_VALUE, INITIAL_VALUE, MOUNT_ID } from "../core/constants.js";
import { Codes } from "../core/errors.js";
import { Presentation } from "../components/ui/Presentation.js";
import { createFailureLog } from "../services/failure-log.js";
import { createValueStore } from "../services/value-store.js";
import { updateReading } from "../workflows/update-reading.js";
import "../core/styles.css";

// Wire domain services and bootstrap presentation.
function main(): void {
  const failureLog = createFailureLog();
  // Normalize renderer failures into canonical codes.
  function rendererFailure(): void {
    failureLog.record({ code: Codes.UPSTREAM_FAILURE });
  }
  const store = createValueStore({ value: INITIAL_VALUE });
  const result = updateReading({ value: DEMO_VALUE }, store);
  if (!result.ok) {
    failureLog.record({ code: result.code });
    return;
  }
  const target = document.getElementById(MOUNT_ID);
  if (target === null) {
    failureLog.record({ code: Codes.ENTITY_MISSING });
    return;
  }
  try {
    const root = createRoot(target, {
      onCaughtError: rendererFailure,
      onUncaughtError: rendererFailure,
      onRecoverableError: rendererFailure
    });
    try {
      root.render(Presentation(result.value));
    } catch {
      rendererFailure();
      root.unmount();
    }
  } catch {
    rendererFailure();
  }
}

main();
