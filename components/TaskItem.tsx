import { BlurView } from "expo-blur";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  completed: boolean;
  onToggle: () => void;
  onDelete: () => void;
};

export default function TaskItem({
  title,
  description,
  dueDate,
  completed,
  onToggle,
  onDelete,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

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
      <BlurView intensity={70} tint="light" style={styles.blurContainer}>
        {/* Overdue accent bar */}
        {isOverdue && <View style={styles.overdueBar} />}
        {isToday && <View style={styles.todayBar} />}

        <View style={styles.innerRow}>
          {/* Enhanced checkbox */}
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
              <View style={styles.checkmarkWrap}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </Pressable>

          {/* Text content */}
          <View style={styles.textBlock}>
            <Text
              numberOfLines={2}
              style={[styles.title, completed && styles.titleCompleted]}
            >
              {title}
            </Text>

            {!!description && (
              <Text
                numberOfLines={2}
                style={[styles.description, completed && styles.textCompleted]}
              >
                {description}
              </Text>
            )}

            {/* Enhanced date chip */}
            {!!dueDate && (
              <View
                style={[
                  styles.dateChip,
                  isOverdue
                    ? styles.dateChipOverdue
                    : isToday
                      ? styles.dateChipToday
                      : styles.dateChipNormal,
                ]}
              >
                <Text style={styles.dateChipEmoji}>
                  {isOverdue ? "⚠️" : isToday ? "🔔" : "⏱️"}
                </Text>
                <Text
                  style={[
                    styles.dateChipText,
                    isOverdue
                      ? styles.dateChipTextOverdue
                      : isToday
                        ? styles.dateChipTextToday
                        : styles.dateChipTextNormal,
                  ]}
                >
                  {formatDueDate(dueDate)}
                </Text>
              </View>
            )}
          </View>

          {/* Delete button */}
          <Pressable
            onPress={handleDelete}
            hitSlop={14}
            style={({ pressed }) => [
              styles.deleteBtn,
              pressed && styles.deleteBtnPressed,
            ]}
          >
            <Text style={styles.deleteIcon}>✕</Text>
          </Pressable>
        </View>
      </BlurView>
    </Animated.View>
  );
}

// ─── Design tokens ────────────────────────────────────────────────
const RADIUS = 18;
const GLASS_BG = "rgba(255, 255, 255, 0.96)";
const GLASS_BORDER = "rgba(0, 0, 0, 0.06)";
const SEPARATOR = "rgba(0, 0, 0, 0.08)";

const BLUE = "#0084FF";
const RED = "#FF3B30";
const RED_SOFT = "rgba(255, 59, 48, 0.12)";
const BLUE_SOFT = "rgba(0, 132, 255, 0.12)";
const ORANGE = "#FF9500";
const ORANGE_SOFT = "rgba(255, 149, 0, 0.12)";
const GREEN = "#34C759";
const MUTED = "rgba(0, 0, 0, 0.4)";
const MUTED_TEXT = "rgba(0, 0, 0, 0.55)";

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 12,
    borderRadius: RADIUS,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    marginHorizontal: 2,
  },

  blurContainer: {
    borderRadius: RADIUS,
    overflow: "hidden",
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },

  overdueBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: RED,
  },

  todayBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: ORANGE,
  },

  innerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },

  // ─── Checkbox ──────────────────────────────────────
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: SEPARATOR,
    backgroundColor: "rgba(0,0,0,0.02)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  checkboxCompleted: {
    backgroundColor: GREEN,
    borderColor: GREEN,
    shadowColor: GREEN,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  checkboxPressed: {
    transform: [{ scale: 0.88 }],
  },

  checkmarkWrap: {
    alignItems: "center",
    justifyContent: "center",
  },

  checkmarkText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 16,
  },

  // ─── Text block ────────────────────────────────────
  textBlock: {
    flex: 1,
    gap: 5,
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0D0D0D",
    letterSpacing: -0.2,
    lineHeight: 20,
  },

  titleCompleted: {
    textDecorationLine: "line-through",
    color: MUTED,
    fontWeight: "400",
  },

  description: {
    fontSize: 13,
    color: MUTED_TEXT,
    lineHeight: 18,
    fontWeight: "400",
  },

  textCompleted: {
    textDecorationLine: "line-through",
    color: MUTED,
  },

  // ─── Date chip ─────────────────────────────────────
  dateChip: {
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  dateChipNormal: {
    backgroundColor: BLUE_SOFT,
  },

  dateChipToday: {
    backgroundColor: ORANGE_SOFT,
  },

  dateChipOverdue: {
    backgroundColor: RED_SOFT,
  },

  dateChipEmoji: {
    fontSize: 12,
  },

  dateChipText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.05,
  },

  dateChipTextNormal: {
    color: BLUE,
  },

  dateChipTextToday: {
    color: ORANGE,
  },

  dateChipTextOverdue: {
    color: RED,
  },

  // ─── Delete button ─────────────────────────────────
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 59, 48, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  deleteBtnPressed: {
    backgroundColor: "rgba(255, 59, 48, 0.18)",
    transform: [{ scale: 0.92 }],
  },

  deleteIcon: {
    fontSize: 14,
    color: RED,
    fontWeight: "600",
  },
});
