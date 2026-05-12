import {
  Button,
  Col,
  Grid,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { useModals } from "@mantine/modals";
import { ModalsContextProps } from "@mantine/modals/lib/context";
import moment from "moment";
import * as yup from "yup";
import useTranslate from "../../hooks/useTranslate.hook";
import { MyReverseShare } from "../../types/share.type";
import { Timespan } from "../../types/timespan.type";
import { getExpirationPreview } from "../../utils/date.util";
import shareService from "../../services/share.service";
import toast from "../../utils/toast.util";
import FileSizeInput from "../core/FileSizeInput";

const showEditReverseShareModal = (
  modals: ModalsContextProps,
  reverseShare: MyReverseShare,
  maxExpiration: Timespan,
  getReverseShares: () => void,
) => {
  return modals.openModal({
    title: "编辑闪包",
    children: (
      <Body
        reverseShare={reverseShare}
        maxExpiration={maxExpiration}
        getReverseShares={getReverseShares}
      />
    ),
  });
};

const Body = ({
  reverseShare,
  maxExpiration,
  getReverseShares,
}: {
  reverseShare: MyReverseShare;
  maxExpiration: Timespan;
  getReverseShares: () => void;
}) => {
  const modals = useModals();
  const t = useTranslate();

  const initialExpiration = moment(reverseShare.shareExpiration).diff(moment(), "days");
  const form = useForm({
    initialValues: {
      name: reverseShare.name || "",
      maxShareSize: parseInt(reverseShare.maxShareSize),
      expiration_num: Math.max(1, initialExpiration),
      expiration_unit: "-days",
    },
    validate: yupResolver(
      yup.object().shape({
        maxShareSize: yup
          .number()
          .min(1, t("common.error.number-too-small", { min: 1 }))
          .required(t("common.error.field-required")),
      }),
    ),
  });

  const onSubmit = form.onSubmit(async (values) => {
    const expirationDate = moment().add(
      form.values.expiration_num,
      form.values.expiration_unit.replace(
        "-",
        "",
      ) as moment.unitOfTime.DurationConstructor,
    );
    if (
      maxExpiration.value != 0 &&
      expirationDate.isAfter(
        moment().add(maxExpiration.value, maxExpiration.unit),
      )
    ) {
      form.setFieldError(
        "expiration_num",
        t("upload.modal.expires.error.too-long", {
          max: moment
            .duration(maxExpiration.value, maxExpiration.unit)
            .humanize(),
        }),
      );
      return;
    }

    shareService
      .updateReverseShare(reverseShare.id, {
        name: values.name || undefined,
        maxShareSize: values.maxShareSize.toString(),
        shareExpiration: values.expiration_num + values.expiration_unit,
      })
      .then(() => {
        modals.closeAll();
        getReverseShares();
        toast.success("闪包已更新");
      })
      .catch(toast.axiosError);
  });

  return (
    <Group>
      <form onSubmit={onSubmit}>
        <Stack align="stretch">
          <TextInput
            label={t("account.reverseShares.modal.name.label")}
            placeholder={t("account.reverseShares.modal.name.placeholder")}
            {...form.getInputProps("name")}
          />
          <div>
            <Grid align={form.errors.expiration_num ? "center" : "flex-end"}>
              <Col xs={6}>
                <NumberInput
                  min={1}
                  max={99999}
                  precision={0}
                  variant="filled"
                  label={t("account.reverseShares.modal.expiration.label")}
                  {...form.getInputProps("expiration_num")}
                />
              </Col>
              <Col xs={6}>
                <Select
                  {...form.getInputProps("expiration_unit")}
                  data={[
                    {
                      value: "-minutes",
                      label:
                        form.values.expiration_num == 1
                          ? t("upload.modal.expires.minute-singular")
                          : t("upload.modal.expires.minute-plural"),
                    },
                    {
                      value: "-hours",
                      label:
                        form.values.expiration_num == 1
                          ? t("upload.modal.expires.hour-singular")
                          : t("upload.modal.expires.hour-plural"),
                    },
                    {
                      value: "-days",
                      label:
                        form.values.expiration_num == 1
                          ? t("upload.modal.expires.day-singular")
                          : t("upload.modal.expires.day-plural"),
                    },
                    {
                      value: "-weeks",
                      label:
                        form.values.expiration_num == 1
                          ? t("upload.modal.expires.week-singular")
                          : t("upload.modal.expires.week-plural"),
                    },
                    {
                      value: "-months",
                      label:
                        form.values.expiration_num == 1
                          ? t("upload.modal.expires.month-singular")
                          : t("upload.modal.expires.month-plural"),
                    },
                    {
                      value: "-years",
                      label:
                        form.values.expiration_num == 1
                          ? t("upload.modal.expires.year-singular")
                          : t("upload.modal.expires.year-plural"),
                    },
                  ]}
                />
              </Col>
            </Grid>
            <Text
              mt="sm"
              italic
              size="xs"
              sx={(theme) => ({
                color: theme.colors.gray[6],
              })}
            >
              {getExpirationPreview(
                {
                  expiresOn: t("account.reverseShare.expires-on"),
                  neverExpires: t("account.reverseShare.never-expires"),
                },
                form,
              )}
            </Text>
          </div>
          <FileSizeInput
            label={t("account.reverseShares.modal.max-size.label")}
            value={form.values.maxShareSize}
            onChange={(number) => form.setFieldValue("maxShareSize", number)}
          />
          <Button mt="md" type="submit">
            {t("common.button.save")}
          </Button>
        </Stack>
      </form>
    </Group>
  );
};

export default showEditReverseShareModal;