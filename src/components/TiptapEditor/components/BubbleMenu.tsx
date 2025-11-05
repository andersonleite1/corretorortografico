import React from "react";
import clsx from "clsx";
import {
  BubbleMenu as TipTapBubbleMenu,
  type BubbleMenuProps as TipTapBubbleMenuProps,
} from "@tiptap/react/menus";

export type BubbleMenuProps = TipTapBubbleMenuProps;

export const BubbleMenu = ({ className, children, ...props }: BubbleMenuProps) => {
  return (
    <TipTapBubbleMenu {...props} className={clsx("rte-bubble-menu", className)}>
      {children}
    </TipTapBubbleMenu>
  );
};
