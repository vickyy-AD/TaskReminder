import { COLORS } from "@/constants/colors";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: screenHeight } = Dimensions.get("window");

interface ToastOptions {
  msg: string;
  bgColor?: string;
  textColor?: string;
  isShowCancel?: boolean;
  textStyle?: object;
  dismissDuration?: number;
  autoDismiss?: boolean;
}

type ToastInternal = ToastOptions & { id: number };

let globalToastRef: ((options: ToastOptions) => void) | null = null;
const toastQueue: ToastInternal[] = [];
let lastMessage = "";

interface ToastComponent extends React.FC {
  show: (options: ToastOptions) => void;
}

const Toast: ToastComponent = () => {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ToastInternal | null>(null);
  const slideAnim = useRef(new Animated.Value(-screenHeight)).current;

  useEffect(() => {
    globalToastRef = (opts: ToastOptions) => {
      if (opts.msg.trim() === lastMessage.trim()) return;

      lastMessage = opts.msg;

      const newToast: ToastInternal = { ...opts, id: Date.now() };
      toastQueue.push(newToast);
      if (!visible) showNextToast();
    };

    return () => {
      globalToastRef = null;
    };
  }, [visible]);

  const showNextToast = () => {
    if (toastQueue.length === 0) {
      lastMessage = "";
      return;
    }

    const nextToast = toastQueue.shift();
    if (!nextToast) return;

    setOptions(nextToast);
    setVisible(true);

    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    if (nextToast.autoDismiss !== false) {
      setTimeout(() => {
        hideToast();
      }, nextToast.dismissDuration || 2500);
    }
  };

  const hideToast = () => {
    Animated.timing(slideAnim, {
      toValue: -screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setOptions(null);
      setTimeout(showNextToast, 250);
    });
  };

  if (!visible || !options) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: options.bgColor || "black",
          transform: [{ translateY: slideAnim }],
          marginTop: insets.top,
        },
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.text,
            { color: options.textColor || "white" },
            options.textStyle,
          ]}
        >
          {options.msg}
        </Text>
        {options.isShowCancel && (
          <TouchableOpacity onPress={hideToast} style={styles.cancelButton}>
            <Text
              style={[
                styles.cancelIcon,
                { color: options.textColor || "white" },
              ]}
            >
              ×
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

Toast.show = (options: ToastOptions) => {
  if (globalToastRef) {
    globalToastRef(options);
  } else {
    setTimeout(() => {
      if (globalToastRef) globalToastRef(options);
    }, 200);
  }
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 6,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
    marginHorizontal: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "95%",
  },
  text: {
    flex: 1,
    marginRight: 16,
    fontSize: 14,
    fontWeight: "500",
  },
  cancelButton: {
    padding: 6,
  },
  cancelIcon: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default Toast;
