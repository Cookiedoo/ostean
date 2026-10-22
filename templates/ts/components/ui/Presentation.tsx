import type { ReactElement } from "react";
import { APP_CLASS } from "../../core/constants.js";
import type { Reading } from "../../core/schemas.js";
import { Panel } from "./Panel.js";

// Compose the root presentation tree.
export function Presentation(props: Reading): ReactElement {
  return <main className={APP_CLASS}><Panel value={props.value} /></main>;
}
