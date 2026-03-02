import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  completed: boolean;
  onToggle: () => void;
  onDelete: () => void;
  theme?: any;
};

export default function TaskItemDark({
  title,
  description,
  dueDate,
  completed,
  onToggle,
  onDelete,
  theme,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  // Trigger checkmark animation when task completes
  useEffect(() => {
    if (completed) {
      Animated.spring(checkAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      checkAnim.setValue(0);
    }
  }, [completed, checkAnim]);

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
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDelete();
    });
  };

  // Determine colors based on theme
  const textPrimary = theme?.textPrimary || "#F0F4FF";
  const textSecondary = theme?.textSecondary || "#A8B4D4";
  const textTertiary = theme?.textTertiary || "#6B7491";
  const surfaceLight = theme?.surfaceLight || "#242B4A";
  const surfaceBright = theme?.surfaceBright || "#2F3654";
  const success = theme?.success || "#10B981";
  const warning = theme?.warning || "#F59E0B";
  const error = theme?.error || "#EF4444";
  const successGlow = theme?.successGlow || "rgba(16, 185, 129, 0.2)";
  const warningGlow = theme?.warningGlow || "rgba(245, 158, 11, 0.2)";
  const errorGlow = theme?.errorGlow || "rgba(239, 68, 68, 0.2)";

  const accentBarColor = isOverdue ? error : isToday ? warning : "#3B82F6";
  const accentGlow = isOverdue
    ? errorGlow
    : isToday
      ? warningGlow
      : successGlow;

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
        colors={[surfaceLight, surfaceBright]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.linearGradient}
      >
        <BlurView intensity={50} tint="dark" style={styles.blurContainer}>
          {/* Accent bar with glow */}
          <LinearGradient
            colors={[accentBarColor, accentBarColor + "80"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.accentBar, { backgroundColor: accentBarColor }]}
          />

          <View style={[styles.accentGlow, { backgroundColor: accentGlow }]} />

          <View style={styles.innerRow}>
            {/* Enhanced checkbox with gradient */}
            <Pressable
              onPress={onToggle}
              hitSlop={12}
              style={({ pressed }) => [
                styles.checkbox,
                completed && styles.checkboxCompleted,
                pressed && styles.checkboxPressed,
              ]}
            >
              {completed && (
                <LinearGradient
                  colors={[success, "#059669"]}
                  style={styles.checkmarkGradient}
                >
                  <Animated.Text
                    style={[
                      styles.checkmarkText,
                      {
                        transform: [
                          {
                            scale: checkAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.5, 1],
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
                  { color: textPrimary },
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
                    { color: textSecondary },
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
                      ? [error + "20", error + "05"]
                      : isToday
                        ? [warning + "20", warning + "05"]
                        : ["#3B82F6" + "20", "#3B82F6" + "05"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.dateChip,
                    {
                      borderColor: isOverdue
                        ? error
                        : isToday
                          ? warning
                          : "#3B82F6",
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
                          ? error
                          : isToday
                            ? warning
                            : "#3B82F6",
                      },
                    ]}
                  >
                    {formatDueDate(dueDate)}
                  </Text>
                </LinearGradient>
              )}
            </View>

            {/* Delete button with hover effect */}
            <Pressable
              onPress={handleDelete}
              hitSlop={14}
              style={({ pressed }) => [
                styles.deleteBtn,
                pressed && styles.deleteBtnPressed,
              ]}
            >
              <LinearGradient
                colors={[error + "20", error + "05"]}
                style={styles.deleteBtnGradient}
              >
                <Text style={[styles.deleteIcon, { color: error }]}>✕</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 12,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    marginHorizontal: 2,
  },

  linearGradient: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  blurContainer: {
    borderRadius: 18,
    overflow: "hidden",
  },

  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },

  accentGlow: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    opacity: 0.3,
  },

  innerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },

  // ─── Checkbox with Gradient ──────────────────────────────────
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  checkboxCompleted: {
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#10B981",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  checkboxPressed: {
    transform: [{ scale: 0.88 }],
  },

  checkmarkGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  checkmarkText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 16,
  },

  // ─── Text block ────────────────────────────────────────────────
  textBlock: {
    flex: 1,
    gap: 5,
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
    lineHeight: 20,
  },

  titleCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.5,
    fontWeight: "400",
  },

  description: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
  },

  textCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.4,
  },

  // ─── Date chip ─────────────────────────────────────────────────
  dateChip: {
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
  },

  dateChipEmoji: {
    fontSize: 12,
  },

  dateChipText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.05,
  },

  // ─── Delete button ─────────────────────────────────────────────
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  deleteBtnGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteBtnPressed: {
    transform: [{ scale: 0.92 }],
  },

  deleteIcon: {
    fontSize: 14,
    fontWeight: "600",
  },
});
