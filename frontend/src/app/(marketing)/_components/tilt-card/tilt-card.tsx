// components/TiltCard.tsx
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className, style }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Adjust these values to control the intensity of the tilt
  const rotateX = useTransform(y, [-10, 10], [10, -10]);
  const rotateY = useTransform(x, [-10, 10], [-10, 10]);

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const card = cardRef.current;
    if (card) {
      const rect = card.getBoundingClientRect();
      const cardWidth = rect.width;
      const cardHeight = rect.height;

      const centerX = rect.left + cardWidth / 2;
      const centerY = rect.top + cardHeight / 2;

      const mouseX = event.clientX - centerX;
      const mouseY = event.clientY - centerY;

      // Normalize mouse coordinates
      const rotateXValue = (mouseY / (cardHeight / 2)) * 30; // Max rotation of 30 degrees
      const rotateYValue = (-mouseX / (cardWidth / 2)) * 30;

      x.set(mouseX);
      y.set(mouseY);
    }
  };

  const handleMouseLeave = () => {
    // Reset the tilt when the mouse leaves
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={className}
      style={{
        perspective: 1000,
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX: rotateX,
          rotateY: rotateY,
          transformStyle: "preserve-3d",
          transition: "ease",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default TiltCard;
