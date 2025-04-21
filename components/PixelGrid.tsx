import React from 'react';
import { View, StyleSheet, Pressable, GestureResponderEvent } from 'react-native';

interface PixelGridProps {
  grid: string[][];
  selectedColor: string;
  scale: number;
  symmetryMode: string;
  onPixelUpdate: (x: number, y: number, color: string) => void;
}

export default function PixelGrid({ 
  grid, 
  selectedColor, 
  scale, 
  symmetryMode, 
  onPixelUpdate 
}: PixelGridProps) {
  const [isDrawing, setIsDrawing] = React.useState(false);

  const handlePixelPress = (x: number, y: number) => {
    onPixelUpdate(x, y, selectedColor);
  };

  const handlePixelMove = (event: GestureResponderEvent, x: number, y: number) => {
    if (isDrawing) {
      const { locationX, locationY } = event.nativeEvent;
      const pixelSize = 8 * scale;
      const newX = Math.floor(locationX / pixelSize);
      const newY = Math.floor(locationY / pixelSize);
      
      if (newX >= 0 && newX < grid[0].length && newY >= 0 && newY < grid.length) {
        onPixelUpdate(newX, newY, selectedColor);
      }
    }
  };

  return (
    <View style={styles.container}>
      {grid.map((row, y) => (
        <View key={y} style={styles.row}>
          {row.map((color, x) => (
            <Pressable
              key={`${x}-${y}`}
              onPressIn={() => {
                setIsDrawing(true);
                handlePixelPress(x, y);
              }}
              onPressOut={() => setIsDrawing(false)}
              onTouchMove={(e) => handlePixelMove(e, x, y)}
              style={[
                styles.pixel,
                {
                  backgroundColor: color || '#FFFFFF',
                  width: 8 * scale,
                  height: 8 * scale,
                },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
  },
  pixel: {
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
});