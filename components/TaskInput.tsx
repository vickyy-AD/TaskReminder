import Toast from "@/components/Toast";
import { COLORS } from "@/constants/colors";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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

  const handleAdd = () => {
    if (!title.trim()) {
      if (description.trim() || dueDate) {
        Toast.show({
          msg: "Add Title to create a task",
          bgColor: "red",
        });
      }
      return;
    }
    onAdd(title.trim(), description.trim() || undefined, dueDate);
    setTitle("");
    setDescription("");
    setDueDate(null);
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

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TextInput
          placeholder="Task title"
          placeholderTextColor={COLORS.placeholder}
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          returnKeyType="next"
        />
        <TextInput
          placeholder="Description (optional)"
          placeholderTextColor={COLORS.placeholder}
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.descriptionInput]}
          multiline
          numberOfLines={2}
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.dueDateButton} onPress={openDatePicker}>
            <Text style={styles.dueDateButtonText}>
              {dueDate ? formatDueDate(dueDate) : "Set due date"}
            </Text>
          </TouchableOpacity>

          {dueDate && (
            <TouchableOpacity
              onPress={() => setDueDate(null)}
              style={styles.clearDate}
            >
              <Text style={styles.clearDateText}>✕</Text>
            </TouchableOpacity>
          )}

          <View style={{ flex: 1 }} />

          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showPicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode={pickerMode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={new Date()}
          onChange={handlePickerChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    flexDirection: "column",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: COLORS.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  input: {
    paddingHorizontal: 0,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
  },
  descriptionInput: {
    minHeight: 36,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  dueDateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.input,
  },
  dueDateButtonText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  clearDate: {
    padding: 4,
  },
  clearDateText: {
    fontSize: 14,
    color: COLORS.delete,
    fontWeight: "600",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "700",
  },
});
