import { useState, useRef } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface SelectableObjectProps {
  children: React.ReactNode;
  objectId: string;
  objectName: string;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  showTooltip?: boolean;
}

export function SelectableObject({
  children,
  objectId,
  objectName,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  showTooltip = true,
}: SelectableObjectProps) {
  const groupRef = useRef<THREE.Group>(null);

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(false);
    document.body.style.cursor = "auto";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {children}
      
      {/* Selection outline effect */}
      {(isSelected || isHovered) && (
        <mesh scale={1.1}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial
            color={isSelected ? 0x00ff00 : 0xffff00}
            transparent
            opacity={0.15}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      {/* Hover tooltip */}
      {isHovered && showTooltip && !isSelected && (
        <Html position={[0, 1, 0]} center>
          <div className="bg-background/95 border border-primary/50 px-3 py-1.5 rounded-lg shadow-lg pointer-events-none animate-fade-in">
            <p className="text-sm font-medium whitespace-nowrap">{objectName}</p>
            <p className="text-xs text-muted-foreground">Click to select</p>
          </div>
        </Html>
      )}
    </group>
  );
}
