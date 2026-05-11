import {
  createStyles,
  NumberInput,
  PasswordInput,
  Stack,
  Switch,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { AdminConfig, UpdateConfig } from "../../../types/config.type";
import { stringToTimespan, timespanToString } from "../../../utils/date.util";
import FileSizeInput from "../../core/FileSizeInput";
import TimespanInput from "../../core/TimespanInput";

const useStyles = createStyles(() => ({
  input: {
    input: {
      minHeight: 44,
      borderRadius: 14,
      borderColor: "#e5e5e5",
      fontWeight: 700,
      "&:focus": {
        borderColor: "#ffd84d",
      },
    },
    textarea: {
      borderRadius: 14,
      borderColor: "#e5e5e5",
      fontWeight: 700,
      "&:focus": {
        borderColor: "#ffd84d",
      },
    },
  },
  switch: {
    input: {
      "&:checked + *": {
        backgroundColor: "#ffd84d",
        borderColor: "#ffd84d",
      },
    },
  },
}));

const AdminConfigInput = ({
  configVariable,
  updateConfigVariable,
}: {
  configVariable: AdminConfig;
  updateConfigVariable: (variable: UpdateConfig) => void;
}) => {
  const { classes } = useStyles();
  const form = useForm({
    initialValues: {
      stringValue: configVariable.value ?? configVariable.defaultValue,
      textValue: configVariable.value ?? configVariable.defaultValue,
      numberValue: parseInt(
        configVariable.value ?? configVariable.defaultValue,
      ),
      booleanValue:
        (configVariable.value ?? configVariable.defaultValue) == "true",
    },
  });

  const onValueChange = (configVariable: AdminConfig, value: any) => {
    form.setFieldValue(`${configVariable.type}Value`, value);
    updateConfigVariable({ key: configVariable.key, value: value });
  };

  return (
    <Stack align="end">
      {configVariable.type == "string" &&
        (configVariable.obscured ? (
          <PasswordInput
            className={classes.input}
            autoComplete="new-password"
            style={{
              width: "100%",
            }}
            disabled={!configVariable.allowEdit}
            {...form.getInputProps("stringValue")}
            onChange={(e) => onValueChange(configVariable, e.target.value)}
          />
        ) : (
          <TextInput
            className={classes.input}
            style={{
              width: "100%",
            }}
            disabled={!configVariable.allowEdit}
            {...form.getInputProps("stringValue")}
            placeholder={configVariable.defaultValue}
            onChange={(e) => onValueChange(configVariable, e.target.value)}
          />
        ))}

      {configVariable.type == "text" && (
        <Textarea
          className={classes.input}
          style={{
            width: "100%",
          }}
          disabled={!configVariable.allowEdit}
          autosize
          {...form.getInputProps("textValue")}
          placeholder={configVariable.defaultValue}
          onChange={(e) => onValueChange(configVariable, e.target.value)}
        />
      )}
      {configVariable.type == "number" && (
        <NumberInput
          className={classes.input}
          {...form.getInputProps("numberValue")}
          disabled={!configVariable.allowEdit}
          placeholder={configVariable.defaultValue}
          onChange={(number) => onValueChange(configVariable, number)}
          w={201}
        />
      )}
      {configVariable.type == "filesize" && (
        <FileSizeInput
          {...form.getInputProps("numberValue")}
          disabled={!configVariable.allowEdit}
          value={parseInt(configVariable.value ?? configVariable.defaultValue)}
          onChange={(bytes) => onValueChange(configVariable, bytes)}
          w={201}
        />
      )}
      {configVariable.type == "boolean" && (
        <>
          <Switch
            className={classes.switch}
            disabled={!configVariable.allowEdit}
            {...form.getInputProps("booleanValue", { type: "checkbox" })}
            onChange={(e) => onValueChange(configVariable, e.target.checked)}
          />
        </>
      )}
      {configVariable.type == "timespan" && (
        <TimespanInput
          value={stringToTimespan(configVariable.value)}
          disabled={!configVariable.allowEdit}
          onChange={(timespan) =>
            onValueChange(configVariable, timespanToString(timespan))
          }
          w={201}
        />
      )}
    </Stack>
  );
};

export default AdminConfigInput;
