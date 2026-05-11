import { Button, Center, createStyles, Group, Text } from "@mantine/core";
import { Dropzone as MantineDropzone } from "@mantine/dropzone";
import { ForwardedRef, useEffect, useRef, useState } from "react";
import { TbCloudUpload, TbPlus, TbUpload } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import useTranslate from "../../hooks/useTranslate.hook";
import { FileUpload } from "../../types/File.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
    marginBottom: 30,
  },

  transferWrapper: {
    position: "relative",
    zIndex: 5,
    width: "min(360px, calc(100vw - 32px))",
    marginBottom: 0,
    transition: "width 360ms cubic-bezier(0.22, 1, 0.36, 1)",
  },

  transferWrapperReceiveActive: {
    width: "min(360px, calc(100vw - 32px))",
  },

  dropzone: {
    borderWidth: 1,
    paddingBottom: 50,
  },

  transferDropzone: {
    boxSizing: "border-box",
    border: "3px solid transparent",
    padding: 0,
    background: "transparent",
    overflow: "visible",

    "&:hover": {
      background: "transparent",
    },
  },

  icon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[4],
  },

  control: {
    position: "absolute",
    bottom: -20,
  },

  transferCard: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 72,
    gap: 10,
    padding: "8px 10px 8px 20px",
    borderRadius: 999,
    background: "#ffffff",
    color: "#000000",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
    transition:
      "transform 200ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 200ms cubic-bezier(0.22, 1, 0.36, 1)",
    cursor: "pointer",
    pointerEvents: "auto",

    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 10px 28px rgba(0, 0, 0, 0.12)",
    },
  },

  transferAddAction: {
    flex: "1 1 196px",
    minWidth: 0,
    height: 56,
    position: "relative",
    display: "flex",
    alignItems: "center",
    borderRadius: 999,
    overflow: "hidden",
    transition:
      "flex-basis 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms cubic-bezier(0.22, 1, 0.36, 1), transform 200ms cubic-bezier(0.22, 1, 0.36, 1)",
    paddingRight: 118,
  },

  transferAddActionHovered: {
    transform: "scale(1.02)",
  },

  transferAddActionReceiveActive: {
    flexBasis: 170,
    opacity: 0.95,
  },

  transferPlus: {
    display: "grid",
    placeItems: "center",
    flex: "0 0 28px",
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "transparent",
    color: "#000000",
    transition:
      "transform 200ms cubic-bezier(0.22, 1, 0.36, 1), color 200ms cubic-bezier(0.22, 1, 0.36, 1)",
  },

  transferPlusHovered: {
    transform: "translateX(2px) scale(1.08)",
  },

  transferText: {
    position: "relative",
    flex: "0 1 auto",
    minWidth: 0,
    height: 42,
    minInlineSize: 150,
  },

  transferLabelRow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    display: "flex",
    alignItems: "center",
    minWidth: 0,
    opacity: 1,
    transform: "translateY(-50%)",
    transition: "opacity 220ms ease, transform 260ms ease",
  },

  transferLabelRowHoverOut: {
    opacity: 0,
    transform: "translateY(calc(-50% - 4px))",
  },

  transferClickLabelRow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: -1,
    opacity: 0,
    transform: "translateY(4px)",
    transition: "opacity 180ms ease, transform 180ms ease",
  },

  transferClickLabelRowVisible: {
    opacity: 1,
    transform: "translateY(0)",
  },

  transferTitle: {
    position: "relative",
    display: "inline-block",
    color: "#000000",
    fontSize: 24,
    lineHeight: 1.05,
    fontWeight: 800,
    letterSpacing: 0,
    whiteSpace: "nowrap",
    transition:
      "font-weight 180ms ease, letter-spacing 180ms ease, transform 180ms ease",

    [theme.fn.smallerThan("xs")]: {
      fontSize: 20,
    },
  },

  transferTitleActive: {
    fontWeight: 800,
    letterSpacing: "0.2px",
  },

  transferPhaseTitle: {
    animation: "transferTextSwap 260ms cubic-bezier(0.22, 1, 0.36, 1)",
  },

  transferBounceChar: {
    display: "inline-block",
    animation: "transferBounceChar 460ms cubic-bezier(0.2, 1.2, 0.36, 1)",
  },

  transferHoverSubTitle: {
    marginTop: 4,
    color: "#777777",
    fontSize: 12,
    lineHeight: 1,
    fontWeight: 500,
    letterSpacing: 0,
    whiteSpace: "nowrap",
  },

  transferDescription: {
    color: "#4d5159",
    fontSize: 12,
    marginTop: 6,

    [theme.fn.smallerThan("xs")]: {
      display: "none",
    },
  },

  transferReceive: {
    position: "absolute",
    top: 12,
    right: 10,
    left: "calc(100% - 122px)",
    zIndex: 3,
    width: 112,
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 0,
    paddingRight: 0,
    borderRadius: 999,
    border: 0,
    background: "#f3f3f3",
    color: "#000000",
    fontWeight: 800,
    overflow: "hidden",
    cursor: "pointer",
    transition:
      "left 420ms cubic-bezier(0.22, 1, 0.36, 1), width 360ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms cubic-bezier(0.22, 1, 0.36, 1), transform 260ms cubic-bezier(0.22, 1, 0.36, 1), background 200ms cubic-bezier(0.22, 1, 0.36, 1), border-color 200ms cubic-bezier(0.22, 1, 0.36, 1)",

    "&:hover": {
      background: "#ffd84d",
    },
  },

  transferReceiveAnimated: {
    left: 8,
    right: 10,
    width: "auto",
    background: "#ffffff",
    border: "3px solid #ffd84d",
    color: "#000000",
    boxShadow: "0 10px 26px rgba(0, 0, 0, 0.12)",
    transition:
      "left 420ms cubic-bezier(0.22, 1, 0.36, 1) 1000ms, width 360ms cubic-bezier(0.22, 1, 0.36, 1) 1000ms, opacity 200ms cubic-bezier(0.22, 1, 0.36, 1), transform 260ms cubic-bezier(0.22, 1, 0.36, 1), background 200ms cubic-bezier(0.22, 1, 0.36, 1), border-color 200ms cubic-bezier(0.22, 1, 0.36, 1) 1000ms, box-shadow 260ms ease 1000ms",
    animation: "receiveMorphFill 1420ms cubic-bezier(0.22, 1, 0.36, 1)",

    "&:hover": {
      background: "#ffffff",
    },
  },

  transferReceiveFocused: {
    left: 8,
    right: 10,
    width: "auto",
    background: "#ffffff",
    border: "3px solid #ffd84d",
    color: "#000000",
    boxShadow: "0 10px 26px rgba(0, 0, 0, 0.12)",
    transition:
      "left 420ms cubic-bezier(0.22, 1, 0.36, 1), width 360ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms cubic-bezier(0.22, 1, 0.36, 1), transform 260ms cubic-bezier(0.22, 1, 0.36, 1), background 200ms cubic-bezier(0.22, 1, 0.36, 1), border-color 200ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 260ms ease",

    "&:hover": {
      background: "#ffffff",
    },
  },

  transferReceiveDimmed: {
    opacity: 0.9,
  },

  transferReceiveLabel: {
    display: "block",
    opacity: 1,
    transform: "translateY(0)",
    transition: "opacity 180ms ease, transform 180ms ease",
  },

  transferReceiveLabelHidden: {
    opacity: 0,
    transform: "translateY(-4px)",
    transitionDelay: "1000ms",
  },

  transferReceiveLabelFocusedHidden: {
    opacity: 0,
    transform: "translateY(-4px)",
    transitionDelay: "0ms",
  },

  transferReceiveInput: {
    position: "absolute",
    inset: "0 16px",
    display: "flex",
    alignItems: "center",
    opacity: 0,
    transform: "translateY(4px)",
    transition: "opacity 140ms ease, transform 140ms ease",
    pointerEvents: "none",
  },

  transferReceiveInputVisible: {
    opacity: 1,
    transform: "translateY(0)",
    transition: "opacity 180ms ease 1150ms, transform 180ms ease 1150ms",
    pointerEvents: "auto",
  },

  transferReceiveInputFocusedVisible: {
    opacity: 1,
    transform: "translateY(0)",
    transition: "opacity 180ms ease, transform 180ms ease",
    pointerEvents: "auto",
  },

  transferCaret: {
    width: 1,
    height: 18,
    marginRight: 8,
    background: "#000000",
    animation: "receiveCaretBlink 600ms infinite",
  },

  transferPlaceholder: {
    width: "100%",
    border: 0,
    outline: "none",
    background: "transparent",
    color: "#000000",
    fontSize: 14,
    fontWeight: 800,
    whiteSpace: "nowrap",
    caretColor: "#000000",

    "&::placeholder": {
      color: "#000000",
      opacity: 1,
    },
  },

  "@global": {
    "@keyframes receiveMorphFill": {
      "0%": { background: "#f3f3f3" },
      "12%": { background: "#ffd84d" },
      "70%": { background: "#ffd84d" },
      "100%": { background: "#ffffff" },
    },
    "@keyframes receiveCaretBlink": {
      "0%, 45%": { opacity: 1 },
      "46%, 100%": { opacity: 0 },
    },
    "@keyframes transferTextSwap": {
      "0%": { opacity: 0, transform: "translateY(4px)" },
      "100%": { opacity: 1, transform: "translateY(0)" },
    },
    "@keyframes transferBounceChar": {
      "0%": { opacity: 0, transform: "translateX(-10px) scale(0.86)" },
      "62%": { opacity: 1, transform: "translateX(2px) scale(1.06)" },
      "100%": { opacity: 1, transform: "translateX(0) scale(1)" },
    },
  },
}));

const Dropzone = ({
  title,
  addHoverLabel,
  addHoverSubLabel,
  receiveLabel,
  receivePlaceholder,
  receiveCodeLength = 8,
  isUploading,
  maxShareSize,
  onFilesChanged,
  onReceive,
  variant = "default",
}: {
  title?: string;
  addHoverLabel?: string;
  addHoverSubLabel?: string;
  receiveLabel?: string;
  receivePlaceholder?: string;
  receiveCodeLength?: number;
  isUploading: boolean;
  maxShareSize: number;
  onFilesChanged: (files: FileUpload[]) => void;
  onReceive?: (code?: string) => void;
  variant?: "default" | "stellarTransfer";
}) => {
  const t = useTranslate();

  const { classes } = useStyles();
  const openRef = useRef<() => void>();
  const receiveInputRef = useRef<HTMLInputElement>(null);
  const [isAddHovered, setIsAddHovered] = useState(false);
  const [isReceiveHovered, setIsReceiveHovered] = useState(false);
  const [isReceiveFocused, setIsReceiveFocused] = useState(false);
  const [receiveCode, setReceiveCode] = useState("");
  const [addHoverPhase, setAddHoverPhase] = useState<"flash" | "add">("flash");
  const isReceiveActive = isReceiveHovered || isReceiveFocused;

  useEffect(() => {
    if (!isAddHovered) {
      setAddHoverPhase("flash");
      return;
    }

    setAddHoverPhase("flash");
    const timeout = window.setTimeout(() => {
      setAddHoverPhase("add");
    }, 520);

    return () => window.clearTimeout(timeout);
  }, [isAddHovered]);

  const addTitleText = title ?? t("upload.dropzone.title");
  const focusReceiveInput = () => {
    setIsAddHovered(false);
    setIsReceiveFocused(true);
    window.setTimeout(() => receiveInputRef.current?.focus(), 0);
  };

  const submitReceiveCode = (code: string) => {
    const normalizedCode = code.trim();
    if (!normalizedCode) return;
    onReceive?.(normalizedCode);
  };

  const renderAddHoverTitle = () => {
    if (addHoverPhase === "flash") return addHoverLabel ?? "闪一下～";

    if (addTitleText.length <= 1) return addTitleText;

    return (
      <>
        {addTitleText.slice(0, -1)}
        <span className={classes.transferBounceChar}>
          {addTitleText.slice(-1)}
        </span>
      </>
    );
  };

  const dropzoneContent =
    variant == "stellarTransfer" ? (
      <div
        className={classes.transferCard}
        onMouseLeave={() => {
          setIsAddHovered(false);
          setIsReceiveHovered(false);
        }}
      >
        <Group
          className={`${classes.transferAddAction} ${
            isAddHovered ? classes.transferAddActionHovered : ""
          } ${isReceiveActive ? classes.transferAddActionReceiveActive : ""}`}
          spacing={12}
          noWrap
          onMouseEnter={() => {
            if (!isReceiveActive) setIsAddHovered(true);
          }}
          onMouseLeave={() => setIsAddHovered(false)}
        >
          <div
            className={`${classes.transferPlus} ${
              isAddHovered ? classes.transferPlusHovered : ""
            }`}
          >
            <TbPlus size={28} strokeWidth={3} />
          </div>
          <div className={classes.transferText}>
            <div
              className={`${classes.transferLabelRow} ${
                isAddHovered ? classes.transferLabelRowHoverOut : ""
              }`}
            >
              <Text
                className={`${classes.transferTitle} ${
                  isAddHovered ? classes.transferTitleActive : ""
                }`}
              >
                {title || <FormattedMessage id="upload.dropzone.title" />}
              </Text>
            </div>
            <div
              className={`${classes.transferClickLabelRow} ${
                isAddHovered ? classes.transferClickLabelRowVisible : ""
              }`}
            >
              <Text
                key={addHoverPhase}
                className={`${classes.transferTitle} ${classes.transferTitleActive}`}
              >
                <span className={classes.transferPhaseTitle}>
                  {renderAddHoverTitle()}
                </span>
              </Text>
              {addHoverSubLabel && (
                <Text className={classes.transferHoverSubTitle}>
                  {addHoverSubLabel}
                </Text>
              )}
            </div>
          </div>
        </Group>
        {onReceive && (
          <div
            role="button"
            tabIndex={0}
            className={`${classes.transferReceive} ${
              isReceiveFocused
                ? classes.transferReceiveFocused
                : isReceiveHovered
                  ? classes.transferReceiveAnimated
                  : ""
            } ${isAddHovered ? classes.transferReceiveDimmed : ""}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (!isUploading) focusReceiveInput();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                if (!isUploading) focusReceiveInput();
              }
            }}
            onMouseEnter={() => {
              setIsAddHovered(false);
              setIsReceiveHovered(true);
            }}
          >
            <span
              className={`${classes.transferReceiveLabel} ${
                isReceiveFocused
                  ? classes.transferReceiveLabelFocusedHidden
                  : isReceiveHovered
                    ? classes.transferReceiveLabelHidden
                    : ""
              }`}
            >
              {receiveLabel ?? "接受文件"}
            </span>
            <span
              className={`${classes.transferReceiveInput} ${
                isReceiveFocused
                  ? classes.transferReceiveInputFocusedVisible
                  : isReceiveHovered
                    ? classes.transferReceiveInputVisible
                    : ""
              }`}
            >
              <span className={classes.transferCaret} />
              <input
                ref={receiveInputRef}
                className={classes.transferPlaceholder}
                value={receiveCode}
                placeholder={receivePlaceholder ?? "请输入取件码"}
                maxLength={receiveCodeLength}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setReceiveCode(value);
                  if (value.trim().length >= receiveCodeLength) {
                    submitReceiveCode(value);
                  }
                }}
                onFocus={() => setIsReceiveFocused(true)}
                onBlur={() => {
                  if (!receiveCode.trim()) setIsReceiveFocused(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    submitReceiveCode(receiveCode);
                  }
                }}
              />
            </span>
          </div>
        )}
      </div>
    ) : (
      <div style={{ pointerEvents: "none" }}>
        <Group position="center">
          <TbCloudUpload size={50} />
        </Group>
        <Text align="center" weight={700} size="lg" mt="xl">
          {title || <FormattedMessage id="upload.dropzone.title" />}
        </Text>
        <Text align="center" size="sm" mt="xs" color="dimmed">
          <FormattedMessage
            id="upload.dropzone.description"
            values={{ maxSize: byteToHumanSizeString(maxShareSize) }}
          />
        </Text>
      </div>
    );

  return (
    <div
      className={
        variant == "stellarTransfer"
          ? `${classes.transferWrapper} ${
              isReceiveActive ? classes.transferWrapperReceiveActive : ""
            }`
          : classes.wrapper
      }
    >
      <MantineDropzone
        onReject={(e) => {
          toast.error(e[0].errors[0].message);
        }}
        disabled={isUploading}
        openRef={openRef as ForwardedRef<() => void>}
        onDrop={(files: FileUpload[]) => {
          const fileSizeSum = files.reduce((n, { size }) => n + size, 0);

          if (maxShareSize > 0 && fileSizeSum > maxShareSize) {
            toast.error(
              t("upload.dropzone.notify.file-too-big", {
                maxSize: byteToHumanSizeString(maxShareSize),
              }),
            );
          } else {
            files = files.map((newFile) => {
              newFile.uploadingProgress = 0;
              return newFile;
            });
            onFilesChanged(files);
          }
        }}
        className={
          variant == "stellarTransfer"
            ? classes.transferDropzone
            : classes.dropzone
        }
        radius="md"
      >
        {dropzoneContent}
      </MantineDropzone>
      {variant == "default" && (
        <Center>
          <Button
            className={classes.control}
            variant="light"
            size="sm"
            radius="xl"
            disabled={isUploading}
            onClick={() => openRef.current && openRef.current()}
          >
            {<TbUpload />}
          </Button>
        </Center>
      )}
    </div>
  );
};
export default Dropzone;
