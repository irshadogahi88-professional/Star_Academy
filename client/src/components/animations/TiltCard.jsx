import Tilt from 'react-parallax-tilt'

export default function TiltCard({ children, className = '', intensity = 5 }) {
  return (
    <Tilt
      tiltMaxAngleX={intensity}
      tiltMaxAngleY={intensity}
      perspective={1000}
      scale={1.02}
      transitionSpeed={2000}
      gyroscope={true}
      glareEnable={true}
      glareMaxOpacity={0.15}
      glareColor="#ffffff"
      glarePosition="all"
      glareBorderRadius="1.5rem"
      className={className}
    >
      {children}
    </Tilt>
  )
}
