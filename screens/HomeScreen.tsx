import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PixelGrid from '../components/PixelGrid';
import ColorPalette from '../components/ColorPalette';
import ToolsPanel from '../components/ToolsPanel';
import AnimationFrames from '../components/AnimationFrames';

export default function HomeScreen() {
  const [selectedColor, setSelectedColor] = useState('#000000');  const [gridSize] = useState({ width: 16, height: 16 });
  const [scale, setScale] = useState(1);
  const [symmetryMode, setSymmetryMode] = useState('none'); // none, horizontal, vertical, both
  const [currentFrame, setCurrentFrame] = useState(0);
  const [frames, setFrames] = useState([Array(gridSize.height).fill().map(() => Array(gridSize.width).fill('#FFFFFF'))]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.toolbarContainer}>
          <ToolsPanel
            symmetryMode={symmetryMode}
            onSymmetryChange={setSymmetryMode}
            scale={scale}
            onScaleChange={setScale}
          />
        </View>
        
        <ScrollView 
          style={styles.canvasContainer}
          contentContainerStyle={styles.canvasContent}
          maximumZoomScale={4}
          minimumZoomScale={0.5}
        >
          <PixelGrid
            grid={frames[currentFrame]}
            selectedColor={selectedColor}
            scale={scale}
            symmetryMode={symmetryMode}
            onPixelUpdate={(x, y, color) => {
              const newFrames = [...frames];
              const newGrid = [...newFrames[currentFrame]];
              newGrid[y] = [...newGrid[y]];
              newGrid[y][x] = color;
              
              // Apply symmetry
              if (symmetryMode === 'horizontal' || symmetryMode === 'both') {
                newGrid[y][gridSize.width - 1 - x] = color;
              }
              if (symmetryMode === 'vertical' || symmetryMode === 'both') {
                newGrid[gridSize.height - 1 - y][x] = color;
              }
              if (symmetryMode === 'both') {
                newGrid[gridSize.height - 1 - y][gridSize.width - 1 - x] = color;
              }
              
              newFrames[currentFrame] = newGrid;
              setFrames(newFrames);
            }}
          />
        </ScrollView>

        <View style={styles.bottomContainer}>
          <ColorPalette
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
          />
          <AnimationFrames
            frames={frames}
            currentFrame={currentFrame}
            onFrameSelect={setCurrentFrame}
            onAddFrame={() => {
              setFrames([...frames, Array(gridSize.height).fill().map(() => Array(gridSize.width).fill('#FFFFFF'))]);
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  toolbarContainer: {
    height: 60,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  canvasContent: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    height: 120,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});