import React from "react";
import MenuButton from "../../MenuButton";
import { DropdownMenuItem } from "../../ui/DropdownMenu";
import { useTiptapContext } from "../../Provider";

interface SizeDropdownProps {
  value: number;
  onChange: (value: number | null) => void;
}

const SizeDropdown = ({ value, onChange }: SizeDropdownProps) => {
  const { messages } = useTiptapContext();
  const options = [null, 25, 50, 75, 100];
  return (
    <MenuButton
      type="dropdown"
      buttonStyle={{ width: "6.5rem" }}
      dropdownStyle={{ width: "7rem" }}
      icon="Ruler"
      text={value ? `${value}%` : messages.general.default}
      hideText={false}
      tooltip={false}
    >
      {options.map((option, index) => (
        <DropdownMenuItem
          key={index}
          data-active={option == value || undefined}
          onSelect={() => onChange(option)}
        >
          {option ? messages.image.sizeOptionLabel(option) : messages.general.default}
        </DropdownMenuItem>
      ))}
    </MenuButton>
  );
};

export default SizeDropdown;
