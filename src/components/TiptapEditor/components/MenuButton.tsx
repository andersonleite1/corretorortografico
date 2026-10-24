import React, { CSSProperties, memo, useMemo, useRef, useState } from "react";
import clsx from "clsx";

import Tooltip from "./ui/Tooltip";
import Icon, { type IconProps } from "./ui/Icon";
import Button, { type ButtonProps } from "./ui/Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "./ui/DropdownMenu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/Popover";

import { getShortcutKey } from "../utils/shortcut";
import { useTiptapContext } from "./Provider";

interface MenuButtonProps extends Omit<
  ButtonProps,
  "variant" | "ref" | "type"
> {
  icon?: IconProps["name"];
  type?: "button" | "dropdown" | "popover";
  buttonType?: ButtonProps["type"];
  text?: string;
  active?: boolean;
  shortcuts?: string[];
  hideText?: boolean;
  hideArrow?: boolean;
  tooltip?: string | boolean;
  buttonClass?: string;
  buttonStyle?: CSSProperties;
  dropdownClass?: string;
  dropdownStyle?: CSSProperties;
  openOnHover?: boolean;
}

const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  (
    {
      active,
      icon,
      text,
      shortcuts,
      children,
      type,
      buttonType,
      hideText = true,
      hideArrow = false,
      tooltip = true,
      buttonClass,
      buttonStyle,
      dropdownClass,
      dropdownStyle,
      openOnHover,
      disabled,
      ...props
    },
    ref,
  ) => {
    const { editor, contentElement } = useTiptapContext();
    const shouldOpenOnHover =
      openOnHover ?? (type === "dropdown" || type === "popover");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hoverOpen = useRef(false);
    const clickFromHover = useRef(false);

    const clearCloseTimer = () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      closeTimer.current = null;
    };
    const scheduleHoverClose = () => {
      if (!hoverOpen.current) return;
      clearCloseTimer();
      closeTimer.current = setTimeout(() => {
        hoverOpen.current = false;
        setDropdownOpen(false);
      }, 250);
    };
    React.useEffect(
      () => () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
      },
      [],
    );
    const handlePointerEnter = (event: React.PointerEvent<HTMLButtonElement>) => {
      props.onPointerEnter?.(event);
      if (
        !shouldOpenOnHover ||
        event.pointerType !== "mouse" ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches
      ) return;
      clearCloseTimer();
      hoverOpen.current = true;
      setDropdownOpen(true);
    };

    const hasArrowIcon =
      type === "dropdown" || (type === "popover" && !hideArrow);
    const hasIconOnly = hideText && !hasArrowIcon;

    const tooltipContent = useMemo(() => {
      if (shouldOpenOnHover || tooltip === false) return null;
      const content = {
        title: typeof tooltip === "string" ? tooltip : text,
        shortcuts: shortcuts
          ? `(${shortcuts.map(getShortcutKey).join(" + ")})`
          : "",
      };

      return `${content.title} ${content.shortcuts}`;
    }, [shouldOpenOnHover, tooltip, text, shortcuts]);

    const renderIcon = useMemo(
      () => (icon ? <Icon name={icon} className="rte-button-icon" /> : null),
      [icon],
    );

    const renderButton = (
      <Button
        ref={ref}
        type={buttonType}
        variant="ghost"
        className={clsx("rte-menu__button", buttonClass)}
        style={buttonStyle}
        iconOnly={hasIconOnly}
        slotBefore={!hasIconOnly && renderIcon}
        slotAfter={
          hasArrowIcon && (
            <span className="rte-icon-arrow">
              <Icon name="ChevronDown" size={16} />
            </span>
          )
        }
        onFocusCapture={(e) => e.stopPropagation()}
        data-active={(editor.isEditable && active) || undefined}
        aria-pressed={
          active === undefined
            ? undefined
            : Boolean(editor.isEditable && active)
        }
        aria-label={
          hideText
            ? typeof tooltip === "string"
              ? tooltip
              : text
            : typeof tooltip === "string" && tooltip !== text
              ? `${tooltip} ${text}`
              : text
        }
        disabled={!editor.isEditable || disabled}
        {...props}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={(event) => {
          props.onPointerLeave?.(event);
          scheduleHoverClose();
        }}
        onPointerDownCapture={(event) => {
          props.onPointerDownCapture?.(event);
          if (hoverOpen.current) {
            clearCloseTimer();
            clickFromHover.current = true;
          }
        }}
        onClick={(event) => {
          props.onClick?.(event);
          if (clickFromHover.current && event.detail > 0 && hoverOpen.current) {
            event.preventDefault();
            hoverOpen.current = false;
          }
          clickFromHover.current = false;
        }}
      >
        {hasIconOnly ? renderIcon : !hideText && text}
      </Button>
    );

    const renderContent = tooltipContent ? (
      <Tooltip
        content={tooltipContent}
        options={{ collisionBoundary: contentElement.current?.parentElement }}
      >
        {renderButton}
      </Tooltip>
    ) : (
      renderButton
    );

    if (type === "dropdown") {
      return (
        <DropdownMenu
          modal={false}
          open={shouldOpenOnHover ? dropdownOpen : undefined}
          onOpenChange={shouldOpenOnHover ? (nextOpen) => {
            if (!nextOpen) {
              clearCloseTimer();
              hoverOpen.current = false;
            }
            setDropdownOpen(nextOpen);
          } : undefined}
        >
          <DropdownMenuTrigger asChild>{renderContent}</DropdownMenuTrigger>
          <DropdownMenuContent
            className={dropdownClass}
            style={dropdownStyle}
            onEntryFocus={(event) => {
              if (hoverOpen.current) event.preventDefault();
            }}
            onPointerEnter={clearCloseTimer}
            onPointerLeave={scheduleHoverClose}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {children}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    if (type === "popover") {
      return (
        <Popover
          modal={false}
          open={shouldOpenOnHover ? dropdownOpen : undefined}
          onOpenChange={shouldOpenOnHover ? (nextOpen) => {
            if (!nextOpen) {
              clearCloseTimer();
              hoverOpen.current = false;
            }
            setDropdownOpen(nextOpen);
          } : undefined}
        >
          <PopoverTrigger asChild>{renderContent}</PopoverTrigger>
          <PopoverContent
            className={dropdownClass}
            style={dropdownStyle}
            onOpenAutoFocus={(event) => {
              if (hoverOpen.current) event.preventDefault();
            }}
            onPointerEnter={clearCloseTimer}
            onPointerLeave={scheduleHoverClose}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {children}
          </PopoverContent>
        </Popover>
      );
    }

    return renderContent;
  },
);

MenuButton.displayName = "MenuButton";

export default memo(MenuButton);
