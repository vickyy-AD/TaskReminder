import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  ColorValue,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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

interface TaskItemPremiumProps {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  completed: boolean;
  onToggle: () => void;
  onDelete: () => void;
  theme: ThemeType;
}

export default function TaskItemPremium({
  title,
  description,
  dueDate,
  completed,
  onToggle,
  onDelete,
  theme,
}: TaskItemPremiumProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Trigger animations on completion
  useEffect(() => {
    if (completed) {
      Animated.parallel([
        Animated.spring(checkAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(shimmerAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: false,
            }),
            Animated.timing(shimmerAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: false,
            }),
          ]),
        ),
      ]).start();
    } else {
      checkAnim.setValue(0);
      shimmerAnim.setValue(0);
    }
  }, [completed, checkAnim, shimmerAnim]);

  const formatDueDate = (iso: string) => {
    const date = new Date(iso);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    let dateStr = "";
    if (isToday) {
      dateStr = "Today";
    } else if (isTomorrow) {
      dateStr = "Tomorrow";
    } else {
      dateStr = date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }

    const time = date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr}, ${time}`;
  };

  const isOverdue = !!dueDate && !completed && new Date(dueDate) < new Date();
  const isToday =
    !!dueDate &&
    !completed &&
    new Date(dueDate).toDateString() === new Date().toDateString();

  const handleDelete = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDelete();
    });
  };

  const accentBarColor = isOverdue
    ? theme.error
    : isToday
      ? theme.warning
      : theme.info;
  const accentGlow = isOverdue
    ? theme.errorGlow
    : isToday
      ? theme.warningGlow
      : theme.infoGlow;

  const successGradient: [ColorValue, ColorValue] = [
    theme.success as ColorValue,
    "#059669" as ColorValue,
  ];

  const surfaceGradient: [ColorValue, ColorValue] = [
    theme.surfaceLight as ColorValue,
    theme.surfaceBright as ColorValue,
  ];

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <LinearGradient
        colors={surfaceGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.linearGradient}
      >
        <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
          {/* Premium accent bar with glow */}
          <View
            style={[
              styles.accentBar,
              {
                backgroundColor: accentBarColor,
              },
            ]}
          />

          {/* Accent glow effect */}
          <Animated.View
            style={[
              styles.accentGlow,
              {
                backgroundColor: accentGlow,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.8],
                }),
              },
            ]}
          />

          {/* Shimmer effect on completion */}
          {completed && (
            <Animated.View
              style={[
                styles.shimmerEffect,
                {
                  opacity: shimmerAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.4, 0],
                  }),
                },
              ]}
            />
          )}

          <View style={styles.innerRow}>
            {/* Enhanced checkbox with glow */}
            <Pressable
              onPress={onToggle}
              hitSlop={14}
              style={({ pressed }) => [
                styles.checkbox,
                completed && styles.checkboxCompleted,
                pressed && styles.checkboxPressed,
              ]}
            >
              {completed && (
                <LinearGradient
                  colors={successGradient}
                  style={styles.checkmarkGradient}
                >
                  {/* Checkmark glow */}
                  <View style={styles.checkGlow} />

                  <Animated.Text
                    style={[
                      styles.checkmarkText,
                      {
                        transform: [
                          {
                            scale: checkAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.3, 1],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    ✓
                  </Animated.Text>
                </LinearGradient>
              )}
            </Pressable>

            {/* Text content */}
            <View style={styles.textBlock}>
              <Text
                numberOfLines={2}
                style={[
                  styles.title,
                  { color: theme.textPrimary },
                  completed && styles.titleCompleted,
                ]}
              >
                {title}
              </Text>

              {!!description && (
                <Text
                  numberOfLines={2}
                  style={[
                    styles.description,
                    { color: theme.textSecondary },
                    completed && styles.textCompleted,
                  ]}
                >
                  {description}
                </Text>
              )}

              {/* Enhanced date chip */}
              {!!dueDate && (
                <LinearGradient
                  colors={
                    isOverdue
                      ? [
                          (theme.error + "25") as string,
                          (theme.error + "10") as string,
                        ]
                      : isToday
                        ? [
                            (theme.warning + "25") as string,
                            (theme.warning + "10") as string,
                          ]
                        : [
                            (theme.info + "25") as string,
                            (theme.info + "10") as string,
                          ]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.dateChip,
                    {
                      borderColor: isOverdue
                        ? theme.error
                        : isToday
                          ? theme.warning
                          : theme.info,
                    },
                  ]}
                >
                  <Text style={styles.dateChipEmoji}>
                    {isOverdue ? "⚠️" : isToday ? "🔔" : "⏱️"}
                  </Text>
                  <Text
                    style={[
                      styles.dateChipText,
                      {
                        color: isOverdue
                          ? theme.error
                          : isToday
                            ? theme.warning
                            : theme.info,
                      },
                    ]}
                  >
                    {formatDueDate(dueDate)}
                  </Text>
                </LinearGradient>
              )}
            </View>

            {/* Delete button with glow */}
            <Pressable
              onPress={handleDelete}
              hitSlop={16}
              style={({ pressed }) => [
                styles.deleteBtn,
                pressed && styles.deleteBtnPressed,
              ]}
            >
              <LinearGradient
                colors={[
                  (theme.error + "25") as ColorValue,
                  (theme.error + "08") as ColorValue,
                ]}
                style={styles.deleteBtnGradient}
              >
                <Text style={[styles.deleteIcon, { color: theme.error }]}>
                  ✕
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 14,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    marginHorizontal: 2,
  },

  linearGradient: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  blurContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },

  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },

  accentGlow: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },

  shimmerEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  innerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },

  // ─── Checkbox ──────────────────────────────────────
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  checkboxCompleted: {
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#10B981",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  checkboxPressed: {
    transform: [{ scale: 0.84 }],
  },

  checkmarkGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  checkGlow: {
    position: "absolute",
    width: "120%",
    height: "120%",
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.3)",
  },

  checkmarkText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 20,
    zIndex: 1,
  },

  // ─── Text block ────────────────────────────────────
  textBlock: {
    flex: 1,
    gap: 6,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
    lineHeight: 22,
  },

  titleCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.45,
    fontWeight: "400",
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "400",
  },

  textCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.35,
  },

  // ─── Date chip ─────────────────────────────────────
  dateChip: {
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
  },

  dateChipEmoji: {
    fontSize: 13,
  },

  dateChipText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.1,
  },

  // ─── Delete button ─────────────────────────────────
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    flexShrink: 0,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  deleteBtnGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteBtnPressed: {
    transform: [{ scale: 0.88 }],
  },

  deleteIcon: {
    fontSize: 16,
    fontWeight: "700",
  },
});
