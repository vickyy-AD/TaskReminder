import Toast from "@/components/Toast";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
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
  theme?: any;
};

export default function TaskInputDark({ onAdd, theme }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [isFocused, setIsFocused] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  // Theme defaults
  const textPrimary = theme?.textPrimary || "#F0F4FF";
  const textSecondary = theme?.textSecondary || "#A8B4D4";
  const textTertiary = theme?.textTertiary || "#6B7491";
  const surface = theme?.surface || "#1A1F3A";
  const surfaceLight = theme?.surfaceLight || "#242B4A";
  const surfaceBright = theme?.surfaceBright || "#2F3654";
  const accentGradient = theme?.accentGradient || ["#00D4FF", "#0099FF"];
  const infoGlow = theme?.infoGlow || "rgba(59, 130, 246, 0.2)";
  const info = theme?.info || "#3B82F6";
  const error = theme?.error || "#EF4444";

  const handleAdd = () => {
    if (!title.trim()) {
      if (description.trim() || dueDate) {
        Toast.show({ msg: "Add a title to create a task", bgColor: error });
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
      <LinearGradient
        colors={[surfaceLight, surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.linearGradientBg}
      >
        <BlurView intensity={50} tint="dark" style={styles.blurCard}>
          {/* Gradient accent bar at top */}
          <LinearGradient colors={accentGradient} style={styles.accentBar} />

          {/* Title row with enhanced icon */}
          <View style={styles.titleRow}>
            <View
              style={[styles.leadIcon, hasContent && styles.leadIconActive]}
            >
              {hasContent && (
                <LinearGradient
                  colors={accentGradient}
                  style={styles.iconGradientBg}
                >
                  <Text style={styles.leadIconText}>✓</Text>
                </LinearGradient>
              )}
              {!hasContent && <Text style={styles.leadIconText}>+</Text>}
            </View>
            <TextInput
              placeholder="What needs to be done?"
              placeholderTextColor={textTertiary}
              value={title}
              onChangeText={setTitle}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={[styles.titleInput, { color: textPrimary }]}
              returnKeyType="next"
            />
          </View>

          {/* Description with subtle background */}
          {(isFocused || description) && (
            <View
              style={[
                styles.descriptionContainer,
                { backgroundColor: surfaceBright + "40" },
              ]}
            >
              <TextInput
                placeholder="Add details or notes…"
                placeholderTextColor={textTertiary}
                value={description}
                onChangeText={setDescription}
                style={[styles.descInput, { color: textSecondary }]}
                multiline
                numberOfLines={2}
                returnKeyType="done"
                onSubmitEditing={handleAdd}
              />
            </View>
          )}

          {/* Enhanced separator */}
          <View
            style={[styles.separator, { backgroundColor: surfaceBright }]}
          />

          {/* Action row with better spacing */}
          <View style={styles.actionRow}>
            {/* Date chip - premium style with gradient */}
            <LinearGradient
              colors={
                dueDate ? [info + "25", info + "10"] : [surfaceBright, surface]
              }
              style={styles.dateChipGradient}
            >
              <Pressable
                onPress={openDatePicker}
                style={({ pressed }) => [
                  styles.dateChip,
                  pressed && styles.chipPressed,
                ]}
              >
                <Text style={styles.dateChipEmoji}>
                  {dueDate ? "📅" : "🕐"}
                </Text>
                <Text
                  style={[
                    styles.dateChipText,
                    { color: dueDate ? info : textSecondary },
                    dueDate && styles.dateChipTextSet,
                  ]}
                >
                  {dueDate ? formatDueDate(dueDate) : "Set due date"}
                </Text>
              </Pressable>
            </LinearGradient>

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
                <Text style={[styles.clearBtnText, { color: error }]}>✕</Text>
              </Pressable>
            )}

            <View style={{ flex: 1 }} />

            {/* Premium add button with gradient */}
            <Pressable
              onPress={handleAdd}
              style={({ pressed }) => [
                styles.addFab,
                pressed && styles.chipPressed,
              ]}
            >
              <LinearGradient
                colors={
                  hasContent ? accentGradient : [surfaceBright, surfaceLight]
                }
                style={styles.fabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.addFabText}>+</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </BlurView>
      </LinearGradient>

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

// ─── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
    marginHorizontal: 2,
  },

  linearGradientBg: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  blurCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },

  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  leadIconActive: {
    borderColor: "rgba(255,255,255,0.25)",
  },

  iconGradientBg: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },

  leadIconText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  titleInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 4,
    letterSpacing: -0.3,
  },

  descriptionContainer: {
    marginBottom: 8,
    marginLeft: 40,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },

  descInput: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    paddingVertical: 0,
  },

  separator: {
    height: 1,
    marginVertical: 12,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  dateChipGradient: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
  },

  dateChipEmoji: {
    fontSize: 14,
  },

  dateChipText: {
    fontSize: 13,
    fontWeight: "500",
  },

  dateChipTextSet: {
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
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },

  clearBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },

  addFab: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  fabGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
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
