import Toast from "@/components/Toast";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import { useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  onAdd: (title: string, description?: string, dueDate?: Date | null) => void;
};

export default function TaskInput({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [isFocused, setIsFocused] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const handleAdd = () => {
    if (!title.trim()) {
      if (description.trim() || dueDate) {
        Toast.show({ msg: "Add a title to create a task", bgColor: "red" });
      }
      return;
    }
    onAdd(title.trim(), description.trim() || undefined, dueDate);
    setTitle("");
    setDescription("");
    setDueDate(null);
    setIsFocused(false);
  };

  const openDatePicker = () => {
    setPickerMode("date");
    setShowPicker(true);
  };

  const handlePickerChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (event.type === "dismissed") {
      setShowPicker(false);
      return;
    }

    if (pickerMode === "date" && selectedDate) {
      const merged = dueDate ? new Date(dueDate) : new Date(selectedDate);
      merged.setFullYear(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      );
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
    } else if (pickerMode === "time" && selectedDate) {
      const merged = dueDate ? new Date(dueDate) : new Date();
      merged.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setDueDate(merged);
      setShowPicker(false);
    }
  };

  const formatDueDate = (date: Date) => {
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

  const hasContent = title.trim().length > 0;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    if (!hasContent) {
      setIsFocused(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <BlurView intensity={85} tint="light" style={styles.blurCard}>
        {/* Gradient accent top */}
        <View style={styles.accentBar} />

        {/* Title row with enhanced icon */}
        <View style={styles.titleRow}>
          <View style={[styles.leadIcon, hasContent && styles.leadIconActive]}>
            <Text
              style={[
                styles.leadIconText,
                hasContent && styles.leadIconTextActive,
              ]}
            >
              {hasContent ? "✓" : "+"}
            </Text>
          </View>
          <TextInput
            placeholder="What needs to be done?"
            placeholderTextColor={PLACEHOLDER}
            value={title}
            onChangeText={setTitle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={styles.titleInput}
            returnKeyType="next"
          />
        </View>

        {/* Description with subtle background */}
        {(isFocused || description) && (
          <View style={styles.descriptionContainer}>
            <TextInput
              placeholder="Add details or notes…"
              placeholderTextColor={PLACEHOLDER_SOFT}
              value={description}
              onChangeText={setDescription}
              style={styles.descInput}
              multiline
              numberOfLines={2}
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />
          </View>
        )}

        {/* Enhanced separator */}
        <View style={styles.separator} />

        {/* Action row with better spacing */}
        <View style={styles.actionRow}>
          {/* Date chip - premium style */}
          <Pressable
            onPress={openDatePicker}
            style={({ pressed }) => [
              styles.dateChip,
              dueDate && styles.dateChipSet,
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={styles.dateChipEmoji}>
              {dueDate ? "📅" : "🕐"}
            </Text>
            <Text
              style={[styles.dateChipText, dueDate && styles.dateChipTextSet]}
            >
              {dueDate ? formatDueDate(dueDate) : "Set due date"}
            </Text>
          </Pressable>

          {/* Clear date button */}
          {dueDate && (
            <Pressable
              onPress={() => setDueDate(null)}
              hitSlop={10}
              style={({ pressed }) => [
                styles.clearBtn,
                pressed && styles.clearBtnPressed,
              ]}
            >
              <Text style={styles.clearBtnText}>✕</Text>
            </Pressable>
          )}

          <View style={{ flex: 1 }} />

          {/* Premium add button */}
          <Pressable
            onPress={handleAdd}
            style={({ pressed }) => [
              styles.addFab,
              pressed && styles.addFabPressed,
              hasContent && styles.addFabActive,
            ]}
          >
            <Text style={styles.addFabText}>+</Text>
          </Pressable>
        </View>
      </BlurView>

      {/* Date / time picker */}
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

// ─── Design tokens ─────────────────────────────────────────────────
const RADIUS = 20;
const GLASS_BG = "rgba(255,255,255,0.96)";
const GLASS_BORDER = "rgba(0,0,0,0.06)";
const SEPARATOR = "rgba(0,0,0,0.08)";
const PLACEHOLDER = "rgba(0,0,0,0.35)";
const PLACEHOLDER_SOFT = "rgba(0,0,0,0.25)";
const BLUE = "#0084FF";
const BLUE_SOFT = "rgba(0,132,255,0.12)";
const ACCENT = "#FF6B6B";

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
    marginHorizontal: 2,
  },

  blurCard: {
    borderRadius: RADIUS,
    overflow: "hidden",
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  // Gradient accent bar at top
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: BLUE,
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },

  leadIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: PLACEHOLDER,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: "rgba(0,0,0,0.02)",
  },

  leadIconActive: {
    borderStyle: "solid",
    borderColor: BLUE,
    backgroundColor: BLUE_SOFT,
  },

  leadIconText: {
    fontSize: 16,
    fontWeight: "600",
    color: PLACEHOLDER,
  },

  leadIconTextActive: {
    color: BLUE,
  },

  titleInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#0D0D0D",
    paddingVertical: 4,
    letterSpacing: -0.3,
  },

  descriptionContainer: {
    marginBottom: 8,
    marginLeft: 40,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 12,
  },

  descInput: {
    fontSize: 14,
    fontWeight: "400",
    color: "rgba(0,0,0,0.65)",
    lineHeight: 20,
    paddingVertical: 0,
  },

  separator: {
    height: 1,
    backgroundColor: SEPARATOR,
    marginVertical: 12,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderWidth: 1,
    borderColor: SEPARATOR,
    gap: 6,
  },

  dateChipSet: {
    backgroundColor: BLUE_SOFT,
    borderColor: BLUE,
    borderWidth: 1.2,
  },

  dateChipEmoji: {
    fontSize: 14,
  },

  dateChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(0,0,0,0.5)",
  },

  dateChipTextSet: {
    color: BLUE,
    fontWeight: "600",
  },

  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  clearBtnPressed: {
    backgroundColor: "rgba(255,59,48,0.1)",
  },

  clearBtnText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "600",
  },

  addFab: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: SEPARATOR,
  },

  addFabActive: {
    backgroundColor: BLUE,
    borderColor: BLUE,
    shadowColor: BLUE,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  addFabPressed: {
    transform: [{ scale: 0.92 }],
  },

  addFabText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "400",
    lineHeight: 24,
  },

  chipPressed: {
    opacity: 0.7,
  },
});