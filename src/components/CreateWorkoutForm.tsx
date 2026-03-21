import { Pressable, Text, TextInput, View } from 'react-native';

interface CreateWorkoutFormProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function CreateWorkoutForm({
  value,
  onChangeText,
  onSubmit,
  onCancel,
}: CreateWorkoutFormProps) {
  return (
    <View className="mb-5 rounded-2xl bg-secondary-100 px-5 pb-4 pt-5">
      <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-typography-500">
        Workout Name
      </Text>
      <TextInput
        className="mb-6 border-b border-outline-400/20 pb-3 text-2xl font-semibold text-typography-950"
        placeholder="e.g. Push Day"
        value={value}
        onChangeText={onChangeText}
        autoFocus
        onSubmitEditing={onSubmit}
        style={{ minHeight: 56 }}
      />
      <View className="flex-row gap-3">
        <Pressable
          className="flex-1 items-center justify-center py-4"
          onPress={onCancel}
        >
          <Text className="text-base font-semibold text-typography-500">
            Cancel
          </Text>
        </Pressable>
        <Pressable
          className="flex-1 items-center justify-center rounded-2xl bg-primary py-4 active:bg-primary-300"
          onPress={onSubmit}
        >
          <Text className="text-base font-semibold text-typography-0">
            Create
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
