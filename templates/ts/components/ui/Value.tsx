import type { ReactElement } from "react";
import { VALUE_CLASS } from "../../core/constants.js";
import type { Reading } from "../../core/schemas.js";

// Render the canonical numeric value.
export function Value(props: Reading): ReactElement {
  return <output className={VALUE_CLASS}>{props.value}</output>;
}
