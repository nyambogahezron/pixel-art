import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const DEFAULT_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#800000',
  '#808000', '#008000', '#800080', '#008080', '#000080',
];

interface ColorPaletteProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export default function ColorPalette({ selectedColor, onColorSelect }: ColorPaletteProps) {
  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState('#000000');

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {colors.map((color, index) => (
          <Pressable
            key={index}
            style={[
              styles.colorSwatch,
              { backgroundColor: color },
              color === selectedColor && styles.selectedSwatch,
            ]}
            onPress={() => onColorSelect(color)}
          />
        ))}
        <Pressable
          style={[styles.colorSwatch, styles.addColorButton]}
          onPress={() => setShowColorPicker(true)}
        >
          <MaterialIcons name="add" size={20} color="#666" />
        </Pressable>
      </ScrollView>
      
      {showColorPicker && (
        <View style={styles.colorPicker}>
          <TextInput
            style={styles.colorInput}
            value={newColor}
            onChangeText={setNewColor}
            placeholder="#000000"
          />
          <Pressable
            style={styles.addButton}
            onPress={() => {
              setColors([...colors, newColor]);
              setShowColorPicker(false);
            }}
          >
            <MaterialIcons name="check" size={20} color="white" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedSwatch: {
    borderWidth: 2,
    borderColor: '#000',
  },
  addColorButton: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  colorInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});