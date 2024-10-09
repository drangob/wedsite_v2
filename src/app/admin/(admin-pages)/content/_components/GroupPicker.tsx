import React from "react";
import {
  Card,
  CardBody,
  Radio,
  RadioGroup,
  type CardProps,
} from "@nextui-org/react";
import { type Group } from "@prisma/client";

interface GroupPickerProps extends CardProps {
  setGroup: (group: Group | null) => void;
  group: Group | null;
  isDisabled?: boolean;
}

const GroupPicker: React.FC<GroupPickerProps> = ({
  setGroup,
  group,
  isDisabled,
  ...props
}) => {
  return (
    <Card {...props}>
      <CardBody>
        <h3 className="text-lg">Pick group</h3>
        <RadioGroup
          orientation="horizontal"
          value={group ?? ""}
          onValueChange={(value) => {
            if (value === "") {
              setGroup(null);
            } else {
              setGroup(value as Group);
            }
          }}
          isDisabled={isDisabled}
        >
          <Radio value="">No</Radio>
          <Radio value="DAY">Day</Radio>
          <Radio value="EVENING">Evening</Radio>
        </RadioGroup>
      </CardBody>
    </Card>
  );
};

export default GroupPicker;
