import { Divider, Flex, Progress, Stack, Text } from "@mantine/core";
import { ModalsContextProps } from "@mantine/modals/lib/context";
import moment from "moment";
import { MyReverseShare } from "../../types/share.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import CopyTextField from "../upload/CopyTextField";

const showReverseShareInfoModal = (
  modals: ModalsContextProps,
  reverseShare: MyReverseShare,
) => {
  const link = `${window.location.origin}/upload/${reverseShare.token}`;
  const maxShareSize = parseInt(reverseShare.maxShareSize);
  const currentSize = reverseShare.currentSize || 0;
  const sizeProgress = maxShareSize > 0 ? (currentSize / maxShareSize) * 100 : 0;

  const formattedCreatedAt = moment(reverseShare.createdAt).format("LLL");
  const formattedExpiration =
    moment(reverseShare.shareExpiration).unix() === 0
      ? "Never"
      : moment(reverseShare.shareExpiration).format("LLL");

  return modals.openModal({
    title: "闪包信息",
    children: (
      <Stack align="stretch" spacing="md">
        <Text size="sm">
          <b>闪包名称: </b>
          {reverseShare.name || "-"}
        </Text>
        <Text size="sm">
          <b>创建日期: </b>
          {formattedCreatedAt}
        </Text>
        <Text size="sm">
          <b>过期日期: </b>
          {formattedExpiration}
        </Text>
        <Divider />
        <CopyTextField link={link} />
        <Divider />
        <Text size="sm">
          <b>文件大小: </b>
          {byteToHumanSizeString(currentSize)} / {byteToHumanSizeString(maxShareSize)} ({sizeProgress.toFixed(1)}%)
        </Text>
        <Flex align="center" justify="center">
          {sizeProgress < 0.1 && (
            <Text size="xs" style={{ marginRight: "4px" }}>
              {byteToHumanSizeString(currentSize)}
            </Text>
          )}
          <Progress
            value={sizeProgress}
            label={sizeProgress >= 0.1 ? byteToHumanSizeString(currentSize) : ""}
            style={{ width: sizeProgress < 0.1 ? "70%" : "80%" }}
            size="xl"
            radius="xl"
          />
          <Text size="xs" style={{ marginLeft: "4px" }}>
            {byteToHumanSizeString(maxShareSize)}
          </Text>
        </Flex>
      </Stack>
    ),
  });
};

export default showReverseShareInfoModal;