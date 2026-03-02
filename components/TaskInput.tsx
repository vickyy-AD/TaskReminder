import Toast from "@/components/Toast";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Animated,
  ColorValue,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type ThemeType = {
  background: string;
  surface: string;
  surfaceLight: string;
  surfaceBright: string;
  accentGradient: [string, string];
  accentGradient2: [string, string];
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  successGlow: string;
  warningGlow: string;
  errorGlow: string;
  infoGlow: string;
  gold: string;
  goldLight: string;
  goldDark: string;
};

interface TaskInputProps {
  onAdd: (
    title: string,
    description?: string,
    dueDate?: Date | null,
  ) => Promise<void>;
  theme: ThemeType;
}

export default function TaskInputGoldenLuxury({
  onAdd,
  theme,
}: TaskInputProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [isFocused, setIsFocused] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.06,
        useNativeDriver: true,
        friction: 7,
      }),
      Animated.timing(focusAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 3500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 3500,
            useNativeDriver: false,
          }),
        ]),
      ),
    ]).start();
  };

  const handleBlur = () => {
    if (!title.trim()) {
      setIsFocused(false);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(focusAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleAdd = () => {
    if (!title.trim()) {
      Toast.show({ msg: "Add a title", bgColor: theme.error });
      return;
    }
    onAdd(title.trim(), description.trim() || undefined, dueDate);
    setTitle("");
    setDescription("");
    setDueDate(null);
    setIsFocused(false);
  };

  const handlePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "dismissed") {
      setShowPicker(false);
      return;
    }
    if (pickerMode === "date" && date) {
      const merged = dueDate ? new Date(dueDate) : new Date(date);
      merged.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setDueDate(merged);
      if (Platform.OS === "android") {
        setShowPicker(false);
        setTimeout(() => {
          setPickerMode("time");
          setShowPicker(true);
        }, 300);
      } else {
        setPickerMode("time");
      }
    } else if (pickerMode === "time" && date) {
      const merged = dueDate ? new Date(dueDate) : new Date();
      merged.setHours(date.getHours(), date.getMinutes());
      setDueDate(merged);
      setShowPicker(false);
    }
  };

  const hasContent = title.trim().length > 0;
  const accentGradient: [ColorValue, ColorValue] = [
    theme.accentGradient[0] as ColorValue,
    theme.accentGradient[1] as ColorValue,
  ];

  return (
    <Animated.View
      style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}
    >
      {/* {isFocused && (
        <Animated.View
          style={[
            styles.glowBackdrop,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.1, 0.4],
              }),
            },
          ]}
        />
      )} */}

      <LinearGradient
        colors={[theme.surfaceLight, theme.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <BlurView intensity={70} tint="dark" style={styles.blur}>
          <LinearGradient colors={accentGradient} style={styles.goldenBar} />
          <View style={styles.topLine} />

          <View style={styles.titleRow}>
            <View
              style={[styles.leadIcon, hasContent && styles.leadIconActive]}
            >
              {hasContent ? (
                <LinearGradient
                  colors={accentGradient}
                  style={styles.iconGradient}
                >
                  <Text style={styles.checkIcon}>✓</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.plusIcon}>+</Text>
              )}
            </View>

            <TextInput
              placeholder="What needs to be done?"
              placeholderTextColor={theme.textTertiary}
              value={title}
              onChangeText={setTitle}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={[styles.titleInput, { color: theme.textPrimary }]}
              returnKeyType="next"
            />
          </View>

          {(isFocused || description) && (
            <Animated.View
              style={[
                styles.descriptionBox,
                {
                  backgroundColor: theme.surfaceBright + "70",
                  opacity: focusAnim,
                },
              ]}
            >
              <TextInput
                placeholder="Add details…"
                placeholderTextColor={theme.textTertiary}
                value={description}
                onChangeText={setDescription}
                style={[styles.descInput, { color: theme.textSecondary }]}
                multiline
                numberOfLines={2}
              />
            </Animated.View>
          )}

          <View
            style={[
              styles.separator,
              { backgroundColor: theme.surfaceBright + "80" },
            ]}
          />

          <View style={styles.actionRow}>
            <Pressable
              onPress={() => setShowPicker(true)}
              style={({ pressed }) => [
                styles.dateBtn,
                {
                  backgroundColor: dueDate
                    ? theme.infoGlow
                    : theme.surfaceBright + "60",
                },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.dateEmoji}>{dueDate ? "📅" : "🕐"}</Text>
              <Text
                style={[
                  styles.dateText,
                  { color: dueDate ? theme.gold : theme.textSecondary },
                ]}
              >
                {dueDate
                  ? dueDate.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : "Date"}
              </Text>
            </Pressable>

            {dueDate && (
              <Pressable
                onPress={() => setDueDate(null)}
                style={({ pressed }) => [
                  styles.clearBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.clearX}>✕</Text>
              </Pressable>
            )}

            <View style={{ flex: 1 }} />

            <Pressable
              onPress={handleAdd}
              style={({ pressed }) => [
                styles.addBtn,
                pressed && styles.pressed,
              ]}
            >
              <LinearGradient
                colors={accentGradient}
                style={styles.addGradient}
              >
                <Text style={styles.addText}>+</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </BlurView>
      </LinearGradient>

      {showPicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode={pickerMode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={new Date()}
          onChange={handlePickerChange}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 32,
    marginHorizontal: 2,
  },
  glowBackdrop: {
    position: "absolute",
    top: -60,
    left: -30,
    right: -30,
    height: 400,
    borderRadius: 28,
    backgroundColor: "#FFD700",
    zIndex: -1,
  },
  card: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#FFD700",
    shadowOpacity: 0.6,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 14,
  },
  blur: {
    paddingHorizontal: 22,
    paddingVertical: 20,
    borderRadius: 28,
  },
  goldenBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  topLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,215,0,0.3)",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  leadIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,215,0,0.08)",
  },
  leadIconActive: {
    borderColor: "rgba(255,215,0,0.6)",
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  checkIcon: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
  },
  plusIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    paddingVertical: 8,
    letterSpacing: -0.5,
  },
  descriptionBox: {
    marginHorizontal: 0,
    marginBottom: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  descInput: {
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 20,
  },
  separator: {
    height: 2,
    marginVertical: 16,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 2,
    borderColor: "rgba(255,215,0,0.3)",
  },
  dateEmoji: { fontSize: 15 },
  dateText: { fontSize: 13, fontWeight: "700" },
  clearBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,82,82,0.15)",
  },
  clearX: { fontSize: 16, color: "#FF5252", fontWeight: "800" },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#FFD700",
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  addGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  addText: { color: "#FFF", fontSize: 24, fontWeight: "400" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.94 }] },
});
