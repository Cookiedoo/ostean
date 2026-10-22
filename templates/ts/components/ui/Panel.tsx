import type { ReactElement } from "react";
import { PANEL_CLASS } from "../../core/constants.js";
import type { Reading } from "../../core/schemas.js";
import { Value } from "./Value.js";

// Compose the numeric presentation panel.
export function Panel(props: Reading): ReactElement {
  return <section className={PANEL_CLASS}><Value value={props.value} /></section>;
}
