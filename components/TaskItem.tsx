import { COLORS } from "@/constants/colors";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
  const formatDueDate = (iso: string) => {
    const date = new Date(iso);
    const day = date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    const time = date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${day}, ${time}`;
  };

  const isOverdue =
    !!dueDate && !completed && new Date(dueDate) < new Date();
  return (
    <Pressable style={styles.card} onPress={onToggle}>
      <View style={styles.row}>
        <View style={styles.left}>
          <View
            style={[styles.checkbox, completed && styles.checkboxCompleted]}
          >
            {completed && <Text style={styles.checkboxTick}>✓</Text>}
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[styles.title, completed && styles.titleCompleted]}
              numberOfLines={2}
            >
              {title}
            </Text>
            {!!description && (
              <Text
                style={[
                  styles.description,
                  completed && styles.descriptionCompleted,
                ]}
                numberOfLines={4}
              >
                {description}
              </Text>
            )}
            {!!dueDate && (
              <Text
                style={[
                  styles.dueDate,
                  isOverdue && styles.dueDateOverdue,
                  completed && styles.descriptionCompleted,
                ]}
              >
                {isOverdue ? "⚠ " : "🕐 "}
                {formatDueDate(dueDate)}
              </Text>
            )}
          </View>
        </View>

        <Pressable onPress={onDelete} hitSlop={8}>
          <Text style={styles.delete}>🗑️</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    shadowColor: COLORS.black,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: COLORS.placeholder,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: COLORS.card,
  },
  checkboxCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxTick: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },
  title: {
    fontSize: 15,
    color: COLORS.text,
    flexShrink: 1,
    fontWeight: "600",
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: COLORS.textMuted,
  },
  textContainer: {
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  descriptionCompleted: {
    textDecorationLine: "line-through",
    color: COLORS.textMuted,
  },
  dueDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  dueDateOverdue: {
    color: COLORS.delete,
  },
  delete: {
    fontSize: 20,
    color: COLORS.delete,
    fontWeight: "600",
  },
});
