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

import Toast from "@/components/Toast";

// ─── TYPE DEFINITIONS ─────────────────────────────────────────────────
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
};

interface TaskInputPremiumProps {
  onAdd: (
    title: string,
    description?: string,
    dueDate?: Date | null,
  ) => Promise<void>;
  theme: ThemeType;
}

export default function TaskInputUltimatePremium({
  onAdd,
  theme,
}: TaskInputPremiumProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [isFocused, setIsFocused] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const buttonGlowAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    setIsActive(true);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.04,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
      Animated.timing(focusAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: false,
          }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: false,
          }),
        ]),
      ),
    ]).start();
  };

  const handleBlur = () => {
    if (!title.trim()) {
      setIsFocused(false);
      setIsActive(false);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
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
      Toast.show({
        msg: "Add a title to create a task",
        bgColor: theme.error,
      });
      return;
    }
    onAdd(title.trim(), description.trim() || undefined, dueDate);
    setTitle("");
    setDescription("");
    setDueDate(null);
    setIsFocused(false);
    setIsActive(false);
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

  const surfaceGradient: [ColorValue, ColorValue] = [
    theme.surfaceLight as ColorValue,
    theme.surface as ColorValue,
  ];

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Premium glow backdrop */}
      {/* {isActive && (
        <Animated.View
          style={[
            styles.glowBackdrop,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.5],
              }),
            },
          ]}
        />
      )} */}

      <LinearGradient
        colors={surfaceGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <BlurView intensity={70} tint="dark" style={styles.blur}>
          {/* Premium gradient accent bar */}
          <LinearGradient
            colors={accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.accentBar}
          />

          {/* Top shimmer line */}
          <View style={styles.shimmerLine} />

          {/* Shimmer effect overlay */}
          {isActive && (
            <Animated.View
              style={[
                styles.shimmerOverlay,
                {
                  opacity: shimmerAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.2, 0],
                  }),
                  transform: [
                    {
                      translateX: shimmerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-400, 400],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}

          <View style={styles.titleRow}>
            <Animated.View
              style={[styles.leadIcon, hasContent && styles.leadIconActive]}
            >
              {hasContent ? (
                <LinearGradient
                  colors={accentGradient}
                  style={styles.iconGradient}
                >
                  <View style={styles.iconGlow} />
                  <Text style={styles.leadIconTextActive}>✓</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.leadIconText}>+</Text>
              )}
            </Animated.View>

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
                styles.descriptionContainer,
                {
                  backgroundColor: theme.surfaceBright + "60",
                  opacity: focusAnim,
                  transform: [
                    {
                      translateY: focusAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TextInput
                placeholder="Add details or notes…"
                placeholderTextColor={theme.textTertiary}
                value={description}
                onChangeText={setDescription}
                style={[styles.descInput, { color: theme.textSecondary }]}
                multiline
                numberOfLines={2}
                returnKeyType="done"
                onSubmitEditing={handleAdd}
              />
            </Animated.View>
          )}

          <View
            style={[
              styles.separator,
              { backgroundColor: theme.surfaceBright + "70" },
            ]}
          />

          <View style={styles.actionRow}>
            <Pressable
              onPress={() => setShowPicker(true)}
              style={({ pressed }) => [
                styles.dateChip,
                {
                  backgroundColor: dueDate
                    ? theme.infoGlow
                    : theme.surfaceBright + "50",
                  borderColor: dueDate
                    ? theme.info + "50"
                    : "rgba(255,255,255,0.1)",
                },
                pressed && styles.chipPressed,
              ]}
            >
              <Text style={styles.dateChipEmoji}>{dueDate ? "📅" : "🕐"}</Text>
              <Text
                style={[
                  styles.dateChipText,
                  {
                    color: dueDate ? theme.info : theme.textSecondary,
                  },
                ]}
              >
                {dueDate
                  ? dueDate.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : "Set due date"}
              </Text>
            </Pressable>

            {dueDate && (
              <Pressable
                onPress={() => setDueDate(null)}
                style={({ pressed }) => [
                  styles.clearBtn,
                  pressed && styles.clearBtnPressed,
                ]}
              >
                <Text style={styles.clearBtnText}>✕</Text>
              </Pressable>
            )}

            <View style={{ flex: 1 }} />

            <Pressable
              onPress={handleAdd}
              onPressIn={() => {
                Animated.loop(
                  Animated.sequence([
                    Animated.timing(buttonGlowAnim, {
                      toValue: 1,
                      duration: 600,
                      useNativeDriver: false,
                    }),
                    Animated.timing(buttonGlowAnim, {
                      toValue: 0,
                      duration: 600,
                      useNativeDriver: false,
                    }),
                  ]),
                ).start();
              }}
              style={({ pressed }) => [
                styles.addFab,
                pressed && styles.addFabPressed,
              ]}
            >
              <LinearGradient
                colors={
                  hasContent
                    ? (accentGradient as ColorValue[])
                    : (surfaceGradient as ColorValue[])
                }
                style={styles.fabGradient}
              >
                {/* Glow effect */}
                {hasContent && (
                  <Animated.View
                    style={[
                      styles.fabGlowPulse,
                      {
                        opacity: buttonGlowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.3, 0.7],
                        }),
                      },
                    ]}
                  />
                )}
                <Text style={styles.addFabText}>+</Text>
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

// ─── STYLES ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 28,
    marginHorizontal: 2,
  },
  glowBackdrop: {
    position: "absolute",
    top: -50,
    left: -30,
    right: -30,
    height: 380,
    borderRadius: 24,
    backgroundColor: "#00D4FF",
    zIndex: -1,
  },
  card: {
    borderRadius: 26,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.55,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  blur: {
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4.5,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  shimmerLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  leadIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  leadIconActive: {
    borderColor: "rgba(255,255,255,0.45)",
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  iconGlow: {
    position: "absolute",
    width: "140%",
    height: "140%",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  leadIconText: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
    zIndex: 1,
  },
  leadIconTextActive: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFF",
    zIndex: 1,
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    paddingVertical: 8,
    letterSpacing: -0.5,
  },
  descriptionContainer: {
    marginHorizontal: 0,
    marginBottom: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
  },
  descInput: {
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 22,
    paddingVertical: 0,
  },
  separator: {
    height: 1.5,
    marginVertical: 16,
    marginHorizontal: 0,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    gap: 8,
    borderWidth: 2,
  },
  dateChipEmoji: {
    fontSize: 16,
  },
  dateChipText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  chipPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.94 }],
  },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239,68,68,0.15)",
  },
  clearBtnPressed: {
    backgroundColor: "rgba(239,68,68,0.25)",
    transform: [{ scale: 0.88 }],
  },
  clearBtnText: {
    fontSize: 18,
    color: "#EF4444",
    fontWeight: "800",
  },
  addFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  fabGlowPulse: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.4)",
    zIndex: 0,
  },
  addFabPressed: {
    transform: [{ scale: 0.85 }],
  },
  addFabText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "400",
    zIndex: 1,
  },
});
