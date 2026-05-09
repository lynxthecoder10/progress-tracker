import { Fragment, isValidElement } from "react";

export function isFragment(value: unknown) {
  return isValidElement(value) && value.type === Fragment;
}
